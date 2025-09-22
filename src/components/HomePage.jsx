import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { 
  Calendar, 
  Search, 
  Plus, 
  MapPin, 
  User, 
  Clock, 
  DollarSign,
  Building2,
  AlertCircle,
  CheckCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2
} from 'lucide-react'

const HomePage = ({ onNavigateToTab }) => {
  // Estados para o calendário
  const [calendarioData, setCalendarioData] = useState(new Date())
  const [eventosCalendario, setEventosCalendario] = useState({})
  const [modalCalendarioAberto, setModalCalendarioAberto] = useState(false)
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [eventosSelecionados, setEventosSelecionados] = useState([])
  const [carregandoCalendario, setCarregandoCalendario] = useState(false)

  // Estados para eventos próximos
  const [eventosProximos, setEventosProximos] = useState([])
  const [carregandoEventosProximos, setCarregandoEventosProximos] = useState(false)

  // Estados para busca
  const [filtrosBusca, setFiltrosBusca] = useState({
    q: '',
    cliente: '',
    responsavel_ativacao: '',
    local_entrega: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  })
  const [resultadosBusca, setResultadosBusca] = useState([])
  const [buscandoOperacoes, setBuscandoOperacoes] = useState(false)
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false)

  // Estados para estatísticas
  const [estatisticas, setEstatisticas] = useState(null)

  // Carregar dados do calendário
  const carregarEventosCalendario = async (mes = null, ano = null) => {
    setCarregandoCalendario(true)
    try {
      const mesAtual = mes || calendarioData.getMonth() + 1
      const anoAtual = ano || calendarioData.getFullYear()
      
      const response = await fetch(`/api/home/calendario?mes=${mesAtual}&ano=${anoAtual}`)
      const dados = await response.json()
      
      if (response.ok) {
        setEventosCalendario(dados.eventos_por_dia || {})
      } else {
        console.error('Erro ao carregar eventos do calendário:', dados.error)
      }
    } catch (error) {
      console.error('Erro ao carregar eventos do calendário:', error)
    } finally {
      setCarregandoCalendario(false)
    }
  }

  // Carregar eventos próximos
  const carregarEventosProximos = async () => {
    setCarregandoEventosProximos(true)
    try {
      const response = await fetch('/api/home/eventos-proximos?limite=10')
      const dados = await response.json()
      
      if (response.ok) {
        setEventosProximos(dados.eventos || [])
      } else {
        console.error('Erro ao carregar eventos próximos:', dados.error)
      }
    } catch (error) {
      console.error('Erro ao carregar eventos próximos:', error)
    } finally {
      setCarregandoEventosProximos(false)
    }
  }

  // Carregar estatísticas
  const carregarEstatisticas = async () => {
    try {
      const response = await fetch('/api/home/estatisticas')
      const dados = await response.json()
      
      if (response.ok) {
        setEstatisticas(dados)
      } else {
        console.error('Erro ao carregar estatísticas:', dados.error)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  // Buscar operações
  const buscarOperacoes = async () => {
    setBuscandoOperacoes(true)
    try {
      const params = new URLSearchParams()
      
      Object.entries(filtrosBusca).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/home/busca?${params.toString()}`)
      const dados = await response.json()
      
      if (response.ok) {
        setResultadosBusca(dados.resultados || [])
      } else {
        console.error('Erro ao buscar operações:', dados.error)
        setResultadosBusca([])
      }
    } catch (error) {
      console.error('Erro ao buscar operações:', error)
      setResultadosBusca([])
    } finally {
      setBuscandoOperacoes(false)
    }
  }

  // Gerar calendário
  const gerarCalendario = () => {
    const hoje = new Date()
    const ano = calendarioData.getFullYear()
    const mes = calendarioData.getMonth()
    
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const diasNoMes = ultimoDia.getDate()
    const diaDaSemanaInicio = primeiroDia.getDay()
    
    const dias = []
    
    // Dias vazios no início
    for (let i = 0; i < diaDaSemanaInicio; i++) {
      dias.push(null)
    }
    
    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes, dia)
      const temEventos = eventosCalendario[dia] && eventosCalendario[dia].length > 0
      
      dias.push({
        dia,
        data,
        temEventos,
        ehHoje: data.toDateString() === hoje.toDateString(),
        eventos: eventosCalendario[dia] || []
      })
    }
    
    return dias
  }

  // Abrir modal do calendário
  const abrirModalCalendario = (diaInfo) => {
    if (!diaInfo || !diaInfo.temEventos) return
    
    const dataFormatada = diaInfo.data.toISOString().split('T')[0]
    setDataSelecionada(dataFormatada)
    setEventosSelecionados(diaInfo.eventos)
    setModalCalendarioAberto(true)
  }

  // Navegar no calendário
  const navegarCalendario = (direcao) => {
    const novaData = new Date(calendarioData)
    if (direcao === 'anterior') {
      novaData.setMonth(novaData.getMonth() - 1)
    } else {
      novaData.setMonth(novaData.getMonth() + 1)
    }
    setCalendarioData(novaData)
  }

  // Formatadores
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0)
  }

  const formatarDataHora = (data) => {
    return new Date(data).toLocaleString('pt-BR')
  }

  // Obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANEJADA': return 'bg-blue-100 text-blue-800'
      case 'EM_ANDAMENTO': return 'bg-yellow-100 text-yellow-800'
      case 'CONCLUIDA': return 'bg-green-100 text-green-800'
      case 'CANCELADA': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Effects
  useEffect(() => {
    carregarEventosCalendario()
  }, [calendarioData])

  useEffect(() => {
    carregarEventosProximos()
    carregarEstatisticas()
  }, [])

  useEffect(() => {
    if (filtrosBusca.q || Object.values(filtrosBusca).some(v => v && v !== filtrosBusca.q)) {
      const timeoutId = setTimeout(() => {
        buscarOperacoes()
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setResultadosBusca([])
    }
  }, [filtrosBusca])

  return (
    <div className="space-y-6">
      {/* Estatísticas Rápidas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Planejadas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {estatisticas.operacoes_por_status.planejadas}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {estatisticas.operacoes_por_status.em_andamento}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próxima Semana</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {estatisticas.operacoes_proxima_semana}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Ativo</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatarMoeda(estatisticas.valor_total_ativo)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendário Interativo */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendário de Eventos
              </CardTitle>
              <CardDescription>
                Clique em uma data destacada para ver os eventos do dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Navegação do calendário */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navegarCalendario('anterior')}
                    disabled={carregandoCalendario}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-lg font-semibold">
                    {calendarioData.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h3>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navegarCalendario('proximo')}
                    disabled={carregandoCalendario}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Grid do calendário */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                    <div key={dia} className="p-2 font-semibold text-gray-600 text-sm">
                      {dia}
                    </div>
                  ))}
                  
                  {gerarCalendario().map((diaInfo, index) => (
                    <div key={index} className="aspect-square">
                      {diaInfo ? (
                        <button
                          onClick={() => abrirModalCalendario(diaInfo)}
                          className={`
                            w-full h-full p-1 text-sm rounded-md transition-colors
                            ${diaInfo.ehHoje ? 'bg-blue-500 text-white font-bold' : ''}
                            ${diaInfo.temEventos && !diaInfo.ehHoje ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                            ${!diaInfo.temEventos && !diaInfo.ehHoje ? 'hover:bg-gray-100' : ''}
                            ${diaInfo.temEventos ? 'cursor-pointer' : 'cursor-default'}
                          `}
                          disabled={!diaInfo.temEventos}
                        >
                          {diaInfo.dia}
                          {diaInfo.temEventos && (
                            <div className="w-1 h-1 bg-current rounded-full mx-auto mt-1"></div>
                          )}
                        </button>
                      ) : (
                        <div className="w-full h-full"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                {carregandoCalendario && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Eventos Próximos */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Próximos 15 dias
              </CardTitle>
              <CardDescription>
                Eventos que requerem atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {carregandoEventosProximos ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : eventosProximos.length > 0 ? (
                  eventosProximos.map((evento, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{evento.nomeCliente}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatarData(evento.dataAtivacao)}
                          </p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {evento.localEntrega}
                          </p>
                        </div>
                        <Badge className={getStatusColor(evento.status)}>
                          {evento.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum evento nos próximos 15 dias
                  </p>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigateToTab('semaforo')}
                >
                  Ver todos no Semáforo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Área de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca de Operações
          </CardTitle>
          <CardDescription>
            Encontre operações por cliente, responsável, local ou outros critérios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Busca principal */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por cliente, local ou responsável..."
                  value={filtrosBusca.q}
                  onChange={(e) => setFiltrosBusca({...filtrosBusca, q: e.target.value})}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            {/* Filtros avançados */}
            {mostrarFiltrosAvancados && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Input
                    id="cliente"
                    placeholder="Nome do cliente"
                    value={filtrosBusca.cliente}
                    onChange={(e) => setFiltrosBusca({...filtrosBusca, cliente: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    placeholder="Responsável pela ativação"
                    value={filtrosBusca.responsavel_ativacao}
                    onChange={(e) => setFiltrosBusca({...filtrosBusca, responsavel_ativacao: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    placeholder="Cidade/Estado"
                    value={filtrosBusca.local_entrega}
                    onChange={(e) => setFiltrosBusca({...filtrosBusca, local_entrega: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={filtrosBusca.status} 
                    onValueChange={(value) => setFiltrosBusca({...filtrosBusca, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="PLANEJADA">Planejada</SelectItem>
                      <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                      <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                      <SelectItem value="CANCELADA">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="data_inicio">Data Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={filtrosBusca.data_inicio}
                    onChange={(e) => setFiltrosBusca({...filtrosBusca, data_inicio: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_fim">Data Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={filtrosBusca.data_fim}
                    onChange={(e) => setFiltrosBusca({...filtrosBusca, data_fim: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Resultados da busca */}
            {buscandoOperacoes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : resultadosBusca.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Resultados ({resultadosBusca.length})</h4>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {resultadosBusca.map((operacao) => (
                    <div key={operacao.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium">{operacao.nomeCliente}</h5>
                            <Badge className={getStatusColor(operacao.status)}>
                              {operacao.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatarDataHora(operacao.dataAtivacao)}
                            </p>
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {operacao.localEntrega}
                            </p>
                            <p className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {operacao.responsavelAtivacaoInterno}
                            </p>
                            <p className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatarMoeda(operacao.custoTotalOperacao)}
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onNavigateToTab('negociacao')}
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filtrosBusca.q || Object.values(filtrosBusca).some(v => v && v !== filtrosBusca.q) ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma operação encontrada com os critérios informados
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Botão de Inserir Novo Evento */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          className="shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => onNavigateToTab('negociacao')}
        >
          <Plus className="h-5 w-5 mr-2" />
          INSERIR NOVO EVENTO OU PRODUÇÃO
        </Button>
      </div>

      {/* Modal do Calendário */}
      <Dialog open={modalCalendarioAberto} onOpenChange={setModalCalendarioAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Eventos do dia {formatarData(dataSelecionada)}
            </DialogTitle>
            <DialogDescription>
              {eventosSelecionados.length} evento(s) programado(s) para este dia
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {eventosSelecionados.map((evento, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{evento.nomeCliente}</h4>
                  <Badge className={getStatusColor(evento.status)}>
                    {evento.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {evento.localEntrega}
                  </p>
                  <p className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {evento.responsavelAtivacaoInterno}
                  </p>
                  <p className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatarMoeda(evento.custoTotalOperacao)}
                  </p>
                </div>
                
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setModalCalendarioAberto(false)
                      onNavigateToTab('negociacao')
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Operação
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HomePage

