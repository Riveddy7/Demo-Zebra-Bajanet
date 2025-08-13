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
              label={`Total Tags: ${latestData?.tags?.length || 0}`} 
              color="primary" 
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
          ) : latestData?.tags?.length > 0 ? (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>EPC</strong></TableCell>
                    <TableCell><strong>TID</strong></TableCell>
                    <TableCell><strong>RSSI</strong></TableCell>
                    <TableCell><strong>PC</strong></TableCell>
                    <TableCell><strong>Antenna</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestData.tags.map((tag, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <code style={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                          {tag.epc || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code style={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                          {tag.tid || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={tag.rssi || 'N/A'} 
                          size="small" 
                          color={tag.rssi && tag.rssi > -50 ? 'success' : 'warning'} 
                        />
                      </TableCell>
                      <TableCell>{tag.pc || 'N/A'}</TableCell>
                      <TableCell>{tag.antenna || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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