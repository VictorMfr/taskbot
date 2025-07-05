import { NextRequest, NextResponse } from 'next/server';
import connection from '@/db';
import { getUserIdFromRequest } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const proposal = await request.json();
    const { id, type, entity, data, description } = proposal;

    if (!id || !type || !entity || !data || !description) {
      return NextResponse.json({ message: 'Datos de propuesta incompletos' }, { status: 400 });
    }

    // Guardar la propuesta en la base de datos con la estructura correcta
    await connection.query(
      'INSERT INTO propuestas_pendientes (id, usuario_id, tipo, entidad, datos, descripcion) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, type, entity, JSON.stringify({ type, data, entity }), description]
    );

    return NextResponse.json({ message: 'Propuesta guardada' });

  } catch (error) {
    console.error('Error saving proposal:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
} 