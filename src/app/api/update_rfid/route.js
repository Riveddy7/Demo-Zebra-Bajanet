import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Datos RFID recibidos:', data);

    // Aquí puedes agregar la lógica para procesar los datos,
    // como guardarlos en tu base de datos.

    return NextResponse.json({ message: 'Datos recibidos correctamente', data }, { status: 200 });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json({ message: 'Error: El cuerpo de la solicitud no es un JSON válido.' }, { status: 400 });
  }
}
