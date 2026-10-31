// src/AdminNotificationsModal.tsx
// مركز التنبيهات والإشعارات الإدارية للأمين العام الوطني والولائي
import React, { useState } from 'react';
import {
  SnteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './notificationsSystem';

interface AdminNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SnteNotification[];
  currentUser: any;
  onOpenPendingMembers?: () => void;
  onOpenReviewRequests?: () => void;
  onRefreshNotifications: () => void;
}

export const AdminNotificationsModal: React.FC<AdminNotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onOpenPendingMembers,
  onOpenReviewRequests,
  onRefreshNotifications,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === 'all') return true;
    if (filterType === 'new_member') return notif.type === 'new_member';
    if (filterType === 'expiring') return notif.type === 'temporary_expiring';
    if (filterType === 'expired') return notif.type === 'temporary_expired';
    if (filterType === 'requests') return notif.type === 'license_request';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(notifications.map((n) => n.id));
    onRefreshNotifications();
  };

  const handleItemClick = (notif: SnteNotification) => {
    markNotificationAsRead(notif.id);
    onRefreshNotifications();

    if (notif.type === 'new_member' || notif.type === 'temporary_expiring' || notif.type === 'temporary_expired') {
      if (onOpenPendingMembers) {
        onClose();
        onOpenPendingMembers();
      }
    } else if (notif.type === 'license_request') {
      if (onOpenReviewRequests) {
        onClose();
        onOpenReviewRequests();
      }
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days === 1) return 'أمس';
    return `منذ ${days} أيام`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-center-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-['Cairo',sans-serif]"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-700/30 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00371b] via-[#004d26] to-[#00371b] text-white p-4 sm:p-5 border-b-2 border-amber-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shadow-inner font-black shrink-0">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="notif-center-title" className="text-base sm:text-lg font-black text-white">
                  مركز التنبيهات والإشعارات الإدارية
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                متابعة المنخرطين الجدد، اقتراب انتهاء فترات العضوية المؤقتة، وطلبات التراخيص
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                title="تحديد كافة التنبيهات كمقروءة"
              >
                تحديد الكل كمقروء ✓
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-base cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#004d26] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            الكل ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('new_member')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
              filterType === 'new_member'
                ? 'bg-[#004d26] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>🪪</span>
            <span>منخرطون جدد</span>
            <span className="text-[10px] font-mono opacity-80">
              ({notifications.filter((n) => n.type === 'new_member').length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expiring')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
              filterType === 'expiring'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <span>⚠️</span>
            <span>اقتراب انتهاء المهلة</span>
            <span className="text-[10px] font-mono opacity-80">
              ({notifications.filter((n) => n.type === 'temporary_expiring').length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expired')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
              filterType === 'expired'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white text-red-900 hover:bg-red-50 border border-red-200'
            }`}
          >
            <span>⏳</span>
            <span>مهلة منتهية</span>
            <span className="text-[10px] font-mono opacity-80">
              ({notifications.filter((n) => n.type === 'temporary_expired').length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('requests')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
              filterType === 'requests'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            <span>📩</span>
            <span>طلبات الترخيص</span>
            <span className="text-[10px] font-mono opacity-80">
              ({notifications.filter((n) => n.type === 'license_request').length})
            </span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <span className="text-4xl block">✨</span>
              <p className="font-bold text-sm">لا توجد تنبيهات في هذا القسم حالياً</p>
              <p className="text-xs text-gray-400">ستصلكم إشعارات فورية عند تسجيل منخرطين جدد أو اقتراب انتهاء فتراتهم المؤقتة.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUrgent = notif.isUrgent;
              return (
                <article
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col justify-between gap-2.5 ${
                    !notif.read
                      ? isUrgent
                        ? 'bg-amber-50/90 border-amber-400 shadow-xs'
                        : 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5 border ${
                          notif.type === 'temporary_expiring'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : notif.type === 'temporary_expired'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : notif.type === 'new_member'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {notif.type === 'temporary_expiring'
                          ? '⚠️'
                          : notif.type === 'temporary_expired'
                          ? '⏳'
                          : notif.type === 'new_member'
                          ? '🪪'
                          : '📩'}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-xs sm:text-sm text-gray-900">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
                          )}
                          {notif.wilayaName && (
                            <span className="text-[10px] font-bold bg-white text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                              ولاية {notif.wilayaName} ({notif.wilayaCode})
                            </span>
                          )}
                          {notif.hoursRemaining !== undefined && notif.hoursRemaining > 0 && (
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                notif.hoursRemaining <= 24
                                  ? 'bg-red-600 text-white animate-pulse'
                                  : 'bg-amber-200 text-amber-950'
                              }`}
                            >
                              متبقي {notif.hoursRemaining} ساعة
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">
                          {notif.message}
                        </p>

                        {/* Extra info badges if member */}
                        {notif.membershipCardNo && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px] text-gray-500 font-mono">
                            <span className="bg-black/5 px-2 py-0.5 rounded border border-gray-200 font-bold text-gray-800">
                              رقم البطاقة: {notif.membershipCardNo}
                            </span>
                            {notif.nationalId && (
                              <span className="bg-black/5 px-2 py-0.5 rounded border border-gray-200">
                                NIN: {notif.nationalId}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleItemClick(notif)}
                        className="bg-[#006633] hover:bg-[#004d26] text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>✅</span>
                        <span>
                          {notif.type === 'license_request'
                            ? 'مراجعة طلب الترخيص'
                            : 'معالجة العضوية وسداد 100 دج'}
                        </span>
                      </button>

                      {notif.phone && (
                        <a
                          href={`tel:${notif.phone}`}
                          className="bg-white hover:bg-gray-100 text-blue-700 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-gray-300 transition-colors flex items-center gap-1"
                          dir="ltr"
                        >
                          <span>📞</span>
                          <span>{notif.phone}</span>
                        </a>
                      )}
                    </div>

                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          onRefreshNotifications();
                        }}
                        className="text-[11px] text-gray-500 hover:text-gray-800 font-bold cursor-pointer"
                      >
                        تحديد كمقروء ✓
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <span>نظام التنبيهات يعمل بتحديث دوري وتلقائي مع قاعدة البيانات والشيتات</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
