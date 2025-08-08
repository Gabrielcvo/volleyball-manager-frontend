import api from "../config/api";

export interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
  localizacao?: string;
  regras?: string;
  administrador_id: number;
  data_criacao: string;
  ativo: boolean;
  usuario?: {
    id: number;
    nome: string;
    email: string;
  };
  administrador?: {
    id: number;
    nome: string;
    email: string;
  };
  papel?: "admin" | "membro";
  total_membros?: number;
  total_partidas?: number;
  meu_papel?: "admin" | "membro";
}

export interface CreateGrupoRequest {
  nome: string;
  descricao?: string;
  localizacao?: string;
  regras?: string;
}

export interface MembroGrupo {
  id: number;
  nome: string;
  email: string;
  posicao_preferida?: string;
  overall: number;
  papel: "admin" | "membro";
  data_entrada: string;
  vitorias?: number;
  derrotas?: number;
  presencas?: number;
  ausencias?: number;
  assiduidade?: number;
  media_nota?: number;
  avatar_url?: string;
}

const GruposService = {
  // Criar grupo
  create: async (
    data: CreateGrupoRequest
  ): Promise<{ message: string; grupo: Grupo }> => {
    const response = await api.post("/grupos", data);
    return response.data;
  },

  // Listar grupos do usuário
  list: async (): Promise<{ grupos: Grupo[] }> => {
    const response = await api.get("/grupos");
    return response.data;
  },

  // Obter detalhes do grupo
  getById: async (grupoId: number): Promise<{ grupo: Grupo }> => {
    const response = await api.get(`/grupos/${grupoId}`);
    return response.data;
  },

  // Adicionar jogador ao grupo
  addMembro: async (
    grupoId: number,
    email: string
  ): Promise<{ message: string; membro: MembroGrupo }> => {
    const response = await api.post(`/grupos/${grupoId}/membros`, { email });
    return response.data;
  },

  // Listar membros do grupo
  getMembros: async (grupoId: number): Promise<{ membros: MembroGrupo[] }> => {
    const response = await api.get(`/grupos/${grupoId}/membros`);
    return response.data;
  },

  // Remover jogador do grupo
  removeMembro: async (
    grupoId: number,
    jogadorId: number
  ): Promise<{ message: string }> => {
    const response = await api.delete(
      `/grupos/${grupoId}/membros/${jogadorId}`
    );
    return response.data;
  },
};

export default GruposService;
