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
import MapaEventos from './components/MapaEventos.jsx'
import apiService from './services/api.js'
import OrdemServico from './components/ordemOs.jsx'
import Negociacoes from './components/negociacao.jsx'
// import './App.css'

const locahostBackend = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [codigoOperacao, setCodigoOperacao] = useState('')


   const [calculoFrete, setCalculoFrete] = useState({
          distancia: 0,
          valor_total: 0
        })
      const [calculandoFrete, setCalculandoFrete] = useState(false)
      // Estados para loading e mensagens
      const [loading, setLoading] = useState(false)
  
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
              horario_partida_montagem: '',
              data_montagem: '',
              horario_montagem: '',
              data_desmontagem: '',
              horario_desmontagem: '',
              data_retorno_empresa: '',
              horario_retorno_empresa: ''
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

  
  const [profissionais, setProfissionais] = useState([
    { nome: '', funcao: '', valor_diaria: 0, dias_trabalho: 0 }
  ])

  const [equipamentos, setEquipamentos] = useState({
    tela: false,
    oculos_vr: false,
    computador: false
  })


  const [calculoDiarias, setCalculoDiarias] = useState({
    valor_total: 0
  })

  // Estados para loading e mensagens
  const [message, setMessage] = useState({ type: '', text: '' })

  // Estados para semáforo
  const [dadosSemaforo, setDadosSemaforo] = useState({
    vermelho: [],
    amarelo: [],
    azul: [],
    totais: { vermelho: 0, amarelo: 0, azul: 0 }
  })
  const [carregandoSemaforo, setCarregandoSemaforo] = useState(false)

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

  const calcularDiarias = () => {
    const total = profissionais.reduce((acc, prof) => {
      return acc + (parseFloat(prof.valor_diaria || 0) * parseInt(prof.dias_trabalho || 0))
    }, 0)
    
    setCalculoDiarias({
      valor_total: total
    })
  }

  // Função para carregar dados do semáforo
  const carregarSemaforo = async () => {
    setCarregandoSemaforo(true)
    try {
      const response = await fetch('/api/operacoes/semaforo?dias=15')
      const dados = await response.json()
      
      if (response.ok) {
        setDadosSemaforo(dados)
      } else {
        console.error('Erro ao carregar semáforo:', dados.error)
        setMessage({ type: 'error', text: 'Erro ao carregar dados do semáforo.' })
      }
    } catch (error) {
      console.error('Erro ao carregar semáforo:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar dados do semáforo.' })
    } finally {
      setCarregandoSemaforo(false)
    }
  }




  // Função para atualizar status de operação
  const atualizarStatusOperacao = async (operacaoId, novoStatus) => {
    try {
      const response = await fetch(`/api/operacoes/${operacaoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: novoStatus })
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Status atualizado com sucesso!' })
        // Recarregar dados do semáforo
        carregarSemaforo()
      } else {
        const erro = await response.json()
        setMessage({ type: 'error', text: erro.error || 'Erro ao atualizar status.' })
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      setMessage({ type: 'error', text: 'Erro ao atualizar status da operação.' })
    }
  }

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANEJADA': return 'bg-blue-100 text-blue-800'
      case 'EM_ANDAMENTO': return 'bg-yellow-100 text-yellow-800'
      case 'CONCLUIDA': return 'bg-green-100 text-green-800'
      case 'CANCELADA': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    calcularDiarias()
  }, [profissionais])

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

          {/* Aba Negociação/Operações */}
          <Negociacoes />

          {/* Aba Semáforo */}
          <TabsContent value="semaforo" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Semáforo (15 dias)</h2>
                <p className="text-gray-600">Priorização de eventos nos próximos 15 dias</p>
              </div>
              <Button onClick={carregarSemaforo} disabled={carregandoSemaforo}>
                {carregandoSemaforo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Atualizar Semáforo
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna Vermelha */}
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Vermelho — Emergência ({dadosSemaforo.totais.vermelho})
                  </CardTitle>
                  <CardDescription className="text-red-600">
                    ATENÇÃO - Eventos críticos
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {dadosSemaforo.vermelho.length > 0 ? (
                    <div className="space-y-3">
                      {dadosSemaforo.vermelho.map((operacao, index) => (
                        <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-red-900">{operacao.nomeCliente}</h4>
                              <p className="text-sm text-red-700 flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {formatarData(operacao.dataAtivacao)}
                              </p>
                              <p className="text-sm text-red-700 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {operacao.localEntrega}
                              </p>
                              <p className="text-sm text-red-700 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {operacao.responsavelAtivacaoInterno}
                              </p>
                            </div>
                            <Badge className="bg-red-100 text-red-800">
                              ATENÇÃO
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setActiveTab('negociacao')}
                            >
                              Ver Operação
                            </Button>
                            {operacao.status === 'PLANEJADA' && (
                              <Button 
                                size="sm"
                                onClick={() => atualizarStatusOperacao(operacao.id, 'EM_ANDAMENTO')}
                              >
                                Marcar Em Andamento
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-red-600 py-4">
                      Nenhum evento neste período.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Coluna Amarela */}
              <Card className="border-yellow-200">
                <CardHeader className="bg-yellow-50">
                  <CardTitle className="text-yellow-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Amarelo — Atenção ({dadosSemaforo.totais.amarelo})
                  </CardTitle>
                  <CardDescription className="text-yellow-600">
                    Eventos que requerem atenção
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {dadosSemaforo.amarelo.length > 0 ? (
                    <div className="space-y-3">
                      {dadosSemaforo.amarelo.map((operacao, index) => (
                        <div key={index} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-yellow-900">{operacao.nomeCliente}</h4>
                              <p className="text-sm text-yellow-700 flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {formatarData(operacao.dataAtivacao)}
                              </p>
                              <p className="text-sm text-yellow-700 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {operacao.localEntrega}
                              </p>
                              <p className="text-sm text-yellow-700 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {operacao.responsavelAtivacaoInterno}
                              </p>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              ATENÇÃO
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setActiveTab('negociacao')}
                            >
                              Ver Operação
                            </Button>
                            {operacao.status === 'PLANEJADA' && (
                              <Button 
                                size="sm"
                                onClick={() => atualizarStatusOperacao(operacao.id, 'EM_ANDAMENTO')}
                              >
                                Marcar Em Andamento
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-yellow-600 py-4">
                      Nenhum evento neste período.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Coluna Azul */}
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Azul — Cuidado ({dadosSemaforo.totais.azul})
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Eventos para monitoramento
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {dadosSemaforo.azul.length > 0 ? (
                    <div className="space-y-3">
                      {dadosSemaforo.azul.map((operacao, index) => (
                        <div key={index} className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-900">{operacao.nomeCliente}</h4>
                              <p className="text-sm text-blue-700 flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {formatarData(operacao.dataAtivacao)}
                              </p>
                              <p className="text-sm text-blue-700 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {operacao.localEntrega}
                              </p>
                              <p className="text-sm text-blue-700 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {operacao.responsavelAtivacaoInterno}
                              </p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                              CUIDADO
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setActiveTab('negociacao')}
                            >
                              Ver Operação
                            </Button>
                            {operacao.status === 'PLANEJADA' && (
                              <Button 
                                size="sm"
                                onClick={() => atualizarStatusOperacao(operacao.id, 'EM_ANDAMENTO')}
                              >
                                Marcar Em Andamento
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-blue-600 py-4">
                      Nenhum evento neste período.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
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
                  Datas e horários das etapas do evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_partida_montagem">Data de Partida para Montagem</Label>
                    <Input
                      id="data_partida_montagem"
                      type="date"
                      onChange={(e) => setEvento({...evento, data_partida_montagem: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="horario_partida_montagem">Horário de Partida</Label>
                    <Input
                      id="horario_partida_montagem"
                      type="time"
                      value=""
                      onChange={(e) => setEvento({...evento, horario_partida_montagem: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_montagem">Data de Montagem</Label>
                    <Input
                      id="data_montagem"
                      type="date"
                      value=""
                      onChange={(e) => setEvento({...evento, data_montagem: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="horario_montagem">Horário de Montagem</Label>
                    <Input
                      id="horario_montagem"
                      type="time"
                      value=""
                      onChange={(e) => setEvento({...evento, horario_montagem: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_desmontagem">Data de Desmontagem</Label>
                    <Input
                      id="data_desmontagem"
                      type="date"
                      value=""
                      onChange={(e) => setEvento({...evento, data_desmontagem: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="horario_desmontagem">Horário de Desmontagem</Label>
                    <Input
                      id="horario_desmontagem"
                      type="time"
                      value=""
                      onChange={(e) => setEvento({...evento, horario_desmontagem: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_retorno_empresa">Data de Retorno à Empresa</Label>
                    <Input
                      id="data_retorno_empresa"
                      type="date"
                      value=""
                      onChange={(e) => setEvento({...evento, data_retorno_empresa: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="horario_retorno_empresa">Horário de Retorno</Label>
                    <Input
                      id="horario_retorno_empresa"
                      type="time"
                      value=""
                      onChange={(e) => setEvento({...evento, horario_retorno_empresa: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Ordem de Serviço */}
          <TabsContent value="ordem-servico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Ordem de Serviço (OS)
                </CardTitle>
                <CardDescription>
                  Descrição do trabalho e composição dos equipamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <OrdemServico />
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
                    Calcule o custo total das diárias dos profissionais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profissionais.map((profissional, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome do Profissional</Label>
                          <Input
                            value={profissional.nome}
                            onChange={(e) => atualizarProfissional(index, 'nome', e.target.value)}
                            placeholder="Nome completo"
                          />
                        </div>
                        
                        <div>
                          <Label>Função</Label>
                          <Input
                            value={profissional.funcao}
                            onChange={(e) => atualizarProfissional(index, 'funcao', e.target.value)}
                            placeholder="Cargo/função"
                          />
                        </div>
                        
                        <div>
                          <Label>Valor da Diária (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={profissional.valor_diaria}
                            onChange={(e) => atualizarProfissional(index, 'valor_diaria', parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                          />
                        </div>
                        
                        <div>
                          <Label>Dias de Trabalho</Label>
                          <Input
                            type="number"
                            min="1"
                            value={profissional.dias_trabalho}
                            onChange={(e) => atualizarProfissional(index, 'dias_trabalho', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm font-medium">
                          Subtotal: {formatarMoeda(profissional.valor_diaria * profissional.dias_trabalho)}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removerProfissional(index)}
                          disabled={profissionais.length === 1}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={adicionarProfissional} variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Adicionar Profissional
                  </Button>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-green-900">Total das Diárias:</span>
                      <span className="text-xl font-bold text-green-900">{formatarMoeda(calculoDiarias.valor_total)}</span>
                    </div>
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
                    Visão geral dos custos da operação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-900 font-medium">Frete:</span>
                      <span className="text-blue-900 font-bold">{formatarMoeda(calculoFrete.valor_total)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-900 font-medium">Diárias:</span>
                      <span className="text-green-900 font-bold">{formatarMoeda(calculoDiarias.valor_total)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                      <span className="text-gray-900 text-lg font-semibold">Total Geral:</span>
                      <span className="text-gray-900 text-xl font-bold">
                        {formatarMoeda(calculoFrete.valor_total + calculoDiarias.valor_total)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Distância calculada: {calculoFrete.distancia.toFixed(1)} km</p>
                    <p>• Profissionais: {profissionais.length}</p>
                    <p>• Total de dias: {profissionais.reduce((acc, prof) => acc + (prof.dias_trabalho || 0), 0)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Mapa */}
          <TabsContent value="mapa" className="space-y-6">
            <MapaEventos />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

