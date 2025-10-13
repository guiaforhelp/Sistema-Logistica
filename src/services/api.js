const locahostBackend = import.meta.env.VITE_BACKEND_URL;
const API_BASE_URL = `${locahostBackend}/api`;

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Se não há conteúdo (204), retorna null
      if (response.status === 204) {
        return null
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Clientes
  async getClientes() {
    return this.request('/clientes')
  }

  async createCliente(cliente) {
    return this.request('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    })
  }

  async updateCliente(id, cliente) {
    return this.request(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    })
  }

  async deleteCliente(id) {
    return this.request(`/clientes/${id}`, {
      method: 'DELETE',
    })
  }

  // Profissionais
  async getProfissionais() {
    return this.request('/profissional')
  }

  async createProfissional(profissional) {
    return this.request('/profissional', {
      method: 'POST',
      body: JSON.stringify(profissional),
    })
  }

  async updateProfissional(id, profissional) {
    return this.request(`/profissional/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profissional),
    })
  }

  async deleteProfissional(id) {
    return this.request(`/profissional/${id}`, {
      method: 'DELETE',
    })
  }

  // Equipamentos
  async getEquipamentos() {
    return this.request('/equipamentos')
  }

  async createEquipamento(equipamento) {
    return this.request('/equipamentos', {
      method: 'POST',
      body: JSON.stringify(equipamento),
    })
  }

  // Negociações
  async getNegociacoes() {
    return this.request('/operacoes')
  }

  async createNegociacao(dadosOperacao) {
    const { id, ...dadosSemId } = dadosOperacao;
    // console.log('dados: ', dadosSemId);
    return this.request('/operacoes', {
      method: 'POST',
      body: JSON.stringify(dadosSemId),
    })
    
  }

  async updateNegociacao(idUpadete, negociacao, tipo) {
    
    const {
      id,
      ...dadosSemId
    } = negociacao

    const {  
      nomecliente, 
      modelonegocio,
      responsavelnegociacao,
      responsavelativacaointerno,
      responsavelproducaointerno,
      dataativacao,
      localentrega,
      tipo_frete,
      localpartida,
      data_retorno,
      data_desmontagem,
      data_montagem,
      valor_por_km,
      distancia_km,
      hora_desmontagem,
      hora_montagem,
      horapartida,
      horaretorno,
      custoTotalOperacao,
      ...dadosSem
    } = dadosSemId;

    // console.log(tipo === "os_equipamentos" ? dadosSem : dadosSemId);
    
    return this.request(`/operacoes/${idUpadete}`, {
      method: 'PUT',
      body: JSON.stringify(tipo === "os_equipamentos" ? dadosSem : dadosSemId),
    })
  }

  async deleteNegociacao(id) {
    return this.request(`/operacoes/${id}`, {
      method: 'DELETE',
    })
  }

  async calcularFrete(id, valorKm) {
    return this.request(`/operacoes/${id}/calcular-frete`, {
      method: 'POST',
      body: JSON.stringify({ valor_km: valorKm }),
    })
  }

  //OS
  async getOrdensServico() {
    try {
      const res = await fetch('/os');
      if (!res.ok) throw new Error("Erro ao buscar OS");
      return await res.json();
    } catch (error) {
      console.error("Erro na ApiService:", error);
      return [];
    }
  }

  // Semáforo
  async getSemaforo() {
    return this.request('/api/semaforo')
  }

  // Eventos
  async getEventos() {
    return this.request('/eventos')
  }

  async createEvento(evento) {
    return this.request('/eventos', {
      method: 'POST',
      body: JSON.stringify(evento),
    })
  }

  async updateEvento(id, evento) {
    return this.request(`/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(evento),
    })
  }

  async deleteEvento(id) {
    return this.request(`/eventos/${id}`, {
      method: 'DELETE',
    })
  }

  async getEventoByNegociacao(negociacaoId) {
    return this.request(`/eventos/negociacao/${negociacaoId}`)
  }

  // Ordem de Serviço
  async getOrdemServico() {
    return this.request('/ordem-servico')
  }

  async createOrdemServico(ordemServico) {
    return this.request('/ordem-servico', {
      method: 'POST',
      body: JSON.stringify(ordemServico),
    })
  }

  async updateOrdemServico(id, ordemServico) {
    return this.request(`/ordem-servico/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ordemServico),
    })
  }

  async deleteOrdemServico(id) {
    return this.request(`/ordem-servico/${id}`, {
      method: 'DELETE',
    })
  }

  async getOrdemServicoByNegociacao(negociacaoId) {
    return this.request(`/ordem-servico/negociacao/${negociacaoId}`)
  }

  // Gerenciar itens de equipamento
  async addEquipamentoItem(ordemId, item) {
    return this.request(`/ordem-servico/${ordemId}/equipamento`, {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  async updateEquipamentoItem(itemId, item) {
    return this.request(`/ordem-servico/equipamento/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    })
  }

  async deleteEquipamentoItem(itemId) {
    return this.request(`/ordem-servico/equipamento/${itemId}`, {
      method: 'DELETE',
    })
  }

  async getEquipamentosByOrdem(ordemId) {
    return this.request(`/ordem-servico/${ordemId}/equipamentos`)
  }

  // Função para criar negociação (atualizada)
  async criarNegociacao(negociacao) {
    return this.createNegociacao(negociacao)
  }

  // Função para calcular distância (simulada)
  async calcularDistancia(origem, destino) {
    // Em produção, usar Google Maps Distance Matrix API
    // Por enquanto, retorna um valor simulado
    return new Promise((resolve) => {
      setTimeout(() => {
        const distanciaSimulada = Math.floor(Math.random() * 500) + 50 // 50-550 km
        resolve({
          distancia_km: distanciaSimulada,
          origem,
          destino
        })
      }, 1000)
    })
  }
}

export default new ApiService()

