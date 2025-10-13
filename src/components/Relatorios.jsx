import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, MapPin, User, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import apiService from '../services/api'

const locahostBackend = import.meta.env.VITE_BACKEND_URL;

export default function Relatorios() {
    // Estados principais
    const [carregandoRelatorios, setCarregandoRelatorios] = useState(false);
    const [relatorios, setRelatorios] = useState([]);
    const [erro, setErro] = useState('');

    // Estados para loading e mensagens

    const [message, setMessage] = useState({ type: '', text: '' })

    const mostrarMensagem = (type, text) => {
        setMessage({ type, text });

        // Ocultar em 2 segundos
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 2000);
    };


    // Função para atualizar status de operação
    const atualizarStatusOperacao = async (operacaoId, novoStatus) => {
        try {
            const status = {
                status: novoStatus
            }
            await apiService.updateNegociacao(operacaoId, status);
            mostrarMensagem('success', 'Status atualizado com sucesso!')
            // Recarregar dados do semáforo
            //   carregarSemaforo()
            carregarRelatorios()

        } catch (error) {
            console.error('Erro ao atualizar status:', error)
            mostrarMensagem('error', 'Erro ao atualizar status da operação.')
        }
    }

    // Função para formatar data
    const formatarData = (data) => {
        if (!data) return '-';
        try {
            return new Date(data).toLocaleDateString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
            });
        } catch {
            return '-';
        }
    };

    // Função para carregar relatórios
    const carregarRelatorios = async () => {
        setCarregandoRelatorios(true);
        setErro('');
        try {
            const response = await fetch(`${locahostBackend}/api/operacoes`);
            if (!response.ok) throw new Error('Erro ao buscar relatórios');
            const dados = await response.json();
            setRelatorios(dados);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
            setErro('Não foi possível carregar os relatórios.');
        } finally {
            setCarregandoRelatorios(false);
        }
    };

    // Carregar automaticamente ao abrir a página
    useEffect(() => {
        carregarRelatorios();
    }, []);

    return (
        <>
            <style>{`
                .card-relatorio {
                    width: 413px;
                    display: flex;
                    flex-direction: row;
                }
            }
        `}

            </style>
            <div className="flex flex-col gap-6">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Relatórios de Operações</h2>
                        <p className="text-gray-600">Listagem geral das operações concluidas</p>
                    </div>

                    <Button onClick={carregarRelatorios} disabled={carregandoRelatorios}>
                        {carregandoRelatorios ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Atualizar Relatórios
                    </Button>
                </div>

                {/* Mensagem de erro */}
                {erro && (
                    <p className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                        {erro}
                    </p>
                )}
                {/* {h - [260px] flex flex-col justify-between gap-0 border-gray-200} */}
                {/* Lista de relatórios */}
                <div className="flex flex-wrap gap-6">
                    {relatorios.length > 0 ? (
                        relatorios.filter(r => r.status === 'FINALIZADA')
                            .map((relatorio) => (
                                <div className='card-relatorio' key={relatorio.id}>
                                    {/* {relatorio.status === 'FINALIZADA' && ( */}
                                    <Card>
                                        <CardHeader className="bg-gray-50">
                                            <CardTitle className="text-gray-800 flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                {relatorio.nomecliente || 'Cliente não informado'}
                                            </CardTitle>
                                            <CardDescription className="text-gray-600">
                                                {relatorio.modelonegocio} — {relatorio.status}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="p-4 space-y-2">
                                            <p className="flex items-center gap-2 text-sm text-gray-700">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <strong>Ativação:</strong> {formatarData(relatorio.dataativacao)}
                                            </p>
                                            <p className="flex items-center gap-2 text-sm text-gray-700">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <strong>Local:</strong> {relatorio.localentrega || '-'}
                                            </p>
                                            <p className="flex items-center gap-2 text-sm text-gray-700">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <strong>Responsável:</strong> {relatorio.responsavelativacaointerno || '-'}
                                            </p>

                                            <div className='flex gap-4'>
                                                <Badge
                                                    className={`${relatorio.status === 'PLANEJADA'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : relatorio.status === 'EM_ANDAMENTO'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : relatorio.status === 'FINALIZADA'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {relatorio.status}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => atualizarStatusOperacao(relatorio.id, 'EM_ANDAMENTO')}
                                                >
                                                    Desfazer
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {/* // )} */}
                                </div>
                            ))
                    ) : (
                        <p className="text-center text-gray-600 col-span-3 py-8">
                            Nenhum relatório encontrado.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
