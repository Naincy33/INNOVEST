import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function IdeaDetailScreen({ route }) {
  const { idea, investAmount } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{idea.title}</Text>

      <Text style={styles.desc}>{idea.desc}</Text>

      <Text style={styles.stat}>💰 Invested: {investAmount}</Text>
      <Text style={styles.stat}>❤️ Likes: {idea.likes}</Text>

      <TouchableOpacity style={styles.btn}>
        <Text style={{ color: "#fff" }}>Invest More</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: { fontSize: 22, fontWeight: "bold" },

  desc: { marginVertical: 10 },

  stat: { marginTop: 10 },

  btn: {
    marginTop: 20,
    backgroundColor: "#FF8C94",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});