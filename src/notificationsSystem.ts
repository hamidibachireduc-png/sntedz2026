// src/notificationsSystem.ts
// نظام التنبيهات والإشعارات الذكي للأمين العام الوطني والأمناء العامين الولائيين (S.N.T.E)

export type NotificationType =
  | 'new_member' // تسجيل منخرط جديد
  | 'temporary_expiring' // اقتراب انتهاء مهلة الأسبوع (أقل من 48 ساعة)
  | 'temporary_expired' // انتهاء مهلة الأسبوع دون سداد
  | 'license_request'; // طلب ترخيص نشر موضوع جديد

export interface SnteNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  memberId?: string;
  memberFullName?: string;
  membershipCardNo?: string;
  wilayaCode?: string;
  wilayaName?: string;
  nationalId?: string;
  phone?: string;
  hoursRemaining?: number;
  daysRemaining?: number;
  isUrgent?: boolean;
}

const NOTIFICATIONS_STORAGE_KEY = 'snte_notifications_v2';
const READ_IDS_STORAGE_KEY = 'snte_notifications_read_ids_v1';

// Play subtle, non-intrusive sound alert via browser Web Audio API
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle two-tone chime
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.46);
  } catch {
    // Audio context may be restricted before interaction; safe to ignore
  }
};

// Get stored read notification IDs
const getReadNotificationIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(READ_IDS_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

// Save a notification as read
export const markNotificationAsRead = (id: string) => {
  try {
    const readIds = getReadNotificationIds();
    readIds.add(id);
    localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(Array.from(readIds)));
    window.dispatchEvent(new CustomEvent('snte-notifications-updated'));
  } catch {}
};

// Mark all notifications as read
export const markAllNotificationsAsRead = (ids: string[]) => {
  try {
    const readIds = getReadNotificationIds();
    ids.forEach((id) => readIds.add(id));
    localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(Array.from(readIds)));
    window.dispatchEvent(new CustomEvent('snte-notifications-updated'));
  } catch {}
};

// Synchronize and generate notifications from real database records (members & publication requests)
export const generateDynamicNotifications = (currentUser: any): SnteNotification[] => {
  const notifications: SnteNotification[] = [];
  const readIds = getReadNotificationIds();

  const isNationalSG =
    currentUser?.role === 'NATIONAL_SG' ||
    currentUser?.level === 'national' ||
    currentUser?.username === 'kouideryahiaoui';

  const userWilayaCode = currentUser?.wilayaCode ? String(currentUser.wilayaCode).padStart(2, '0') : null;

  // 1. Scan Members (snte_members_v3)
  try {
    const membersRaw = localStorage.getItem('snte_members_v3');
    const members: any[] = membersRaw ? JSON.parse(membersRaw) : [];
    const now = Date.now();

    members.forEach((m) => {
      const mWilayaCode = String(m.wilayaCode || '').padStart(2, '0');

      // Filter: If user is Wilaya SG, only process their wilaya members
      if (!isNationalSG && userWilayaCode && mWilayaCode !== userWilayaCode) {
        return;
      }

      const isPending = m.membershipStatus === 'temporary_pending' || (!m.membershipStatus && !m.duesPaid);
      const regTime = m.registrationTimestamp || (m.joinDate ? new Date(m.joinDate).getTime() : now);
      const expiresAt = m.temporaryExpiresAt || (regTime + 7 * 24 * 60 * 60 * 1000);
      const diffMs = expiresAt - now;
      const hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      // 1.1 Notification: New member registered (within the last 7 days)
      const newMemberNotifId = `notif-new-${m.id}`;
      notifications.push({
        id: newMemberNotifId,
        type: 'new_member',
        title: `تسجيل منخرط جديد: ${m.fullName}`,
        message: `سُجل منخرط جديد برقم بطاقة (${m.membershipCardNo}) بولاية ${m.wilayaName}، وهو في فترة ولوج مؤقتة (أسبوع) في انتظار استلام البطاقة الورقية وسداد اشتراك 100 دج.`,
        timestamp: regTime,
        read: readIds.has(newMemberNotifId),
        memberId: m.id,
        memberFullName: m.fullName,
        membershipCardNo: m.membershipCardNo,
        wilayaCode: m.wilayaCode,
        wilayaName: m.wilayaName,
        nationalId: m.nationalId,
        phone: m.phone,
        daysRemaining: daysRemaining,
        hoursRemaining: hoursRemaining,
        isUrgent: false,
      });

      // 1.2 Notification: Temporary membership expiring soon (under 48 hours remaining)
      if (isPending && diffMs > 0 && hoursRemaining <= 48) {
        const expiringNotifId = `notif-expiring-${m.id}`;
        notifications.push({
          id: expiringNotifId,
          type: 'temporary_expiring',
          title: `⚠️ تنبيه: اقتراب انتهاء فترة الأسبوع للمنخرط ${m.fullName}`,
          message: `متبقي ${hoursRemaining > 24 ? `${daysRemaining} يوم` : `${hoursRemaining} ساعة`} فقط على انتهاء فترة العضوية المؤقتة للمنخرط ${m.fullName} (ولاية ${m.wilayaName}). يرجى تأكيد تسديد اشتراك 100 دج واقتناء البطاقة الورقية لتفادي غلق الحساب.`,
          timestamp: expiresAt - 48 * 60 * 60 * 1000,
          read: readIds.has(expiringNotifId),
          memberId: m.id,
          memberFullName: m.fullName,
          membershipCardNo: m.membershipCardNo,
          wilayaCode: m.wilayaCode,
          wilayaName: m.wilayaName,
          nationalId: m.nationalId,
          phone: m.phone,
          daysRemaining: daysRemaining,
          hoursRemaining: hoursRemaining,
          isUrgent: true,
        });
      }

      // 1.3 Notification: Temporary membership expired without payment
      if (isPending && diffMs <= 0) {
        const expiredNotifId = `notif-expired-${m.id}`;
        notifications.push({
          id: expiredNotifId,
          type: 'temporary_expired',
          title: `⏳ انتهت مهلة الأسبوع: ${m.fullName}`,
          message: `انتهت فترة الولوج التجريبية للمنخرط ${m.fullName} (ولاية ${m.wilayaName}) دون تسديد اشتراك 100 دج. يمكنكم الآن رفض الحساب أو التواصل معه لتسوية الوضعية.`,
          timestamp: expiresAt,
          read: readIds.has(expiredNotifId),
          memberId: m.id,
          memberFullName: m.fullName,
          membershipCardNo: m.membershipCardNo,
          wilayaCode: m.wilayaCode,
          wilayaName: m.wilayaName,
          nationalId: m.nationalId,
          phone: m.phone,
          daysRemaining: 0,
          hoursRemaining: 0,
          isUrgent: true,
        });
      }
    });
  } catch (err) {
    console.error('Error generating member notifications:', err);
  }

  // 2. Scan Publication Requests (snte_publication_requests_v1)
  try {
    const reqsRaw = localStorage.getItem('snte_publication_requests_v1');
    const reqs: any[] = reqsRaw ? JSON.parse(reqsRaw) : [];

    reqs.forEach((r) => {
      if (r.status === 'pending') {
        // If National SG, sees all requests; if Wilaya SG, only sees requests from their wilaya
        const rWilayaCode = r.wilayaCode ? String(r.wilayaCode).padStart(2, '0') : null;
        if (!isNationalSG && userWilayaCode && rWilayaCode !== userWilayaCode) {
          return;
        }

        const reqNotifId = `notif-req-${r.id}`;
        notifications.push({
          id: reqNotifId,
          type: 'license_request',
          title: `📩 طلب ترخيص نشر: ${r.title}`,
          message: `ورد طلب ترخيص بنشر نشاط نقابي من طرف الأستاذ ${r.submittedBy} (${r.wilayaName || 'الأمانة الولائية'}). في انتظار مراجعة وتفويض الأمين العام الوطني.`,
          timestamp: r.timestamp ? new Date(r.timestamp).getTime() : Date.now(),
          read: readIds.has(reqNotifId),
          wilayaCode: r.wilayaCode,
          wilayaName: r.wilayaName,
          isUrgent: false,
        });
      }
    });
  } catch (err) {
    console.error('Error generating request notifications:', err);
  }

  // Sort by timestamp descending (newest first)
  return notifications.sort((a, b) => b.timestamp - a.timestamp);
};
