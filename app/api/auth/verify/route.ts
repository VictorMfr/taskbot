import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connection from '@/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Simulación de base de datos (en producción usarías una DB real)
const users: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validar campos
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword
    };

    // En producción, guardar en base de datos
    users.push(newUser);

    // Generar JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retornar respuesta sin la contraseña
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      user: userWithoutPassword,
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verificar JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar usuario en la base de datos
    const [rows]: any = await connection.query('SELECT id, email, name FROM usuarios WHERE id = ?', [decoded.userId]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const user = rows[0];
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
