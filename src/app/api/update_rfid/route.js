import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Datos RFID recibidos de lectora Zebra:', data);

    // Extraer tags del payload (ajustar según formato de Zebra)
    let tags = [];
    
    // Si los datos vienen como array de tags directamente
    if (Array.isArray(data)) {
      tags = data;
    }
    // Si vienen en una propiedad específica (común en lectoras Zebra)
    else if (data.tags && Array.isArray(data.tags)) {
      tags = data.tags;
    }
    // Si vienen como objetos con EPC/TID
    else if (data.tagReads && Array.isArray(data.tagReads)) {
      tags = data.tagReads.map(tag => tag.epc || tag.tid || tag.tagId);
    }
    // Si viene un solo tag
    else if (data.epc || data.tid || data.tagId) {
      tags = [data.epc || data.tid || data.tagId];
    }

    // Filtrar tags válidos (no vacíos)
    tags = tags.filter(tag => tag && typeof tag === 'string' && tag.trim() !== '');

    console.log(`Procesando ${tags.length} tags RFID:`, tags);

    // Guardar en Firebase (mismo formato que /api/rfid)
    const docRef = db.collection('inventory').doc('latest-scan');
    await docRef.set({
      tags: tags,
      timestamp: new Date().toISOString(),
      source: 'zebra-reader',
      rawData: data // Guardar datos originales para debug
    });

    return NextResponse.json({ 
      success: true, 
      message: `Inventario actualizado con ${tags.length} tags desde lectora Zebra`,
      tagsProcessed: tags.length
    });

  } catch (error) {
    console.error('Error procesando datos de lectora Zebra:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor al procesar datos RFID',
      details: error.message 
    }, { status: 500 });
  }
}
