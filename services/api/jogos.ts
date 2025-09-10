import api from "../config/api";

export type StatusJogo = "agendado" | "em_andamento" | "finalizado";
export type StatusSerie = "em_andamento" | "finalizada";

export interface Time {
  id: number;
  nome: string;
  jogadores?: {
    id: number;
    nome: string;
  }[];
}

export interface TimeEstatisticas {
  time_id: number;
  nome_time: string;
  jogos_jogados: number;
  vitorias: number;
  derrotas: number;
  pontos_marcados: number;
  pontos_sofridos: number;
  jogadores: {
    id: number;
    nome: string;
  }[];
}

export interface Jogo {
  id: number;
  numero_jogo: number;
  partida_id?: number;
  time_a: Time;
  time_b: Time;
  placar: {
    time_a: number;
    time_b: number;
  };
  time_vencedor?: Time;
  status: StatusJogo;
  timing: {
    data_inicio?: string;
    data_fim?: string;
    duracao_minutos?: number;
  };
  observacoes?: string;
  eventos?: any[];
}

export interface SerieInfo {
  tipo?: string;
  jogos_para_vencer?: number;
  placar_serie?: {
    time_a: number;
    time_b: number;
  };
  vencedor_serie?: Time;
  status?: StatusSerie;
}

export interface StatusGeral {
  jogos_total: number;
  jogos_finalizados: number;
  jogos_pendentes: number;
  jogo_em_andamento: boolean;
  serie_finalizada: boolean;
}

export interface JogosPartida {
  partida: {
    id: number;
    jogo_ativo?: boolean;
    status: string;
  };
  times: TimeEstatisticas[];
  jogos: Jogo[];
  serie_info?: SerieInfo;
  status_geral: StatusGeral;
  proximo_jogo?: {
    id: number;
    numero_jogo: number;
  } | null;
}

export type InicializarJogosRequest = Record<string, never>;

export type InicializarJogosResponse = {
  message?: string;
  partida?: any;
};

export interface AtualizarPontosRequest {
  placar_time_a: number;
  placar_time_b: number;
}

export interface AtualizarPontosResponse {
  message: string;
  jogo: {
    id: number;
    numero_jogo: number;
    status: StatusJogo;
    placar: {
      time_a: number;
      time_b: number;
    };
    times: {
      time_a: {
        id: number;
        nome: string;
      };
      time_b: {
        id: number;
        nome: string;
      };
    };
    ultima_atualizacao: string;
  };
  proximos_passos: string[];
}

export interface FinalizarJogoRequest {
  placar_time_a: number;
  placar_time_b: number;
  observacoes?: string;
}

export interface FinalizarJogoResponse {
  message: string;
  jogo: {
    id: number;
    numero_jogo: number;
    status: StatusJogo;
    placar: {
      time_a: number;
      time_b: number;
    };
    time_vencedor: Time;
    timing: {
      data_inicio: string;
      data_fim: string;
      duracao_minutos: number;
    };
    observacoes?: string;
  };
  proximo_jogo?: {
    id: number;
    numero_jogo: number;
    criado_automaticamente: boolean;
  } | null;
  serie_info?: {
    placar_serie: {
      time_a: number;
      time_b: number;
    };
    vencedor_serie?: Time;
    status: StatusSerie;
  };
}

export interface ObterJogoResponse {
  jogo: {
    id: number;
    numero_jogo: number;
    partida_id: number;
    status: StatusJogo; // Adicionar o campo status que estava faltando
    times: {
      time_a: {
        id: number;
        nome: string;
        jogadores: {
          id: number;
          nome: string;
        }[];
      };
      time_b: {
        id: number;
        nome: string;
        jogadores: {
          id: number;
          nome: string;
        }[];
      };
    };
    placar: {
      time_a: number;
      time_b: number;
    };
    time_vencedor?: Time;
    timing: {
      data_inicio?: string;
      data_fim?: string;
      duracao_minutos?: number;
    };
    observacoes?: string;
    eventos: any[];
  };
  estatisticas_contexto: {
    partida: {
      id: number;
      total_times: number;
    };
    serie?: {
      numero_na_serie: number;
      placar_serie: {
        time_a: number;
        time_b: number;
      };
    };
    game: {
      status: StatusJogo;
      timing: {
        data_inicio?: string;
        data_fim?: string;
        duracao_minutos?: number;
      };
      observacoes?: string;
    };
  };
}

const JogosService = {
  // Iniciar pelada (alias para inicialização do fluxo simplificado)
  iniciarPelada: async (
    partidaId: number
  ): Promise<{ message: string; partida: any; proximo_passo?: string }> => {
    const response = await api.post(`/partidas/${partidaId}/pelada/iniciar`);
    return response.data;
  },

  // Listar todos os jogos da partida
  listar: async (partidaId: number): Promise<JogosPartida> => {
    const response = await api.get(`/partidas/${partidaId}/jogos`, {
      params: { _t: Date.now() }, // Evitar cache
    });
    return response.data;
  },

  // Obter detalhes de um jogo específico
  obterJogo: async (jogoId: number): Promise<ObterJogoResponse> => {
    const response = await api.get(`/jogos/${jogoId}`);
    return response.data;
  },

  // Iniciar um jogo
  iniciarJogo: async (
    jogoId: number
  ): Promise<{ message: string; jogo: any; proximo_passo: string }> => {
    const response = await api.put(`/jogos/${jogoId}/iniciar`);
    return response.data;
  },

  // Atualizar pontos de um jogo em andamento
  atualizarPontos: async (
    jogoId: number,
    data: AtualizarPontosRequest
  ): Promise<AtualizarPontosResponse> => {
    const response = await api.put(`/jogos/${jogoId}/pontos`, data);
    return response.data;
  },

  // Finalizar um jogo
  finalizarJogo: async (
    jogoId: number,
    data: FinalizarJogoRequest
  ): Promise<FinalizarJogoResponse> => {
    const response = await api.put(`/jogos/${jogoId}/finalizar`, data);
    return response.data;
  },

  // Criar novo jogo (selecionar times)
  criarJogo: async (
    partidaId: number,
    data: {
      time_a_id: number;
      time_b_id: number;
      observacoes?: string;
    }
  ): Promise<{
    message: string;
    jogo: {
      id: number;
      numero_jogo: number;
      time_a: Time;
      time_b: Time;
      status: StatusJogo;
      observacoes?: string;
      created_at: string;
    };
  }> => {
    const response = await api.post(`/partidas/${partidaId}/jogos`, data);
    return response.data;
  },

  // Finalizar pelada
  finalizarPelada: async (
    partidaId: number
  ): Promise<{ message: string; resumo?: any }> => {
    const response = await api.put(`/partidas/${partidaId}/pelada/finalizar`);
    return response.data;
  },
};

export default JogosService;
