import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const mensagensIniciais = [
  { id: "1", autor: "João", texto: "Vamos jogar amanhã?" },
  { id: "2", autor: "Maria", texto: "Sim! Estou confirmada." },
];

export default function ChatScreen() {
  const [mensagens, setMensagens] = useState(mensagensIniciais);
  const [novaMensagem, setNovaMensagem] = useState("");

  function enviarMensagem() {
    if (novaMensagem.trim()) {
      setMensagens([
        ...mensagens,
        {
          id: String(mensagens.length + 1),
          autor: "Você",
          texto: novaMensagem,
        },
      ]);
      setNovaMensagem("");
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Chat da Pelada
      </ThemedText>
      <FlatList
        data={mensagens}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mensagemItem}>
            <Text style={styles.autor}>{item.autor}:</Text>
            <Text style={styles.texto}>{item.texto}</Text>
          </View>
        )}
        style={{ marginBottom: 16 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#A0A4AB"
          value={novaMensagem}
          onChangeText={setNovaMensagem}
        />
        <TouchableOpacity style={styles.enviarButton} onPress={enviarMensagem}>
          <Text style={styles.enviarButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181B20",
    padding: 20,
  },
  title: {
    alignSelf: "center",
    marginBottom: 16,
  },
  mensagemItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  autor: {
    color: "#A0A4AB",
    fontWeight: "bold",
    marginRight: 6,
  },
  texto: {
    color: "#fff",
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#23262B",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  enviarButton: {
    backgroundColor: "#2D6BFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  enviarButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
