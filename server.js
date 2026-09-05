/**
 * Servidor simples para servir a chave do Google Maps com segurança
 * Use este arquivo se quiser proteger a chave no servidor
 * 
 * Instalação:
 * npm install express dotenv cors
 * 
 * Execução:
 * node server.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.redirect('/mapa.html');
});

// Rota protegida para obter a chave do Google Maps
app.get('/api/maps-key', (req, res) => {
  // Verificar origem (referer) para segurança adicional
  const referer = req.get('referer');
  const allowedOrigins = [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:5173', // Vite
    'http://127.0.0.1'
  ];

  const isAllowed = allowedOrigins.some(origin => referer?.startsWith(origin));

  if (!isAllowed && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Origem não autorizada' });
  }

  res.json({
    key: process.env.VITE_GOOGLE_MAPS_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`🗺️ Servidor rodando em http://localhost:${PORT}`);
  console.log('Use /api/maps-key para obter a chave do Google Maps');
});
