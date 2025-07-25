import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

export default function CreateGameScreen() {
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [local, setLocal] = useState("");
  const [jogadores, setJogadores] = useState("");

  const handleSave = async () => {
    console.log("data", data);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Criar Nova Pelada
      </ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Data (ex: 20/07/2024)"
        placeholderTextColor="#A0A4AB"
        value={data}
        onChangeText={setData}
      />
      <TextInput
        style={styles.input}
        placeholder="Horário (ex: 15:00 - 17:00)"
        placeholderTextColor="#A0A4AB"
        value={horario}
        onChangeText={setHorario}
      />
      <TextInput
        style={styles.input}
        placeholder="Local (ex: Praia de Copacabana)"
        placeholderTextColor="#A0A4AB"
        value={local}
        onChangeText={setLocal}
      />
      <TextInput
        style={styles.input}
        placeholder="Número de jogadores"
        placeholderTextColor="#A0A4AB"
        keyboardType="numeric"
        value={jogadores}
        onChangeText={setJogadores}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181B20",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    alignSelf: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#23262B",
    color: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2D6BFF",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
