import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connection from '@/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validar campos
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const [existing] = await connection.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insertar usuario
    const [result]: any = await connection.query(
      'INSERT INTO usuarios (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    const user = {
      id: result.insertId,
      email,
      name
    };

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
