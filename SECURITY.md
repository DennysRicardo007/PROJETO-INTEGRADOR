# 🔒 Guia de Segurança - Google Maps API

## Como usar sua nova chave de forma segura

### Opção 1: Desenvolvimento Local (Rápido)
1. Copie sua chave do Google Cloud Console
2. Edite o arquivo `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui
   ```
3. Use o servidor Node.js:
   ```bash
   npm install
   npm start
   ```
4. Acesse em `http://localhost:3000`

### Opção 2: HTML Puro com Restrições (Simples)
Se não quiser usar servidor:
1. Crie a chave no Google Cloud Console
2. Configure restrições de **Referer** para apenas seu domínio
3. Configure restrições de **API** para apenas Google Maps
4. Use a chave diretamente no HTML (APENAS em produção com referer restrito)

### Opção 3: Produção Segura (Recomendado)
1. Mantenha a chave em variáveis de ambiente do servidor
2. Crie um endpoint `/api/maps-key` protegido
3. O frontend faz fetch para obter a chave
4. Use rate limiting e validação de origem

## Passos para gerar a chave:

### 1️⃣ Google Cloud Console
- Acesse: https://console.cloud.google.com
- Selecione seu projeto
- APIs e Serviços → Biblioteca
- Busque: "Maps JavaScript API"
- Clique em ativar

### 2️⃣ Criar Credencial
- APIs e Serviços → Credenciais
- Criar Credencial → Chave de API
- Copie a chave

### 3️⃣ Configurar Restrições (IMPORTANTE!)
- Clique na chave criada
- **Restrição de Aplicativo**: HTTP (sites)
- **Referer**: 
  - Desenvolvimento: `http://localhost:*` ou `http://127.0.0.1:*`
  - Produção: `https://seu-dominio.com/*`
- **Restrição de API**: Maps JavaScript API
- Clique em Salvar

## ⚠️ Nunca comita `.env` com chaves reais!

O `.gitignore` já está configurado para ignorar:
- `.env`
- `.env.local`
- Qualquer arquivo sensível

Compartilhe apenas o `.env.example` com outros desenvolvedores.

## Testando

Quando estiver pronto, atualize o arquivo `mapa.html` com:
```html
<script>
  // Carrega a chave de forma segura
  fetch('/api/maps-key')
    .then(r => r.json())
    .then(d => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${d.key}&callback=initMap`;
      document.head.appendChild(script);
    });
</script>
```

## Mais informações
- [Google Maps API Documentation](https://developers.google.com/maps/documentation/javascript/overview)
- [API Key Security Best Practices](https://developers.google.com/maps/api-key-best-practices)
