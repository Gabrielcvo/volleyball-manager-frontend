import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Image, Text, View } from "react-native";

const history = [
  {
    id: "1",
    result: "Vitória contra a equipe 'Right Serve'",
    date: "20 de julho de 2024",
  },
  {
    id: "2",
    result: "Derrota para a equipe 'High Net'",
    date: "15 de julho de 2024",
  },
  {
    id: "3",
    result: "Vitória contra a equipe 'Spike'",
    date: "10 de julho de 2024",
  },
];

export default function ProfileScreen() {
  return (
    <ThemedView className="flex-1 bg-[#181B20] p-5">
      <View className="items-center mb-6">
        <Image
          source={require("@/assets/images/icon.png")}
          className="w-20 h-20 rounded-full mb-3"
        />
        <ThemedText type="title" className="mb-0.5">
          Isabela Costa
        </ThemedText>
        <Text className="text-[#A0A4AB] text-sm mb-0.5">
          Nível: Intermediário
        </Text>
        <Text className="text-[#A0A4AB] text-sm mb-2">
          Jogos organizados: 5
        </Text>
      </View>
      <ThemedText type="subtitle" className="mb-2 mt-2">
        Histórico de Jogos
      </ThemedText>
      <View className="mb-4">
        {history.map((item) => (
          <View key={item.id} className="bg-[#23262B] rounded-lg p-3 mb-2">
            <Text className="text-white font-semibold text-[15px]">
              {item.result}
            </Text>
            <Text className="text-[#A0A4AB] text-[13px]">{item.date}</Text>
          </View>
        ))}
      </View>
      <ThemedText type="subtitle" className="mb-2 mt-2">
        Estatísticas
      </ThemedText>
      <View className="flex-row gap-3 mb-2">
        <View className="flex-1 bg-[#23262B] rounded-lg items-center p-4">
          <Text className="text-white font-bold text-xl">15</Text>
          <Text className="text-[#A0A4AB] text-[13px]">Jogos Jogados</Text>
        </View>
        <View className="flex-1 bg-[#23262B] rounded-lg items-center p-4">
          <Text className="text-white font-bold text-xl">10</Text>
          <Text className="text-[#A0A4AB] text-[13px]">Vitórias</Text>
        </View>
      </View>
      <View className="flex-row gap-3 mb-2">
        <View className="flex-1 bg-[#23262B] rounded-lg items-center p-4">
          <Text className="text-white font-bold text-xl">5</Text>
          <Text className="text-[#A0A4AB] text-[13px]">Derrotas</Text>
        </View>
      </View>
    </ThemedView>
  );
}
