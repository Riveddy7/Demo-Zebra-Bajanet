'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Box,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

export default function ValidationPage() {
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLatestData = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Error al obtener datos');
      }
      const data = await response.json();
      setLatestData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('es-ES');
  };

  return (
    <StyledContainer maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white', textAlign: 'center', mb: 4 }}>
        Validación de Datos RFID
      </Typography>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Endpoint: <code>POST http://139.177.101.46:8989/api/rfid</code>
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchLatestData}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error}
        </Alert>
      )}

      <StyledCard>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Estado del Sistema
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <Chip 
              label={loading ? "Cargando..." : "Conectado"} 
              color={loading ? "default" : "success"} 
            />
            <Chip 
              label={`Datos recibidos: ${latestData ? 'Sí' : 'No'}`} 
              color={latestData ? "success" : "default"} 
            />
            <Chip 
              label={`Última actualización: ${lastUpdated ? lastUpdated.toLocaleTimeString('es-ES') : 'N/A'}`} 
              color="info" 
            />
          </Box>
          {latestData?.timestamp && (
            <Typography variant="body2" color="textSecondary">
              Último escaneo recibido: {formatTimestamp(latestData.timestamp)}
            </Typography>
          )}
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Datos Recibidos
          </Typography>
          
          {loading ? (
            <Typography>Cargando datos...</Typography>
          ) : latestData ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                ¡Datos recibidos! Analizando formato...
              </Alert>
              
              <Typography variant="h6" gutterBottom>
                Información de Recepción:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Chip label={`Tipo: ${latestData.dataType || 'N/A'}`} color="primary" />
                <Chip label={`Content-Type: ${latestData.contentType || 'N/A'}`} color="secondary" />
                {latestData.status && (
                  <Chip label={`Status: ${latestData.status}`} color="error" />
                )}
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Datos Sin Procesar:
              </Typography>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5', maxHeight: 400, overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '12px', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {latestData.error ? 
                    `ERROR: ${latestData.error}` : 
                    JSON.stringify(latestData.rawData, null, 2)
                  }
                </pre>
              </Paper>
              
              {latestData.rawData && typeof latestData.rawData === 'object' && (
                <Box mt={2}>
                  <Typography variant="h6" gutterBottom>
                    Análisis Automático:
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Campo</strong></TableCell>
                          <TableCell><strong>Valor</strong></TableCell>
                          <TableCell><strong>Tipo</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(latestData.rawData).map(([key, value], index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <code style={{ backgroundColor: '#e3f2fd', padding: '2px 6px', borderRadius: '3px' }}>
                                {key}
                              </code>
                            </TableCell>
                            <TableCell>
                              <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px', maxWidth: 300, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={typeof value} 
                                size="small" 
                                color={typeof value === 'object' ? 'primary' : 'default'} 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              No se han recibido datos RFID aún. Envía datos al endpoint POST para verlos aquí.
            </Alert>
          )}
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Formato de Datos Esperado
          </Typography>
          <Typography variant="body2" gutterBottom>
            El endpoint espera datos en el siguiente formato JSON:
          </Typography>
          <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <pre style={{ margin: 0, fontSize: '14px' }}>
{`{
  "tags": [
    {
      "epc": "E20000123456789012345678",
      "tid": "E200001234567890",
      "rssi": -45,
      "pc": "3000",
      "antenna": 1
    }
  ]
}`}
            </pre>
          </Paper>
        </CardContent>
      </StyledCard>
    </StyledContainer>
  );
}