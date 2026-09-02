/**
 * Configuração da API Google Maps
 * Em produção, use variáveis de ambiente
 * Em desenvolvimento, use um arquivo .env
 */

function getGoogleMapsApiKey() {
  // Em um servidor Node.js/Express, você fetcharia de uma rota protegida
  // Por enquanto, como é um projeto simples, armazenaremos no .env
  
  // Se usando Vite ou similar:
  // const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Alternativa segura: carregue da sessão do servidor
  // return fetch('/api/maps-key').then(r => r.json()).then(d => d.key);
  
  // Para desenvolvimento local, você pode usar:
  return localStorage.getItem('google_maps_api_key') || '';
}

/**
 * Carrega o script do Google Maps dinamicamente
 */
function loadGoogleMapsScript(apiKey) {
  if (window.google && window.google.maps) {
    console.log('Google Maps já carregado');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = resolve;
    script.onerror = () => reject(new Error('Erro ao carregar Google Maps'));
    
    document.head.appendChild(script);
  });
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getGoogleMapsApiKey, loadGoogleMapsScript };
}
