import { useState, useEffect } from 'react'
import { MapPin, Navigation } from 'lucide-react'

const MapComponent = ({ eventos = [] }) => {
  const [selectedEvento, setSelectedEvento] = useState(null)

  // Simulação de dados de eventos para demonstração
  const eventosSimulados = [
    {
      id: 1,
      cliente: 'Empresa ABC',
      local: 'São Paulo, SP',
      status: 'Em andamento',
      coordenadas: { lat: -23.5505, lng: -46.6333 },
      data_evento: '2025-08-20'
    },
    {
      id: 2,
      cliente: 'Empresa XYZ',
      local: 'Rio de Janeiro, RJ',
      status: 'Planejado',
      coordenadas: { lat: -22.9068, lng: -43.1729 },
      data_evento: '2025-08-25'
    },
    {
      id: 3,
      cliente: 'Empresa 123',
      local: 'Belo Horizonte, MG',
      status: 'Concluído',
      coordenadas: { lat: -19.9191, lng: -43.9386 },
      data_evento: '2025-08-15'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-green-500'
      case 'Planejado':
        return 'bg-blue-500'
      case 'Concluído':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden">
      {/* Simulação do mapa do Brasil */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200 opacity-30"></div>
      
      {/* Título do mapa */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          Mapa do Brasil - Eventos Ativos
        </h3>
      </div>

      {/* Marcadores dos eventos */}
      {eventosSimulados.map((evento, index) => (
        <div
          key={evento.id}
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
          style={{
            left: `${30 + (index * 25)}%`,
            top: `${40 + (index * 15)}%`
          }}
          onClick={() => setSelectedEvento(evento)}
        >
          <div className={`w-4 h-4 rounded-full ${getStatusColor(evento.status)} border-2 border-white shadow-lg animate-pulse`}></div>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
            {evento.cliente}
          </div>
        </div>
      ))}

      {/* Legenda */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="font-medium text-gray-800 mb-2 text-sm">Legenda</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Em andamento</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Planejado</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Concluído</span>
          </div>
        </div>
      </div>

      {/* Modal de detalhes do evento */}
      {selectedEvento && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg">{selectedEvento.cliente}</h3>
              <button
                onClick={() => setSelectedEvento(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Local:</strong> {selectedEvento.local}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs text-white ${getStatusColor(selectedEvento.status)}`}>
                  {selectedEvento.status}
                </span>
              </p>
              <p><strong>Data do Evento:</strong> {new Date(selectedEvento.data_evento).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Indicação de que é uma simulação */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-600 pointer-events-none">
        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium opacity-75">Simulação do Mapa do Brasil</p>
        <p className="text-xs opacity-50">Clique nos pontos para ver detalhes</p>
      </div>
    </div>
  )
}

export default MapComponent

