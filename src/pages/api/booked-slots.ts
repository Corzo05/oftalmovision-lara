export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const fecha = url.searchParams.get('fecha');

  if (!fecha) {
    return new Response(JSON.stringify({ bookedSlots: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data, error } = await supabase
      .from('citas')
      .select('hora')
      .eq('fecha', fecha);

    if (error) throw error;

    const bookedSlots = data.map((item) => item.hora);

    return new Response(JSON.stringify({ bookedSlots }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};