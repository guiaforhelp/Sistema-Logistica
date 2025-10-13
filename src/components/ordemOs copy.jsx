import { useEffect, useState } from "react";
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Button } from '@/components/ui/button.jsx';
import { CheckSquare } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import apiService from "../services/api";
import { LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'

const locahostBackend = import.meta.env.VITE_BACKEND_URL;


export default function OrdemServico() {
    // Estados para loading e mensagens
    const [message, setMessage] = useState({ type: '', text: '' })

    const mostrarMensagem = (type, text) => {
        setMessage({ type, text });

        // Ocultar em 2 segundos
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 2000);
    };

    const [loading, setLoading] = useState(false)

    const [dadosOperacao, setDadosOperacao] = useState({
        id: '',
        nomecliente: '',
        modelonegocio: '',
        responsavelnegociacao: '',
        responsavelativacaointerno: '',
        responsavelproducaointerno: '',
        dataativacao: '',
        localentrega: '',
        tipo_frete: '',
        localpartida: '',
        data_retorno: '',
        data_desmontagem: '',
        data_montagem: '',
        valor_por_km: 0,
        distancia_km: 0,
        hora_desmontagem: '',
        hora_montagem: '',
        horapartida: '',
        horaretorno: '',
        custoTotalOperacao: 0,
        equipamentos: '',
        descTrabalho: '',
        observacoes: ''
    });

    const [idSelecionadoBtn, setIdSelecionadoBtn] = useState("");

    // apenas guarda o ID selecionado
    const handleSelectChange = (value) => {
        setIdSelecionadoBtn(value);
    };

    // só consulta quando clicar no botão
    const handleConsulta = () => {
        if (!selectedCliente) {
            console.warn("Nenhum cliente selecionado!");
            return;
        }

        // aqui você chama sua API ou lógica de consulta
        setIdSelecionado(selectedCliente)
    };

    const limparFormulario = () => {
        setDadosProfissional({
            nome: '',
            funcao: '',
            valor_diaria: ''
        }),
            setDadosOperacao({
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

    const [selectedCliente, setSelectedCliente] = useState("");
    
      const resetForm = () => {
        limparFormulario();
        setIdSelecionado('default');
        setSelectedCliente('default');
      };

    // Funções para gerenciar equipamentos
    const adicionarEquipamento = () => {
        const novoEquipamento = {
            id: null,
            equipamento_nome: 'Novo Equipamento ',
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

    const atualizarDesc = (novaDescricao) => {
        setOrdemServico({
            ...ordemServico,
            descricao_trabalho: novaDescricao
        });
        
    };




    //criando loop
    const [listaOperacoes, setListaOperacoes] = useState([]);
    const [idSelecionado, setIdSelecionado] = useState('');
    const [ordemServico, setOrdemServico] = useState({
        descricao_trabalho: '',
        observacoes: '',
        composicao_equipamentos: []
    });

 

    useEffect(() => {
        const fetchListaOperacoes = async () => {
            try {
                const res = await fetch(`${locahostBackend}/api/operacoes/`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setListaOperacoes(data);
                    setDadosOperacao(data);

                } else {
                    console.warn("Resposta inesperada ao listar operações:", data);
                }
            } catch (error) {
                console.error("Erro ao buscar lista de operações:", error);
            }
        };

        fetchListaOperacoes();
    }, []);


    const salvarnegociacao = async () => {
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            // Validações básicas
            if (!dadosOperacao.nomecliente || !dadosOperacao.modelonegocio) {
                setMessage({ type: 'error', text: 'Por favor, preencha os campos obrigatórios.' })
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
            if (valorFinalFrete <= 0) {
                setMessage({ type: 'error', text: 'Calculo do frete ainda não foi definido, por favor clique no botão calcular frete' })
                return
            }




            // Salvar negociação via API
            const response = await apiService.createNegociacao(payload)

            // // Capturar código de operação
            // if (response.codigo_operacao) {
            //   setCodigoOperacao(response.codigo_operacao)
            // }

            setMessage({ type: 'success', text: `Negociação salva com sucesso! Código: ` })
        } catch (error) {
            console.error('Erro ao salvar negociação:', error)
            setMessage({ type: 'error', text: 'Erro ao salvar a negociação. Tente novamente.' })
        } finally {
            setLoading(false)
        }
    }

    const deleteNegociacao = async () => {
        try {
            await apiService.deleteNegociacao(idSelecionado);
            mostrarMensagem('success', `Deletado com sucesso`)
        } catch (err) {
            console.error("Erro ao deletar:", err);
            mostrarMensagem('error', 'Erro ao deletar. Tente novamente.')
        }
    }

    const atualizarNegociacao = async () => {
        setMessage({ type: '', text: '' })
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
            } = ordemServico || {};

            const equipamentos = ordemServico.composicao_equipamentos;


            // ordemServico.composicao_equipamentos.map((equipamento, index) => (
            //     console.log(`ID: ${index}, ITEM: ${equipamento.descTrabalho}`)

            // ))

            const envDados = {
                ...dadosOperacao,
                // equipamentos
            }

            console.log(envDados);
            

            // chama a API no formato (id, payload)
            // await apiService.updateNegociacao(id, envDados, "os_equipamentos");

            setMessage({ type: 'success', text: `Atualização realizada com sucesso` })
        } catch (err) {
            console.error("Erro ao atualizar negociação:", err);
        }
    };



    useEffect(() => {
        if (!idSelecionado) return;

        const fetchOS = async () => {
            try {
                const res = await fetch(`${locahostBackend}/api/operacoes/${idSelecionado}`);
                const data = await res.json();
                

                const equipamentosFormatados = Array.isArray(data.equipamentos)
                    ? data.equipamentos.map(item => ({
                        id: item.id || null,
                        equipamento_nome: item.equipamento_nome || '',
                        quantidade: Number(item.quantidade) || 1,
                        verificado: item.verificado || false,
                        observacao_item: '',
                    }))
                    : [];



                setOrdemServico({
                    descricao_trabalho: data.descTrabalho,
                    observacoes: data.observacoes,
                    composicao_equipamentos: equipamentosFormatados, // mesmo que vazio
                });

                setDadosOperacao(descricao_trabalho)


            } catch (err) {
                console.error("Erro ao buscar OS:", err);
            }
        };

        fetchOS();
    }, [idSelecionado]);
    

    return (
        <div>
            <Card>
                <CardHeader>
                    <div className="flex items-end gap-2">
                        <div>
                            <Label htmlFor="tipo_negocio">Consulta por Cliente</Label>
                            <Select value={selectedCliente} onValueChange={(e) => setSelectedCliente(e)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={selectedCliente == 'default' ? "Consulta por Cliente" : selectedCliente} />
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
                <CardContent className="space-y-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5" />
                            Ordem de Serviço (OS)
                        </CardTitle>
                        <CardDescription>
                            Descrição do trabalho e composição dos equipamentos
                        </CardDescription>
                    </CardHeader>
                    {message.text && (
                        <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                            {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                                {message.text}
                            </AlertDescription>
                        </Alert>
                    )}
                    {/* <div>
                <Label htmlFor="tipo_negocio">Selecione o Cliente</Label>
                <Select value={idSelecionado} onValueChange={setIdSelecionado}>
                    <SelectTrigger>
                        <SelectValue placeholder='Selecione o tipo' />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        {listaOperacoes.map((opList) => (
                            <SelectItem key={opList.id} value={opList.id}>{opList.nomecliente}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div> */}
                    <div>
                        <Label htmlFor="descricao_trabalho">Descrição do Trabalho</Label>
                        <textarea
                            id="descricao_trabalho"
                            className="w-full p-3 border border-gray-300 rounded-md resize-none"
                            rows="4"
                            value={ordemServico.descricao_trabalho ?? ''}
                            onChange={(e) => atualizarDesc(e.target.value)}
                            placeholder="Descreva detalhadamente o trabalho que será executado..."
                        />
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <Label>Composição do Equipamento - Checklist</Label>
                        <Button onClick={adicionarEquipamento} size="sm">
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Insira mais itens
                        </Button>
                    </div>
                    {Array.isArray(ordemServico.composicao_equipamentos) && ordemServico.composicao_equipamentos.length > 0 ?
                        (ordemServico.composicao_equipamentos.map((equipamento, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                    <div>
                                        <Label>Nome do Equipamento</Label>
                                        <Input
                                            value={equipamento.equipamento_nome}
                                            onChange={(e) => atualizarEquipamento(index, 'equipamento_nome', e.target.value)}
                                            placeholder="Nome do equipamento"
                                        />

                                    </div>

                                    <div>
                                        <Label>Quantidade</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={equipamento.quantidade}
                                            onChange={(e) => atualizarEquipamento(index, 'quantidade', parseInt(e.target.value) || 1)}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 pt-6">
                                        <Checkbox
                                            id={`verificado-${index}`}
                                            checked={equipamento.verificado}
                                            onCheckedChange={(checked) => atualizarEquipamento(index, 'verificado', checked)}
                                        />
                                        <Label htmlFor={`verificado-${index}`}>Verificado</Label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            className="bg-red-500 hover:bg-red-600"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removerEquipamento(index)}
                                            disabled={ordemServico.composicao_equipamentos.length === 1}
                                        >
                                            Remover
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Label>Observações do Item</Label>
                                    <Input
                                        value={equipamento.observacao_item}
                                        onChange={(e) => atualizarEquipamento(index, 'observacao_item', e.target.value)}
                                        placeholder="Observações específicas deste equipamento..."
                                    />
                                </div>
                            </div>
                        ))) : (<p className="text-gray-500 italic mt-4">Nenhum equipamento selecionado.</p>)}
                    <div>
                        <Label htmlFor="observacoes">Área de Observações</Label>
                        <textarea
                            id="observacoes"
                            className="w-full p-3 border border-gray-300 rounded-md resize-none"
                            rows="3"
                            value={ordemServico.observacoes ?? ''}
                            onChange={(e) => setOrdemServico({ ...ordemServico, observacoes: e.target.value })}
                            placeholder="Observações gerais importantes sobre a ordem de serviço..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={idSelecionado && idSelecionado !== "default" ? atualizarNegociacao : salvarnegociacao} disabled={loading}>
                            {loading ? (<Loader2 className="h-4 w-4 animate-spin mr-2" />) : (<CheckCircle className="h-4 w-4 mr-2" />)}
                            {idSelecionado && idSelecionado !== "default" ? "Atualizar Negociação" : "Salvar Negociação"}
                        </Button>
                        <Button variant="outline" onClick={limparFormulario}>
                            Limpar Formulário
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}