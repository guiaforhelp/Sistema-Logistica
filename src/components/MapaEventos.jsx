import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, RefreshCw, MapPin, Clock, Calendar, User, Building, X, Menu } from 'lucide-react';

const MapaEventos = () => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const markerClusterRef = useRef(null);
  const infoWindowRef = useRef(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dados, setDados] = useState(null);
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [filtros, setFiltros] = useState({
    status: ['planejado', 'em_andamento', 'finalizado'],
    busca: '',
    dataInicio: '',
    dataFim: ''
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Configurações do Google Maps
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'SUA_CHAVE_AQUI'; // Configurar no .env
  
  // Cores dos pins por status
  const STATUS_COLORS = {
    'PLANEJADO': '#3B82F6', // Azul
    'EM_ANDAMENTO': '#EF4444', // Vermelho
    'FINALIZADO': '#6B7280' // Cinza
  };

  // Carregar Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    window.initMap = () => {
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      setError('Erro ao carregar Google Maps API');
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.initMap;
    };
  }, []);

  // Inicializar mapa quando API estiver carregada
  useEffect(() => {
    if (isLoaded && mapRef.current && !googleMapRef.current) {
      initializeMap();
    }
  }, [isLoaded]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      carregarDados();
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(interval);
  }, [autoRefresh, filtros]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const initializeMap = () => {
    try {
      // Configuração do mapa centrado no Brasil
      const mapOptions = {
        center: { lat: -14.235, lng: -51.9253 }, // Centro do Brasil
        zoom: 4,
        mapTypeId: 'roadmap',
        gestureHandling: 'greedy',
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
      
      // Inicializar InfoWindow
      infoWindowRef.current = new window.google.maps.InfoWindow();
      
      console.log('Mapa inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      setError('Erro ao inicializar o mapa');
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query string
      const params = new URLSearchParams();
      
      if (filtros.status.length > 0) {
        params.append('status', filtros.status.join(','));
      }
      
      if (filtros.busca.trim()) {
        params.append('q', filtros.busca.trim());
      }
      
      if (filtros.dataInicio) {
        params.append('inicio', filtros.dataInicio);
      }
      
      if (filtros.dataFim) {
        params.append('fim', filtros.dataFim);
      }
      
      const response = await fetch(`/api/mapa/eventos?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDados(data);
      
      // Atualizar markers no mapa
      if (googleMapRef.current) {
        atualizarMarkers(data.itens);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const atualizarMarkers = (itens) => {
    // Limpar markers existentes
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Limpar cluster se existir
    if (markerClusterRef.current) {
      markerClusterRef.current.clearMarkers();
    }
    
    if (!itens || itens.length === 0) return;
    
    // Criar novos markers
    const novosMarkers = itens.map(item => {
      const marker = new window.google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        map: googleMapRef.current,
        title: item.nomeCliente,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: STATUS_COLORS[item.status] || '#6B7280',
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      });
      
      // Adicionar listener para InfoWindow
      marker.addListener('click', () => {
        mostrarInfoWindow(marker, item);
      });
      
      return marker;
    });
    
    markersRef.current = novosMarkers;
    
    // Aplicar clustering se houver muitos markers
    if (novosMarkers.length > 10 && window.MarkerClusterer) {
      markerClusterRef.current = new window.MarkerClusterer({
        map: googleMapRef.current,
        markers: novosMarkers
      });
    }
  };

  const mostrarInfoWindow = (marker, item) => {
    const formatarData = (isoString) => {
      if (!isoString) return 'N/A';
      try {
        return new Date(isoString).toLocaleString('pt-BR');
      } catch {
        return 'N/A';
      }
    };

    const getStatusBadge = (status) => {
      const cores = {
        'PLANEJADO': 'background: #3B82F6; color: white;',
        'EM_ANDAMENTO': 'background: #EF4444; color: white;',
        'FINALIZADO': 'background: #6B7280; color: white;'
      };
      
      return `<span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; ${cores[status] || ''}">${status}</span>`;
    };

    const conteudo = `
      <div style="max-width: 300px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 16px;">${item.nomeCliente}</h3>
        
        <div style="margin-bottom: 8px;">
          ${getStatusBadge(item.status)}
        </div>
        
        <div style="margin-bottom: 8px;">
          <strong>📍 Local:</strong> ${item.local}
        </div>
        
        <div style="margin-bottom: 8px;">
          <strong>📅 Ativação:</strong> ${formatarData(item.dataAtivacao)}
        </div>
        
        ${item.inicioEvento ? `
          <div style="margin-bottom: 8px;">
            <strong>🚀 Início:</strong> ${formatarData(item.inicioEvento)}
          </div>
        ` : ''}
        
        ${item.fimEvento ? `
          <div style="margin-bottom: 8px;">
            <strong>🏁 Fim:</strong> ${formatarData(item.fimEvento)}
          </div>
        ` : ''}
        
        ${item.responsavelAtivacao ? `
          <div style="margin-bottom: 8px;">
            <strong>👤 Responsável:</strong> ${item.responsavelAtivacao}
          </div>
        ` : ''}
        
        <div style="margin-top: 12px;">
          <button onclick="window.location.href='${item.linkOperacao}'" 
                  style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">
            Ver Operação
          </button>
        </div>
      </div>
    `;
    
    infoWindowRef.current.setContent(conteudo);
    infoWindowRef.current.open(googleMapRef.current, marker);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleStatusToggle = (status) => {
    setFiltros(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      status: ['planejado', 'em_andamento', 'finalizado'],
      busca: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Google Maps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarAberta ? 'w-80' : 'w-0'} overflow-hidden`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Filtros e Busca</h2>
            <button
              onClick={() => setSidebarAberta(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cliente, responsável, local..."
              value={filtros.busca}
              onChange={(e) => handleFiltroChange('busca', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtros de Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="space-y-2">
              {[
                { key: 'planejado', label: 'Planejado', color: 'bg-blue-500' },
                { key: 'em_andamento', label: 'Em Andamento', color: 'bg-red-500' },
                { key: 'finalizado', label: 'Finalizado (≤48h)', color: 'bg-gray-500' }
              ].map(({ key, label, color }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filtros.status.includes(key)}
                    onChange={() => handleStatusToggle(key)}
                    className="mr-2"
                  />
                  <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Filtros de Data */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <div className="space-y-2">
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Data início"
              />
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Data fim"
              />
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="space-y-2">
            <button
              onClick={carregarDados}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            
            <button
              onClick={limparFiltros}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Limpar Filtros
            </button>
          </div>
          
          {/* Auto-refresh */}
          <div className="mt-4 pt-4 border-t">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Auto-atualizar (5min)</span>
            </label>
          </div>
        </div>
        
        {/* Estatísticas */}
        {dados && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Estatísticas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  Planejados
                </span>
                <span className="font-medium">{dados.totais.planejado}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  Em Andamento
                </span>
                <span className="font-medium">{dados.totais.em_andamento}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                  Finalizados
                </span>
                <span className="font-medium">{dados.totais.finalizado_48h}</span>
              </div>
              {dados.totais.nao_geocodificado > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Não geocodificados</span>
                  <span className="font-medium">{dados.totais.nao_geocodificado}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Área do Mapa */}
      <div className="flex-1 relative">
        {/* Botão para abrir sidebar no mobile */}
        {!sidebarAberta && (
          <button
            onClick={() => setSidebarAberta(true)}
            className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Carregando eventos...</p>
            </div>
          </div>
        )}
        
        {/* Mapa */}
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Legenda */}
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Legenda</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Planejado</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span>Em Andamento</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
              <span>Finalizado (≤48h)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaEventos;

