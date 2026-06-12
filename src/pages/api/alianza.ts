export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

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

  const resend = new Resend(import.meta.env.RESEND_API_TOKEN);

  const { error } = await resend.emails.send({
    from: import.meta.env.RESEND_FROM ?? 'onboarding@resend.dev',
    to: import.meta.env.CONTACT_EMAIL ?? 'juan.josecuadros1@gmail.com',
    replyTo: email,
    subject: `Propuesta de alianza — ${organizacion}`,
    html: `
      <h2>Nueva propuesta de alianza con laboratorio / IPS</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:4px 8px;font-weight:bold">Organización</td><td style="padding:4px 8px">${organizacion}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Tipo</td><td style="padding:4px 8px">${tipo}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Contacto</td><td style="padding:4px 8px">${nombre}${cargo ? ` (${cargo})` : ''}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Email</td><td style="padding:4px 8px">${email}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Teléfono</td><td style="padding:4px 8px">${telefono}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold">Ciudad</td><td style="padding:4px 8px">${ciudad}</td></tr>
        ${servicios ? `<tr><td style="padding:4px 8px;font-weight:bold">Servicios</td><td style="padding:4px 8px">${servicios}</td></tr>` : ''}
        ${mensaje ? `<tr><td style="padding:4px 8px;font-weight:bold">Descripción</td><td style="padding:4px 8px">${mensaje}</td></tr>` : ''}
      </table>
    `,
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Error al enviar el correo.' }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
