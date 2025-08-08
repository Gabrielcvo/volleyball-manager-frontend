import api from "../config/api";

export type MetodoSorteio = "overall" | "posicao" | "aleatorio";

export interface Time {
  id: number;
  partida_id: number;
  nome_time: string;
  pontuacao_final: number;
  overall_medio?: number;
  total_jogadores?: number;
  jogador_time?: {
    time_id: number;
    jogador_id: number;
    posicao_jogada?: string;
    jogador: {
      id: number;
      usuario: {
        id: number;
        nome: string;
      };
    };
  }[];
  jogadores?: {
    id: number;
    nome: string;
    posicao_preferida?: string;
    posicao_jogada?: string;
    overall: number;
    avatar_url?: string;
  }[];
}

export interface SortearTimesRequest {
  metodo: MetodoSorteio;
  num_times?: number;
  jogadores_selecionados?: number[];
}

export interface SortearTimesResponse {
  message: string;
  metodo_sorteio: MetodoSorteio;
  total_jogadores: number;
  times: Time[];
}

export interface EditarTimeRequest {
  nome_time?: string;
  jogadores?: {
    jogador_id: number;
    posicao_jogada?: string;
  }[];
}

export interface TimesPartida {
  partida: {
    id: number;
    data_hora: string;
    status: string;
  };
  times: Time[];
}

const TimesService = {
  // Sortear times
  sortear: async (
    partidaId: number,
    data: SortearTimesRequest
  ): Promise<SortearTimesResponse> => {
    const response = await api.post(
      `/partidas/${partidaId}/sortear-times`,
      data
    );
    return response.data;
  },

  // Listar times da partida
  listar: async (partidaId: number): Promise<TimesPartida> => {
    const response = await api.get(`/partidas/${partidaId}/times`);
    return response.data;
  },

  // Editar time
  editar: async (
    timeId: number,
    data: EditarTimeRequest
  ): Promise<{ message: string; time: Time }> => {
    const response = await api.put(`/times/${timeId}`, data);
    return response.data;
  },

  // Atualizar pontuação
  atualizarPontuacao: async (
    timeId: number,
    pontuacao: number
  ): Promise<{ message: string; time: Time }> => {
    const response = await api.put(`/times/${timeId}/pontuacao`, { pontuacao });
    return response.data;
  },
};

export default TimesService;
