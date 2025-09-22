/**
 * Gerador de 1000 Operações Fictícias
 * Sistema Techno Motion - Dados de Teste
 */

const fs = require('fs');
const path = require('path');

class GeradorOperacoes {
  constructor() {
    this.empresas = [
      'TechCorp Inovações Ltda', 'Mega Eventos & Produções', 'Inovação Digital Solutions',
      'StartUp Tech Expo', 'Future Vision Conferences', 'Digital Experience Hub',
      'Innovation Labs Brasil', 'Tech Summit Organizers', 'Virtual Reality Pro',
      'Immersive Events Co', 'NextGen Conferences', 'Smart Events Brasil',
      'Tech Expo International', 'Digital Transformation Ltd', 'VR Experience Center',
      'Interactive Media Group', 'Advanced Tech Solutions', 'Modern Events Company',
      'Digital Innovation Hub', 'Technology Showcase Ltd', 'Virtual Experiences Inc',
      'Tech Conference Masters', 'Digital Events Pro', 'Innovation Expo Brasil',
      'Future Tech Events', 'Immersive Technology Co', 'Smart Conference Solutions',
      'Digital Media Experts', 'Tech Revolution Events', 'Virtual Reality Masters',
      'Interactive Solutions Ltd', 'Advanced Events Group', 'Digital Experience Pro',
      'Technology Leaders Expo', 'Innovation Summit Brasil', 'VR Technology Hub',
      'Digital Transformation Events', 'Tech Innovation Center', 'Future Events Company',
      'Immersive Media Solutions', 'Smart Technology Expo', 'Digital Revolution Ltd',
      'Tech Experience Masters', 'Virtual Innovation Hub', 'Advanced Digital Events',
      'Technology Showcase Pro', 'Digital Future Conferences', 'Innovation Tech Expo',
      'VR Solutions Company', 'Interactive Technology Ltd', 'Smart Digital Events'
    ];

    this.cidades = [
      { nome: 'São Paulo', estado: 'SP', regiao: 'Sudeste' },
      { nome: 'Rio de Janeiro', estado: 'RJ', regiao: 'Sudeste' },
      { nome: 'Belo Horizonte', estado: 'MG', regiao: 'Sudeste' },
      { nome: 'Brasília', estado: 'DF', regiao: 'Centro-Oeste' },
      { nome: 'Salvador', estado: 'BA', regiao: 'Nordeste' },
      { nome: 'Fortaleza', estado: 'CE', regiao: 'Nordeste' },
      { nome: 'Recife', estado: 'PE', regiao: 'Nordeste' },
      { nome: 'Porto Alegre', estado: 'RS', regiao: 'Sul' },
      { nome: 'Curitiba', estado: 'PR', regiao: 'Sul' },
      { nome: 'Florianópolis', estado: 'SC', regiao: 'Sul' },
      { nome: 'Goiânia', estado: 'GO', regiao: 'Centro-Oeste' },
      { nome: 'Belém', estado: 'PA', regiao: 'Norte' },
      { nome: 'Manaus', estado: 'AM', regiao: 'Norte' },
      { nome: 'Vitória', estado: 'ES', regiao: 'Sudeste' },
      { nome: 'João Pessoa', estado: 'PB', regiao: 'Nordeste' },
      { nome: 'Natal', estado: 'RN', regiao: 'Nordeste' },
      { nome: 'Maceió', estado: 'AL', regiao: 'Nordeste' },
      { nome: 'Aracaju', estado: 'SE', regiao: 'Nordeste' },
      { nome: 'Campo Grande', estado: 'MS', regiao: 'Centro-Oeste' },
      { nome: 'Cuiabá', estado: 'MT', regiao: 'Centro-Oeste' },
      { nome: 'Teresina', estado: 'PI', regiao: 'Nordeste' },
      { nome: 'São Luís', estado: 'MA', regiao: 'Nordeste' },
      { nome: 'Macapá', estado: 'AP', regiao: 'Norte' },
      { nome: 'Boa Vista', estado: 'RR', regiao: 'Norte' },
      { nome: 'Rio Branco', estado: 'AC', regiao: 'Norte' },
      { nome: 'Porto Velho', estado: 'RO', regiao: 'Norte' },
      { nome: 'Palmas', estado: 'TO', regiao: 'Norte' },
      { nome: 'Campinas', estado: 'SP', regiao: 'Sudeste' },
      { nome: 'Santos', estado: 'SP', regiao: 'Sudeste' },
      { nome: 'Ribeirão Preto', estado: 'SP', regiao: 'Sudeste' }
    ];

    this.responsaveis = [
      'Carlos Silva Santos', 'Maria Costa Oliveira', 'João Pedro Lima', 'Ana Paula Ferreira',
      'Roberto Mendes Souza', 'Fernanda Torres Alves', 'Ricardo Barbosa Costa', 'Juliana Santos Lima',
      'Marcos Antonio Silva', 'Patricia Rodrigues Nunes', 'Eduardo Pereira Santos', 'Camila Oliveira Costa',
      'Rafael Souza Ferreira', 'Luciana Mendes Torres', 'Thiago Barbosa Lima', 'Isabela Rocha Santos',
      'Diego Alves Pereira', 'Sofia Rodrigues Costa', 'Gabriel Lima Souza', 'Beatriz Santos Oliveira',
      'Leonardo Costa Ferreira', 'Mariana Alves Lima', 'Felipe Santos Rodrigues', 'Larissa Oliveira Souza',
      'Bruno Ferreira Costa', 'Amanda Torres Santos', 'Gustavo Lima Alves', 'Natália Santos Ferreira',
      'Rodrigo Costa Oliveira', 'Vanessa Alves Santos', 'Daniel Souza Lima', 'Caroline Ferreira Costa',
      'André Santos Rodrigues', 'Priscila Lima Oliveira', 'Henrique Costa Santos', 'Tatiane Alves Ferreira',
      'Vinícius Santos Lima', 'Renata Oliveira Costa', 'Fábio Ferreira Santos', 'Cristiane Lima Alves'
    ];

    this.locaisMontagem = [
      'Centro de Convenções', 'Expo Center', 'Arena Multiuso', 'Pavilhão de Exposições',
      'Centro de Eventos', 'Complexo Empresarial', 'Hotel Convention Center', 'Shopping Center',
      'Universidade Campus', 'Centro Cultural', 'Estádio Multiuso', 'Centro Empresarial',
      'Parque de Exposições', 'Centro de Negócios', 'Auditório Municipal', 'Centro Tecnológico'
    ];

    this.equipamentos = [
      { tipo: 'Tela', modelos: ['LED 55"', 'LED 65"', 'LED 75"', 'LED 85"', 'Projetor 4K'], precoBase: 400 },
      { tipo: 'Oculos VR', modelos: ['Meta Quest 3', 'Meta Quest Pro', 'HTC Vive Pro', 'Pico 4'], precoBase: 150 },
      { tipo: 'Computador', modelos: ['Gaming PC', 'Workstation', 'Gaming PC Pro', 'Server Grade'], precoBase: 400 }
    ];

    this.profissionais = [
      { funcao: 'Técnico de Montagem', valorDiaria: 350 },
      { funcao: 'Coordenador de Eventos', valorDiaria: 450 },
      { funcao: 'Especialista em TI', valorDiaria: 400 },
      { funcao: 'Designer de Experiência', valorDiaria: 500 },
      { funcao: 'Técnico de Suporte', valorDiaria: 300 },
      { funcao: 'Gerente de Operações', valorDiaria: 600 },
      { funcao: 'Analista de Sistemas', valorDiaria: 380 },
      { funcao: 'Especialista em VR', valorDiaria: 550 }
    ];

    this.observacoes = [
      'Evento corporativo de lançamento de produto',
      'Feira de tecnologia com demonstrações VR',
      'Congresso internacional de inovação',
      'Exposição de startups e tecnologia',
      'Conferência de transformação digital',
      'Summit de líderes empresariais',
      'Workshop de realidade virtual',
      'Seminário de tendências tecnológicas',
      'Encontro de desenvolvedores',
      'Mostra de soluções digitais',
      'Evento de networking empresarial',
      'Apresentação de produtos inovadores',
      'Treinamento corporativo avançado',
      'Demonstração de tecnologias emergentes',
      'Evento de capacitação profissional'
    ];
  }

  gerarOperacoes(quantidade = 1000) {
    console.log(`🚀 Gerando ${quantidade} operações fictícias...`);
    
    const operacoes = [];
    const dataInicio = new Date('2024-01-01');
    const dataFim = new Date('2025-12-31');
    
    for (let i = 1; i <= quantidade; i++) {
      const operacao = this.gerarOperacao(i, dataInicio, dataFim);
      operacoes.push(operacao);
      
      if (i % 100 === 0) {
        console.log(`   ✅ ${i}/${quantidade} operações geradas`);
      }
    }
    
    return operacoes;
  }

  gerarOperacao(id, dataInicio, dataFim) {
    const cidade = this.randomItem(this.cidades);
    const empresa = this.randomItem(this.empresas);
    const dataAtivacao = this.gerarDataAleatoria(dataInicio, dataFim);
    const modeloNegocio = this.random(0, 100) < 70 ? 'LOCACAO' : 'VENDA';
    
    // Gerar datas do evento
    const diasAntecedencia = this.random(1, 5);
    const duracaoEvento = this.random(1, 7);
    
    const dataMontagem = new Date(dataAtivacao);
    dataMontagem.setDate(dataMontagem.getDate() - diasAntecedencia);
    
    const dataDesmontagem = new Date(dataMontagem);
    dataDesmontagem.setDate(dataDesmontagem.getDate() + duracaoEvento);
    
    const dataPartida = new Date(dataMontagem);
    dataPartida.setDate(dataPartida.getDate() - 1);
    
    const dataRetorno = new Date(dataDesmontagem);
    dataRetorno.setDate(dataRetorno.getDate() + 1);
    
    // Gerar equipamentos
    const equipamentosOperacao = this.gerarEquipamentos();
    const valorEquipamentos = equipamentosOperacao.reduce((sum, eq) => sum + eq.valor, 0);
    
    // Gerar profissionais
    const profissionaisOperacao = this.gerarProfissionais(duracaoEvento);
    const valorProfissionais = profissionaisOperacao.reduce((sum, prof) => sum + (prof.valorDiaria * prof.diasTrabalho), 0);
    
    // Calcular frete
    const distanciaKm = this.random(50, 2000);
    const valorPorKm = this.random(80, 150) / 100; // R$ 0.80 a R$ 1.50
    const valorFrete = Math.round(distanciaKm * valorPorKm);
    const tipoFrete = this.random(0, 100) < 60 ? 'INTERNO' : 'EXTERNO';
    
    // Calcular custo total
    const custoTotalOperacao = valorEquipamentos + valorProfissionais + valorFrete + this.random(200, 800);
    
    // Determinar status baseado na data
    const status = this.determinarStatus(dataAtivacao, dataMontagem, dataDesmontagem);
    
    // Determinar prioridade
    const prioridade = this.determinarPrioridade(dataAtivacao, custoTotalOperacao);
    
    return {
      id: `op_${String(id).padStart(4, '0')}`,
      nomeCliente: empresa,
      clienteId: `cliente_${String(this.random(1, 200)).padStart(3, '0')}`,
      modeloNegocio,
      dataAtivacao: this.formatarData(dataAtivacao),
      localEntrega: `${cidade.nome}, ${cidade.estado}`,
      localMontagem: `${this.randomItem(this.locaisMontagem)}, ${cidade.nome}, ${cidade.estado}`,
      responsavelNegociacao: this.randomItem(this.responsaveis),
      responsavelAtivacaoInterno: this.randomItem(this.responsaveis),
      responsavelProducaoInterno: this.randomItem(this.responsaveis),
      dataMontagem: this.formatarData(dataMontagem),
      horaMontagem: this.gerarHorario('inicio'),
      dataDesmontagem: this.formatarData(dataDesmontagem),
      horaDesmontagem: this.gerarHorario('fim'),
      dataPartida: this.formatarData(dataPartida),
      dataRetorno: this.formatarData(dataRetorno),
      status,
      custoTotalOperacao: Math.round(custoTotalOperacao * 100) / 100,
      valorFrete,
      tipoFrete,
      distanciaKm,
      valorPorKm: Math.round(valorPorKm * 100) / 100,
      equipamentos: equipamentosOperacao,
      profissionais: profissionaisOperacao,
      observacoes: this.randomItem(this.observacoes),
      prioridade,
      regiao: cidade.regiao,
      createdAt: this.gerarTimestamp(dataAtivacao, -30, -1),
      updatedAt: this.gerarTimestamp(dataAtivacao, -15, 0)
    };
  }

  gerarEquipamentos() {
    const equipamentos = [];
    const numTipos = this.random(1, 3);
    
    for (let i = 0; i < numTipos; i++) {
      const equipamento = this.randomItem(this.equipamentos);
      const quantidade = this.random(1, 20);
      const modelo = this.randomItem(equipamento.modelos);
      const valorUnitario = equipamento.precoBase + this.random(-50, 200);
      const valor = quantidade * valorUnitario;
      
      equipamentos.push({
        tipo: equipamento.tipo,
        quantidade,
        modelo,
        valorUnitario: Math.round(valorUnitario * 100) / 100,
        valor: Math.round(valor * 100) / 100
      });
    }
    
    return equipamentos;
  }

  gerarProfissionais(duracaoEvento) {
    const profissionais = [];
    const numProfissionais = this.random(1, 4);
    
    for (let i = 0; i < numProfissionais; i++) {
      const profissional = this.randomItem(this.profissionais);
      const nome = this.randomItem(this.responsaveis);
      const diasTrabalho = this.random(1, duracaoEvento + 2);
      const valorDiaria = profissional.valorDiaria + this.random(-50, 100);
      
      profissionais.push({
        profissionalId: `prof_${String(this.random(1, 100)).padStart(3, '0')}`,
        nome,
        funcao: profissional.funcao,
        valorDiaria: Math.round(valorDiaria * 100) / 100,
        diasTrabalho
      });
    }
    
    return profissionais;
  }

  determinarStatus(dataAtivacao, dataMontagem, dataDesmontagem) {
    const agora = new Date();
    
    if (agora < dataMontagem) {
      return 'PLANEJADA';
    } else if (agora >= dataMontagem && agora <= dataDesmontagem) {
      return 'EM_ANDAMENTO';
    } else if (agora > dataDesmontagem) {
      const diasAposFim = Math.floor((agora - dataDesmontagem) / (1000 * 60 * 60 * 24));
      return diasAposFim <= 2 ? 'FINALIZADA' : 'ARQUIVADA';
    }
    
    return 'PLANEJADA';
  }

  determinarPrioridade(dataAtivacao, custoTotal) {
    const agora = new Date();
    const diasAteEvento = Math.floor((dataAtivacao - agora) / (1000 * 60 * 60 * 24));
    
    if (diasAteEvento <= 2 || custoTotal > 8000) {
      return 'URGENTE';
    } else if (diasAteEvento <= 7 || custoTotal > 5000) {
      return 'ALTA';
    } else if (diasAteEvento <= 15 || custoTotal > 3000) {
      return 'MEDIA';
    } else {
      return 'BAIXA';
    }
  }

  gerarDataAleatoria(inicio, fim) {
    const timestamp = inicio.getTime() + Math.random() * (fim.getTime() - inicio.getTime());
    return new Date(timestamp);
  }

  gerarHorario(tipo) {
    if (tipo === 'inicio') {
      const hora = this.random(6, 10);
      const minuto = this.random(0, 3) * 15; // 0, 15, 30, 45
      return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00`;
    } else {
      const hora = this.random(17, 23);
      const minuto = this.random(0, 3) * 15;
      return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00`;
    }
  }

  gerarTimestamp(dataBase, diasMin, diasMax) {
    const dias = this.random(diasMin, diasMax);
    const data = new Date(dataBase);
    data.setDate(data.getDate() + dias);
    data.setHours(this.random(8, 18), this.random(0, 59), this.random(0, 59));
    return data.toISOString();
  }

  formatarData(data) {
    return data.toISOString().split('T')[0];
  }

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  salvarArquivo(operacoes, nomeArquivo = 'operacoes-1000.json') {
    const dados = {
      metadata: {
        totalOperacoes: operacoes.length,
        geradoEm: new Date().toISOString(),
        versao: '1.0.0',
        descricao: 'Dados fictícios para testes do Sistema Techno Motion'
      },
      estatisticas: this.gerarEstatisticas(operacoes),
      operacoes
    };

    const conteudo = JSON.stringify(dados, null, 2);
    fs.writeFileSync(nomeArquivo, conteudo);
    
    console.log(`\n📄 Arquivo salvo: ${nomeArquivo}`);
    console.log(`📊 Tamanho: ${Math.round(conteudo.length / 1024)} KB`);
    
    return nomeArquivo;
  }

  gerarEstatisticas(operacoes) {
    const stats = {
      totalOperacoes: operacoes.length,
      porStatus: {},
      porModelo: {},
      porRegiao: {},
      porPrioridade: {},
      valorTotal: 0,
      valorMedio: 0,
      distanciaTotal: 0,
      distanciaMedia: 0
    };

    operacoes.forEach(op => {
      // Status
      stats.porStatus[op.status] = (stats.porStatus[op.status] || 0) + 1;
      
      // Modelo de negócio
      stats.porModelo[op.modeloNegocio] = (stats.porModelo[op.modeloNegocio] || 0) + 1;
      
      // Região
      stats.porRegiao[op.regiao] = (stats.porRegiao[op.regiao] || 0) + 1;
      
      // Prioridade
      stats.porPrioridade[op.prioridade] = (stats.porPrioridade[op.prioridade] || 0) + 1;
      
      // Valores
      stats.valorTotal += op.custoTotalOperacao;
      stats.distanciaTotal += op.distanciaKm;
    });

    stats.valorMedio = Math.round((stats.valorTotal / operacoes.length) * 100) / 100;
    stats.distanciaMedia = Math.round((stats.distanciaTotal / operacoes.length) * 100) / 100;

    return stats;
  }

  gerarRelatorio(operacoes) {
    const stats = this.gerarEstatisticas(operacoes);
    
    console.log('\n📊 RELATÓRIO DE OPERAÇÕES GERADAS');
    console.log('=====================================');
    console.log(`Total de Operações: ${stats.totalOperacoes}`);
    console.log(`Valor Total: R$ ${stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`Valor Médio: R$ ${stats.valorMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`Distância Total: ${stats.distanciaTotal.toLocaleString('pt-BR')} km`);
    console.log(`Distância Média: ${stats.distanciaMedia.toLocaleString('pt-BR')} km`);
    
    console.log('\n📈 Por Status:');
    Object.entries(stats.porStatus).forEach(([status, count]) => {
      const percent = Math.round((count / stats.totalOperacoes) * 100);
      console.log(`   ${status}: ${count} (${percent}%)`);
    });
    
    console.log('\n💼 Por Modelo de Negócio:');
    Object.entries(stats.porModelo).forEach(([modelo, count]) => {
      const percent = Math.round((count / stats.totalOperacoes) * 100);
      console.log(`   ${modelo}: ${count} (${percent}%)`);
    });
    
    console.log('\n🗺️ Por Região:');
    Object.entries(stats.porRegiao).forEach(([regiao, count]) => {
      const percent = Math.round((count / stats.totalOperacoes) * 100);
      console.log(`   ${regiao}: ${count} (${percent}%)`);
    });
    
    console.log('\n🚨 Por Prioridade:');
    Object.entries(stats.porPrioridade).forEach(([prioridade, count]) => {
      const percent = Math.round((count / stats.totalOperacoes) * 100);
      console.log(`   ${prioridade}: ${count} (${percent}%)`);
    });
  }

  executar(quantidade = 1000) {
    console.log('🎯 Gerador de Operações Fictícias - Sistema Techno Motion');
    console.log('=========================================================');
    
    const inicio = Date.now();
    
    try {
      const operacoes = this.gerarOperacoes(quantidade);
      const nomeArquivo = this.salvarArquivo(operacoes);
      this.gerarRelatorio(operacoes);
      
      const duracao = Date.now() - inicio;
      console.log(`\n⏱️ Tempo de execução: ${duracao}ms`);
      console.log(`🎉 ${quantidade} operações geradas com sucesso!`);
      console.log(`📁 Arquivo: ${nomeArquivo}`);
      
      return { operacoes, nomeArquivo, stats: this.gerarEstatisticas(operacoes) };
      
    } catch (error) {
      console.error('❌ Erro ao gerar operações:', error);
      throw error;
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const gerador = new GeradorOperacoes();
  
  // Verificar argumentos da linha de comando
  const quantidade = process.argv[2] ? parseInt(process.argv[2]) : 1000;
  
  if (isNaN(quantidade) || quantidade <= 0) {
    console.error('❌ Quantidade deve ser um número positivo');
    process.exit(1);
  }
  
  gerador.executar(quantidade);
}

module.exports = GeradorOperacoes;

