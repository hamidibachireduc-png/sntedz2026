import React, { useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { LockKeyhole, Mail, PenLine, Send, X } from 'lucide-react';
import {
  privateMessagesAuth,
  privateMessagesDb,
  preparePrivateMessagesAuth,
} from './privateMessagesFirebase';

interface PrivateMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MessageAccount {
  name: string;
  email: string;
  role: 'NATIONAL_SG' | 'WILAYA_SG';
  wilayaCode?: string;
  wilayaName?: string;
}

interface PrivateMessage {
  id: string;
  senderUid: string;
  senderName: string;
  recipientUid: string;
  recipientName: string;
  recipientWilayaCode: string;
  subject: string;
  body: string;
  createdAt: Timestamp | null;
  readAt: Timestamp | null;
}

const messageFromDocument = (id: string, data: Record<string, unknown>): PrivateMessage => ({
  id,
  senderUid: String(data.senderUid || ''),
  senderName: String(data.senderName || ''),
  recipientUid: String(data.recipientUid || ''),
  recipientName: String(data.recipientName || ''),
  recipientWilayaCode: String(data.recipientWilayaCode || ''),
  subject: String(data.subject || ''),
  body: String(data.body || ''),
  createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
  readAt: data.readAt instanceof Timestamp ? data.readAt : null,
});

type Folder = 'inbox' | 'sent';

const getSignInErrorMessage = (error: unknown) => {
  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : 'unknown';

  switch (code) {
    case 'auth/unauthorized-domain':
      return 'Firebase لا يسمح بنطاق الموقع الحالي. أضف اسم النطاق الظاهر في شريط العنوان إلى Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'تسجيل الدخول بـ Google غير مفعّل. فعّل Google من Firebase Console > Authentication > Sign-in method.';
    case 'auth/popup-blocked':
      return 'حُظرت نافذة Google المنبثقة. اسمح بالنوافذ المنبثقة لهذا الموقع ثم أعد المحاولة.';
    case 'auth/popup-closed-by-user':
      return 'أُغلقت نافذة تسجيل الدخول قبل اكتمال العملية. أعد المحاولة وأكمل اختيار الحساب.';
    case 'auth/cancelled-popup-request':
      return 'هناك محاولة تسجيل دخول أخرى قيد التنفيذ. انتظر لحظة ثم أعد المحاولة.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بخدمة تسجيل الدخول. تحقق من الإنترنت أو إعدادات حظر الشبكة ثم أعد المحاولة.';
    case 'auth/invalid-api-key':
      return 'مفتاح Firebase API غير صالح. راجع إعدادات التطبيق في Firebase Console.';
    default:
      return `فشل تسجيل الدخول. رمز الخطأ: ${code}. راجع Firebase Console > Authentication وتأكد من إعداد Google والنطاق المصرح به.`;
  }
};

export const PrivateMessagesModal: React.FC<PrivateMessagesModalProps> = ({ isOpen, onClose }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [account, setAccount] = useState<MessageAccount | null>(null);
  const [recipients, setRecipients] = useState<Array<MessageAccount & { uid: string }>>([]);
  const [inbox, setInbox] = useState<PrivateMessage[]>([]);
  const [sent, setSent] = useState<PrivateMessage[]>([]);
  const [folder, setFolder] = useState<Folder>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<PrivateMessage | null>(null);
  const [selectedRecipientUid, setSelectedRecipientUid] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const clearPrivateData = () => {
    setAccount(null);
    setRecipients([]);
    setInbox([]);
    setSent([]);
    setSelectedMessage(null);
    setSelectedRecipientUid('');
    setSubject('');
    setBody('');
    setIsComposing(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    let unsubscribe = () => {};
    setError(null);
    setIsLoading(true);
    const startAuthListener = async () => {
      try {
        await preparePrivateMessagesAuth();
        if (!active) return;

        unsubscribe = onAuthStateChanged(privateMessagesAuth, async (user) => {
          if (!active) return;
          setFirebaseUser(user);
          setAccount(null);
          setRecipients([]);
          setInbox([]);
          setSent([]);
          setSelectedMessage(null);
          setError(null);

          if (!user) {
            clearPrivateData();
            setFirebaseUser(null);
            setIsLoading(false);
            return;
          }

          try {
            const accountSnapshot = await getDoc(doc(privateMessagesDb, 'messageAccounts', user.uid));
            if (!active) return;
            if (!accountSnapshot.exists()) {
              setError('هذا الحساب غير مفعّل للرسائل الخاصة. يرجى التواصل مع مسؤول النظام.');
              return;
            }

            const profile = accountSnapshot.data() as MessageAccount;
            if (profile.role !== 'NATIONAL_SG' && profile.role !== 'WILAYA_SG') {
              setError('لا يملك هذا الحساب صلاحية استخدام الرسائل الخاصة.');
              return;
            }
            if (!profile.name?.trim() || !profile.email?.trim()) {
              setError('بيانات حساب الرسائل غير مكتملة. يرجى التواصل مع مسؤول النظام.');
              return;
            }
            if (profile.email.toLowerCase() !== (user.email || '').toLowerCase()) {
              setError('البريد الإلكتروني لهذا الحساب لا يطابق هوية Google المعتمدة.');
              return;
            }
            if (profile.role === 'WILAYA_SG' && (!profile.wilayaCode?.trim() || !profile.wilayaName?.trim())) {
              setError('بيانات الولاية غير مكتملة في حساب الرسائل.');
              return;
            }
            setAccount(profile);

            if (profile.role === 'NATIONAL_SG') {
              const recipientSnapshot = await getDocs(
                query(collection(privateMessagesDb, 'messageAccounts'), where('role', '==', 'WILAYA_SG')),
              );
              if (!active) return;
              setRecipients(
                recipientSnapshot.docs
                  .map((recipient) => ({
                    ...(recipient.data() as MessageAccount),
                    uid: recipient.id,
                  }))
                  .filter(
                    (recipient) =>
                      typeof recipient.name === 'string' &&
                      !!recipient.name.trim() &&
                      typeof recipient.email === 'string' &&
                      !!recipient.email.trim() &&
                      typeof recipient.wilayaCode === 'string' &&
                      !!recipient.wilayaCode.trim() &&
                      typeof recipient.wilayaName === 'string' &&
                      !!recipient.wilayaName.trim(),
                  ),
              );
            }
          } catch (loadError) {
            console.error('Failed to load private message account:', loadError);
            if (active) {
              setError('تعذر تحميل حساب الرسائل. تحقق من اتصالك وإعدادات Firebase ثم أعد المحاولة.');
            }
          } finally {
            if (active) setIsLoading(false);
          }
        });
      } catch (authError) {
        console.error('Failed to initialize private messages authentication:', authError);
        if (active) {
          setError('تعذر تهيئة تسجيل الدخول الآمن. أعد تحميل الصفحة وحاول مجددًا.');
          setIsLoading(false);
        }
      }
    };
    void startAuthListener();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !firebaseUser || !account) return;

    const messageCollection = collection(privateMessagesDb, 'privateMessages');
    const unsubscribeInbox = onSnapshot(
      query(messageCollection, where('recipientUid', '==', firebaseUser.uid)),
      (snapshot) => setInbox(snapshot.docs.map((item) => messageFromDocument(item.id, item.data()))),
      (snapshotError) => {
        console.error('Failed to read private inbox:', snapshotError);
        setError('تعذر تحميل صندوق الوارد. تحقق من نشر قواعد Firestore.');
      },
    );
    const unsubscribeSent = onSnapshot(
      query(messageCollection, where('senderUid', '==', firebaseUser.uid)),
      (snapshot) => setSent(snapshot.docs.map((item) => messageFromDocument(item.id, item.data()))),
      (snapshotError) => {
        console.error('Failed to read sent private messages:', snapshotError);
        setError('تعذر تحميل الرسائل المرسلة. تحقق من نشر قواعد Firestore.');
      },
    );

    return () => {
      unsubscribeInbox();
      unsubscribeSent();
    };
  }, [account, firebaseUser, isOpen]);

  const visibleMessages = useMemo(() => {
    const messages = folder === 'inbox' ? inbox : sent;
    return [...messages].sort(
      (first, second) =>
        (second.createdAt?.toMillis() || 0) - (first.createdAt?.toMillis() || 0),
    );
  }, [folder, inbox, sent]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await preparePrivateMessagesAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(privateMessagesAuth, provider);
    } catch (signInError) {
      console.error('Private messages sign-in failed:', signInError);
      setError(getSignInErrorMessage(signInError));
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await signOut(privateMessagesAuth);
      setFirebaseUser(null);
      clearPrivateData();
      setNotice(null);
    } catch (signOutError) {
      console.error('Private messages sign-out failed:', signOutError);
      setError('تعذر تسجيل الخروج من صندوق الرسائل.');
    }
  };

  const handleClose = async () => {
    setError(null);
    try {
      await signOut(privateMessagesAuth);
      setFirebaseUser(null);
      clearPrivateData();
      setNotice(null);
      onClose();
    } catch (signOutError) {
      console.error('Failed to end private messages session:', signOutError);
      setError('تعذر إنهاء جلسة الرسائل. أعد المحاولة قبل إغلاق الصندوق على جهاز مشترك.');
    }
  };

  const handleSelectMessage = async (message: PrivateMessage) => {
    setSelectedMessage(message);
    setIsComposing(false);
    setError(null);
    if (folder !== 'inbox' || message.readAt || !firebaseUser) return;

    try {
      await updateDoc(doc(privateMessagesDb, 'privateMessages', message.id), {
        readAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error('Failed to mark private message as read:', updateError);
      setError('تعذر تحديث حالة قراءة الرسالة.');
    }
  };

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();
    const recipient = recipients.find((item) => item.uid === selectedRecipientUid);
    if (!firebaseUser || !account || account.role !== 'NATIONAL_SG' || !recipient) {
      setError('اختر أمينًا ولائيًا معتمدًا قبل إرسال الرسالة.');
      return;
    }
    if (!trimmedSubject || trimmedSubject.length > 160 || !trimmedBody || trimmedBody.length > 10000) {
      setError('أدخل موضوعًا (حتى 160 حرفًا) ومحتوى (حتى 10000 حرف).');
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      await addDoc(collection(privateMessagesDb, 'privateMessages'), {
        senderUid: firebaseUser.uid,
        senderName: account.name,
        recipientUid: recipient.uid,
        recipientName: recipient.name,
        recipientWilayaCode: recipient.wilayaCode,
        subject: trimmedSubject,
        body: trimmedBody,
        createdAt: serverTimestamp(),
        readAt: null,
      });
      setSubject('');
      setBody('');
      setSelectedRecipientUid('');
      setIsComposing(false);
      setFolder('sent');
      setNotice('تم إرسال الرسالة إلى المستلم المحدد فقط.');
    } catch (sendError) {
      console.error('Failed to send private message:', sendError);
      setError('لم تُرسل الرسالة. تحقق من صلاحيات الحساب وقواعد Firestore وحاول مجددًا.');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (date: Timestamp | null) =>
    date ? new Intl.DateTimeFormat('ar-DZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date.toDate()) : 'الآن';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 font-['Cairo',sans-serif]" dir="rtl">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="private-messages-title"
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-emerald-700 bg-[#062c14] text-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-emerald-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-amber-300" />
            <div>
              <h2 id="private-messages-title" className="font-black text-amber-200">الرسائل الخاصة</h2>
              <p className="text-xs text-emerald-200">مراسلات فردية بين الأمانة الوطنية والأمناء العامين الولائيين</p>
            </div>
          </div>
          <button type="button" onClick={() => void handleClose()} aria-label="إغلاق" className="rounded-lg p-2 text-gray-300 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-100">
            لا تُخزّن الرسائل محليًا، وتقتصر قراءتها على المرسل والمستلم وفق قواعد Firestore. لا يوجد تشفير طرفي؛ يمكن لمسؤولي Firebase المخوّلين إدارة بيانات المشروع.
          </p>

          {error && <p role="alert" className="mb-3 rounded-lg bg-red-900/60 p-2 text-sm text-red-100">{error}</p>}
          {notice && <p role="status" className="mb-3 rounded-lg bg-emerald-900/80 p-2 text-sm text-emerald-100">{notice}</p>}

          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center text-emerald-200">جارٍ التحقق من الحساب...</div>
          ) : !firebaseUser ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
              <LockKeyhole className="h-10 w-10 text-amber-300" />
              <p className="max-w-lg text-sm text-emerald-100">
                سجّل الدخول بحساب Google المعتمد للرسائل. صلاحية الحساب تُتحقق من Firebase، ولا يعتمد الصندوق على تسجيل الدخول المحلي للموقع.
              </p>
              <button type="button" onClick={handleGoogleSignIn} className="rounded-xl bg-amber-400 px-5 py-2 font-black text-emerald-950 hover:bg-amber-300">
                تسجيل الدخول بحساب Google
              </button>
            </div>
          ) : !account ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
              <p className="text-sm text-emerald-100">الحساب {firebaseUser.email} غير مفعّل في دليل الرسائل.</p>
              <button type="button" onClick={handleSignOut} className="rounded-lg border border-emerald-500 px-4 py-2 text-sm hover:bg-white/10">
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-emerald-200">الحساب المعتمد: {account.name} ({firebaseUser.email})</p>
                <button type="button" onClick={handleSignOut} className="text-xs text-emerald-200 underline hover:text-white">
                  تسجيل الخروج من الرسائل
                </button>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-emerald-800 pb-3">
                <button type="button" onClick={() => { setFolder('inbox'); setSelectedMessage(null); setIsComposing(false); }} className={`rounded-lg px-3 py-1.5 text-sm ${folder === 'inbox' && !isComposing ? 'bg-emerald-600 text-white' : 'bg-emerald-950 text-emerald-200'}`}>
                  <Mail className="ml-1 inline h-4 w-4" /> الوارد ({inbox.filter((message) => !message.readAt).length} غير مقروءة)
                </button>
                {account.role === 'NATIONAL_SG' && (
                  <>
                    <button type="button" onClick={() => { setFolder('sent'); setSelectedMessage(null); setIsComposing(false); }} className={`rounded-lg px-3 py-1.5 text-sm ${folder === 'sent' && !isComposing ? 'bg-emerald-600 text-white' : 'bg-emerald-950 text-emerald-200'}`}>
                      <Send className="ml-1 inline h-4 w-4" /> المرسلة
                    </button>
                    <button type="button" onClick={() => { setSelectedMessage(null); setIsComposing(true); setError(null); setNotice(null); }} className={`rounded-lg px-3 py-1.5 text-sm ${isComposing ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-950 text-emerald-200'}`}>
                      <PenLine className="ml-1 inline h-4 w-4" /> رسالة جديدة
                    </button>
                  </>
                )}
              </div>

              {isComposing ? (
                <form onSubmit={handleSend} className="mx-auto w-full max-w-2xl space-y-3 overflow-y-auto">
                  <label className="block text-sm font-bold">
                    المستلم
                    <select required value={selectedRecipientUid} onChange={(event) => setSelectedRecipientUid(event.target.value)} className="mt-1 w-full rounded-lg border border-emerald-700 bg-[#021a0b] p-2 text-white">
                      <option value="">اختر أمينًا عامًا ولائيًا واحدًا</option>
                      {recipients.map((recipient) => (
                        <option key={recipient.uid} value={recipient.uid}>
                          {recipient.wilayaCode} - ولاية {recipient.wilayaName} — {recipient.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-bold">
                    الموضوع
                    <input required maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 w-full rounded-lg border border-emerald-700 bg-[#021a0b] p-2 text-white" />
                  </label>
                  <label className="block text-sm font-bold">
                    نص الرسالة
                    <textarea required maxLength={10000} rows={8} value={body} onChange={(event) => setBody(event.target.value)} className="mt-1 w-full resize-y rounded-lg border border-emerald-700 bg-[#021a0b] p-2 text-white" />
                  </label>
                  <p className="text-xs text-emerald-300">ستُرسل هذه الرسالة إلى المستلم المحدد فقط. لا توجد نسخة إلى مستلمين آخرين.</p>
                  <button disabled={isSending || recipients.length === 0} type="submit" className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 font-black text-emerald-950 disabled:cursor-not-allowed disabled:opacity-50">
                    <Send className="h-4 w-4" /> {isSending ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
                  </button>
                </form>
              ) : (
                <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[minmax(14rem,0.8fr)_minmax(0,1.2fr)]">
                  <div className="min-h-32 overflow-y-auto rounded-xl border border-emerald-800">
                    {visibleMessages.length === 0 ? (
                      <p className="p-5 text-center text-sm text-emerald-300">لا توجد رسائل في هذا القسم.</p>
                    ) : visibleMessages.map((message) => (
                      <button key={message.id} type="button" onClick={() => void handleSelectMessage(message)} className={`block w-full border-b border-emerald-900 p-3 text-right hover:bg-emerald-900/70 ${selectedMessage?.id === message.id ? 'bg-emerald-900' : ''}`}>
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold">{message.subject}</span>
                          {folder === 'inbox' && !message.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-label="غير مقروءة" />}
                        </span>
                        <span className="mt-1 block text-xs text-emerald-300">{folder === 'inbox' ? message.senderName : `إلى: ${message.recipientName}`}</span>
                        <span className="mt-1 block text-[11px] text-gray-400">{formatDate(message.createdAt)}</span>
                      </button>
                    ))}
                  </div>
                  <article className="min-h-32 overflow-y-auto rounded-xl border border-emerald-800 p-4">
                    {selectedMessage ? (
                      <>
                        <h3 className="text-lg font-black text-amber-200">{selectedMessage.subject}</h3>
                        <p className="mt-1 text-xs text-emerald-300">
                          {folder === 'inbox' ? `من: ${selectedMessage.senderName}` : `إلى: ${selectedMessage.recipientName} (ولاية ${selectedMessage.recipientWilayaCode})`}
                          {' • '}{formatDate(selectedMessage.createdAt)}
                        </p>
                        <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-gray-100">{selectedMessage.body}</p>
                      </>
                    ) : <p className="pt-8 text-center text-sm text-emerald-300">اختر رسالة لعرض تفاصيلها.</p>}
                  </article>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
