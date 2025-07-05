import { NextRequest, NextResponse } from 'next/server';
import connection from '@/db';
import { getUserIdFromRequest } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { proposalId } = await request.json();
    if (!proposalId) {
      return NextResponse.json({ message: 'ID de propuesta requerido' }, { status: 400 });
    }

    // Eliminar la propuesta rechazada
    const [result]: any = await connection.query(
      'DELETE FROM propuestas_pendientes WHERE id = ? AND usuario_id = ?',
      [proposalId, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Propuesta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Propuesta rechazada' });

  } catch (error) {
    console.error('Error rejecting proposal:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
} 