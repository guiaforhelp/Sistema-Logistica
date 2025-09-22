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
import InputDatetimeLocal, { InputTimeLocal } from './components/InputDatetimeLocal.jsx'
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

  const [negociacao, setnegociacao] = useState({
    tipo_negocio: '',
    cliente_nome: '',
    responsavel_negociacao: '',
    responsavel_ativacao: '',
    responsavel_producao: '',
    data_ativacao: '',
    local_partida: '',
    local_entrega: '',
    frete_tipo: '',
    distancia_km: '',
    valor_km: 0
  })


  const calcularFrete = async () => {
    if (!dadosOperacao.localpartida || !dadosOperacao.localentrega) {
      // setMessage({ type: 'error', text: 'Por favor, preencha os locais de partida e entrega.' })
      mostrarMensagem('error', 'Por favor, preencha os locais de partida e entrega.')
      return
    }

    setCalculandoFrete(true)
    setMessage({ type: '', text: '' })

    try {
      const resultado = await apiService.calcularDistancia(dadosOperacao.localpartida, dadosOperacao.localentrega)
      const valorTotal = resultado.distancia_km * parseFloat(dadosOperacao.valor_por_km || 0)

      setCalculoFrete({
        distancia: resultado.distancia_km,
        valor_total: valorTotal
      })

      // setMessage({ type: 'success', text: 'Frete calculado com sucesso!' })
      mostrarMensagem('success', 'Frete calculado com sucesso!')
    } catch (error) {
      console.error('Erro ao calcular frete:', error)
      mostrarMensagem('error', 'Erro ao calcular o frete. Tente novamente.')
    } finally {
      setCalculandoFrete(false)
    }
  }

  //CRIANDO A NEGOCIAÇÃO NO BANCO DE DADOS
  const salvarnegociacao = async () => {
    setLoading(true)
    mostrarMensagem({ type: '', text: '' })

    try {
      // Validações básicas
      if (!dadosOperacao.nomecliente || !dadosOperacao.modelonegocio) {
        mostrarMensagem('error', 'Por favor, preencha os campos obrigatórios.')
        return
      }

      // enviando o valor total de frete
      const valorFinalFrete = dadosOperacao.valor_frete > 0 ? Number(dadosOperacao.valor_frete) + Number(dadosOperacao.valor_diaria) : calculoFrete.valor_total + calculoDiarias.valor_total;

      const valorFinalDistancia = calculoFrete.distancia.toFixed(1)

      const payload = {
        ...dadosOperacao,
        custoTotalOperacao: parseFloat(valorFinalFrete),
        distancia_km: parseFloat(valorFinalDistancia)
      };


      // verifica se o custo por operação foi preenchido
      if (valorFinalFrete <= 0 && setActiveTab == 'evento') {
        mostrarMensagem('error', 'Calculo do frete ainda não foi definido, por favor clique no botão calcular frete')
        return
      }




      // Salvar negociação via API
      const response = await apiService.createNegociacao(payload)

      // // Capturar código de operação
      // if (response.codigo_operacao) {
      //   setCodigoOperacao(response.codigo_operacao)
      // }

      mostrarMensagem('success', 'Negociação salva com sucesso! Código: ')
    } catch (error) {
      console.error('Erro ao salvar negociação:', error)
      mostrarMensagem('error', 'Erro ao salvar a negociação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }


  // CRIANDO PROFISSIONA NO BANCO DE DADOS
  const salvarProfissional = async () => {
    setLoading(true)
    mostrarMensagem({ type: '', text: '' })

    try {
      // Validações básicas
      if (!dadosProfissional.nome || !dadosProfissional.funcao || !dadosProfissional.valor_diaria) {
        mostrarMensagem('error', 'Por favor, preencha os campos obrigatórios.')
        return
      }


      // Salvar os dados do profissional via API
      const response = await apiService.createProfissional(dadosProfissional)

      mostrarMensagem('success', 'Profissional criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar Profissional:', error)
      mostrarMensagem('error', 'Erro ao criar os dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const atualizarNegociacao = async () => {
    try {
      // pegue o id de onde fizer sentido no seu app
      const id = idSelecionado || dadosOperacao.id;
      if (!id) {
        console.error("ID da negociação ausente para atualização");
        return;
      }

      // monta o payload SEM o id e normalizando tipos/camelCase
      const {
        id: _throwAway,           // remove id do body
        created_at, updated_at,   // remova campos imutáveis se existirem
        ...rest
      } = dadosOperacao || {};

      const atualizaPayload = {
        ...rest,
      };

      // chama a API no formato (id, payload)
      await apiService.updateNegociacao(id, atualizaPayload);

      mostrarMensagem('success', `Atualização realizada com sucesso`)
    } catch (err) {
      console.error("Erro ao atualizar negociação:", err);
    }
  };


  const atualizarProfissionalBanco = async () => {
    try {
      // pegue o id de onde fizer sentido no seu app
      const id = idSelecionadoProf
      if (!id) {
        console.error("ID da negociação ausente para atualização");
        return;
      }

      // monta o payload SEM o id e normalizando tipos/camelCase
      const {
        id: _throwAway,           // remove id do body
        created_at, updated_at,   // remova campos imutáveis se existirem
        ...rest
      } = dadosProfissional || {};

      const atualizaPayload = {
        ...rest,
      };

      // chama a API no formato (id, payload)
      await apiService.updateProfissional(id, atualizaPayload);

      mostrarMensagem('success', `Atualização realizada com sucesso`)
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      mostrarMensagem('error', 'Erro ao deletar. Tente novamente.')
    }
  };


  const deleteNegociacao = async () => {
    try {
      await apiService.deleteNegociacao(idSelecionado);
      mostrarMensagem('success', `Deletado com sucesso`)
    } catch (err) {
      console.error("Erro ao deletar:", err);
      mostrarMensagem('error', 'Erro ao deletar. Tente novamente.')
    }
  }


  const deleteProfissional = async () => {
    try {
      await apiService.deleteProfissional(idSelecionadoProf);
      // setMessage({ type: 'success', text: `Deletado com sucesso` })
      mostrarMensagem('success', 'Deletado com sucesso')
    } catch (err) {
      console.error("Erro ao deletar:", err);
      mostrarMensagem('error', 'Erro ao deletar. Tente novamente.')
    }
  }

  const limparFormulario = () => {
    setDadosProfissional({
      nome: '',
      funcao: '',
      valor_diaria: '',
      valor_frete: '',
      diastrabalhado: ''
    }),
      setDadosOperacao({
        id: '',
        nomecliente: '',
        modelonegocio: '',
        responsavelnegociacao: '',
        responsavelativacaointerno: '',
        responsavelproducaointerno: '',
        dataativacao: '',
        localentrega: '',
        tipo_frete: '',
        localpartida: null,
        data_retorno: null,
        data_desmontagem: null,
        data_montagem: null,
        valor_por_km: 0,
        distancia_km: 0,
        hora_desmontagem: null,
        hora_montagem: null,
        horapartida: null,
        horaretorno: null,
        custoTotalOperacao: 0
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


  // Recuperando os dados operaçøes
  const [listaOperacoes, setListaOperacoes] = useState([]);
  const [idSelecionado, setIdSelecionado] = useState('');


  const [ordemServico, setOrdemServico] = useState({
    descricao_trabalho: '',
    observacoes: '',
    composicao_equipamentos: []
  });


  const [listaProfissional, setListaProfissional] = useState([]);
  const [idSelecionadoProf, setIdSelecionadoProf] = useState('');
  const [dadosProfissional, setDadosProfissional] = useState({
    nome: '',
    funcao: '',
    valor_diaria: 0,
    valor_frete: 0,
    diastrabalhado: ''
  })
  const [dadosOperacao, setDadosOperacao] = useState({
    id: '',
    nomecliente: '',
    modelonegocio: '',
    responsavelnegociacao: '',
    responsavelativacaointerno: '',
    responsavelproducaointerno: '',
    dataativacao: '',
    localentrega: 'Local Entrega',
    tipo_frete: null,
    localpartida: null,
    data_retorno: null,
    data_desmontagem: null,
    data_montagem: null,
    valor_por_km: 0,
    distancia_km: 0,
    hora_desmontagem: null,
    hora_montagem: null,
    horapartida: null,
    horaretorno: null,
    custoTotalOperacao: 0
  });


  //recuperando os dados via loop
  useEffect(() => {
    const fetchListaOperacoes = async () => {
      try {
        const res = await fetch(`${locahostBackend}/api/operacoes/`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setListaOperacoes(data);

        } else {
          console.warn("Resposta inesperada ao listar operações:", data);
        }
      } catch (error) {
        console.error("Erro ao buscar lista de operações:", error);
      }
    };

    fetchListaOperacoes();
  }, []);


  //recupera os dados da pagina Negociações
  useEffect(() => {
    if (!idSelecionado) return;
    const fetchOperacoes = async () => {
      try {
        const res = await fetch(`${locahostBackend}/api/operacoes/${idSelecionado}`);
        const data = await res.json();

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setDadosOperacao(data);
        } else {
          console.warn("A resposta não é um objeto esperado:", data);
        }
      } catch (error) {
        console.error("Erro ao buscar operação:", error);
      }
    };

    fetchOperacoes();
  }, [idSelecionado]);



  //recupera os dados da pagina calculadora
  //recuperando os dados via loop
  useEffect(() => {
    const fetchListaProfissional = async () => {
      try {
        const res = await fetch(`${locahostBackend}/api/profissional/`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setListaProfissional(data);

        } else {
          console.warn("Resposta inesperada ao listar operações:", data);
        }
      } catch (error) {
        console.error("Erro ao buscar lista de operações:", error);
      }
    };

    fetchListaProfissional();
  }, []);


  useEffect(() => {
    if (!idSelecionadoProf) return;
    const fetchProfissional = async () => {
      try {
        const res = await fetch(`${locahostBackend}/api/profissional/${idSelecionadoProf}`);
        const data = await res.json();

        // console.log("Retorno da API:", data.operacoes); // veja isso no console
        setDadosProfissional(data);
      } catch (error) {
        console.error("Erro ao buscar operações:", error);
      }
    }

    fetchProfissional()
  }, [idSelecionadoProf]);


  // Preparar dados da negociação
  const dadosNegociacao = {
    ...negociacao,
    cliente_id: 1, // Por enquanto usando ID fixo, em produção buscar cliente
    distancia_km: calculoFrete.distancia,
    valor_frete: calculoFrete.valor_total
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

  const mostrarMensagem = (type, text) => {
    setMessage({ type, text });

    // Ocultar em 2 segundos
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 2000);
  };

  // Estados para semáforo
  const [dadosSemaforo, setDadosSemaforo] = useState({
    vermelho: [],
    amarelo: [],
    azul: [],
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

  // const handleSelectChange = (value) => {
  //   if (value === "defaul") {
  //     limparFormulario();
  //     setIdSelecionado("");
  //     return
  //   } else {
  //     setIdSelecionado(value);
  //   }
  // }

  // const handleSelectChangeProf = (value) => {
  //   if (value === "Selecione um cliente" || value === "") {
  //     limparFormulario();
  //   } else {
  //     setIdSelecionadoProf(value);
  //   }
  // }

  const [idSelecionadoBtnProf, setIdSelecionadoBtnProf] = useState("");
  const [idSelecionadoBtn, setIdSelecionadoBtn] = useState("");

  // apenas guarda o ID selecionado
  const handleSelectChange = (value) => {
    setIdSelecionadoBtn(value);
  };

  const handleSelectChangeProf = (value) => {
    setIdSelecionadoBtnProf(value);
  }

  // só consulta quando clicar no botão
  const handleConsulta = () => {
    if (!idSelecionadoBtn) {
      console.warn("Nenhum cliente selecionado!");
      return;
    }

    // aqui você chama sua API ou lógica de consulta
    setIdSelecionado(idSelecionadoBtn)
  };

  const handleConsultaProf = () => {
    if (!idSelecionadoBtnProf) {
      console.warn("Nenhum cliente selecionado!");
      return;
    }

    // aqui você chama sua API ou lógica de consulta
    setIdSelecionadoProf(idSelecionadoBtnProf)
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
      const response = await fetch(`${locahostBackend}/api/semaforo`)
      const dados = await response.json()

      // console.log(dados);

      if (response.ok) {
        const vermelhoSemaforo = Array.isArray(dados.semanaAtual)
          ? dados.semanaAtual.map(item => ({
            id: item.id,
            nomecliente: item.nomecliente,
            responsavelativacaointerno: item.responsavelativacaointerno,
            dataativacao: item.dataativacao,
            localentrega: item.localentrega
          })) : []

        const amareloSemaforo = Array.isArray(dados.proximaSemana)
          ? dados.proximaSemana.map(item => ({
            id: item.id,
            nomecliente: item.nomecliente,
            responsavelativacaointerno: item.responsavelativacaointerno,
            dataativacao: item.dataativacao,
            localentrega: item.localentrega
          })) : []

        const azulSemaforo = Array.isArray(dados.duasSemanasOuMais)
          ? dados.duasSemanasOuMais.map(item => ({
            id: item.id,
            nomecliente: item.nomecliente,
            responsavelativacaointerno: item.responsavelativacaointerno,
            dataativacao: item.dataativacao,
            localentrega: item.localentrega
          })) : []


        setDadosSemaforo({
          vermelho: vermelhoSemaforo,
          amarelo: amareloSemaforo,
          azul: azulSemaforo,
        })

      } else {
        console.error('Erro ao carregar semáforo:', dados.error)
        mostrarMensagem('error', 'Erro ao carregar dados do semáforo.')
      }
    } catch (error) {
      console.error('Erro ao carregar semáforo:', error)
      mostrarMensagem('error', 'Erro ao carregar dados do semáforo.')
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
        mostrarMensagem('success', 'Status atualizado com sucesso!')
        // Recarregar dados do semáforo
        carregarSemaforo()
      } else {
        const erro = await response.json()
        mostrarMensagem('error', erro.error || 'Erro ao atualizar status.')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      mostrarMensagem('error', 'Erro ao atualizar status da operação.')
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
            <Alert
              className={
                message.type === 'error'
                  ? 'border-red-500 bg-red-50'
                  : 'border-green-500 bg-green-50'
              }
            >
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription
                className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Aba Home */}
          <TabsContent value="home">
            <HomePage onNavigateToTab={setActiveTab} />
          </TabsContent>

          {/* Aba Negociação/Operações */}
          <TabsContent value="negociacao" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-end gap-2">
                  <div>
                    <Label htmlFor="tipo_negocio">Consulta por Cliente</Label>
                    <Select onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={dadosOperacao.nomecliente ? dadosOperacao.nomecliente : 'Consulta por cliente'} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {listaOperacoes.map((opList) => (
                          <SelectItem key={opList.id} value={opList.id}>{opList.nomecliente}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button onClick={handleConsulta} disabled={loading}>
                      {loading ? (<Loader2 className="h-4 w-4 animate-spin mr-2" />) : (<CheckCircle className="h-4 w-4 mr-2" />)}
                      {"Consultar"}
                    </Button>
                  </div>
                  <div>
                    <Button 
                      className="bg-red-500 hover:bg-red-600"
                      variant="destructive"
                      onClick={deleteNegociacao}>
                      Deletar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados da Negociação
                </CardTitle>
                <CardDescription>
                  Informações básicas da operação e responsáveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_negocio">Modelo de Negócio *</Label>
                    <Select value={dadosOperacao.modelonegocio} onValueChange={(value) => setDadosOperacao({ ...dadosOperacao, modelonegocio: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={dadosOperacao.modelonegocio ?? 'Selecione o tipo'} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="VENDA">Venda</SelectItem>
                        <SelectItem value="LOCACAO">Locação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
                    <Input
                      id="cliente_nome"
                      value={dadosOperacao.nomecliente ?? ''}
                      onChange={(e) => setDadosOperacao({ ...dadosOperacao, nomecliente: e.target.value })}
                      placeholder="Digite o nome do cliente"
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsavel_negociacao">Responsável pela Negociação</Label>
                    {/* INPUT TEXT */}
                    <Input
                      id="responsavel_negociacao"
                      value={dadosOperacao.responsavelnegociacao ?? ''}
                      onChange={(e) => setDadosOperacao({ ...dadosOperacao, responsavelnegociacao: e.target.value })}
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsavel_ativacao">Responsável pela Ativação</Label>
                    <Input
                      id="responsavel_ativacao"
                      value={dadosOperacao.responsavelativacaointerno ?? ''}
                      onChange={(e) => setDadosOperacao({ ...dadosOperacao, responsavelativacaointerno: e.target.value })}
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsavel_producao">Responsável pela Produção</Label>
                    <Input
                      id="responsavel_producao"
                      value={dadosOperacao.responsavelproducaointerno ?? ''}
                      onChange={(e) => setDadosOperacao({ ...dadosOperacao, responsavelproducaointerno: e.target.value })}
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <InputDatetimeLocal
                      label="Data de Ativação"
                      name="dataativacao"
                      value={dadosOperacao.dataativacao ?? ''}
                      onChange={(e) =>
                        setDadosOperacao({ ...dadosOperacao, dataativacao: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="local_partida">Local de Partida</Label>
                    <Input
                      id="local_partida"
                      value={dadosOperacao.localpartida ?? ''}
                      onChange={(e) => setDadosOperacao({ ...dadosOperacao, localpartida: e.target.value })}
                      placeholder="Cidade, Estado"
                    />
                  </div>

                  <div>
                    <Label htmlFor="local_entrega">Local de Entrega</Label>
                    <Input
                      id="local_entrega"
                      value={dadosOperacao.localentrega ?? ''}
                      onChange={(e) => setDadosOperacao({ ...dadosOperacao, localentrega: e.target.value })}
                      placeholder="Cidade, Estado"
                    />
                  </div>

                  <div>
                    <Label htmlFor="frete_tipo">Tipo de Frete</Label>
                    <Select value={dadosOperacao.tipo_frete} onValueChange={(value) => setDadosOperacao({ ...dadosOperacao, tipo_frete: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={dadosOperacao.tipoFrete ?? "Selecione o tipo"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="INTERNO">Frete Interno</SelectItem>
                        <SelectItem value="EXTERNO">Frete Externo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="valor_km">Valor por Quilômetro (R$)</Label>
                    <Input
                      id="valor_km"
                      type="number"
                      step="0.01"
                      value={dadosOperacao.valor_por_km ?? ''}
                      onChange={(e) => setDadosOperacao({ ...dadosOperacao, valor_por_km: parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                    />
                  </div>
                </div> */}

                <div className="flex gap-2">
                  {/* <Button onClick={calcularFrete} disabled={calculandoFrete}>
                    {calculandoFrete ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Route className="h-4 w-4 mr-2" />}
                    Calcular Frete
                  </Button> */}
                  <Button onClick={idSelecionado && idSelecionado !== "default" ? atualizarNegociacao : salvarnegociacao} disabled={loading}>
                    {loading ? (<Loader2 className="h-4 w-4 animate-spin mr-2" />) : (<CheckCircle className="h-4 w-4 mr-2" />)}
                    {idSelecionado && idSelecionado !== "default" ? "Atualizar Negociação" : "Salvar Negociação"}
                  </Button>
                  <Button variant="outline" onClick={limparFormulario}>
                    Limpar Formulário
                  </Button>
                </div>

                {/* {(calculoFrete.distancia > 0 || dadosOperacao.distancia_km > 0) && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Resultado do Cálculo de Frete</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Distância:</span>
                        <span className="font-semibold ml-2">{dadosOperacao.distancia_km > 0 ? dadosOperacao.distancia_km : calculoFrete.distancia.toFixed(1)} km</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Valor Total:</span>
                        <span className="font-semibold ml-2">{formatarMoeda(dadosOperacao.custoTotalOperacao > 0 ? dadosOperacao.custoTotalOperacao : calculoFrete.valor_total)}</span>
                      </div>
                    </div>
                  </div>
                )} */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Semáforo */}
          {
            // 🔹 Chamar automaticamente quando a página carregar
            useEffect(() => {
              carregarSemaforo();
            }, []) // [] = só na montagem do componente
          }
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
                    Vermelho — Emergência ({dadosSemaforo.vermelho.length})
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
                              <h4 className="font-medium text-red-900">{operacao.nomecliente}</h4>
                              <p className="text-sm text-red-700 flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {formatarData(operacao.dataativacao)}
                              </p>
                              <p className="text-sm text-red-700 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {operacao.localentrega}
                              </p>
                              <p className="text-sm text-red-700 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {operacao.responsavelativacaointerno}
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
                    Amarelo — Atenção ({dadosSemaforo.amarelo.length})
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
                              <h4 className="font-medium text-yellow-900">{operacao.nomecliente}</h4>
                              <p className="text-sm text-yellow-700 flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {formatarData(operacao.dataativacao)}
                              </p>
                              <p className="text-sm text-yellow-700 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {operacao.localentrega}
                              </p>
                              <p className="text-sm text-yellow-700 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {operacao.responsavelativacaointerno}
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
                    Azul — Cuidado ({dadosSemaforo.azul.length})
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
                              <h4 className="font-medium text-blue-900">{operacao.nomecliente}</h4>
                              <p className="text-sm text-blue-700 flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {formatarData(operacao.dataativacao)}
                              </p>
                              <p className="text-sm text-blue-700 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {operacao.localentrega}
                              </p>
                              <p className="text-sm text-blue-700 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {operacao.responsavelativacaointerno}
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
                <div className="flex items-end gap-2">
                  <div>
                    <Label htmlFor="tipo_negocio">Consulta por Cliente</Label>
                    <Select onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={dadosOperacao.nomecliente ? dadosOperacao.nomecliente : 'Consulta por cliente'} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {listaOperacoes.map((opList) => (
                          <SelectItem key={opList.id} value={opList.id}>{opList.nomecliente}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button onClick={handleConsulta} disabled={loading}>
                      {loading ? (<Loader2 className="h-4 w-4 animate-spin mr-2" />) : (<CheckCircle className="h-4 w-4 mr-2" />)}
                      {"Consultar"}
                    </Button>
                  </div>
                  <div>
                    <Button
                      className="bg-red-500 hover:bg-red-600"
                      variant="destructive"
                      onClick={deleteNegociacao}>
                      Deletar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
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
                    <InputDatetimeLocal
                      label="Data de Partida para Montagem"
                      name="data_partida"
                      value={dadosOperacao.data_partida ?? ''}
                      onChange={(e) =>
                        setDadosOperacao({ ...dadosOperacao, data_partida: e.target.value })
                      }
                    />
                  </div>

                  <div className='flex gap-4 items-end'>
                    <div>
                      <InputTimeLocal
                        label="Hora de Partida para Montagem"
                        name="horapartida"
                        value={dadosOperacao.horapartida ?? ''}
                        onChange={(e) =>
                          setDadosOperacao({ ...dadosOperacao, horapartida: e.target.value })
                        }
                      />
                    </div>
                    <div className='flex flex-1 flex-col gap-1 mb-4'>
                      <Label htmlFor="local_partida">Local de Partida</Label>
                      <Input
                        id="local_partida"
                        value={dadosOperacao.localpartida ?? ''}
                        onChange={(e) => setDadosOperacao({ ...dadosOperacao, localpartida: e.target.value })}
                        placeholder="Cidade, Estado"
                        className="h-11 bg-white"
                      />
                    </div>
                  </div>



                  <div>
                    <InputDatetimeLocal
                      label="Data de Montagem"
                      name="data_montagem"
                      value={dadosOperacao.data_montagem ?? ''}
                      onChange={(e) =>
                        setDadosOperacao({ ...dadosOperacao, data_montagem: e.target.value })
                      }
                    />
                  </div>

                  <div className='flex gap-4 items-end'>
                    <div>
                      <InputTimeLocal
                        label="Hora da Montagem"
                        name="hora_montagem"
                        value={dadosOperacao.hora_montagem}
                        onChange={(e) =>
                          setDadosOperacao({ ...dadosOperacao, hora_montagem: e.target.value })
                        }
                      />
                    </div>

                    <div className='flex flex-1 flex-col gap-1 mb-4'>
                      <Label htmlFor="local_entrega">Local de Entrega</Label>
                      <Input
                        id="local_entrega"
                        value={dadosOperacao.localentrega ?? ''}
                        onChange={(e) => setDadosOperacao({ ...dadosOperacao, localentrega: e.target.value })}
                        placeholder="Cidade, Estado"
                        className="h-11 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <InputDatetimeLocal
                      label="Data de Desmontagem"
                      name="data_desmontagem"
                      value={dadosOperacao.data_desmontagem ?? ''}
                      onChange={(e) =>
                        setDadosOperacao({ ...dadosOperacao, data_desmontagem: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <InputTimeLocal
                      label="Hora da Desmontagem"
                      name="hora_demontagem"
                      value={dadosOperacao.hora_desmontagem ?? ''}
                      onChange={(e) =>
                        setDadosOperacao({ ...dadosOperacao, hora_desmontagem: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <InputDatetimeLocal
                      label="Data de Retorno à Empresa"
                      name="data_retorno"
                      value={dadosOperacao.data_retorno ?? ''}
                      onChange={(e) =>
                        setDadosOperacao({ ...dadosOperacao, data_retorno: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <InputTimeLocal
                      label="Hora de Retorno à Empresa"
                      name="horaretorno"
                      value={dadosOperacao.horaretorno}
                      onChange={(e) =>
                        setDadosOperacao({ ...dadosOperacao, horaretorno: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="frete_tipo">Tipo de Frete</Label>
                    <Select value={dadosOperacao.tipo_frete} onValueChange={(value) => setDadosOperacao({ ...dadosOperacao, tipo_frete: value })}>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder={dadosOperacao.tipoFrete ?? "Selecione o tipo"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="INTERNO">Frete Interno</SelectItem>
                        <SelectItem value="EXTERNO">Frete Externo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="valor_km">Valor por Quilômetro (R$)</Label>
                    <Input
                      id="valor_km"
                      type="number"
                      step="0.01"
                      value={dadosOperacao.valor_por_km ?? ''}
                      className="h-11 bg-white"
                      onChange={(e) => setDadosOperacao({ ...dadosOperacao, valor_por_km: parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={idSelecionado && idSelecionado !== "default" ? atualizarNegociacao : salvarnegociacao} disabled={loading}>
                      {loading ? (<Loader2 className="h-4 w-4 animate-spin mr-2" />) : (<CheckCircle className="h-4 w-4 mr-2" />)}
                      {idSelecionado && idSelecionado !== "default" ? "Atualizar Negociação" : "Salvar Negociação"}
                    </Button>
                    <Button onClick={calcularFrete} disabled={calculandoFrete}>
                      {calculandoFrete ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Route className="h-4 w-4 mr-2" />}
                      Calcular Frete
                    </Button>
                    <Button variant="outline" onClick={limparFormulario}>
                      Limpar Formulário
                    </Button>
                  </div>
                </div>

                {(calculoFrete.distancia > 0 || dadosOperacao.distancia_km > 0) && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Resultado do Cálculo de Frete</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Distância:</span>
                        <span className="font-semibold ml-2">{dadosOperacao.distancia_km > 0 ? dadosOperacao.distancia_km : calculoFrete.distancia.toFixed(1)} km</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Valor Total:</span>
                        <span className="font-semibold ml-2">{formatarMoeda(dadosOperacao.custoTotalOperacao > 0 ? dadosOperacao.custoTotalOperacao : calculoFrete.valor_total)}</span>
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Ordem de Serviço */}
          <TabsContent value="ordem-servico" className="space-y-6">
            <OrdemServico />
          </TabsContent>

          {/* Aba Calculadoras */}
          <TabsContent value="calculadoras" className="space-y-6">
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-end gap-2">
                    <div>
                      <Label htmlFor="tipo_negocio">Consulta por Profissional</Label>
                      <Select onValueChange={handleSelectChangeProf}>
                        <SelectTrigger>
                          <SelectValue placeholder='Consulta por Profissional' />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="default">Selecione um profissional</SelectItem>
                          {listaProfissional.map((opList) => (
                            <SelectItem key={opList.id} value={opList.id}>{opList.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Button onClick={handleConsultaProf} disabled={loading}>
                        {loading ? (<Loader2 className="h-4 w-4 animate-spin mr-2" />) : (<CheckCircle className="h-4 w-4 mr-2" />)}
                        {"Consultar"}
                      </Button>
                    </div>
                    <div>
                      <Button
                        className="bg-red-500 hover:bg-red-600"
                        variant="destructive"
                        onClick={deleteNegociacao}>
                        Deletar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
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
                            value={dadosProfissional.nome ?? ''}
                            onChange={(e) => setDadosProfissional({ ...dadosProfissional, nome: e.target.value })}
                            placeholder="Nome completo"
                          />
                        </div>

                        <div>
                          <Label>Função</Label>
                          <Input
                            value={dadosProfissional.funcao ?? ''}
                            onChange={(e) => setDadosProfissional({ ...dadosProfissional, funcao: e.target.value })}
                            placeholder="Cargo/função"
                          />
                        </div>

                        <div>
                          <Label>Valor da Diária (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={dadosProfissional.valor_diaria ?? ''}
                            onChange={(e) => setDadosProfissional({ ...dadosProfissional, valor_diaria: e.target.value })}
                            placeholder="0,00"
                          />
                        </div>

                        <div>
                          <Label>Dias de Trabalho</Label>
                          <Input
                            type="number"
                            min="1"
                            value={dadosProfissional.diastrabalhado ?? ''}
                            onChange={(e) => setDadosProfissional({ ...dadosProfissional, diastrabalhado: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm font-medium">
                          Subtotal: {formatarMoeda(dadosProfissional.valor_diaria * dadosProfissional.diastrabalhado)}
                        </span>
                        <Button
                          className="bg-red-500 hover:bg-red-600"
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
                      <span className="text-xl font-bold text-green-900">{formatarMoeda(dadosProfissional.valor_diaria * dadosProfissional.diastrabalhado)}</span>
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
                      <span className="text-blue-900 font-bold">{formatarMoeda(dadosProfissional.valor_frete > 0 ? dadosProfissional.valor_frete : calculoFrete.valor_total)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-900 font-medium">Diárias:</span>
                      <span className="text-green-900 font-bold">{formatarMoeda(dadosProfissional.valor_diaria > 0 ? dadosProfissional.valor_diaria : calculoDiarias.valor_total)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                      <span className="text-gray-900 text-lg font-semibold">Total Geral:</span>
                      <span className="text-gray-900 text-xl font-bold">
                        {formatarMoeda(dadosProfissional.valor_diaria > 0 ? Number(dadosProfissional.valor_frete) + Number(dadosProfissional.valor_diaria) : Number(calculoFrete.valor_total) + Number(calculoDiarias.valor_total))}
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
            <div className="flex gap-2">
              {/* <Button onClick={calcularFrete} disabled={calculandoFrete}>
                    {calculandoFrete ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Route className="h-4 w-4 mr-2" />}
                    Calcular Frete
                  </Button> */}
              <Button onClick={idSelecionadoProf && idSelecionadoProf !== "default" ? atualizarProfissionalBanco : salvarProfissional} disabled={loading}>
                {loading ? (<Loader2 className="h-4 w-4 animate-spin mr-2" />) : (<CheckCircle className="h-4 w-4 mr-2" />)}
                {idSelecionadoProf && idSelecionadoProf !== "default" ? "Atualizar" : "Salvar"}
              </Button>
              <Button variant="outline" onClick={limparFormulario}>
                Limpar Formulário
              </Button>
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

