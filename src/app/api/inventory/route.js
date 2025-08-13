
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic'; // Asegura que la ruta sea dinámica

export async function GET(request) {
  try {
    const docRef = db.collection('inventory').doc('latest-scan');
    const doc = await docRef.get();

    if (!doc.exists) {
      // Si no hay datos, devuelve una lista vacía
      return NextResponse.json({ tags: [] });
    } else {
      // Devuelve los tags del último escaneo
      return NextResponse.json(doc.data());
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
