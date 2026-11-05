/**
 * Universal Print & PDF Export Utility for SNTE Director Platform
 * Works reliably in both standalone browser tabs and sandboxed preview iframes.
 */

interface Html2PdfInstance {
  set: (opt: Record<string, unknown>) => {
    from: (el: HTMLElement) => {
      save: () => Promise<void>;
    };
  };
}

type WindowWithHtml2Pdf = Window & {
  html2pdf?: () => Html2PdfInstance;
};

export function exportElementToPDF(
  element: HTMLElement | null,
  filenameTitle: string,
  orientation: 'landscape' | 'portrait' = 'landscape'
): boolean {
  const target =
    element ||
    (document.querySelector('.a4-landscape-page') as HTMLElement | null) ||
    (document.querySelector('main') as HTMLElement | null);

  if (!target) return false;

  const w = window as unknown as WindowWithHtml2Pdf;
  const cleanTitle = filenameTitle.replace(/\s+/g, '_').replace(/[^\w\u0600-\u06FF_-]/g, '');

  if (typeof w.html2pdf === 'function') {
    const opt = {
      margin: [3, 3, 3, 3],
      filename: `${cleanTitle}_منصة_المدير_2026.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation },
    };
    w.html2pdf().set(opt).from(target).save();
    return true;
  }

  return false;
}

export function triggerPrintOrPdf(
  customTitle = 'وثيقة_رسمية_منصة_المدير',
  specificElement?: HTMLElement | null
) {
  const target =
    specificElement ||
    (document.querySelector('.a4-landscape-page') as HTMLElement | null) ||
    (document.querySelector('main') as HTMLElement | null);

  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // First try native browser print
  try {
    window.print();
  } catch {
    // Fallback if blocked
  }

  // Also trigger PDF generation via html2pdf if running inside an iframe where window.print() may be suppressed by sandbox
  let isInIframe = false;
  try {
    isInIframe = window.self !== window.top;
  } catch {
    isInIframe = true;
  }

  if (isInIframe && target) {
    exportElementToPDF(target, customTitle, 'landscape');
  }
}
