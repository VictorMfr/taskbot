import { NextRequest, NextResponse } from 'next/server';
import connection from '@/db';
import { getUserIdFromRequest } from '@/utils/auth'; // Asume que existe una utilidad para extraer el userId del JWT

// GET: Listar todas las tareas y subtareas del usuario en estructura de árbol
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    // Obtener todas las tareas del usuario
    const [rows]: any = await connection.query(
      'SELECT * FROM tareas WHERE usuario_id = ?',
      [userId]
    );
    // Convertir a estructura de árbol
    const buildTree = (tasks: any[], parentId: number | null = null) =>
      tasks
        .filter((t) => t.tarea_padre_id === parentId)
        .map((t) => ({ ...t, subtareas: buildTree(tasks, t.id) }));
    const tree = buildTree(rows);
    return NextResponse.json({ tareas: tree });
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear una nueva tarea o subtarea
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    const { nombre, descripcion, prioridad, fecha_limite, estado, tarea_padre_id } = await request.json();
    if (!nombre || !prioridad || !estado) {
      return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }
    const [result]: any = await connection.query(
      'INSERT INTO tareas (usuario_id, nombre, descripcion, prioridad, fecha_limite, estado, tarea_padre_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, nombre, descripcion, prioridad, fecha_limite, estado, tarea_padre_id || null]
    );
    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
} 