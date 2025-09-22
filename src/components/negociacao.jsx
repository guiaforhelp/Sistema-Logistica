import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { TabsContent } from '@/components/ui/tabs.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import {
    User,
    Route,
    Loader2,
    CheckCircle
} from 'lucide-react'


export default function Negociacoes() {
     const [calculoFrete, setCalculoFrete] = useState({
        distancia: 0,
        valor_total: 0
      })
    const [calculandoFrete, setCalculandoFrete] = useState(false)
    // Estados para loading e mensagens
    const [loading, setLoading] = useState(false)

    const [negociacao2, setnegociacao2] = useState({
        tipo_negocio: '',
        cliente_nome: '',
        responsavel_negociacao2: '',
        responsavel_ativacao: '',
        responsavel_producao: '',
        data_ativacao: '',
        local_partida: '',
        local_entrega: '',
        frete_tipo: '',
        valor_km: 0
    })


    const calcularFrete = async () => {
        if (!negociacao2.local_partida || !negociacao2.local_entrega) {
            setMessage({ type: 'error', text: 'Por favor, preencha os locais de partida e entrega.' })
            return
        }

        setCalculandoFrete(true)
        setMessage({ type: '', text: '' })

        try {
            const resultado = await apiService.calcularDistancia(negociacao2.local_partida, negociacao2.local_entrega)
            const valorTotal = resultado.distancia_km * parseFloat(negociacao2.valor_km || 0)

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

    const salvarnegociacao2 = async () => {
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            // Validações básicas
            if (!negociacao2.cliente_nome || !negociacao2.tipo_negocio) {
                setMessage({ type: 'error', text: 'Por favor, preencha os campos obrigatórios.' })
                return
            }

            // Preparar dados da negociação
            const dadosnegociacao2 = {
                ...negociacao2,
                cliente_id: 1, // Por enquanto usando ID fixo, em produção buscar cliente
                distancia_km: calculoFrete.distancia,
                valor_frete: calculoFrete.valor_total
            }

            // Salvar negociação via API
            const response = await apiService.criarnegociacao2(dadosnegociacao2)

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
        setnegociacao2({
            tipo_negocio: '',
            cliente_nome: '',
            responsavel_negociacao2: '',
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

    // Recuperando os dados operaçøes
    const [lista, setLista] = useState([]);
    const [idBusca, setIdBusca] = useState("1");
    // const [nomeCliente, setNomeCliente] = useState("");
    const [dadosOperacao, setDadosOperacao] = useState({});


    // const fetchOperacoes = async () => {
    //   try {
    //     const res = await fetch(`${locahostBackend}/api/operacoes`);
    //     const data = await res.json();

    //     // console.log("Retorno da API:", data); // veja isso no console

    //     // Ajuste isso com base no formato real
    //      if (Array.isArray(data.operacoes)) {
    //       setLista(data.operacoes);
    //     }  else {
    //       console.warn("Nenhuma lista encontrada:", data);
    //     }
    //   } catch (error) {
    //     console.error("Erro ao buscar operações:", error);
    //   }
    // }

    // fetchOperacoes()

    const locahostBackend = import.meta.env.VITE_BACKEND_URL;
    console.log(locahostBackend);

    const testOp = async ()=>{
        const res = await fetch(`${locahostBackend}/api/operacoes`);
        const data = await res.json();
    }


    useEffect(() => {
        // buscando por nome cliente
        if (Array.isArray(lista)) {
            const encontrado = lista.find(op => String(op.id) === String(idBusca));
            if (encontrado) {
                setDadosOperacao(encontrado);
            } else {
                setDadosOperacao({});
            }

            // setNomeCliente(encontrado?.nomeCliente ?? "");
        }
    }, [idBusca, lista]);


    return (
       <div></div>
    )
}