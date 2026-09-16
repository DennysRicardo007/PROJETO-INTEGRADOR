require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());

// Serve todos os arquivos estáticos (HTML, CSS, JS, imagens) da raiz do projeto
app.use(express.static(__dirname));

// Rota principal: entrega o index.html na raiz '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota protegida para obter a chave do Google Maps
app.get('/api/maps-key', (req, res) => {
  const referer = req.get('referer');

  // Permite localhost e domínios da Vercel / Domínio Próprio
  const isAllowed = !referer || 
    referer.includes('localhost') || 
    referer.includes('127.0.0.1') || 
    referer.includes('vercel.app') || 
    referer.includes(req.get('host'));

  if (!isAllowed && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Origem não autorizada' });
  }

  res.json({
    key: process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY
  });
});

// Inicialização do servidor para ambiente local
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🗺️ Servidor rodando em http://localhost:${PORT}`);
  });
}

// Exporta o aplicativo Express para ser consumido pela Vercel como Serverless Function
module.exports = app;