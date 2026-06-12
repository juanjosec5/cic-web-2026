interface ContactFormOptions {
  formId: string;
  btnId: string;
  msgId: string;
  endpoint: string;
  loadingText?: string;
  defaultText: string;
  successText: string;
}

export function initContactForm(opts: ContactFormOptions): void {
  const form = document.getElementById(opts.formId) as HTMLFormElement | null;
  const btn  = document.getElementById(opts.btnId)  as HTMLButtonElement | null;
  const msg  = document.getElementById(opts.msgId)  as HTMLParagraphElement | null;
  if (!form || !btn || !msg) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    btn.disabled = true;
    btn.textContent = opts.loadingText ?? 'Enviando…';
    msg.className = 'mt-2 text-center text-xs hidden';

    try {
      const res = await fetch(opts.endpoint, { method: 'POST', body: new FormData(form) });

      if (res.ok) {
        const json = await res.json();
        if (json.ok) {
          msg.textContent = opts.successText;
          msg.className = 'mt-2 text-center text-xs text-green-600';
          form.reset();
          return;
        }
        throw new Error(json.error ?? 'Error desconocido');
      }

      let errMsg = 'Error desconocido';
      try { errMsg = (await res.json()).error ?? errMsg; } catch { /* non-JSON error body */ }
      throw new Error(errMsg);
    } catch {
      msg.textContent = 'Ocurrió un error al enviar. Por favor intente de nuevo.';
      msg.className = 'mt-2 text-center text-xs text-red-600';
    } finally {
      btn.disabled = false;
      btn.textContent = opts.defaultText;
      msg.classList.remove('hidden');
    }
  });
}
