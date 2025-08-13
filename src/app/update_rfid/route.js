import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// GET method para mostrar interfaz visual de debug
export async function GET() {
  try {
    // Obtener los últimos datos recibidos
    const docRef = db.collection('inventory').doc('latest-scan');
    const doc = await docRef.get();
    
    const lastData = doc.exists ? doc.data() : null;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Debug RFID - Lectora Zebra</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            .tags { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0; }
            .tag { display: inline-block; background: #007bff; color: white; padding: 5px 10px; margin: 2px; border-radius: 3px; }
            pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
            .refresh { text-align: center; margin: 20px 0; }
            button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        </style>
        <script>
            function refreshData() {
                window.location.reload();
            }
            setInterval(refreshData, 5000); // Auto-refresh cada 5 segundos
        </script>
    </head>
    <body>
        <div class="container">
            <h1>🏷️ Debug RFID - Lectora Zebra</h1>
            <div class="info">
                <strong>Endpoint:</strong> POST /update_rfid<br>
                <strong>Estado:</strong> Activo y esperando datos<br>
                <strong>Auto-refresh:</strong> Cada 5 segundos
            </div>
            
            ${lastData ? `
                <div class="success">
                    ✅ Último escaneo recibido: ${new Date(lastData.timestamp).toLocaleString('es-ES')}
                </div>
                
                <h3>Tags RFID Detectados (${lastData.tags ? lastData.tags.length : 0})</h3>
                <div class="tags">
                    ${lastData.tags ? lastData.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : 'Sin tags'}
                </div>
                
                <h3>Datos Raw Recibidos</h3>
                <pre>${JSON.stringify(lastData.rawData || {}, null, 2)}</pre>
                
                <h3>Información del Escaneo</h3>
                <ul>
                    <li><strong>Fuente:</strong> ${lastData.source || 'No especificada'}</li>
                    <li><strong>Timestamp:</strong> ${lastData.timestamp}</li>
                    <li><strong>Total Tags:</strong> ${lastData.tags ? lastData.tags.length : 0}</li>
                </ul>
            ` : `
                <div class="info">
                    ⏳ Esperando primer escaneo de la lectora Zebra...
                </div>
            `}
            
            <div class="refresh">
                <button onclick="refreshData()">🔄 Actualizar Manualmente</button>
            </div>
            
            <hr>
            <h3>Instrucciones de Uso</h3>
            <p>Configure su lectora Zebra para enviar datos HTTP POST a:</p>
            <pre>http://139.177.101.46:8989/update_rfid</pre>
            <p>Formatos JSON soportados:</p>
            <pre>
// Array directo
["tag1", "tag2", "tag3"]

// Objeto con tags
{"tags": ["tag1", "tag2"]}

// TagReads de Zebra
{"tagReads": [{"epc": "tag1"}, {"tid": "tag2"}]}

// Tag individual
{"epc": "tag1"}
            </pre>
        </div>
    </body>
    </html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error en GET /update_rfid:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

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