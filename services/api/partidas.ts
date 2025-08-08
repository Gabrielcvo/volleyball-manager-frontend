import api from "../config/api";

export type StatusPartida =
  | "agendada"
  | "em_andamento"
  | "finalizada"
  | "cancelada";
export type StatusPresenca = "confirmado" | "nao_confirmado" | "fila_espera";

export interface Partida {
  id: number;
  grupo_id: number;
  data_hora: string;
  local?: string;
  duracao_estimada_minutos: number;
  limite_jogadores: number;
  valor_pelada: number;
  status: StatusPartida;
  created_at: string;
  updated_at?: string;
  grupo?: {
    id: number;
    nome: string;
  };
  confirmados?: number;
  minha_confirmacao?: StatusPresenca;
  confirmacoes?: ConfirmacaoPresenca[];
  times?: TimePartida[];
}

export interface CreatePartidaRequest {
  data_hora: string;
  local?: string;
  duracao_estimada_minutos?: number;
  limite_jogadores?: number;
  valor_pelada?: number;
}

export interface UpdatePartidaRequest {
  data_hora?: string;
  local?: string;
  duracao_estimada_minutos?: number;
  limite_jogadores?: number;
  valor_pelada?: number;
  status?: StatusPartida;
}

export interface ConfirmacaoPresenca {
  partida_id: number;
  jogador_id: number;
  status_presenca: StatusPresenca;
  data_confirmacao: string;
  jogador: {
    id: number;
    usuario: {
      id: number;
      nome: string;
    };
  };
}

export interface JogadorConfirmado {
  jogador: {
    id: number;
    nome: string;
    posicao_preferida?: string;
    overall: number;
    avatar_url?: string;
  };
  data_confirmacao: string;
}

export interface ConfirmacoesPartida {
  partida: {
    id: number;
    data_hora: string;
    local?: string;
    limite_jogadores: number;
    status: StatusPartida;
    grupo?: {
      id: number;
      nome: string;
    };
  };
  confirmados: JogadorConfirmado[];
  fila_espera: JogadorConfirmado[];
  naoComparecer: JogadorConfirmado[]; // Jogadores que cancelaram (nome da API)
}

export interface PartidaDetalhes {
  partida: {
    id: number;
    data_hora: string;
    local?: string;
    duracao_estimada_minutos?: number;
    limite_jogadores: number;
    valor_pelada?: number;
    status: StatusPartida;
    grupo: {
      id: number;
      nome: string;
      meu_papel?: "admin" | "membro";
    };
    confirmacoes: ConfirmacaoPresenca[];
    times: TimePartida[];
    created_at: string;
    updated_at?: string;
  };
}

export interface TimePartida {
  id: number;
  nome_time: string;
  pontuacao_final: number;
  overall_medio?: number;
  total_jogadores?: number;
  jogador_time: {
    id: number;
    nome: string;
    posicao_preferida?: string;
    posicao_jogada?: string;
    overall: number;
    avatar_url?: string;
  }[];
}

const PartidasService = {
  // Criar partida
  create: async (
    grupoId: number,
    data: CreatePartidaRequest
  ): Promise<{ message: string; partida: Partida }> => {
    const response = await api.post(`/grupos/${grupoId}/partidas`, data);
    return response.data;
  },

  // Listar partidas do grupo
  list: async (
    grupoId: number,
    params?: { status?: StatusPartida; futuras?: boolean }
  ): Promise<{ partidas: Partida[] }> => {
    const response = await api.get(`/grupos/${grupoId}/partidas`, { params });
    return response.data;
  },

  // Obter detalhes da partida
  getById: async (partidaId: number): Promise<{ partida: Partida }> => {
    const response = await api.get(`/partidas/${partidaId}`);
    return response.data;
  },

  // Atualizar partida
  update: async (
    partidaId: number,
    data: UpdatePartidaRequest
  ): Promise<{ message: string; partida: Partida }> => {
    const response = await api.put(`/partidas/${partidaId}`, data);
    return response.data;
  },

  // Confirmar presença
  confirmarPresenca: async (
    partidaId: number,
    status_presenca: "confirmado" | "nao_confirmado"
  ): Promise<any> => {
    const response = await api.post(`/partidas/${partidaId}/confirmar`, {
      status_presenca,
    });
    return response.data;
  },

  // Buscar detalhes completos da partida
  getDetalhes: async (partidaId: number): Promise<PartidaDetalhes> => {
    const response = await api.get(`/partidas/${partidaId}`);
    return response.data;
  },

  // Listar confirmações da partida
  getConfirmacoes: async (partidaId: number): Promise<ConfirmacoesPartida> => {
    const response = await api.get(`/partidas/${partidaId}/confirmacoes`);
    return response.data;
  },
};

export default PartidasService;
