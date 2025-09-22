import { useEffect, useState } from 'react';

const localhostBackend = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [operacoes, setLista] = useState([]);

  console.log(operacoes.localentrega);
  

  useEffect(() => {
    const fetchOperacoes = async () => {
      try {
        const res = await fetch(`${localhostBackend}/api/operacoes/ed099e57-35b8-4b40-af69-2b070b482c7b`);
        const data = await res.json()

        setLista(data);
      } catch (err) {
        console.error("Erro ao buscar operações:", err);
      }
    };
    fetchOperacoes();
  }, []);


  return (
    <div style={{ padding: '2rem' }}>
      <h2>Buscar Operação por ID</h2>


      {operacoes?.id && (
        <div style={{ lineHeight: 1.6 }}>
          <h3>Informações Gerais</h3>
          <p><strong>Cliente:</strong> {operacoes.nomecliente}</p>
          <p><strong>Modelo de Negócio:</strong> {operacoes.modelonegocio}</p>
          <p><strong>Status:</strong> {operacoes.status}</p>
          <p><strong>Prioridade:</strong> {operacoes.prioridade}</p>
          <p><strong>Região:</strong> {operacoes.regiao}</p>
          <p><strong>Data Ativação:</strong> {operacoes.dataativacao?.slice(0, 10)}</p>
          <p><strong>Local Entrega:</strong> {operacoes.localentrega}</p>
          <p><strong>Local Montagem:</strong> {operacoes.localmontagem}</p>
          <p><strong>Responsável Negociação:</strong> {operacoes.responsavelnegociacao}</p>
          <p><strong>Responsável Ativação:</strong> {operacoes.responsavelativacaointerno}</p>
          <p><strong>Responsável Produção:</strong> {operacoes.responsavelproducaointerno}</p>

          <h3>Datas</h3>
          <p><strong>Montagem:</strong> {operacoes.data_montagem?.slice(0, 10)} às {operacoes.hora_montagem?.slice(11, 16)}</p>
          <p><strong>Desmontagem:</strong> {operacoes.data_desmontagem?.slice(0, 10)} às {operacoes.hora_desmontagem?.slice(11, 16)}</p>
          <p><strong>Partida:</strong> {operacoes.data_partida?.slice(0, 10)}</p>
          <p><strong>Retorno:</strong> {operacoes.data_retorno?.slice(0, 10)}</p>

          <h3>Custos e Frete</h3>
          <p><strong>Custo Total:</strong> R$ {operacoes.custoTotalOperacao}</p>
          <p><strong>Tipo de Frete:</strong> {operacoes.tipo_frete}</p>
          <p><strong>Valor do Frete:</strong> R$ {operacoes.valor_frete}</p>
          <p><strong>Distância:</strong> {operacoes.distancia_km} km</p>
          <p><strong>Valor por KM:</strong> R$ {operacoes.valor_por_km}</p>

          <h3>Equipamentos</h3>
          <ul>
            {operacoes.equipamentos?.map((eq, idx) => (
              <li key={idx}>
                {eq.tipo} ({eq.modelo}) - Qtd: {eq.quantidade}, Valor Unitário: R$ {eq.valorUnitario}, Total: R$ {eq.valor}
              </li>
            ))}
          </ul>

          <h3>Profissionais</h3>
          <ul>
            {operacoes.profissionais?.map((p, idx) => (
              <li key={idx}>
                {p.nome} - {p.funcao}, Diária: R$ {p.valorDiaria}, Dias: {p.diasTrabalho}
              </li>
            ))}
          </ul>

          <h3>Observações</h3>
          <p>{operacoes.observacoes}</p>
        </div>
      )}
    </div>
  );
}

export default App