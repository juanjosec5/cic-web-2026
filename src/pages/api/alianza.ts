export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { esc } from '@/lib/escapeHtml';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('multipart/form-data') && !ct.includes('application/x-www-form-urlencoded')) {
    return new Response(JSON.stringify({ error: 'Tipo de contenido no soportado.' }), { status: 415 });
  }

  const apiToken = import.meta.env.RESEND_API_TOKEN;
  if (!apiToken) {
    return new Response(JSON.stringify({ error: 'Configuración de servidor incompleta.' }), { status: 503 });
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Datos de formulario inválidos.' }), { status: 400 });
  }

  if (data.get('_gotcha')) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const organizacion = data.get('organizacion')?.toString() ?? '';
  const tipo = data.get('tipo')?.toString() ?? '';
  const nombre = data.get('nombre')?.toString() ?? '';
  const cargo = data.get('cargo')?.toString() ?? '';
  const email = data.get('email')?.toString() ?? '';
  const telefono = data.get('telefono')?.toString() ?? '';
  const ciudad = data.get('ciudad')?.toString() ?? '';
  const servicios = data.getAll('servicio[]').map(String).join(', ');
  const mensaje = data.get('mensaje')?.toString() ?? '';

  if (!organizacion || !tipo || !nombre || !email || !telefono || !ciudad) {
    return new Response(JSON.stringify({ error: 'Campos requeridos faltantes.' }), { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: 'Correo electrónico inválido.' }), { status: 400 });
  }

  const resend = new Resend(apiToken);

  const { error } = await resend.emails.send({
    from: import.meta.env.RESEND_FROM ?? 'onboarding@resend.dev',
    to: import.meta.env.CONTACT_EMAIL ?? 'juan.josecuadros1@gmail.com',
    replyTo: email,
    subject: `Propuesta de alianza — ${esc(organizacion)}`,
    html: `
      <h2>Nueva propuesta de alianza con laboratorio / IPS</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:4px 8px;font-weight:bold">Organización</td><td style="padding:4px 8px">${esc(organizacion)}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Tipo</td><td style="padding:4px 8px">${esc(tipo)}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Contacto</td><td style="padding:4px 8px">${esc(nombre)}${cargo ? ` (${esc(cargo)})` : ''}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Email</td><td style="padding:4px 8px">${esc(email)}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Teléfono</td><td style="padding:4px 8px">${esc(telefono)}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Ciudad</td><td style="padding:4px 8px">${esc(ciudad)}</td></tr>
        ${servicios ? `<tr><td style="padding:4px 8px;font-weight:bold">Servicios</td><td style="padding:4px 8px">${esc(servicios)}</td></tr>` : ''}
        ${mensaje ? `<tr><td style="padding:4px 8px;font-weight:bold">Descripción</td><td style="padding:4px 8px">${esc(mensaje)}</td></tr>` : ''}
      </table>
    `,
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Error al enviar el correo.' }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
