import {
  useAddMembro,
  useCreateGrupo,
  useGrupos,
  useRemoveMembro,
} from "@/services/queries";

/**
 * Hook personalizado para gerenciar grupos
 * Demonstra como usar as queries do React Query
 */
export const useGruposManager = () => {
  // Queries
  const {
    data: grupos,
    isLoading: isLoadingGrupos,
    error: errorGrupos,
    refetch: refetchGrupos,
  } = useGrupos();

  // Mutations
  const createGrupoMutation = useCreateGrupo();
  const addMembroMutation = useAddMembro();
  const removeMembroMutation = useRemoveMembro();

  // Funções de conveniência
  const criarGrupo = async (data: {
    nome: string;
    descricao?: string;
    localizacao?: string;
    regras?: string;
  }) => {
    try {
      const result = await createGrupoMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const adicionarMembro = async (grupoId: number, email: string) => {
    try {
      const result = await addMembroMutation.mutateAsync({ grupoId, email });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const removerMembro = async (grupoId: number, jogadorId: number) => {
    try {
      const result = await removeMembroMutation.mutateAsync({
        grupoId,
        jogadorId,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // Dados
    grupos,

    // Estados de loading
    isLoadingGrupos,
    isCreatingGrupo: createGrupoMutation.isPending,
    isAddingMembro: addMembroMutation.isPending,
    isRemovingMembro: removeMembroMutation.isPending,

    // Estados de erro
    errorGrupos,
    errorCreateGrupo: createGrupoMutation.error,
    errorAddMembro: addMembroMutation.error,
    errorRemoveMembro: removeMembroMutation.error,

    // Funções
    criarGrupo,
    adicionarMembro,
    removerMembro,
    refetchGrupos,
  };
};
