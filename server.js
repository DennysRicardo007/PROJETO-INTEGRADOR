require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());

// Serve todos os arquivos estáticos (HTML, CSS, JS, imagens) da raiz
app.use(express.static(__dirname));

// Rota principal: entrega o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
//aa
// Rota para obter a chave do Google Maps
app.get('/api/maps-key', (req, res) => {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave de API não configurada no servidor' });
  }

  res.json({ key: apiKey });
});

// Suporte para rodar localmente
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🗺️ Servidor rodando em http://localhost:${PORT}`);
  });
}

// Exporta para o Vercel Serverless Function
module.exports = app;