import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { investments } from "../constants/data";
import { db } from "../firebase";
export default function PortfolioScreen() {
  const totalInvested = investments.reduce((sum, i) => sum + i.invested, 0);
  const ideasSupported = investments.length;

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.title}>My Portfolio</Text>
        <Text style={styles.subtitle}>Track your investments</Text>
      </LinearGradient>

      {/* STATS */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.big}>{totalInvested}</Text>
          <Text>Total Invested</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.big}>{ideasSupported}</Text>
          <Text>Ideas Supported</Text>
        </View>
      </View>

      {/* LIST */}
      <Text style={styles.section}>Your Investments</Text>

      {investments.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.idea}>{item.ideaName}</Text>
          <Text>💰 {item.invested} coins</Text>
          <Text style={{ color: "green" }}>{item.growth}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF5F7" },

  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  title: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  subtitle: { color: "#fff" },

  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "40%",
    alignItems: "center",
  },

  big: { fontSize: 22, fontWeight: "bold" },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 15,
  },

  item: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 20,
  },

  idea: { fontWeight: "bold" },
});