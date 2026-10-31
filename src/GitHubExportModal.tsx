import React, { useState } from 'react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [customCommandCopied, setCustomCommandCopied] = useState(false);

  if (!isOpen) return null;

  const repoUrl = 'https://github.com/hamidibachireduc-png/sntedz2026';
  const rawCommand = `git remote set-url origin https://<GITHUB_TOKEN>@github.com/hamidibachireduc-png/sntedz2026.git\ngit branch -M main\ngit add .\ngit commit -m "feat: complete deployment of SNTE 2026 portal with official digital platforms"\ngit push -u origin main --force`;

  const dynamicCommand = tokenInput.trim()
    ? `git remote set-url origin https://${tokenInput.trim()}@github.com/hamidibachireduc-png/sntedz2026.git\ngit branch -M main\ngit add .\ngit commit -m "feat: update SNTE 2026 portal"\ngit push -u origin main --force`
    : rawCommand;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawCommand);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2500);
  };

  const handleCopyCustom = () => {
    navigator.clipboard.writeText(dynamicCommand);
    setCustomCommandCopied(true);
    setTimeout(() => setCustomCommandCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-700/30 overflow-hidden flex flex-col font-['Cairo',sans-serif] max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black shadow-md">
              🐙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  المستودع الرسمي
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  hamidibachireduc-png/sntedz2026
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                تثبيت ونشر المشروع على مستودع GitHub
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-red-300 p-1.5 rounded-xl hover:bg-white/10 transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Status badge */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">✅</span>
              <div>
                <span className="font-black text-emerald-950 block text-xs">
                  تمت تهيئة مستودع Git المحلي وحفظ كافة ملفات المشروع
                </span>
                <span className="text-[11px] text-emerald-800 font-medium">
                  تم ضبط الفرع الأساسي (main) وربط العنوان البعيد (origin) بالمستودع المحدد.
                </span>
              </div>
            </div>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1 shadow-xs transition-colors"
            >
              <span>فتح المستودع ↗</span>
            </a>
          </div>

          {/* Quick token generator command */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
              <span>🔑</span>
              <span>توليد أمر الرفع المباشر باستخدام رمز الوصول (GitHub Personal Access Token):</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              لحماية حسابك، يطلب GitHub إذن التحقق (Token) لرفع التغييرات. ألصق الرمز الخاص بك هنا للحصول على أمر الدفع الجاهز للتنفيذ فورياً:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ألصق الرمز هنا (مثال: ghp_xxxxxxxxxxxxxx)..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleCopyCustom}
                disabled={!tokenInput.trim()}
                className="bg-[#006633] hover:bg-[#004d26] disabled:opacity-40 text-white px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer transition-colors shrink-0 shadow-xs"
              >
                {customCommandCopied ? '✓ تم النسخ' : 'نسخ الأمر المباشر'}
              </button>
            </div>
          </div>

          {/* Code block */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800 text-xs">
                أوامر Terminal الجاهزة للرفع والتثبيت:
              </span>
              <button
                type="button"
                onClick={handleCopyRaw}
                className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] cursor-pointer"
              >
                {copiedCommand ? '✓ تم النسخ إلى الحافظة' : '📋 نسخ الأوامر'}
              </button>
            </div>
            <pre
              className="bg-slate-950 text-emerald-300 p-3.5 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 text-left select-all"
              dir="ltr"
            >
              {dynamicCommand}
            </pre>
          </div>

          {/* Guide Steps */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-[11px] space-y-2 text-amber-950">
            <h5 className="font-black text-amber-900 flex items-center gap-1.5">
              <span>💡</span>
              <span>خطوات الحصول على رمز GitHub Token مجاناً (في دقيقة واحدة):</span>
            </h5>
            <ol className="list-decimal list-inside space-y-1 pr-1 font-medium leading-relaxed">
              <li>
                افتح صفحة الرموز الشخصية في GitHub:{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 font-black underline"
                >
                  github.com/settings/tokens ↗
                </a>
              </li>
              <li>اضغط على <strong>Generate new token (classic)</strong>.</li>
              <li>حدد صلاحية <strong>repo</strong> (التحكم في المستودعات).</li>
              <li>انسخ الرمز الناتج وألصقه في الحقل أعلاه لتنفيذ الرفع إلى مستودعك بنجاح!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500 font-bold">
            مستودع: https://github.com/hamidibachireduc-png/sntedz2026
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black text-xs cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
