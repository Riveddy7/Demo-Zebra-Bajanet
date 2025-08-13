
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { tags } = body;

    // Valida que los tags sean un array
    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: 'Invalid data format: tags must be an array.' }, { status: 400 });
    }

    // Guarda/sobrescribe el último escaneo en Firestore
    const docRef = db.collection('inventory').doc('latest-scan');
    await docRef.set({
      tags: tags,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: `Inventory updated with ${tags.length} tags.` });

  } catch (error) {
    console.error('Error in RFID endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
