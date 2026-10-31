import React, { useState, useEffect, useMemo } from 'react';
import { WILAYAS_LIST } from './wilayasList';
import { MemberData } from './DigitalMembershipCardModal';
import { getAllMembersWithSeed } from './membershipStatusData';
import { UnionAnalyticsDashboard } from './UnionAnalyticsDashboard';
import { playNotificationChime } from './notificationsSystem';

export interface MembershipNotificationItem {
  id: string;
  type: 'renewal_due' | 'pending_request' | 'renewal_expired' | 'pending_urgent';
  title: string;
  message: string;
  memberId: string;
  memberName: string;
  cardNo: string;
  wilayaName: string;
  wilayaCode: string;
  nationalId?: string;
  phone?: string;
  daysRemaining: number;
  hoursRemaining: number;
  isUrgent: boolean;
  renewalDateStr: string;
}

export const MembershipStatusTrackerSection: React.FC = () => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'rejected'>('pending');
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState('');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Notification system states
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(true);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'renewal' | 'pending' | 'urgent'>('all');
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('snte_dismissed_tracker_notifs_v1') || '[]');
    } catch {
      return [];
    }
  });
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('snte_tracker_notifs_sound_muted') === 'true';
    } catch {
      return false;
    }
  });
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' } | null>(null);

  // Update clock every second for live ticking countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    try {
      const uRaw = localStorage.getItem('snte_user');
      const u = uRaw ? JSON.parse(uRaw) : null;
      setCurrentUser(u);

      const all = getAllMembersWithSeed();
      setMembers(all);
    } catch {
      setMembers(getAllMembersWithSeed());
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('snte-members-updated', handleUpdate);
    window.addEventListener('snte-member-registered', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('snte-members-updated', handleUpdate);
      window.removeEventListener('snte-member-registered', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Show temporary toast feedback
  const showToast = (title: string, desc: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ title, desc, type });
    if (!isSoundMuted) {
      playNotificationChime();
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const toggleSound = () => {
    setIsSoundMuted((prev) => {
      const next = !prev;
      localStorage.setItem('snte_tracker_notifs_sound_muted', String(next));
      if (!next) {
        playNotificationChime();
      }
      return next;
    });
  };

  // Countdown calculations
  const getTimeRemaining = (expiresAt?: number) => {
    if (!expiresAt) {
      return { isExpired: false, days: 7, hours: 0, minutes: 0, seconds: 0, totalHours: 168 };
    }
    const diff = expiresAt - now;
    if (diff <= 0) {
      return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    return { isExpired: false, days, hours, minutes, seconds, totalHours };
  };

  const formatExpiryDate = (expiresAt?: number) => {
    if (!expiresAt) return 'خلال 7 أيام من تاريخ التسجيل';
    try {
      const d = new Date(expiresAt);
      return d.toLocaleDateString('ar-DZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return new Date(expiresAt).toLocaleDateString();
    }
  };

  const getStatusCategory = (m: MemberData): 'pending' | 'active' | 'rejected' => {
    if (m.membershipStatus === 'rejected') return 'rejected';
    if (m.membershipStatus === 'active' || m.duesPaid) return 'active';
    return 'pending';
  };

  const counts = {
    all: members.length,
    pending: members.filter((m) => getStatusCategory(m) === 'pending').length,
    active: members.filter((m) => getStatusCategory(m) === 'active').length,
    rejected: members.filter((m) => getStatusCategory(m) === 'rejected').length,
  };

  // -------------------------------------------------------------
  // NOTIFICATION GENERATION ENGINE
  // Alerts for pending requests & approaching subscription renewals
  // -------------------------------------------------------------
  const notifications: MembershipNotificationItem[] = useMemo(() => {
    const list: MembershipNotificationItem[] = [];

    members.forEach((m) => {
      const status = getStatusCategory(m);

      // 1. Pending Membership Requests Alert (طلبات انخراط معلقة)
      if (status === 'pending') {
        const regTime = m.registrationTimestamp || (m.joinDate ? new Date(m.joinDate).getTime() : now);
        const expiresAt = m.temporaryExpiresAt || (regTime + 7 * 24 * 60 * 60 * 1000);
        const diffMs = expiresAt - now;
        const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
        const isUrgent = diffMs <= 48 * 60 * 60 * 1000;
        const isExpired = diffMs <= 0;

        list.push({
          id: `pending-${m.id || m.membershipCardNo}`,
          type: isExpired ? 'pending_urgent' : isUrgent ? 'pending_urgent' : 'pending_request',
          title: isExpired
            ? `انتهت مهلة الأسبوع التجريبي: ${m.fullName}`
            : isUrgent
            ? `⚠️ عاجل (أقل من 48 ساعة): طلب معلق للأستاذ ${m.fullName}`
            : `⏳ طلب انخراط معلق بانتظار التسوية: ${m.fullName}`,
          message: isExpired
            ? `انتهت مهلة الأسبوع التجريبي للمنخرط برقم (${m.membershipCardNo}) دون تأكيد سداد مساهمة 100 دج. يرجى مراجعة الملف.`
            : `الطلب قيد المراجعة في فترة الأسبوع المؤقتة. متبقي ${daysRemaining > 0 ? `${daysRemaining} يوماً` : `${hoursRemaining} ساعة`} لسداد الاشتراك (100 دج) واستلام البطاقة.`,
          memberId: m.id || m.membershipCardNo,
          memberName: m.fullName,
          cardNo: m.membershipCardNo,
          wilayaName: m.wilayaName,
          wilayaCode: m.wilayaCode,
          nationalId: m.nationalId,
          phone: m.phone,
          daysRemaining: daysRemaining,
          hoursRemaining: hoursRemaining,
          isUrgent: isUrgent || isExpired,
          renewalDateStr: formatExpiryDate(expiresAt),
        });
      }

      // 2. Approaching Membership Subscription Renewal Alert (اقتراب موعد تجديد اشتراك العضوية السنوي)
      if (status === 'active') {
        let renewalTimestamp: number;
        if ((m as any).annualRenewalDate) {
          renewalTimestamp = new Date((m as any).annualRenewalDate).getTime();
        } else if (m.temporaryExpiresAt && m.duesPaid) {
          renewalTimestamp = m.temporaryExpiresAt;
        } else {
          const reg = m.registrationTimestamp || (m.joinDate ? new Date(m.joinDate).getTime() : now);
          renewalTimestamp = reg + 365 * 24 * 60 * 60 * 1000;
        }

        const diffMs = renewalTimestamp - now;
        const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

        // If renewal is within 30 days or already overdue
        if (daysRemaining <= 30) {
          const isOverdue = daysRemaining <= 0;
          const isUrgent = daysRemaining <= 7;

          list.push({
            id: `renewal-${m.id || m.membershipCardNo}`,
            type: isOverdue ? 'renewal_expired' : 'renewal_due',
            title: isOverdue
              ? `🔴 اشتراك سنوي منتهي الصلاحية: ${m.fullName}`
              : isUrgent
              ? `🚨 اقتراب موعد تجديد الاشتراك (متبقي ${daysRemaining} يوم): ${m.fullName}`
              : `💳 إشعار تجديد اشتراك العضوية السنوي: ${m.fullName}`,
            message: isOverdue
              ? `انتهت صلاحية اشتراك العضوية السنوية للبطاقة رقم (${m.membershipCardNo}) بولاية ${m.wilayaName}. يرجى تجديد الاشتراك السنوي وتحديث السجلات.`
              : `يحل موعد تجديد اشتراك العضوية السنوي (2026/2027) بعد ${daysRemaining} يوماً (بتاريخ ${formatExpiryDate(renewalTimestamp)}). يرجى تسوية مساهمة الاشتراك السنوي.`,
            memberId: m.id || m.membershipCardNo,
            memberName: m.fullName,
            cardNo: m.membershipCardNo,
            wilayaName: m.wilayaName,
            wilayaCode: m.wilayaCode,
            nationalId: m.nationalId,
            phone: m.phone,
            daysRemaining: Math.max(0, daysRemaining),
            hoursRemaining: hoursRemaining,
            isUrgent: isUrgent || isOverdue,
            renewalDateStr: formatExpiryDate(renewalTimestamp),
          });
        }
      }
    });

    return list;
  }, [members, now]);

  // Active notifications (excluding dismissed ones)
  const activeNotifications = useMemo(() => {
    return notifications.filter((n) => !dismissedNotificationIds.includes(n.id));
  }, [notifications, dismissedNotificationIds]);

  // Filtered notifications in panel
  const displayedNotifications = useMemo(() => {
    if (notificationFilter === 'renewal') {
      return activeNotifications.filter((n) => n.type === 'renewal_due' || n.type === 'renewal_expired');
    }
    if (notificationFilter === 'pending') {
      return activeNotifications.filter((n) => n.type === 'pending_request' || n.type === 'pending_urgent');
    }
    if (notificationFilter === 'urgent') {
      return activeNotifications.filter((n) => n.isUrgent);
    }
    return activeNotifications;
  }, [activeNotifications, notificationFilter]);

  const renewalAlertsCount = activeNotifications.filter(
    (n) => n.type === 'renewal_due' || n.type === 'renewal_expired'
  ).length;

  const pendingAlertsCount = activeNotifications.filter(
    (n) => n.type === 'pending_request' || n.type === 'pending_urgent'
  ).length;

  const urgentAlertsCount = activeNotifications.filter((n) => n.isUrgent).length;

  // Personal user notification check
  const currentUserNotification = useMemo(() => {
    if (!currentUser) return null;
    const userCard = currentUser.membershipCardNo;
    const userNin = currentUser.nationalId;
    return activeNotifications.find(
      (n) => (userCard && n.cardNo === userCard) || (userNin && n.nationalId === userNin)
    );
  }, [currentUser, activeNotifications]);

  // Actions
  const handleDismissNotification = (notifId: string) => {
    const updated = [...dismissedNotificationIds, notifId];
    setDismissedNotificationIds(updated);
    localStorage.setItem('snte_dismissed_tracker_notifs_v1', JSON.stringify(updated));
  };

  const handleClearDismissed = () => {
    setDismissedNotificationIds([]);
    localStorage.removeItem('snte_dismissed_tracker_notifs_v1');
    showToast('تمت استعادة الإشعارات', 'تمت إعادة ضبط جميع التنبيهات وإظهارها مجدداً.', 'info');
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setDismissedNotificationIds(allIds);
    localStorage.setItem('snte_dismissed_tracker_notifs_v1', JSON.stringify(allIds));
    showToast('تمت القراءة', 'تم تمييز جميع التنبيهات الحالية كمقروءة.', 'info');
  };

  // 1. Direct Action: Renew membership subscription (+1 full year)
  const handleRenewMemberSubscription = (memberId: string, memberName: string) => {
    try {
      const allMembersRaw = localStorage.getItem('snte_members_v3');
      const allMembers: MemberData[] = allMembersRaw ? JSON.parse(allMembersRaw) : members;

      const nextYearTimestamp = Date.now() + 365 * 24 * 60 * 60 * 1000;
      const nextYearDateStr = new Date(nextYearTimestamp).toISOString().split('T')[0];

      const updated = allMembers.map((m) => {
        if (m.id === memberId || m.membershipCardNo === memberId) {
          return {
            ...m,
            duesPaid: true,
            duesStatus: 'مدفوع (سنة 2026/2027)',
            membershipStatus: 'active' as const,
            status: 'نشط (تم تجديد الاشتراك السنوي بنجاح)',
            temporaryExpiresAt: nextYearTimestamp,
            annualRenewalDate: nextYearDateStr,
            lastRenewalTimestamp: Date.now(),
            activatedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      localStorage.setItem('snte_members_v3', JSON.stringify(updated));
      setMembers(updated);

      // Also dismiss the renewal notification
      handleDismissNotification(`renewal-${memberId}`);

      window.dispatchEvent(new CustomEvent('snte-members-updated'));
      showToast(
        'تم تجديد الاشتراك السنوي بنجاح! 💳',
        `تم تمديد صلاحية اشتراك المنخرط (${memberName}) لمدة سنة كاملة وتثبيت حالة السداد.`
      );
    } catch {
      showToast('خطأ في العملية', 'تعذر حفظ تحديث التجديد، يرجى المحاولة لاحقاً.', 'info');
    }
  };

  // 2. Direct Action: Approve pending membership application
  const handleApprovePendingMember = (memberId: string, memberName: string) => {
    try {
      const allMembersRaw = localStorage.getItem('snte_members_v3');
      const allMembers: MemberData[] = allMembersRaw ? JSON.parse(allMembersRaw) : members;

      const nextYearTimestamp = Date.now() + 365 * 24 * 60 * 60 * 1000;

      const updated = allMembers.map((m) => {
        if (m.id === memberId || m.membershipCardNo === memberId) {
          return {
            ...m,
            duesPaid: true,
            duesStatus: 'مدفوع',
            membershipStatus: 'active' as const,
            status: 'نشط (معتمد رسمياً - سداد 100 دج)',
            temporaryExpiresAt: nextYearTimestamp,
            activatedBy: currentUser?.name || 'الأمانة العامة الوطنية S.N.T.E',
            activatedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      localStorage.setItem('snte_members_v3', JSON.stringify(updated));
      setMembers(updated);

      handleDismissNotification(`pending-${memberId}`);

      window.dispatchEvent(new CustomEvent('snte-members-updated'));
      showToast(
        'تم اعتماد العضوية بنجاح! ✅',
        `تمت الموافقة وتثبيت العضوية الدائمة للمنخرط (${memberName}) وتفعيل البطاقة رسمياً.`
      );
    } catch {
      showToast('خطأ في الاعتماد', 'حدث خطأ أثناء معالجة الطلب.', 'info');
    }
  };

  // 3. Batch Action: Renew all memberships due soon
  const handleBatchRenewExpiring = () => {
    const expiring = activeNotifications.filter((n) => n.type === 'renewal_due' || n.type === 'renewal_expired');
    if (expiring.length === 0) {
      showToast('لا توجد اشتراكات مستحقة', 'كافة الاشتراكات سارية ولا تتطلب تجديداً حالياً.', 'info');
      return;
    }

    try {
      const allMembersRaw = localStorage.getItem('snte_members_v3');
      const allMembers: MemberData[] = allMembersRaw ? JSON.parse(allMembersRaw) : members;
      const targetIds = new Set(expiring.map((n) => n.memberId));

      const nextYearTimestamp = Date.now() + 365 * 24 * 60 * 60 * 1000;
      const nextYearDateStr = new Date(nextYearTimestamp).toISOString().split('T')[0];

      const updated = allMembers.map((m) => {
        if (targetIds.has(m.id) || targetIds.has(m.membershipCardNo)) {
          return {
            ...m,
            duesPaid: true,
            duesStatus: 'مدفوع (تجديد جماعي 2026/2027)',
            membershipStatus: 'active' as const,
            status: 'نشط (تم تجديد الاشتراك السنوي)',
            temporaryExpiresAt: nextYearTimestamp,
            annualRenewalDate: nextYearDateStr,
            lastRenewalTimestamp: Date.now(),
          };
        }
        return m;
      });

      localStorage.setItem('snte_members_v3', JSON.stringify(updated));
      setMembers(updated);

      // Dismiss all batch renewed notifications
      const renewedNotifIds = expiring.map((n) => n.id);
      const newDismissed = [...dismissedNotificationIds, ...renewedNotifIds];
      setDismissedNotificationIds(newDismissed);
      localStorage.setItem('snte_dismissed_tracker_notifs_v1', JSON.stringify(newDismissed));

      window.dispatchEvent(new CustomEvent('snte-members-updated'));
      showToast(
        `تم تجديد ${expiring.length} اشتراك بنجاح! 💳`,
        'تم تحديث اشتراكات كافة المنخرطين المعنيين وتمديد صلاحياتها لعام كامل.'
      );
    } catch {
      showToast('خطأ في التجديد الجماعي', 'تعذر إتمام العملية الجماعية.', 'info');
    }
  };

  const handleOpenRegister = () => {
    (window as any).openSnteRegister
      ? (window as any).openSnteRegister()
      : window.dispatchEvent(new CustomEvent('snte-open-register'));
  };

  const handleOpenStatusModal = () => {
    (window as any).openSnteMembershipStatus
      ? (window as any).openSnteMembershipStatus()
      : window.dispatchEvent(new CustomEvent('snte-open-membership-status'));
  };

  const handleInspectCard = (cardNo: string) => {
    setSearchQuery(cardNo);
    const elem = document.getElementById('membership-search-box');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="membershipStatusSection"
      aria-label="واجهة متابعة حالة طلبات الانخراط وتنبيهات العضوية"
      className="relative py-14 px-4 sm:px-6 text-white font-['Cairo',sans-serif] overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 39, 18, 0.94), rgba(0, 55, 27, 0.90), rgba(0, 24, 11, 0.96)), url('/assets/aistudio/image_f36486a4.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Decorative Arabesque Border and Glow */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400" />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md bg-emerald-950 border-2 border-amber-400 text-white p-4 rounded-2xl shadow-2xl animate-bounce backdrop-blur-md flex items-start gap-3">
          <span className="text-2xl">{toastMessage.type === 'success' ? '✅' : 'ℹ️'}</span>
          <div className="flex-1">
            <h4 className="font-black text-amber-300 text-sm">{toastMessage.title}</h4>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-emerald-950 px-4 py-1.5 rounded-full text-xs font-black mb-3 shadow-lg border border-amber-300">
            <span>🔔</span>
            <span>نظام إشعارات وتتبع العضوية الرسمي S.N.T.E</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            فضاء متابعة حالة الانخراط ونظام التنبيهات اللحظي
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2.5 leading-relaxed max-w-2xl mx-auto">
            متابعة فورية لوضعية اشتراكات العضوية السنوية مع تنبيهات ذكية عند اقتراب موعد تجديد الاشتراك السنوي أو وجود طلبات انخراط معلقة تحتاج إلى اعتماد وتسوية.
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* NOTIFICATION HUB: ALERT BAR & FAST ACTION CARDS               */}
        {/* ------------------------------------------------------------- */}
        <div className="mb-8 space-y-4">
          {/* Main Control Banner */}
          <div className="bg-gradient-to-r from-black/80 via-emerald-950/85 to-black/80 backdrop-blur-xl rounded-3xl border-2 border-amber-400/50 p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Bell & Status Summary */}
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 flex items-center justify-center text-2xl shadow-lg border border-amber-300">
                  🔔
                </div>
                {activeNotifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-emerald-950 animate-pulse">
                    {activeNotifications.length}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">مركز التنبيهات والإشعارات الذكية</h3>
                  {urgentAlertsCount > 0 && (
                    <span className="bg-red-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                      {urgentAlertsCount} عاجل
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  {activeNotifications.length > 0
                    ? `لديك (${pendingAlertsCount}) طلبات معلقة و (${renewalAlertsCount}) اشتراكات تقترب من موعد التجديد`
                    : 'كافة الاشتراكات سارية ولا توجد طلبات معلقة حالياً'}
                </p>
              </div>
            </div>

            {/* Hub Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              <button
                type="button"
                onClick={toggleSound}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-200 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                title={isSoundMuted ? 'تفعيل نغمة التنبيهات' : 'كتم نغمة التنبيهات'}
              >
                <span>{isSoundMuted ? '🔇' : '🔊'}</span>
                <span>{isSoundMuted ? 'النغمة مكتومة' : 'النغمة مفعلة'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNotificationsDrawerOpen(!isNotificationsDrawerOpen)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-emerald-950 text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isNotificationsDrawerOpen ? 'إخفاء التفاصيل ▴' : 'عرض مركز التنبيهات ▾'}</span>
                <span className="bg-emerald-950 text-amber-300 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                  {activeNotifications.length}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Alert Banners (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Banner 1: Pending Membership Applications Alert */}
            <div
              className={`rounded-3xl p-4 sm:p-5 border transition-all ${
                pendingAlertsCount > 0
                  ? 'bg-gradient-to-br from-amber-950/70 via-black/60 to-amber-950/40 border-amber-400/60 shadow-xl'
                  : 'bg-black/35 border-emerald-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-xl shrink-0">
                    ⏳
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-amber-300">
                      تنبيه الطلبات المعلقة (الأسبوع التجريبي)
                    </h4>
                    <p className="text-xs text-amber-100/80 mt-1">
                      {pendingAlertsCount > 0
                        ? `يوجد ${pendingAlertsCount} ملف انخراط مؤقت بانتظار استلام البطاقة وسداد 100 دج`
                        : 'لا توجد طلبات معلقة تنتظر المعالجة حالياً'}
                    </p>
                  </div>
                </div>
                <span className="bg-amber-400 text-emerald-950 text-xs font-mono font-black px-2.5 py-1 rounded-xl shadow-xs">
                  {pendingAlertsCount} معلق
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-400/20 flex items-center justify-between gap-2">
                <span className="text-[11px] text-emerald-200">مهلة المعالجة: 7 أيام من التسجيل</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('pending');
                    const elem = document.getElementById('membership-status-tabs');
                    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400/90 hover:bg-amber-300 text-emerald-950 text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>عرض الطلبات المعلقة ⏳</span>
                </button>
              </div>
            </div>

            {/* Banner 2: Membership Subscription Renewal Alert */}
            <div
              className={`rounded-3xl p-4 sm:p-5 border transition-all ${
                renewalAlertsCount > 0
                  ? 'bg-gradient-to-br from-red-950/70 via-black/60 to-red-950/40 border-red-400/60 shadow-xl'
                  : 'bg-black/35 border-emerald-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-300 border border-red-400/40 flex items-center justify-center text-xl shrink-0">
                    💳
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-red-300">
                      تنبيه اقتراب موعد تجديد اشتراك العضوية
                    </h4>
                    <p className="text-xs text-red-100/80 mt-1">
                      {renewalAlertsCount > 0
                        ? `يوجد ${renewalAlertsCount} منخرط يحل موعد تجديد اشتراكهم السنوي خلال أقل من 30 يوماً`
                        : 'جميع الاشتراكات السنوية سارية ولا تستحق التجديد هذا الشهر'}
                    </p>
                  </div>
                </div>
                <span className="bg-red-500 text-white text-xs font-mono font-black px-2.5 py-1 rounded-xl shadow-xs">
                  {renewalAlertsCount} للتجديد
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-red-400/20 flex items-center justify-between gap-2">
                <span className="text-[11px] text-emerald-200">الاشتراك السنوي: الموسم 2026/2027</span>
                <button
                  type="button"
                  onClick={handleBatchRenewExpiring}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>تجديد كافة المستحقة 💳</span>
                </button>
              </div>
            </div>
          </div>

          {/* Personal Logged-in User Notification Card (if applicable) */}
          {currentUserNotification && (
            <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/20 via-emerald-900/40 to-amber-500/20 border-2 border-amber-400/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-right">
                <span className="text-2xl">👤</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-300 text-xs sm:text-sm">
                      تنبيه خاص بحسابك الشخصي ({currentUser.name || currentUser.fullName})
                    </span>
                    <span className="text-[10px] bg-amber-400 text-emerald-950 font-mono px-2 py-0.5 rounded-md font-bold">
                      {currentUserNotification.cardNo}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5">{currentUserNotification.message}</p>
                </div>
              </div>
              {currentUserNotification.type.startsWith('renewal') ? (
                <button
                  type="button"
                  onClick={() =>
                    handleRenewMemberSubscription(
                      currentUserNotification.memberId,
                      currentUserNotification.memberName
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
                >
                  💳 تجديد اشتراكي النقابي الآن
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleApprovePendingMember(
                      currentUserNotification.memberId,
                      currentUserNotification.memberName
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
                >
                  ✅ تسوية وتأكيد اشتراكي (100 دج)
                </button>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* EXPANDABLE DETAILED NOTIFICATIONS CENTER DRAWER              */}
          {/* ------------------------------------------------------------- */}
          {isNotificationsDrawerOpen && (
            <div className="bg-black/60 backdrop-blur-2xl rounded-3xl border-2 border-emerald-400/40 p-4 sm:p-6 shadow-2xl transition-all animate-fadeIn">
              {/* Drawer Top Header & Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/25">
                <div>
                  <h4 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                    <span>📋</span>
                    <span>سجل التنبيهات المباشرة والإجراءات السريعة</span>
                  </h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    إدارة الاشتراكات المستحقة والملفات المعلقة وتجديد العضويات بضغطة زر واحدة.
                  </p>
                </div>

                {/* Batch toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition-all cursor-pointer"
                  >
                    تحديد الكل كمقروء
                  </button>
                  {dismissedNotificationIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearDismissed}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-[11px] font-bold text-emerald-200 transition-all cursor-pointer"
                    >
                      استعادة المخفية ({dismissedNotificationIds.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={loadData}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-[11px] font-bold text-amber-300 transition-all cursor-pointer"
                  >
                    تحديث القائمة 🔄
                  </button>
                </div>
              </div>

              {/* Notification Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-3 border-b border-emerald-500/15">
                <button
                  type="button"
                  onClick={() => setNotificationFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    notificationFilter === 'all'
                      ? 'bg-amber-400 text-emerald-950 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <span>الكل</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono font-bold">
                    {activeNotifications.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setNotificationFilter('renewal')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    notificationFilter === 'renewal'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30'
                  }`}
                >
                  <span>💳 تجديد اشتراك العضوية</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono font-bold">
                    {renewalAlertsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setNotificationFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    notificationFilter === 'pending'
                      ? 'bg-amber-400 text-emerald-950 shadow-md'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30'
                  }`}
                >
                  <span>⏳ طلبات معلقة (أسبوع مؤقت)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono font-bold">
                    {pendingAlertsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setNotificationFilter('urgent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    notificationFilter === 'urgent'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30'
                  }`}
                >
                  <span>🚨 تنبيهات عاجلة</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono font-bold">
                    {urgentAlertsCount}
                  </span>
                </button>
              </div>

              {/* Notification Cards List */}
              <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
                {displayedNotifications.length === 0 ? (
                  <div className="text-center py-8 text-emerald-200/70">
                    <span className="text-3xl block mb-2">🎉</span>
                    <p className="text-xs font-bold">لا توجد تنبيهات نشطة في هذا القسم حالياً.</p>
                  </div>
                ) : (
                  displayedNotifications.map((n) => {
                    const isRenewal = n.type === 'renewal_due' || n.type === 'renewal_expired';
                    return (
                      <div
                        key={n.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                          n.isUrgent
                            ? 'bg-gradient-to-r from-red-950/60 via-black/40 to-emerald-950/40 border-red-500/50 shadow-md'
                            : isRenewal
                            ? 'bg-gradient-to-r from-emerald-950/60 via-black/40 to-emerald-950/40 border-amber-400/40'
                            : 'bg-black/40 border-amber-400/30'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl p-2 rounded-xl bg-white/10 shrink-0">
                              {n.type === 'renewal_expired'
                                ? '🔴'
                                : n.type === 'renewal_due'
                                ? '💳'
                                : n.type === 'pending_urgent'
                                ? '⚠️'
                                : '⏳'}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-black text-sm text-white">{n.title}</h5>
                                <span className="bg-emerald-900 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">
                                  {n.cardNo}
                                </span>
                                <span className="bg-white/10 text-emerald-200 text-[10px] px-2 py-0.5 rounded-md">
                                  ولاية {n.wilayaName} ({n.wilayaCode})
                                </span>
                              </div>
                              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">{n.message}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-amber-300 font-medium">
                                <span>📅 تاريخ الاستحقاق: {n.renewalDateStr}</span>
                                {n.daysRemaining > 0 && (
                                  <span className="font-bold">⏳ متبقي: {n.daysRemaining} يوماً</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons for this Notification Item */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap shrink-0">
                            {isRenewal ? (
                              <button
                                type="button"
                                onClick={() => handleRenewMemberSubscription(n.memberId, n.memberName)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span>💳 تجديد الاشتراك الآن (+سنة)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleApprovePendingMember(n.memberId, n.memberName)}
                                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span>✅ اعتماد وتثبيت العضوية</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleInspectCard(n.cardNo)}
                              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                              title="استعلام عن السجل بالبطاقة"
                            >
                              <span>🔍 فحص</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDismissNotification(n.id)}
                              className="px-2 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold transition-all cursor-pointer"
                              title="إخفاء هذا التنبيه"
                            >
                              <span>✕</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SEARCH & FILTERS CONTROLS                                     */}
        {/* ------------------------------------------------------------- */}
        <div
          id="membership-search-box"
          className="bg-black/45 backdrop-blur-md rounded-3xl border border-emerald-400/30 p-4 sm:p-6 mb-8 shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم التعريف الوطني NIN (18 رقماً)، رقم البطاقة (SNTE-2026-XXXX)، أو الاسم..."
                className="w-full pl-4 pr-11 py-3 rounded-2xl bg-white/10 border-2 border-emerald-400/40 text-white placeholder-emerald-200/60 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all text-right shadow-inner"
              />
              <span className="absolute right-3.5 top-3 text-lg text-amber-300">🔎</span>
            </div>

            {/* Wilaya Filter Dropdown */}
            <select
              value={selectedWilayaFilter}
              onChange={(e) => setSelectedWilayaFilter(e.target.value)}
              className="w-full sm:w-56 py-3 px-3.5 rounded-2xl bg-[#00371b] border-2 border-emerald-400/40 text-white text-xs font-bold focus:outline-none focus:border-amber-400 transition-all cursor-pointer"
            >
              <option value="">جميع الولايات (الـ 72)</option>
              {WILAYAS_LIST.map((w) => (
                <option key={w.code} value={w.code} className="bg-slate-900 text-white">
                  {w.code} - ولاية {w.name}
                </option>
              ))}
            </select>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <button
                type="button"
                onClick={handleOpenRegister}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>🪪</span>
                <span>تسجيل انخراط جديد</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAnalyticsOpen(true)}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap border border-emerald-400/40"
              >
                <span>📊</span>
                <span>لوحة القيادة الإحصائية (الرصيد والرتب)</span>
              </button>
            </div>
          </div>

          {/* Filter Pills with Counts */}
          <div
            id="membership-status-tabs"
            className="mt-5 pt-4 border-t border-emerald-500/20 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1"
          >
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'pending'
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-md scale-102'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40'
              }`}
            >
              <span className="animate-spin text-sm">⏳</span>
              <span>قيد الانتظار (أسبوع مؤقت)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'pending' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-amber-300'
                }`}
              >
                {counts.pending}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'active'
                  ? 'bg-emerald-400 text-emerald-950 border-emerald-300 shadow-md scale-102'
                  : 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border-emerald-400/40'
              }`}
            >
              <span>✅</span>
              <span>مقبول (عضوية دائمة مثبتة)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'active' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-emerald-300'
                }`}
              >
                {counts.active}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'rejected'
                  ? 'bg-red-500 text-white border-red-300 shadow-md scale-102'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/40'
              }`}
            >
              <span>❌</span>
              <span>مرفوض (بحاجة لتسوية)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'rejected' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-red-300'
                }`}
              >
                {counts.rejected}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <span>📋</span>
              <span>الكل</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'all' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-emerald-300'
                }`}
              >
                {counts.all}
              </span>
            </button>
          </div>
        </div>

        {/* Secure Privacy Lookup Box */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#004d26] to-emerald-950 rounded-3xl p-8 sm:p-12 text-center border-2 border-amber-400/60 shadow-2xl max-w-3xl mx-auto my-6">
          <div className="w-16 h-16 bg-amber-400 text-emerald-950 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-inner border border-amber-300 font-black">
            🔒
          </div>
          <span className="bg-amber-400 text-emerald-950 text-xs font-black px-4 py-1.5 rounded-full inline-block mb-3 shadow-xs">
            سرية وخصوصية البيانات الشخصية للمنخرطين
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
            تم إخفاء بطاقات الأسماء العامة حمايةً لخصوصية المنخرطين الجدد
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed mb-6 font-medium">
            للاستعلام عن وضعية طلب انخراطك أو متابعة العد التنازلي للأسبوع التجريبي وموعد تجديد الاشتراك السنوي، يرجى إدخال <strong className="text-amber-300 font-mono">رقم التعريف الوطني (NIN)</strong> أو <strong className="text-amber-300 font-mono">رقم البطاقة</strong> في خانة البحث أعلاه، أو الضغط على زر الاستعلام الشامل أدناه.
          </p>
          <button
            type="button"
            onClick={handleOpenStatusModal}
            className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-8 py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 border border-amber-300"
          >
            <span>🔎</span>
            <span>فتح نافذة الاستعلام الآمن عن حالة العضوية والاشتراكات</span>
          </button>
        </div>

        {/* View All & Full Tracker Action Banner */}
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleOpenStatusModal}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-emerald-950 font-black text-sm shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 border border-amber-300"
          >
            <span>🔎</span>
            <span>فتح نافذة الاستعلام الشامل وتتبع كافة طلبات الانخراط</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const elem = document.getElementById('admin-analytics-section');
              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-black text-sm shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 border border-emerald-500"
          >
            <span>📊</span>
            <span>لوحة التحكم الإدارية والإحصائيات التفاعلية</span>
          </button>
        </div>
      </div>
      <UnionAnalyticsDashboard isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
    </section>
  );
};
