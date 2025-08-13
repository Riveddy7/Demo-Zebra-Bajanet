
import { NextResponse } from 'next/server';

// Almacenamiento temporal organizado por antena
let inventoryByAntenna = {};
let lastScanTimestamp = null;

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
    
    // Procesar datos si es un array de objetos RFID
    if (Array.isArray(rawData)) {
      const currentScanTime = new Date().toISOString();
      
      // Limpiar memoria temporal en cada nuevo escaneo
      inventoryByAntenna = {};
      
      // Procesar cada tag
      rawData.forEach(item => {
        if (item.data && item.data.antenna && item.data.idHex) {
          const antenna = item.data.antenna;
          const idHex = item.data.idHex;
          
          // Inicializar antena si no existe
          if (!inventoryByAntenna[antenna]) {
            inventoryByAntenna[antenna] = new Map();
          }
          
          // Agregar o actualizar tag (Map elimina duplicados automáticamente)
          inventoryByAntenna[antenna].set(idHex, {
            idHex: idHex,
            antenna: antenna,
            peakRssi: item.data.peakRssi,
            eventNum: item.data.eventNum,
            format: item.data.format,
            timestamp: item.timestamp,
            receivedAt: currentScanTime
          });
        }
      });
      
      // Convertir Maps a Arrays para facilitar el uso
      const processedData = {};
      Object.keys(inventoryByAntenna).forEach(antenna => {
        processedData[antenna] = Array.from(inventoryByAntenna[antenna].values());
      });
      
      lastScanTimestamp = currentScanTime;
      
      console.log('Processed data by antenna:', Object.keys(processedData).map(ant => ({
        antenna: ant,
        count: processedData[ant].length
      })));
      console.log('========================');
      
      // Intentar guardar en Firebase
      try {
        const { db } = await import('@/lib/firebaseAdmin');
        const docRef = db.collection('inventory').doc('latest-scan');
        await docRef.set({
          antennas: processedData,
          timestamp: currentScanTime,
          totalTags: Object.values(processedData).reduce((sum, tags) => sum + tags.length, 0)
        });
        console.log('Data saved to Firebase successfully');
      } catch (firebaseError) {
        console.log('Firebase failed, but data saved to memory:', firebaseError.message);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Processed ${Object.values(processedData).reduce((sum, tags) => sum + tags.length, 0)} unique tags across ${Object.keys(processedData).length} antennas`,
        antennas: Object.keys(processedData).map(ant => ({
          antenna: parseInt(ant),
          uniqueTags: processedData[ant].length
        }))
      });
    } else {
      // Datos no reconocidos, guardar tal como llegan para análisis
      const currentScanTime = new Date().toISOString();
      inventoryByAntenna = {
        rawData: rawData,
        contentType: contentType,
        timestamp: currentScanTime,
        dataType: typeof rawData,
      };
      lastScanTimestamp = currentScanTime;
      
      return NextResponse.json({ 
        success: true, 
        message: 'Data received and stored for analysis (non-standard format)',
        receivedType: typeof rawData,
        contentType: contentType
      });
    }

  } catch (error) {
    console.error('Error in RFID endpoint:', error);

    return NextResponse.json({ 
      success: false, 
      error: 'Data received but failed to process', 
      details: error.message 
    }, { status: 200 });
  }
}

export async function GET() {
  console.log('GET /api/rfid called');
  console.log('lastScanTimestamp:', lastScanTimestamp);
  console.log('inventoryByAntenna keys:', Object.keys(inventoryByAntenna));
  
  if (!lastScanTimestamp) {
    return NextResponse.json({ message: 'No data received yet' });
  }
  
  // Procesar datos de antenas
  const processedAntennas = [];
  
  Object.keys(inventoryByAntenna).forEach(antennaKey => {
    const antennaNum = parseInt(antennaKey);
    const antennaData = inventoryByAntenna[antennaKey];
    
    let tags = [];
    if (antennaData instanceof Map) {
      tags = Array.from(antennaData.values());
    } else if (Array.isArray(antennaData)) {
      tags = antennaData;
    }
    
    if (tags.length > 0) {
      processedAntennas.push({
        antenna: antennaNum,
        tags: tags
      });
    }
  });
  
  const responseData = {
    antennas: processedAntennas,
    timestamp: lastScanTimestamp,
    totalTags: processedAntennas.reduce((sum, antenna) => sum + antenna.tags.length, 0)
  };
  
  console.log('GET response:', JSON.stringify(responseData, null, 2));
  
  return NextResponse.json(responseData);
}
