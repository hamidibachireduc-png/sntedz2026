import React, { useEffect, useMemo, useState } from 'react';
import { LockKeyhole, Mail, PenLine, Send, X } from 'lucide-react';
import { callContactCardsApi } from './contactCardsApi';
import { MemberData } from './DigitalMembershipCardModal';
import { getAllMembersWithSeed } from './membershipStatusData';
import { CORPS_COORDINATORS, REGIONAL_COORDINATORS } from './wilayasList';

interface PortalMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserUpdated: (user: any) => void;
}

interface PortalMessageUser {
  id: string;
  name: string;
  role: string;
  wilayaCode: string;
  wilayaName: string;
  municipalName: string;
  institutionName: string;
}

interface PortalMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

interface ActivationAccount {
  id: string;
  name: string;
  role: 'MEMBER' | 'GENERAL_COORDINATOR';
  wilayaCode: string;
  wilayaName: string;
  municipalName: string;
  institutionName: string;
}

type Folder = 'inbox' | 'sent';

const roleName = (role: string) => ({
  NATIONAL_SG: 'الأمانة الوطنية',
  WILAYA_SG: 'الأمانة الولائية',
  MUNICIPAL_SG: 'الأمانة البلدية',
  SCHOOL_SG: 'أمين فرع مؤسسة',
  BRANCH_SG: 'أمين فرع نقابي',
  GENERAL_COORDINATOR: 'منسق جهوي',
  MEMBER: 'منخرط',
}[role] || 'مستخدم البوابة');

export const PortalMessagesModal: React.FC<PortalMessagesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) => {
  const [sessionToken, setSessionToken] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [users, setUsers] = useState<PortalMessageUser[]>([]);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [activationAccounts, setActivationAccounts] = useState<ActivationAccount[]>([]);
  const [activationCode, setActivationCode] = useState('');
  const [messagingPassword, setMessagingPassword] = useState('');
  const [isAccountLoginMode, setIsAccountLoginMode] = useState(false);
  const [issuedCode, setIssuedCode] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [folder, setFolder] = useState<Folder>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<PortalMessage | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isIssuingCode, setIsIssuingCode] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const canUseActivationCode = Boolean(currentUser);
  const canIssueCodes = ['NATIONAL_SG', 'WILAYA_SG'].includes(currentUser?.role);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setNotice('');
    setIssuedCode('');
    setSessionToken(currentUser?.contactCardSessionToken || '');
    setIsAccountLoginMode(Boolean(currentUser?.portalMessagingEnabled));
    if (canIssueCodes) {
      try {
        const memberAccounts = getAllMembersWithSeed()
          .filter((member) => member.membershipStatus !== 'rejected')
          .filter((member) =>
            currentUser.role === 'NATIONAL_SG' ||
            String(member.wilayaCode).padStart(2, '0') === String(currentUser.wilayaCode).padStart(2, '0'))
          .map((member: MemberData): ActivationAccount => ({
            id: member.membershipCardNo,
            name: member.fullName,
            role: 'MEMBER',
            wilayaCode: member.wilayaCode,
            wilayaName: member.wilayaName,
            municipalName: member.municipalName || '',
            institutionName: member.institutionName || '',
          }));
        const coordinatorAccounts: ActivationAccount[] = currentUser.role === 'NATIONAL_SG'
          ? [
            ...REGIONAL_COORDINATORS.map((coordinator) => ({
              id: coordinator.id,
              name: coordinator.name,
              role: 'GENERAL_COORDINATOR' as const,
              wilayaCode: '',
              wilayaName: coordinator.region,
              municipalName: '',
              institutionName: '',
            })),
            ...CORPS_COORDINATORS.map((coordinator) => ({
              id: coordinator.id,
              name: coordinator.name,
              role: 'GENERAL_COORDINATOR' as const,
              wilayaCode: '',
              wilayaName: 'التنسيقيات الوطنية',
              municipalName: '',
              institutionName: coordinator.corpsName,
            })),
          ]
          : [];
        setActivationAccounts([...memberAccounts, ...coordinatorAccounts]);
      } catch (loadError) {
        console.error('Failed to load members for messaging activation:', loadError);
        setError('تعذر تحميل قائمة المنخرطين لإصدار رمز التفعيل.');
      }
    }
  }, [isOpen, currentUser, canIssueCodes]);

  const loadMailbox = async (token: string, showLoading = true) => {
    if (!token) return;
    if (showLoading) setIsLoading(true);
    setError('');
    try {
      const [usersResponse, messagesResponse] = await Promise.all([
        callContactCardsApi<PortalMessageUser>({ action: 'listInternalUsers', sessionToken: token }),
        callContactCardsApi<PortalMessage>({ action: 'listInternalMessages', sessionToken: token }),
      ]);
      if (usersResponse.status !== 'success' || messagesResponse.status !== 'success') {
        throw new Error(usersResponse.message || messagesResponse.message || 'تعذر تحميل التراسل الداخلي.');
      }
      setUsers(usersResponse.users || []);
      setMessages(messagesResponse.messages || []);
      setCurrentUserId(usersResponse.currentUserId || '');
    } catch (loadError) {
      console.error('Failed to load portal messages:', loadError);
      const message = loadError instanceof Error ? loadError.message : 'تعذر تحميل صندوق التراسل.';
      setError(message);
      if (message.includes('انتهت جلسة البوابة')) {
        setSessionToken('');
        const { contactCardSessionToken: _expiredToken, ...updatedUser } = currentUser || {};
        localStorage.setItem('snte_user', JSON.stringify(updatedUser));
        onUserUpdated(updatedUser);
        if (currentUser?.portalMessagingEnabled) setIsAccountLoginMode(true);
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !sessionToken) return;
    void loadMailbox(sessionToken);
    const timer = window.setInterval(() => void loadMailbox(sessionToken, false), 30000);
    return () => window.clearInterval(timer);
  }, [isOpen, sessionToken]);

  const visibleMessages = useMemo(
    () => messages.filter((message) => folder === 'inbox'
      ? message.recipientId === currentUserId
      : message.senderId === currentUserId),
    [messages, folder, currentUserId],
  );

  const activateMemberAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await callContactCardsApi({
        action: 'activateMessagingAccount',
        activationCode: activationCode.trim(),
        password: messagingPassword,
      });
      if (response.status !== 'success' || !response.sessionToken) {
        throw new Error(response.message || 'تعذر تفعيل حساب التراسل.');
      }
      const updatedUser = {
        ...currentUser,
        contactCardSessionToken: response.sessionToken,
        portalMessagingEnabled: true,
      };
      localStorage.setItem('snte_user', JSON.stringify(updatedUser));
      setSessionToken(response.sessionToken);
      setActivationCode('');
      setMessagingPassword('');
      onUserUpdated(updatedUser);
      setNotice('تم تفعيل التراسل الداخلي لحسابك بنجاح.');
    } catch (activationError) {
      console.error('Failed to activate portal messaging:', activationError);
      setError(activationError instanceof Error ? activationError.message : 'تعذر تفعيل حساب التراسل.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginMemberAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await callContactCardsApi({
        action: 'loginMessagingAccount',
        memberId: currentUser?.membershipCardNo || currentUser?.id || currentUser?.username || '',
        password: messagingPassword,
      });
      if (response.status !== 'success' || !response.sessionToken) {
        throw new Error(response.message || 'تعذر تسجيل الدخول إلى التراسل.');
      }
      const updatedUser = {
        ...currentUser,
        contactCardSessionToken: response.sessionToken,
        portalMessagingEnabled: true,
      };
      localStorage.setItem('snte_user', JSON.stringify(updatedUser));
      setSessionToken(response.sessionToken);
      setMessagingPassword('');
      onUserUpdated(updatedUser);
      setNotice('تم تسجيل الدخول إلى التراسل الداخلي.');
    } catch (loginError) {
      console.error('Failed to sign in to portal messaging:', loginError);
      setError(loginError instanceof Error ? loginError.message : 'تعذر تسجيل الدخول إلى التراسل.');
    } finally {
      setIsLoading(false);
    }
  };

  const issueMemberActivationCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const activationAccount = activationAccounts.find((item) => item.id === selectedMemberId);
    if (!activationAccount) {
      setError('اختر مستخدم البوابة المطلوب تفعيل حسابه.');
      return;
    }
    setIsIssuingCode(true);
    setError('');
    setIssuedCode('');
    try {
      const response = await callContactCardsApi({
        action: 'issueMessagingCode',
        sessionToken,
        memberId: activationAccount.id,
        name: activationAccount.name,
        role: activationAccount.role,
        wilayaCode: activationAccount.wilayaCode,
        wilayaName: activationAccount.wilayaName,
        municipalName: activationAccount.municipalName,
        institutionName: activationAccount.institutionName,
      });
      if (response.status !== 'success' || !response.activationCode) {
        throw new Error(response.message || 'تعذر إصدار رمز التفعيل.');
      }
      setIssuedCode(response.activationCode);
      setNotice(`تم إصدار رمز لمرة واحدة للمستخدم ${activationAccount.name}. سلّمه له بعد التحقق من هويته.`);
    } catch (issueError) {
      console.error('Failed to issue portal messaging activation code:', issueError);
      setError(issueError instanceof Error ? issueError.message : 'تعذر إصدار رمز التفعيل.');
    } finally {
      setIsIssuingCode(false);
    }
  };

  const selectMessage = async (message: PortalMessage) => {
    setSelectedMessage(message);
    setIsComposing(false);
    if (folder !== 'inbox' || message.readAt) return;
    try {
      const response = await callContactCardsApi({
        action: 'markInternalMessageRead',
        sessionToken,
        messageId: message.id,
      });
      if (response.status !== 'success') throw new Error(response.message || 'تعذر تحديث حالة القراءة.');
      setMessages((current) => current.map((item) =>
        item.id === message.id ? { ...item, readAt: new Date().toISOString() } : item));
    } catch (readError) {
      console.error('Failed to mark portal message as read:', readError);
      setError(readError instanceof Error ? readError.message : 'تعذر تحديث حالة قراءة الرسالة.');
    }
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setError('');
    try {
      const response = await callContactCardsApi({
        action: 'sendInternalMessage',
        sessionToken,
        recipientId,
        subject: subject.trim(),
        body: body.trim(),
      });
      if (response.status !== 'success') throw new Error(response.message || 'تعذر إرسال الرسالة.');
      setSubject('');
      setBody('');
      setRecipientId('');
      setIsComposing(false);
      setFolder('sent');
      setNotice('أُرسلت الرسالة إلى المستلم المحدد عبر البوابة.');
      await loadMailbox(sessionToken, false);
    } catch (sendError) {
      console.error('Failed to send portal message:', sendError);
      setError(sendError instanceof Error ? sendError.message : 'تعذر إرسال الرسالة.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const unreadCount = messages.filter((message) =>
    message.recipientId === currentUserId && !message.readAt).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 font-['Cairo',sans-serif]" dir="rtl">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-messages-title"
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-emerald-700 bg-[#062c14] text-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-emerald-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-amber-300" />
            <div>
              <h2 id="portal-messages-title" className="font-black text-amber-200">التراسل الداخلي للبوابة</h2>
              <p className="text-xs text-emerald-200">مراسلات داخلية بين حسابات البوابة المفعّلة</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="rounded-lg p-2 text-gray-300 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-100">
            تُحفظ الرسائل في جدول البوابة، ولا تُعرض إلا لأطرافها. لا تُرسل معلومات شديدة الحساسية عبر التراسل.
          </p>
          {error && <p role="alert" className="mb-3 rounded-lg bg-red-900/60 p-2 text-sm text-red-100">{error}</p>}
          {notice && <p role="status" className="mb-3 rounded-lg bg-emerald-900/80 p-2 text-sm text-emerald-100">{notice}</p>}

          {!sessionToken ? (
            canUseActivationCode ? (
              <form onSubmit={isAccountLoginMode ? loginMemberAccount : activateMemberAccount} className="mx-auto my-auto w-full max-w-lg space-y-3">
                <h3 className="text-lg font-black text-amber-200">تفعيل التراسل لحساب البوابة</h3>
                {isAccountLoginMode ? (
                  <p className="text-sm leading-7 text-emerald-100">
                    سجّل الدخول باستخدام كلمة المرور التي أنشأتها عند تفعيل التراسل.
                  </p>
                ) : (
                  <>
                    <p className="text-sm leading-7 text-emerald-100">
                      اطلب من الأمين الوطني أو الأمين الولائي التحقق من بيانات حسابك وإصدار رمز تفعيل لمرة واحدة.
                    </p>
                    <label className="block text-sm font-bold">
                      رمز التفعيل
                      <input
                        required
                        autoComplete="one-time-code"
                        value={activationCode}
                        onChange={(event) => setActivationCode(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-emerald-700 bg-[#021a0b] p-2 text-white"
                      />
                    </label>
                  </>
                )}
                <label className="block text-sm font-bold">
                  {isAccountLoginMode ? 'كلمة المرور' : 'أنشئ كلمة مرور (10 أحرف على الأقل)'}
                  <input
                    required
                    minLength={10}
                    type="password"
                    autoComplete={isAccountLoginMode ? 'current-password' : 'new-password'}
                    value={messagingPassword}
                    onChange={(event) => setMessagingPassword(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-emerald-700 bg-[#021a0b] p-2 text-white"
                  />
                </label>
                <button disabled={isLoading} type="submit" className="rounded-lg bg-amber-400 px-4 py-2 font-black text-emerald-950 disabled:opacity-50">
                  {isLoading ? 'جارٍ التحقق...' : isAccountLoginMode ? 'تسجيل الدخول إلى التراسل' : 'تفعيل التراسل'}
                </button>
                <button type="button" onClick={() => { setIsAccountLoginMode(!isAccountLoginMode); setError(''); }} className="mr-3 text-sm text-emerald-200 underline">
                  {isAccountLoginMode ? 'لدي رمز تفعيل جديد' : 'سبق أن فعّلت التراسل؟ سجّل الدخول'}
                </button>
              </form>
            ) : (
              <div className="m-auto max-w-lg text-center">
                <LockKeyhole className="mx-auto mb-3 h-10 w-10 text-amber-300" />
                <p className="text-sm leading-7 text-emerald-100">
                  سجّل الخروج ثم الدخول مجدداً بعد نشر خدمة التراسل لتجديد جلسة حسابك. لا يمكن فتح صندوق الرسائل دون جلسة موثقة من الخادم.
                </p>
              </div>
            )
          ) : isLoading ? (
            <div className="flex min-h-48 items-center justify-center text-emerald-200">جارٍ تحميل رسائل البوابة...</div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-emerald-200">الحساب: {currentUser?.name} — {roleName(currentUser?.role)}</p>
                <button type="button" onClick={() => void loadMailbox(sessionToken)} className="text-xs text-emerald-200 underline hover:text-white">
                  تحديث الرسائل
                </button>
              </div>
              <div className="flex flex-wrap gap-2 border-b border-emerald-800 pb-3">
                <button type="button" onClick={() => { setFolder('inbox'); setSelectedMessage(null); setIsComposing(false); }} className={`rounded-lg px-3 py-1.5 text-sm ${folder === 'inbox' && !isComposing ? 'bg-emerald-600 text-white' : 'bg-emerald-950 text-emerald-200'}`}>
                  <Mail className="ml-1 inline h-4 w-4" /> الوارد ({unreadCount} غير مقروءة)
                </button>
                <button type="button" onClick={() => { setFolder('sent'); setSelectedMessage(null); setIsComposing(false); }} className={`rounded-lg px-3 py-1.5 text-sm ${folder === 'sent' && !isComposing ? 'bg-emerald-600 text-white' : 'bg-emerald-950 text-emerald-200'}`}>
                  <Send className="ml-1 inline h-4 w-4" /> المرسلة
                </button>
                <button type="button" onClick={() => { setSelectedMessage(null); setIsComposing(true); setError(''); setNotice(''); }} className={`rounded-lg px-3 py-1.5 text-sm ${isComposing ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-950 text-emerald-200'}`}>
                  <PenLine className="ml-1 inline h-4 w-4" /> رسالة جديدة
                </button>
              </div>

              {isComposing ? (
                <form onSubmit={sendMessage} className="mx-auto w-full max-w-2xl space-y-3 overflow-y-auto">
                  <label className="block text-sm font-bold">
                    المستلم
                    <select required value={recipientId} onChange={(event) => setRecipientId(event.target.value)} className="mt-1 w-full rounded-lg border border-emerald-700 bg-[#021a0b] p-2 text-white">
                      <option value="">اختر مستخدماً مفعّلاً في البوابة</option>
                      {users.filter((user) => user.id !== currentUserId).map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} — {roleName(user.role)}{user.wilayaName ? ` — ${user.wilayaName}` : ''}
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
                  <button disabled={isSending || users.length < 2} type="submit" className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 font-black text-emerald-950 disabled:cursor-not-allowed disabled:opacity-50">
                    <Send className="h-4 w-4" /> {isSending ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
                  </button>
                </form>
              ) : (
                <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[minmax(14rem,0.8fr)_minmax(0,1.2fr)]">
                  <div className="min-h-32 overflow-y-auto rounded-xl border border-emerald-800">
                    {visibleMessages.length === 0 ? (
                      <p className="p-5 text-center text-sm text-emerald-300">لا توجد رسائل في هذا القسم.</p>
                    ) : visibleMessages.map((message) => (
                      <button key={message.id} type="button" onClick={() => void selectMessage(message)} className={`block w-full border-b border-emerald-900 p-3 text-right hover:bg-emerald-900/70 ${selectedMessage?.id === message.id ? 'bg-emerald-900' : ''}`}>
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold">{message.subject}</span>
                          {folder === 'inbox' && !message.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-label="غير مقروءة" />}
                        </span>
                        <span className="mt-1 block text-xs text-emerald-300">{folder === 'inbox' ? `من: ${message.senderName}` : `إلى: ${message.recipientName}`}</span>
                        <span className="mt-1 block text-[11px] text-gray-400">{new Date(message.createdAt).toLocaleString('ar-DZ')}</span>
                      </button>
                    ))}
                  </div>
                  <article className="min-h-32 overflow-y-auto rounded-xl border border-emerald-800 p-4">
                    {selectedMessage ? (
                      <>
                        <h3 className="text-lg font-black text-amber-200">{selectedMessage.subject}</h3>
                        <p className="mt-1 text-xs text-emerald-300">
                          {folder === 'inbox' ? `من: ${selectedMessage.senderName}` : `إلى: ${selectedMessage.recipientName}`}
                          {' — '}{new Date(selectedMessage.createdAt).toLocaleString('ar-DZ')}
                        </p>
                        <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-gray-100">{selectedMessage.body}</p>
                      </>
                    ) : (
                      <p className="text-center text-sm text-emerald-300">اختر رسالة لعرض محتواها.</p>
                    )}
                  </article>
                </div>
              )}

              {canIssueCodes && (
                <details className="rounded-xl border border-emerald-800 p-3">
                  <summary className="cursor-pointer text-sm font-black text-amber-200">تفعيل حساب مستخدم للتراسل</summary>
                  <form onSubmit={issueMemberActivationCode} className="mt-3 flex flex-wrap items-end gap-2">
                    <label className="min-w-[220px] flex-1 text-xs font-bold">
                      المستخدم (تحقق من هويته قبل إصدار الرمز)
                      <select required value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value)} className="mt-1 w-full rounded-lg border border-emerald-700 bg-[#021a0b] p-2 text-white">
                        <option value="">اختر مستخدماً من القائمة</option>
                        {activationAccounts.map((account) => (
                          <option key={`${account.role}-${account.id}`} value={account.id}>
                            {account.name} — {account.id}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button disabled={isIssuingCode} type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black disabled:opacity-50">
                      {isIssuingCode ? 'جارٍ الإصدار...' : 'إصدار رمز لمرة واحدة'}
                    </button>
                  </form>
                  {issuedCode && (
                    <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-100">
                      رمز التفعيل (صالح 48 ساعة ويُستخدم مرة واحدة):
                      <strong className="mx-2 break-all font-mono text-sm" dir="ltr">{issuedCode}</strong>
                      سلّمه للمستخدم مباشرة ولا تنشره في مجموعة عامة.
                    </p>
                  )}
                </details>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
