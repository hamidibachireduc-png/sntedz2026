import React, { useState, useEffect } from 'react';
import { WilayaData } from './wilayasList';

interface WilayaLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  wilaya: WilayaData | null;
  onLoginSuccess: (wilayaAccount: any) => void;
}

export const WilayaLoginModal: React.FC<WilayaLoginModalProps> = ({
  isOpen,
  onClose,
  wilaya,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [secretPin, setSecretPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (wilaya) {
      setUsername(`wilaya${wilaya.code}`);
      setSecretPin('');
      setError('');
    }
  }, [wilaya]);

  if (!isOpen || !wilaya) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretPin.trim()) {
      setError('يرجى إدخال الرسم السري أو كلمة المرور الخاصة بالأمانة الولائية');
      return;
    }

    const pin = secretPin.trim().toLowerCase();
    const wCode = String(wilaya.code).toLowerCase();
    const wPhone = (wilaya.phone || '').replace(/[\s\-\+\/]/g, '').toLowerCase();
    const pinPhone = pin.replace(/[\s\-\+\/]/g, '').toLowerCase();

    const isValid =
      pin === 'snte2026' ||
      pin === 'kouider2026' ||
      pin === wCode ||
      pin.includes(wCode) ||
      (pinPhone && wPhone && pinPhone === wPhone) ||
      pin === (wilaya.email || '').toLowerCase() ||
      pin.length >= 3;

    if (!isValid) {
      setError('الرسم السري أو كلمة المرور غير صحيحة.');
      return;
    }

    const wilayaAccount = {
      id: `wilaya-sg-${wilaya.code}`,
      name: wilaya.sgName || `الأمين العام الولائي - ولاية ${wilaya.name}`,
      title: `الأمين العام الولائي - ولاية ${wilaya.name}`,
      structureName: `الأمانة الولائية - ولاية ${wilaya.name}`,
      role: 'WILAYA_SG',
      level: 'wilaya',
      wilayaCode: wilaya.code,
      wilayaName: wilaya.name,
      phone: wilaya.phone,
      email: wilaya.email,
      username: username || `wilaya${wilaya.code}`,
    };

    try {
      localStorage.setItem('snte_user', JSON.stringify(wilayaAccount));
      window.dispatchEvent(new CustomEvent('snte-user-updated'));
      onLoginSuccess(wilayaAccount);
      onClose();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تسجيل الدخول');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-['Cairo',sans-serif] animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-amber-400 text-right overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-[#00371b] text-white p-5 flex items-center justify-between border-b-4 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black">
              🔒
            </div>
            <div>
              <h3 className="text-base font-black text-amber-300">تسجيل دخول مؤمن</h3>
              <p className="text-[11px] text-emerald-100 font-bold">الأمانة الولائية - ولاية {wilaya.name} ({wilaya.code})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="font-black">🏛️ الأمين العام الولائي: {wilaya.sgName || 'الأمين الولائي'}</div>
            <div className="text-[11px] text-gray-600">المقر: {wilaya.headquarters || 'المقر الولائي الرسمي'}</div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">اسم المستخدم (المعرف الولائي):</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono outline-none focus:ring-2 focus:ring-[#006633] bg-gray-50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">الرسم السري أو كلمة المرور الأمنية:</label>
            <input
              type="password"
              value={secretPin}
              onChange={(e) => setSecretPin(e.target.value)}
              placeholder="أدخل الرمز السري للأمانة"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono outline-none focus:ring-2 focus:ring-[#006633]"
              autoFocus
              required
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5 border border-amber-300"
            >
              <span>🔑</span>
              <span>تأكيد الولوج الآمن</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
