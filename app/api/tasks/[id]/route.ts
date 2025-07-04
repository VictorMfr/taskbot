import { NextRequest, NextResponse } from 'next/server';
import connection from '@/db';
import { getUserIdFromRequest } from '@/utils/auth';

// PUT: Editar tarea o subtarea
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    const { nombre, descripcion, prioridad, fecha_limite, estado, tarea_padre_id } = await request.json();
    const [result]: any = await connection.query(
      'UPDATE tareas SET nombre=?, descripcion=?, prioridad=?, fecha_limite=?, estado=?, tarea_padre_id=? WHERE id=? AND usuario_id=?',
      [nombre, descripcion, prioridad, fecha_limite, estado, tarea_padre_id || null, params.id, userId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Tarea no encontrada o sin permisos' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Tarea actualizada' });
  } catch (error) {
    console.error('Tasks PUT error:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar tarea o subtarea (y sus subtareas en cascada)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    // Eliminar la tarea solo si pertenece al usuario
    const [result]: any = await connection.query(
      'DELETE FROM tareas WHERE id=? AND usuario_id=?',
      [params.id, userId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Tarea no encontrada o sin permisos' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Tarea eliminada' });
  } catch (error) {
    console.error('Tasks DELETE error:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
} 