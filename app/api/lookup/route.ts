import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_LOOKUP_URL = 'https://efcgpppctxrytnvuawsk.supabase.co/functions/v1/mr-mutant-public-lookup';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const number = typeof body?.number === 'string' ? body.number.trim() : '';
    if (!number) return NextResponse.json({ error: 'Escribe un número telefónico.' }, { status: 400 });

    const upstream = await fetch(SUPABASE_LOOKUP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number }),
      cache: 'no-store',
    });

    const text = await upstream.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { error: text || 'Respuesta inválida del servicio.' }; }
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con el servicio de búsqueda.' }, { status: 502 });
  }
}
