import api from "../config/api";

export interface EstatisticasGrupo {
  presencas: number;
  total_partidas_grupo: number;
  assiduidade: number;
  media_avaliacoes: number;
  total_destaques: number;
  tipos_destaques: Record<string, number>;
}

export interface JogadorRanking {
  posicao: number;
  jogador: {
    id: number;
    nome: string;
    posicao_preferida?: string;
    overall: number;
    avatar_url?: string;
  };
  estatisticas_grupo: EstatisticasGrupo;
  estatisticas_globais: EstatisticasGlobais;
  data_entrada: string;
}

export interface RankingGrupo {
  grupo_id: number;
  total_jogadores: number;
  ranking: JogadorRanking[];
}

export interface PartidaHistorico {
  id: number;
  data_hora: string;
  local?: string;
  duracao_estimada_minutos: number;
  valor_pelada: number;
  jogadores_presentes: {
    id: number;
    nome: string;
    posicao_preferida?: string;
    overall: number;
    avatar_url?: string;
  }[];
  times: {
    id: number;
    nome_time: string;
    pontuacao_final: number;
    jogadores: {
      id: number;
      nome: string;
      posicao_jogada?: string;
    }[];
  }[];
  destaques: {
    tipo: string;
    jogador: {
      id: number;
      nome: string;
    };
  }[];
  total_jogadores: number;
}

export interface HistoricoPartidas {
  grupo_id: number;
  total_partidas: number;
  partidas: PartidaHistorico[];
  paginacao: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface AvaliacaoJogador {
  nota: number;
  comentario?: string;
  avaliador: string;
  partida_id: number;
  data_partida: string;
  data_avaliacao: string;
}

export interface DestaqueJogador {
  tipo: string;
  partida_id: number;
  data_partida: string;
}

export interface EstatisticasJogador {
  jogador: {
    id: number;
    nome: string;
    posicao_preferida?: string;
    overall: number;
    avatar_url?: string;
    data_entrada: string;
  };
  estatisticas_grupo: {
    total_participacoes: number;
    total_partidas_grupo: number;
    assiduidade: number;
    media_avaliacoes: number;
    total_avaliacoes: number;
    total_destaques: number;
    tipos_destaques: Record<string, number>;
  };
  ultimas_avaliacoes: AvaliacaoJogador[];
  ultimos_destaques: DestaqueJogador[];
}

export interface EstatisticasGlobais {
  total_jogadores: number;
  total_partidas: number;
  overall_medio: number;
  assiduidade_media: number;
  ranking_jogadores: {
    id: number;
    nome: string;
    posicao_preferida?: string;
    overall: number;
    total_partidas: number;
    avatar_url?: string;
  }[];
  destaques: {
    [tipo: string]: {
      jogador: {
        id: number;
        nome: string;
        posicao_preferida?: string;
        overall: number;
      };
      valor: number;
    } | null;
  };
}

const RankingService = {
  // Ranking do grupo
  getRanking: async (grupoId: number): Promise<RankingGrupo> => {
    const response = await api.get(`/grupos/${grupoId}/ranking`);
    return response.data;
  },

  // Histórico de partidas
  getHistorico: async (
    grupoId: number,
    params?: { limit?: number; offset?: number }
  ): Promise<HistoricoPartidas> => {
    const response = await api.get(`/grupos/${grupoId}/historico`, { params });
    return response.data;
  },

  // Estatísticas do jogador
  getEstatisticasJogador: async (
    grupoId: number,
    jogadorId: number
  ): Promise<EstatisticasJogador> => {
    const response = await api.get(
      `/grupos/${grupoId}/jogadores/${jogadorId}/estatisticas`
    );
    return response.data;
  },

  // Estatísticas gerais globais
  getEstatisticasGerais: async (): Promise<EstatisticasGlobais> => {
    const response = await api.get("/ranking/global");
    return response.data;
  },
};

export default RankingService;
