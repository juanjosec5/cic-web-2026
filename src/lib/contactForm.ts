interface ContactFormOptions {
  formId: string;
  btnId: string;
  msgId: string;
  successId: string;
  resetBtnId: string;
  endpoint: string;
  loadingText?: string;
  defaultText: string;
}

export function initContactForm(opts: ContactFormOptions): void {
  const form     = document.getElementById(opts.formId)     as HTMLFormElement | null;
  const btn      = document.getElementById(opts.btnId)      as HTMLButtonElement | null;
  const msg      = document.getElementById(opts.msgId)      as HTMLParagraphElement | null;
  const success  = document.getElementById(opts.successId)  as HTMLElement | null;
  const resetBtn = document.getElementById(opts.resetBtnId) as HTMLButtonElement | null;
  if (!form || !btn || !msg || !success) return;

  resetBtn?.addEventListener('click', () => {
    success.classList.add('hidden');
    form.classList.remove('hidden');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    btn.disabled = true;
    btn.textContent = opts.loadingText ?? 'Enviando…';
    msg.className = 'mt-2 text-center text-xs hidden';

    let succeeded = false;

    try {
      const res = await fetch(opts.endpoint, { method: 'POST', body: new FormData(form) });

      if (res.ok) {
        const json = await res.json();
        if (json.ok) {
          succeeded = true;
        } else {
          throw new Error(json.error ?? 'Error desconocido');
        }
      } else {
        let errMsg = 'Error desconocido';
        try { errMsg = (await res.json()).error ?? errMsg; } catch { /* non-JSON error body */ }
        throw new Error(errMsg);
      }
    } catch {
      msg.textContent = 'Ocurrió un error al enviar. Por favor intente de nuevo.';
      msg.className = 'mt-2 text-center text-xs text-red-600';
    } finally {
      btn.disabled = false;
      btn.textContent = opts.defaultText;
      if (!succeeded) msg.classList.remove('hidden');
    }

    if (succeeded) {
      form.classList.add('hidden');
      success.classList.remove('hidden');
      form.reset();
    }
  });
}
