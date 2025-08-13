
import { NextResponse } from 'next/server';

// Almacenamiento temporal en memoria mientras solucionamos Firebase
let latestRFIDData = null;

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

    // Guardar en memoria temporalmente
    latestRFIDData = {
      rawData: rawData,
      contentType: contentType,
      timestamp: new Date().toISOString(),
      dataType: typeof rawData,
    };

    // Intentar guardar en Firebase pero no fallar si no funciona
    try {
      const { db } = await import('@/lib/firebaseAdmin');
      const docRef = db.collection('inventory').doc('latest-scan');
      await docRef.set(latestRFIDData);
      console.log('Data saved to Firebase successfully');
    } catch (firebaseError) {
      console.log('Firebase failed, but data saved to memory:', firebaseError.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Data received and stored for analysis',
      receivedType: typeof rawData,
      contentType: contentType,
      storage: latestRFIDData ? 'memory' : 'firebase'
    });

  } catch (error) {
    console.error('Error in RFID endpoint:', error);

    return NextResponse.json({ 
      success: false, 
      error: 'Data received but failed to process', 
      details: error.message 
    }, { status: 200 }); // Devolver 200 para no rechazar el cliente
  }
}

export async function GET() {
  return NextResponse.json(latestRFIDData || { message: 'No data received yet' });
}
