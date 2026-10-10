export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { supabase } from '../../lib/supabase';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const formatDateLabel = (isoDate: string) => {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const buildEmailHtml = (
  nombre: string,
  cedula: string,
  telefono: string,
  email: string,
  nombreDia: string,
  fecha: string,
  hora: string,
  mensaje: string
) => {
  const fechaFormateada = formatDateLabel(fecha);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
</head>
<body style="background-color: #f3f4f6; font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #1f2937; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
    
    <h2 style="color: #111827; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 8px;">Nueva solicitud de cita en drjesuscorzo.com.ve</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 16px;">Has recibido una solicitud de agendamiento con los siguientes datos:</p>
    
    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
      <span style="display: block; font-weight: bold; color: #0284c7; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Cita Deseada</span>
      <p style="color: #0369a1; font-size: 18px; font-weight: bold; margin: 0;">📅 ${nombreDia} ${fechaFormateada} — ⏰ ${hora}</p>
    </div>

    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
      <span style="display: block; font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Nombre y apellido</span>
      <p style="color: #111827; font-size: 16px; margin: 0;">${nombre}</p>
    </div>

    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
      <span style="display: block; font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Cédula de Identidad</span>
      <p style="color: #111827; font-size: 16px; margin: 0;">${cedula}</p>
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
      <span style="display: block; font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Detalle o Motivo</span>
      <p style="color: #111827; font-size: 16px; margin: 0; white-space: pre-wrap; line-height: 1.625;">${mensaje}</p>
    </div>
    
    <div style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
      Este correo fue enviado automáticamente desde el formulario de agendamiento web.
    </div>
    
  </div>
</body>
</html>
  `;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { nombre, cedula, telefono, email, nombreDia, fecha, hora, mensaje, website } = body;

    if (website) {
      return new Response(JSON.stringify({ success: true, message: 'Mensaje procesado' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!nombre || !cedula || !telefono || !mensaje || !fecha || !hora) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos obligatorios (nombre, cédula, teléfono, fecha, hora y mensaje)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fechaFormateada = formatDateLabel(fecha);

    const { data: existingSlot } = await supabase
      .from('citas')
      .select('id')
      .eq('fecha', fecha)
      .eq('hora', hora)
      .maybeSingle();

    if (existingSlot) {
      return new Response(
        JSON.stringify({ error: 'El horario seleccionado acaba de ser reservado. Por favor elige otro.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error: dbError } = await supabase.from('citas').insert([
      { nombre, cedula, telefono, email, fecha, hora, mensaje }
    ]);

    if (dbError) {
      return new Response(JSON.stringify({ error: 'Error al reservar el cupo en la base de datos' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data, error: emailError } = await resend.emails.send({
      from: 'Contacto Web <consultas@drjesuscorzo.com.ve>',
      to: [import.meta.env.EMAIL_DESTINATARIO],
      replyTo: email || undefined,
      subject: `Nueva cita: ${nombre} (${cedula}) - ${nombreDia} ${fechaFormateada} (${hora})`,
      html: buildEmailHtml(nombre, cedula, telefono, email, nombreDia, fecha, hora, mensaje), 
    });

    if (emailError) {
      return new Response(JSON.stringify({ error: emailError }), {
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