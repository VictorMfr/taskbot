import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connection from '@/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const [rows]: any = await connection.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    const user = rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
