import { ScreenLayout } from "@/components/ScreenLayout";
import { Theme } from "@/constants/Colors";
import { useGrupos } from "@/hooks/queries";
import { Grupo } from "@/services/api/grupos";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GroupsScreen() {
  const router = useRouter();

  // Usando React Query para gerenciar os dados
  const {
    data: grupos = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useGrupos();

  const handleCreateGroup = () => {
    router.push("/screens/CreateGroup");
  };

  const handleGroupPress = (grupo: Grupo) => {
    router.push({
      pathname: "/screens/GroupDetails",
      params: { groupId: grupo.id.toString() },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const renderGrupoItem = ({ item }: { item: Grupo }) => (
    <TouchableOpacity
      style={styles.grupoItem}
      onPress={() => handleGroupPress(item)}
    >
      <View style={styles.grupoInfo}>
        <View style={styles.grupoHeader}>
          <Text style={styles.grupoNome}>{item.nome}</Text>
          {item.papel === "admin" && (
            <MaterialIcons
              name="admin-panel-settings"
              size={16}
              color={Theme.colors.primary}
            />
          )}
        </View>

        {item.descricao && (
          <Text style={styles.grupoDescricao} numberOfLines={2}>
            {item.descricao}
          </Text>
        )}

        {item.localizacao && (
          <View style={styles.grupoLocation}>
            <MaterialIcons
              name="location-on"
              size={14}
              color={Theme.colors.text.secondary}
            />
            <Text style={styles.grupoLocalizacao}>{item.localizacao}</Text>
          </View>
        )}

        <View style={styles.grupoStats}>
          <View style={styles.statItem}>
            <MaterialIcons
              name="group"
              size={16}
              color={Theme.colors.text.secondary}
            />
            <Text style={styles.statText}>
              {item.total_membros || 0} membros
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons
              name="sports-volleyball"
              size={16}
              color={Theme.colors.text.secondary}
            />
            <Text style={styles.statText}>
              {item.total_partidas || 0} partidas
            </Text>
          </View>
        </View>

        <Text style={styles.grupoData}>
          Criado em {formatDate(item.data_criacao)}
        </Text>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={24}
        color={Theme.colors.text.secondary}
      />
    </TouchableOpacity>
  );

  const headerRightElement = (
    <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
      <MaterialIcons name="add" size={24} color={Theme.colors.text.primary} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ScreenLayout title="Grupos" headerRightElement={headerRightElement}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando grupos...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout title="Grupos" headerRightElement={headerRightElement}>
        <View style={styles.loadingContainer}>
          <MaterialIcons
            name="error"
            size={64}
            color={Theme.colors.text.secondary}
          />
          <Text style={styles.loadingText}>Erro ao carregar grupos</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Grupos" headerRightElement={headerRightElement}>
      <View style={styles.container}>
        {grupos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="group"
              size={64}
              color={Theme.colors.text.secondary}
            />
            <Text style={styles.emptyTitle}>Nenhum grupo encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Crie seu primeiro grupo ou peça para alguém te adicionar em um
              grupo existente
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreateGroup}
            >
              <Text style={styles.emptyButtonText}>Criar Grupo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={grupos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderGrupoItem}
            onRefresh={refetch}
            refreshing={isRefetching}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  listContainer: {
    padding: Theme.spacing.lg,
  },
  grupoItem: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  grupoInfo: {
    flex: 1,
  },
  grupoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.xs,
  },
  grupoNome: {
    fontSize: Theme.fontSize.lg,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    flex: 1,
  },
  grupoDescricao: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
    lineHeight: 18,
  },
  grupoLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  grupoLocalizacao: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginLeft: 4,
  },
  grupoStats: {
    flexDirection: "row",
    marginBottom: Theme.spacing.xs,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Theme.spacing.lg,
  },
  statText: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
    marginLeft: 4,
  },
  grupoData: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
  },
  createButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.xxl,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  loadingText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Theme.spacing.xl,
  },
  emptyButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.round,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  emptyButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
  },
  retryButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },
  retryButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: "600",
    color: Theme.colors.text.primary,
  },
});
