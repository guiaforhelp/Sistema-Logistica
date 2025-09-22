import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Truck, 
  MapPin, 
  Calculator, 
  Users, 
  Calendar, 
  CheckSquare, 
  DollarSign,
  Building2,
  User,
  Clock,
  Route,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import MapComponent from './components/MapComponent.jsx'
import HomePage from './components/HomePage.jsx'
import NavigationMenu from './components/NavigationMenu.jsx'
import apiService from './services/api.js'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [codigoOperacao, setCodigoOperacao] = useState('')
  
  const [negociacao, setNegociacao] = useState({
    tipo_negocio: '',
    cliente_nome: '',
    responsavel_negociacao: '',
    responsavel_ativacao: '',
    responsavel_producao: '',
    data_ativacao: '',
    local_partida: '',
    local_entrega: '',
    frete_tipo: '',
    valor_km: 0
  })

  const [evento, setEvento] = useState({
    data_partida_montagem: '',
    horario_partida_montagem: '',
    data_montagem: '',
    horario_montagem: '',
    data_desmontagem: '',
    horario_desmontagem: '',
    data_retorno_empresa: '',
    horario_retorno_empresa: ''
  })

  const [ordemServico, setOrdemServico] = useState({
    descricao_trabalho: '',
    observacoes: '',
    composicao_equipamentos: [
      { id: null, equipamento_nome: 'Tela', quantidade: 1, verificado: false, observacao_item: '' },
      { id: null, equipamento_nome: 'Óculos VR', quantidade: 1, verificado: false, observacao_item: '' },
      { id: null, equipamento_nome: 'Computador', quantidade: 1, verificado: false, observacao_item: '' }
    ]
  })

  const [profissionais, setProfissionais] = useState([
    { nome: '', funcao: '', valor_diaria: 0, dias_trabalho: 0 }
  ])

  const [equipamentos, setEquipamentos] = useState({
    tela: false,
    oculos_vr: false,
    computador: false
  })

  const [calculoFrete, setCalculoFrete] = useState({
    distancia: 0,
    valor_total: 0
  })

  const [calculoDiarias, setCalculoDiarias] = useState({
    valor_total: 0
  })

  // Estados para loading e mensagens
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [calculandoFrete, setCalculandoFrete] = useState(false)

  // Estados para a página Home
  const [calendarioData, setCalendarioData] = useState(new Date())
  const [eventosCalendario, setEventosCalendario] = useState([])
  const [eventosSelecionados, setEventosSelecionados] = useState([])
  const [modalCalendarioAberto, setModalCalendarioAberto] = useState(false)
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [eventosProximos, setEventosProximos] = useState([])
  const [filtrosBusca, setFiltrosBusca] = useState({
    cliente: '',
    responsavel_ativacao: '',
    local_entrega: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  })
  const [resultadosBusca, setResultadosBusca] = useState([])
  const [buscandoOperacoes, setBuscandoOperacoes] = useState(false)

  const adicionarProfissional = () => {
    setProfissionais([...profissionais, { nome: '', funcao: '', valor_diaria: 0, dias_trabalho: 0 }])
  }

  const removerProfissional = (index) => {
    const novosProfissionais = profissionais.filter((_, i) => i !== index)
    setProfissionais(novosProfissionais)
  }

  const atualizarProfissional = (index, campo, valor) => {
    const novosProfissionais = [...profissionais]
    novosProfissionais[index][campo] = valor
    setProfissionais(novosProfissionais)
  }

  // Funções para gerenciar equipamentos
  const adicionarEquipamento = () => {
    const novoEquipamento = {
      id: null,
      equipamento_nome: 'Novo Equipamento',
      quantidade: 1,
      verificado: false,
      observacao_item: ''
    }
    setOrdemServico({
      ...ordemServico,
      composicao_equipamentos: [...ordemServico.composicao_equipamentos, novoEquipamento]
    })
  }

  const removerEquipamento = (index) => {
    const novosEquipamentos = ordemServico.composicao_equipamentos.filter((_, i) => i !== index)
    setOrdemServico({
      ...ordemServico,
      composicao_equipamentos: novosEquipamentos
    })
  }

  const atualizarEquipamento = (index, campo, valor) => {
    const novosEquipamentos = [...ordemServico.composicao_equipamentos]
    novosEquipamentos[index][campo] = valor
    setOrdemServico({
      ...ordemServico,
      composicao_equipamentos: novosEquipamentos
    })
  }

  const calcularFrete = async () => {
    if (!negociacao.local_partida || !negociacao.local_entrega) {
      setMessage({ type: 'error', text: 'Por favor, preencha os locais de partida e entrega.' })
      return
    }

    setCalculandoFrete(true)
    setMessage({ type: '', text: '' })

    try {
      const resultado = await apiService.calcularDistancia(negociacao.local_partida, negociacao.local_entrega)
      const valorTotal = resultado.distancia_km * parseFloat(negociacao.valor_km || 0)
      
      setCalculoFrete({
        distancia: resultado.distancia_km,
        valor_total: valorTotal
      })

      setMessage({ type: 'success', text: 'Frete calculado com sucesso!' })
    } catch (error) {
      console.error('Erro ao calcular frete:', error)
      setMessage({ type: 'error', text: 'Erro ao calcular o frete. Tente novamente.' })
    } finally {
      setCalculandoFrete(false)
    }
  }

  const calcularDiarias = () => {
    const total = profissionais.reduce((acc, prof) => {
      return acc + (parseFloat(prof.valor_diaria || 0) * parseInt(prof.dias_trabalho || 0))
    }, 0)
    
    setCalculoDiarias({
      valor_total: total
    })
  }

  const salvarNegociacao = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Validações básicas
      if (!negociacao.cliente_nome || !negociacao.tipo_negocio) {
        setMessage({ type: 'error', text: 'Por favor, preencha os campos obrigatórios.' })
        return
      }

      // Preparar dados da negociação
      const dadosNegociacao = {
        ...negociacao,
        cliente_id: 1, // Por enquanto usando ID fixo, em produção buscar cliente
        distancia_km: calculoFrete.distancia,
        valor_frete: calculoFrete.valor_total
      }

      // Salvar negociação via API
      const response = await apiService.criarNegociacao(dadosNegociacao)
      
      // Capturar código de operação
      if (response.codigo_operacao) {
        setCodigoOperacao(response.codigo_operacao)
      }
      
      setMessage({ type: 'success', text: `Negociação salva com sucesso! Código: ${response.codigo_operacao}` })
    } catch (error) {
      console.error('Erro ao salvar negociação:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar a negociação. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const limparFormulario = () => {
    setNegociacao({
      tipo_negocio: '',
      cliente_nome: '',
      responsavel_negociacao: '',
      responsavel_ativacao: '',
      responsavel_producao: '',
      data_ativacao: '',
      local_partida: '',
      local_entrega: '',
      frete_tipo: '',
      valor_km: 0
    })
    
    setEvento({
      data_partida_montagem: '',
      data_montagem: '',
      data_desmontagem: '',
      data_retorno_empresa: ''
    })
    
    setProfissionais([{ nome: '', funcao: '', valor_diaria: 0, dias_trabalho: 0 }])
    
    setEquipamentos({
      tela: false,
      oculos_vr: false,
      computador: false
    })
    
    setCalculoFrete({ distancia: 0, valor_total: 0 })
    setMessage({ type: '', text: '' })
  }

  // Funções para a página Home
  const carregarEventosProximos = async () => {
    try {
      const response = await fetch('/api/operacoes/semaforo?dias=15')
      const dados = await response.json()
      
      // Combinar todos os eventos e pegar os primeiros 10
      const todosEventos = [...dados.vermelho, ...dados.amarelo, ...dados.azul]
      setEventosProximos(todosEventos.slice(0, 10))
    } catch (error) {
      console.error('Erro ao carregar eventos próximos:', error)
    }
  }

  const carregarEventosCalendario = async () => {
    try {
      const response = await fetch('/api/operacoes')
      const dados = await response.json()
      setEventosCalendario(dados.operacoes || [])
    } catch (error) {
      console.error('Erro ao carregar eventos do calendário:', error)
    }
  }

  const buscarOperacoes = async () => {
    setBuscandoOperacoes(true)
    try {
      const params = new URLSearchParams()
      
      Object.entries(filtrosBusca).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/operacoes?${params.toString()}`)
      const dados = await response.json()
      setResultadosBusca(dados.operacoes || [])
    } catch (error) {
      console.error('Erro ao buscar operações:', error)
      setResultadosBusca([])
    } finally {
      setBuscandoOperacoes(false)
    }
  }

  const abrirModalCalendario = (data) => {
    const dataFormatada = data.toISOString().split('T')[0]
    setDataSelecionada(dataFormatada)
    
    // Filtrar eventos para a data selecionada
    const eventosDoDia = eventosCalendario.filter(evento => {
      const dataEvento = new Date(evento.data_ativacao).toISOString().split('T')[0]
      return dataEvento === dataFormatada
    })
    
    setEventosSelecionados(eventosDoDia)
    setModalCalendarioAberto(true)
  }

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

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
      const dataFormatada = data.toISOString().split('T')[0]
      
      // Verificar se há eventos neste dia
      const temEventos = eventosCalendario.some(evento => {
        const dataEvento = new Date(evento.data_ativacao).toISOString().split('T')[0]
        return dataEvento === dataFormatada
      })
      
      dias.push({
        dia,
        data,
        temEventos,
        ehHoje: data.toDateString() === hoje.toDateString()
      })
    }
    
    return dias
  }

  useEffect(() => {
    calcularDiarias()
  }, [profissionais])

  useEffect(() => {
    // Carregar dados da página Home
    carregarEventosProximos()
    carregarEventosCalendario()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Menu de Navegação */}
      <NavigationMenu activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Código de Operação */}
        {codigoOperacao && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
              <span>Operação:</span>
              <span className="text-xl font-bold">#{codigoOperacao}</span>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mensagens de alerta */}
          {message.text && (
            <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
              {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Aba Home */}
          <TabsContent value="home">
            <HomePage onNavigateToTab={setActiveTab} />
          </TabsContent>
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
                      Clique em uma data para ver os eventos do dia
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Navegação do calendário */}
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setCalendarioData(new Date(calendarioData.getFullYear(), calendarioData.getMonth() - 1, 1))}
                        >
                          ← Anterior
                        </Button>
                        <h3 className="text-lg font-semibold">
                          {calendarioData.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <Button 
                          variant="outline"
                          onClick={() => setCalendarioData(new Date(calendarioData.getFullYear(), calendarioData.getMonth() + 1, 1))}
                        >
                          Próximo →
                        </Button>
                      </div>
                      
                      {/* Grid do calendário */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                          <div key={dia} className="p-2 font-semibold text-gray-600 text-sm">
                            {dia}
                          </div>
                        ))}
                        
                        {gerarCalendario().map((item, index) => (
                          <div key={index} className="aspect-square">
                            {item ? (
                              <Button
                                variant={item.ehHoje ? "default" : "ghost"}
                                className={`w-full h-full text-sm relative ${
                                  item.temEventos ? 'bg-blue-100 hover:bg-blue-200' : ''
                                } ${item.ehHoje ? 'bg-blue-600 text-white' : ''}`}
                                onClick={() => abrirModalCalendario(item.data)}
                              >
                                {item.dia}
                                {item.temEventos && (
                                  <div className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                )}
                              </Button>
                            ) : (
                              <div className="w-full h-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Eventos Próximos */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Próximos 15 dias
                    </CardTitle>
                    <CardDescription>
                      Eventos previstos para as próximas duas semanas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {eventosProximos.length > 0 ? (
                        eventosProximos.map((evento, index) => (
                          <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-sm">{evento.nome_cliente}</h4>
                              <Badge variant={evento.status === 'PLANEJADA' ? 'secondary' : 'default'}>
                                {evento.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              📅 {formatarData(evento.data_ativacao)}
                            </p>
                            <p className="text-xs text-gray-600 mb-1">
                              📍 {evento.local_entrega}
                            </p>
                            <p className="text-xs text-gray-600">
                              👤 {evento.responsavel_ativacao_interno}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Nenhum evento nos próximos 15 dias</p>
                      )}
                      
                      {eventosProximos.length > 0 && (
                        <Button variant="outline" className="w-full mt-4" onClick={() => document.querySelector('[value="semaforo"]').click()}>
                          Ver todos no Semáforo
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Área de Busca */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Busca Avançada de Operações
                </CardTitle>
                <CardDescription>
                  Encontre operações por cliente, responsável, local ou data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                  <div>
                    <Label htmlFor="busca_cliente">Cliente</Label>
                    <Input
                      id="busca_cliente"
                      placeholder="Nome do cliente"
                      value={filtrosBusca.cliente}
                      onChange={(e) => setFiltrosBusca({...filtrosBusca, cliente: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="busca_responsavel">Responsável</Label>
                    <Input
                      id="busca_responsavel"
                      placeholder="Nome do responsável"
                      value={filtrosBusca.responsavel_ativacao}
                      onChange={(e) => setFiltrosBusca({...filtrosBusca, responsavel_ativacao: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="busca_local">Local</Label>
                    <Input
                      id="busca_local"
                      placeholder="Cidade/Estado"
                      value={filtrosBusca.local_entrega}
                      onChange={(e) => setFiltrosBusca({...filtrosBusca, local_entrega: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="busca_status">Status</Label>
                    <Select value={filtrosBusca.status} onValueChange={(value) => setFiltrosBusca({...filtrosBusca, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        <SelectItem value="PLANEJADA">Planejada</SelectItem>
                        <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                        <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="busca_data_inicio">Data Início</Label>
                    <Input
                      id="busca_data_inicio"
                      type="date"
                      value={filtrosBusca.data_inicio}
                      onChange={(e) => setFiltrosBusca({...filtrosBusca, data_inicio: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="busca_data_fim">Data Fim</Label>
                    <Input
                      id="busca_data_fim"
                      type="date"
                      value={filtrosBusca.data_fim}
                      onChange={(e) => setFiltrosBusca({...filtrosBusca, data_fim: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button onClick={buscarOperacoes} disabled={buscandoOperacoes} className="mb-4">
                  {buscandoOperacoes ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    'Buscar Operações'
                  )}
                </Button>
                
                {/* Resultados da busca */}
                {resultadosBusca.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Resultados ({resultadosBusca.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {resultadosBusca.map((operacao, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-sm">{operacao.nome_cliente}</h5>
                              <Badge variant={operacao.status === 'PLANEJADA' ? 'secondary' : 'default'}>
                                {operacao.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              📅 {formatarData(operacao.data_ativacao)}
                            </p>
                            <p className="text-xs text-gray-600 mb-1">
                              📍 {operacao.local_entrega}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">
                              👤 {operacao.responsavel_ativacao_interno}
                            </p>
                            {operacao.custo_total_operacao && (
                              <p className="text-xs font-semibold text-green-600">
                                💰 {formatarMoeda(operacao.custo_total_operacao)}
                              </p>
                            )}
                            <Button variant="outline" size="sm" className="w-full mt-2">
                              Ver Operação
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botão de Inserir Nova Operação */}
            <div className="fixed bottom-6 right-6">
              <Button 
                size="lg" 
                className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => document.querySelector('[value="negociacao"]').click()}
              >
                <Building2 className="h-5 w-5 mr-2" />
                INSERIR NOVO EVENTO OU PRODUÇÃO
              </Button>
            </div>

            {/* Modal do Calendário */}
            {modalCalendarioAberto && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Eventos de {formatarData(dataSelecionada)}
                    </h3>
                    <Button variant="ghost" onClick={() => setModalCalendarioAberto(false)}>
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {eventosSelecionados.length > 0 ? (
                      eventosSelecionados.map((evento, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{evento.nome_cliente}</h4>
                            <Badge variant={evento.status === 'PLANEJADA' ? 'secondary' : 'default'}>
                              {evento.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">📍 {evento.local_entrega}</p>
                          <p className="text-sm text-gray-600 mb-2">👤 {evento.responsavel_ativacao_interno}</p>
                          <Button variant="outline" size="sm">
                            Ver Operação
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Nenhum evento nesta data</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Aba Negociação */}
          <TabsContent value="negociacao" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informações da Negociação
                  </CardTitle>
                  <CardDescription>
                    Dados básicos do cliente e responsáveis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo_negocio">Modelo de Negócio</Label>
                      <Select value={negociacao.tipo_negocio} onValueChange={(value) => setNegociacao({...negociacao, tipo_negocio: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="venda">Venda</SelectItem>
                          <SelectItem value="locacao">Locação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cliente_nome">Nome do Cliente</Label>
                      <Input 
                        id="cliente_nome"
                        value={negociacao.cliente_nome}
                        onChange={(e) => setNegociacao({...negociacao, cliente_nome: e.target.value})}
                        placeholder="Digite o nome do cliente"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="responsavel_negociacao">Responsável pela Negociação</Label>
                    <Input 
                      id="responsavel_negociacao"
                      value={negociacao.responsavel_negociacao}
                      onChange={(e) => setNegociacao({...negociacao, responsavel_negociacao: e.target.value})}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="responsavel_ativacao">Responsável pela Ativação</Label>
                    <Input 
                      id="responsavel_ativacao"
                      value={negociacao.responsavel_ativacao}
                      onChange={(e) => setNegociacao({...negociacao, responsavel_ativacao: e.target.value})}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="responsavel_producao">Responsável pela Produção</Label>
                    <Input 
                      id="responsavel_producao"
                      value={negociacao.responsavel_producao}
                      onChange={(e) => setNegociacao({...negociacao, responsavel_producao: e.target.value})}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="data_ativacao">Data da Ativação</Label>
                    <Input 
                      id="data_ativacao"
                      type="date"
                      value={negociacao.data_ativacao}
                      onChange={(e) => setNegociacao({...negociacao, data_ativacao: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Localização e Frete */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Localização e Frete
                  </CardTitle>
                  <CardDescription>
                    Endereços e configurações de transporte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="local_partida">Local de Partida</Label>
                    <Input 
                      id="local_partida"
                      value={negociacao.local_partida}
                      onChange={(e) => setNegociacao({...negociacao, local_partida: e.target.value})}
                      placeholder="Endereço de origem"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="local_entrega">Local de Entrega</Label>
                    <Input 
                      id="local_entrega"
                      value={negociacao.local_entrega}
                      onChange={(e) => setNegociacao({...negociacao, local_entrega: e.target.value})}
                      placeholder="Endereço de destino"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frete_tipo">Tipo de Frete</Label>
                      <Select value={negociacao.frete_tipo} onValueChange={(value) => setNegociacao({...negociacao, frete_tipo: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interno">Frete Interno</SelectItem>
                          <SelectItem value="externo">Frete Externo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="valor_km">Valor por KM (R$)</Label>
                      <Input 
                        id="valor_km"
                        type="number"
                        step="0.01"
                        value={negociacao.valor_km}
                        onChange={(e) => setNegociacao({...negociacao, valor_km: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <Button onClick={calcularFrete} className="w-full" disabled={calculandoFrete}>
                    {calculandoFrete ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Route className="h-4 w-4 mr-2" />
                        Calcular Distância e Frete
                      </>
                    )}
                  </Button>
                  
                  {calculoFrete.distancia > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Distância:</strong> {calculoFrete.distancia} km
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Valor do Frete:</strong> R$ {calculoFrete.valor_total.toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Check de Equipamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Check de Equipamentos
                </CardTitle>
                <CardDescription>
                  Marque os equipamentos necessários para o evento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="tela" 
                      checked={equipamentos.tela}
                      onCheckedChange={(checked) => setEquipamentos({...equipamentos, tela: checked})}
                    />
                    <Label htmlFor="tela" className="text-sm font-medium">
                      Tela
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="oculos_vr" 
                      checked={equipamentos.oculos_vr}
                      onCheckedChange={(checked) => setEquipamentos({...equipamentos, oculos_vr: checked})}
                    />
                    <Label htmlFor="oculos_vr" className="text-sm font-medium">
                      Óculos VR
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="computador" 
                      checked={equipamentos.computador}
                      onCheckedChange={(checked) => setEquipamentos({...equipamentos, computador: checked})}
                    />
                    <Label htmlFor="computador" className="text-sm font-medium">
                      Computador
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Evento */}
          <TabsContent value="evento" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Cronograma do Evento
                </CardTitle>
                <CardDescription>
                  Defina as datas e horários importantes do evento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="data_partida_montagem">Data de Partida para Montagem</Label>
                    <Input 
                      id="data_partida_montagem"
                      type="date"
                      value={evento.data_partida_montagem}
                      onChange={(e) => setEvento({...evento, data_partida_montagem: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="horario_partida_montagem">Horário de Partida</Label>
                    <Input 
                      id="horario_partida_montagem"
                      type="time"
                      value={evento.horario_partida_montagem}
                      onChange={(e) => setEvento({...evento, horario_partida_montagem: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="data_montagem">Data de Montagem</Label>
                    <Input 
                      id="data_montagem"
                      type="date"
                      value={evento.data_montagem}
                      onChange={(e) => setEvento({...evento, data_montagem: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="horario_montagem">Horário de Montagem</Label>
                    <Input 
                      id="horario_montagem"
                      type="time"
                      value={evento.horario_montagem}
                      onChange={(e) => setEvento({...evento, horario_montagem: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="data_desmontagem">Data de Desmontagem</Label>
                    <Input 
                      id="data_desmontagem"
                      type="date"
                      value={evento.data_desmontagem}
                      onChange={(e) => setEvento({...evento, data_desmontagem: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="horario_desmontagem">Horário de Desmontagem</Label>
                    <Input 
                      id="horario_desmontagem"
                      type="time"
                      value={evento.horario_desmontagem}
                      onChange={(e) => setEvento({...evento, horario_desmontagem: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="data_retorno_empresa">Data de Retorno à Empresa</Label>
                    <Input 
                      id="data_retorno_empresa"
                      type="date"
                      value={evento.data_retorno_empresa}
                      onChange={(e) => setEvento({...evento, data_retorno_empresa: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="horario_retorno_empresa">Horário de Retorno</Label>
                    <Input 
                      id="horario_retorno_empresa"
                      type="time"
                      value={evento.horario_retorno_empresa}
                      onChange={(e) => setEvento({...evento, horario_retorno_empresa: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Ordem de Serviço */}
          <TabsContent value="ordem-servico" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Descrição do Trabalho */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Descrição do Trabalho
                  </CardTitle>
                  <CardDescription>
                    Detalhe o trabalho que será executado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="descricao_trabalho">Descrição Detalhada</Label>
                    <textarea
                      id="descricao_trabalho"
                      className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descreva detalhadamente o trabalho que será executado..."
                      value={ordemServico.descricao_trabalho}
                      onChange={(e) => setOrdemServico({...ordemServico, descricao_trabalho: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Observações
                  </CardTitle>
                  <CardDescription>
                    Informações adicionais e observações importantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="observacoes">Observações Gerais</Label>
                    <textarea
                      id="observacoes"
                      className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Adicione observações importantes sobre o serviço..."
                      value={ordemServico.observacoes}
                      onChange={(e) => setOrdemServico({...ordemServico, observacoes: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Composição do Equipamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Composição do Equipamento - Checklist
                </CardTitle>
                <CardDescription>
                  Verifique e configure os equipamentos necessários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ordemServico.composicao_equipamentos.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`equipamento_${index}`}
                            checked={item.verificado}
                            onCheckedChange={(checked) => atualizarEquipamento(index, 'verificado', checked)}
                          />
                          <Input
                            value={item.equipamento_nome}
                            onChange={(e) => atualizarEquipamento(index, 'equipamento_nome', e.target.value)}
                            className="font-medium"
                            placeholder="Nome do equipamento"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`quantidade_${index}`}>Quantidade</Label>
                          <Input 
                            id={`quantidade_${index}`}
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => atualizarEquipamento(index, 'quantidade', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label htmlFor={`observacao_${index}`}>Observação do Item</Label>
                          <Input 
                            id={`observacao_${index}`}
                            placeholder="Observações específicas do equipamento..."
                            value={item.observacao_item}
                            onChange={(e) => atualizarEquipamento(index, 'observacao_item', e.target.value)}
                          />
                        </div>
                        
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerEquipamento(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Botão para adicionar mais itens */}
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={adicionarEquipamento}
                      className="flex items-center gap-2"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Insira mais itens
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Calculadoras */}
          <TabsContent value="calculadoras" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calculadora de Diárias */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Calculadora de Diárias
                  </CardTitle>
                  <CardDescription>
                    Gerencie profissionais e calcule custos de diárias
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profissionais.map((prof, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Profissional {index + 1}</h4>
                        {profissionais.length > 1 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removerProfissional(index)}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nome</Label>
                          <Input 
                            value={prof.nome}
                            onChange={(e) => atualizarProfissional(index, 'nome', e.target.value)}
                            placeholder="Nome do profissional"
                          />
                        </div>
                        <div>
                          <Label>Função</Label>
                          <Input 
                            value={prof.funcao}
                            onChange={(e) => atualizarProfissional(index, 'funcao', e.target.value)}
                            placeholder="Função"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Valor da Diária (R$)</Label>
                          <Input 
                            type="number"
                            step="0.01"
                            value={prof.valor_diaria}
                            onChange={(e) => atualizarProfissional(index, 'valor_diaria', e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Dias de Trabalho</Label>
                          <Input 
                            type="number"
                            value={prof.dias_trabalho}
                            onChange={(e) => atualizarProfissional(index, 'dias_trabalho', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="secondary">
                          Subtotal: R$ {((prof.valor_diaria || 0) * (prof.dias_trabalho || 0)).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={adicionarProfissional} variant="outline" className="w-full">
                    Adicionar Profissional
                  </Button>
                  
                  <Separator />
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-lg font-semibold text-green-800">
                      Total de Diárias: R$ {calculoDiarias.valor_total.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Resumo Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Resumo Financeiro
                  </CardTitle>
                  <CardDescription>
                    Visão geral dos custos do projeto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Valor do Frete:</span>
                      <span className="font-semibold text-blue-700">
                        R$ {calculoFrete.valor_total.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Total de Diárias:</span>
                      <span className="font-semibold text-green-700">
                        R$ {calculoDiarias.valor_total.toFixed(2)}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                      <span className="text-lg font-semibold">Total Geral:</span>
                      <span className="text-xl font-bold text-gray-900">
                        R$ {(calculoFrete.valor_total + calculoDiarias.valor_total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Distância:</strong> {calculoFrete.distancia} km</p>
                    <p><strong>Profissionais:</strong> {profissionais.length}</p>
                    <p><strong>Equipamentos selecionados:</strong> {Object.values(equipamentos).filter(Boolean).length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Mapa */}
          <TabsContent value="mapa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mapa de Eventos
                </CardTitle>
                <CardDescription>
                  Visualização geográfica dos eventos em andamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MapComponent />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botões de Ação */}
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" className="px-8" onClick={salvarNegociacao} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Negociação'
            )}
          </Button>
          <Button variant="outline" size="lg" className="px-8" onClick={limparFormulario} disabled={loading}>
            Limpar Formulário
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App

