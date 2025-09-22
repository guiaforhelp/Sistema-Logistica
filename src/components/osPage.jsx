import { useEffect, useState } from "react";

export default function OrdemServico() {
    const [ordemServico, setOrdemServico] = useState({
        descricao_trabalho: '',
        observacoes: '',
        composicao_equipamentos: []
    });

    useEffect(() => {
        async function fetchOS() {
            try {
                const res = await fetch('http://192.168.0.127:5000/api/os');
                const data = await res.json();

                // Transformar os dados no formato do estado
                const equipamentosFormatados = data.os.map(item => ({
                    id: item.id,
                    equipamento_nome: item.nomeEquipamento,
                    quantidade: Number(item.quantidade),
                    verificado: item.verificado,
                    observacao_item: '',
                }));

                setOrdemServico({
                    descricao_trabalho: data.os[0]?.DescTrabalho || '',
                    observacoes: '',
                    composicao_equipamentos: equipamentosFormatados
                });
            } catch (err) {
                console.error("Erro ao buscar OS:", err);
            }
        }

        fetchOS();
    }, []);

    return (
        <div>
            <h2>Ordem de Serviço</h2>

            <p><strong>Descrição do trabalho:</strong> {ordemServico.descricao_trabalho}</p>

            <h3>Equipamentos:</h3>
            <ul>
                {(ordemServico.composicao_equipamentos || []).map((item, index) => (
                    <li key={index}>
                        <strong>{item.equipamento_nome}</strong> — {item.quantidade} unidade(s)
                        {item.verificado ? " ✅" : " ❌"}
                    </li>
                ))}
            </ul>
        </div>
    );
}
