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
    console.log('approve/route.ts - proposalId recibido:', proposalId);
    if (!proposalId) {
      return NextResponse.json({ message: 'ID de propuesta requerido' }, { status: 400 });
    }

    // Obtener las propuestas pendientes del usuario
    const [proposals]: any = await connection.query(
      'SELECT * FROM propuestas_pendientes WHERE usuario_id = ? AND id = ?',
      [userId, proposalId]
    );
    console.log('approve/route.ts - proposals encontrados:', proposals);

    if (!proposals || proposals.length === 0) {
      return NextResponse.json({ message: 'Propuesta no encontrada en la base de datos' }, { status: 404 });
    }

    const proposal = proposals[0];
    const proposalData = typeof proposal.datos === 'string' ? JSON.parse(proposal.datos) : proposal.datos;
    console.log('approve/route.ts - proposalData:', proposalData);

    if (!proposalData || !proposalData.type || !proposalData.data) {
      return NextResponse.json({ message: 'Datos de la propuesta inválidos', proposalData }, { status: 400 });
    }

    // Ejecutar la acción según el tipo de propuesta
    switch (proposalData.type) {
      case 'create':
        await connection.query(
          'INSERT INTO tareas (usuario_id, nombre, descripcion, prioridad, fecha_limite, estado, tarea_padre_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            userId,
            proposalData.data.nombre,
            proposalData.data.descripcion,
            proposalData.data.prioridad,
            proposalData.data.fecha_limite,
            proposalData.data.estado,
            proposalData.data.tarea_padre_id || null
          ]
        );
        break;

      case 'update':
        await connection.query(
          'UPDATE tareas SET nombre=?, descripcion=?, prioridad=?, fecha_limite=?, estado=?, tarea_padre_id=? WHERE id=? AND usuario_id=?',
          [
            proposalData.data.nombre,
            proposalData.data.descripcion,
            proposalData.data.prioridad,
            proposalData.data.fecha_limite,
            proposalData.data.estado,
            proposalData.data.tarea_padre_id || null,
            proposalData.data.id,
            userId
          ]
        );
        break;

      case 'delete':
        await connection.query(
          'DELETE FROM tareas WHERE id=? AND usuario_id=?',
          [proposalData.data.id, userId]
        );
        break;

      default:
        return NextResponse.json({ message: 'Tipo de propuesta no válido', proposalData }, { status: 400 });
    }

    // Eliminar la propuesta aprobada
    await connection.query(
      'DELETE FROM propuestas_pendientes WHERE id = ? AND usuario_id = ?',
      [proposalId, userId]
    );

    return NextResponse.json({ message: 'Propuesta aprobada y aplicada' });

  } catch (error) {
    console.error('Error approving proposal:', error);
    return NextResponse.json({ message: 'Error interno del servidor', error: String(error) }, { status: 500 });
  }
} 