
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    // Intentar obtener el cuerpo como JSON, texto o lo que sea
    let rawData;
    let contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      rawData = await request.json();
    } else {
      rawData = await request.text();
    }

    console.log('=== RFID Data Received ===');
    console.log('Content-Type:', contentType);
    console.log('Raw Data:', JSON.stringify(rawData, null, 2));
    console.log('========================');

    // Guardar los datos tal como llegan para análisis
    const docRef = db.collection('inventory').doc('latest-scan');
    await docRef.set({
      rawData: rawData,
      contentType: contentType,
      timestamp: new Date().toISOString(),
      dataType: typeof rawData,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Data received and stored for analysis',
      receivedType: typeof rawData,
      contentType: contentType
    });

  } catch (error) {
    console.error('Error in RFID endpoint:', error);
    
    // Intentar guardar incluso el error para diagnóstico
    try {
      const docRef = db.collection('inventory').doc('latest-scan');
      await docRef.set({
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'error'
      });
    } catch (dbError) {
      console.error('Failed to save error to database:', dbError);
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Data received but failed to process', 
      details: error.message 
    }, { status: 200 }); // Devolver 200 para no rechazar el cliente
  }
}
