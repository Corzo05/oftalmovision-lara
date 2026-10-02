import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const buildEmailHtml = (nombre: string, telefono: string, email: string, mensaje: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
</head>
<body style="background-color: #f3f4f6; font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #1f2937; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
    
    <h2 style="color: #111827; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 8px;">Nuevo mensaje de contacto de drjesuscorzo.com.ve</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 16px;">Has recibido una nueva consulta con los siguientes datos:</p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
      <span style="display: block; font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Nombre y apellido</span>
      <p style="color: #111827; font-size: 16px; margin: 0;">${nombre}</p>
    </div>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
      <span style="display: block; font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Teléfono</span>
      <p style="color: #111827; font-size: 16px; margin: 0;">${telefono || 'No proporcionado'}</p>
    </div>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
      <span style="display: block; font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Correo electrónico</span>
      <p style="color: #111827; font-size: 16px; margin: 0;">
        <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email || 'No proporcionado'}</a>
      </p>
    </div>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
      <span style="display: block; font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Mensaje</span>
      <p style="color: #111827; font-size: 16px; margin: 0; white-space: pre-wrap; line-height: 1.625;">${mensaje}</p>
    </div>
    
    <div style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
      Este correo fue enviado automáticamente desde el formulario de contacto de tu dominio.
    </div>
    
  </div>
</body>
</html>
`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { nombre, telefono, email, mensaje, website } = body;

    if (website) {
      return new Response(JSON.stringify({ success: true, message: 'Mensaje procesado' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!nombre || !telefono || !mensaje) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos obligatorios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Contacto Web <consultas@drjesuscorzo.com.ve>',
      to: [import.meta.env.EMAIL_DESTINATARIO],
      replyTo: email,
      subject: `Nuevo mensaje de ${nombre}`,
      html: buildEmailHtml(nombre, telefono, email, mensaje), 
    });

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};