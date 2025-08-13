
'use client';

import React, { useState, useEffect } from 'react';
import InventoryDisplay from '@/components/InventoryDisplay';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import AdbIcon from '@mui/icons-material/Adb';

// Crear un tema de Material Design
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Azul de Google
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f4f5f7',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('/api/inventory', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Error al obtener los datos del inventario');
        }
        const data = await response.json();
        // Ordenar los tags para una visualización estable
        setInventory(data.tags ? data.tags.sort() : []);
      } catch (err) {
        setError(err.message);
        console.error(err);
      }
    };

    // Carga inicial
    fetchInventory();

    // Polling cada 10 segundos
    const intervalId = setInterval(fetchInventory, 10000);

    // Limpieza al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              ZEBRA
            </Typography>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard de Inventario RFID
            </Typography>
          </Toolbar>
        </AppBar>
        <Container component="main" sx={{ mt: 4, mb: 4 }}>
          {error && <Typography color="error">Error: {error}</Typography>}
          <InventoryDisplay items={inventory} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
