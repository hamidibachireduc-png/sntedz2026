const CONTACT_CARDS_API_URL =
  'https://script.google.com/macros/s/AKfycbxrB3H-Mzue4UkQ-Q4UwKnHwt-XSTEJRsCr4wjV5y4Dkr6wtnT8pT6btvQV0MBjSSlR/exec';

export interface ContactCardsApiResponse<T = Record<string, unknown>> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  user?: Record<string, unknown>;
  sessionToken?: string;
  activationCode?: string;
  expiresAt?: string;
  currentUserId?: string;
  users?: T[];
  messages?: T[];
}

export function callContactCardsApi<T = Record<string, unknown>>(
  payload: Record<string, string>,
  timeoutMs = 20000,
): Promise<ContactCardsApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const nonce = crypto.randomUUID();
    const iframe = document.createElement('iframe');
    const form = document.createElement('form');
    iframe.name = `snte-contact-api-${nonce}`;
    iframe.title = 'اتصال آمن بخدمة بطاقات الاتصال';
    iframe.hidden = true;
    form.hidden = true;
    form.method = 'POST';
    form.action = CONTACT_CARDS_API_URL;
    form.target = iframe.name;

    const fields = {
      bridge: '1',
      nonce,
      origin: window.location.origin,
      payload: JSON.stringify(payload),
    };
    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      window.clearTimeout(timer);
      form.remove();
      iframe.remove();
    };
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      const message = event.data as {
        type?: string;
        nonce?: string;
        response?: ContactCardsApiResponse<T>;
      };
      if (
        message?.type !== 'snte-contact-cards-response' ||
        message.nonce !== nonce ||
        !message.response
      ) {
        return;
      }
      cleanup();
      resolve(message.response);
    };
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('انتهت مهلة الاتصال بخدمة بطاقات الاتصال.'));
    }, timeoutMs);

    window.addEventListener('message', handleMessage);
    document.body.append(iframe, form);
    form.submit();
  });
}
