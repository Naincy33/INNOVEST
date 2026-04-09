import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { db } from "../firebase";
const investors = [
  { id: 1, name: "Rahul", coins: 8000 },
  { id: 2, name: "Ankit", coins: 7000 },
  { id: 3, name: "Neha", coins: 6000 },
];

const ideas = [
  { id: 1, name: "AI Resume", coins: 12000 },
  { id: 2, name: "Eco Packaging", coins: 10000 },
];

export default function LeaderboardScreen() {
  const [tab, setTab] = useState("investors");

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>

        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab("investors")}>
            <Text style={tab === "investors" ? styles.active : styles.inactive}>
              Investors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTab("ideas")}>
            <Text style={tab === "ideas" ? styles.active : styles.inactive}>
              Ideas
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* LIST */}
      {(tab === "investors" ? investors : ideas).map((item, i) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.rank}>#{i + 1}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text>💰 {item.coins}</Text>
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

  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },

  tabs: {
    flexDirection: "row",
    marginTop: 15,
    gap: 20,
  },

  active: {
    color: "#FF8C94",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
  },

  inactive: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rank: { fontWeight: "bold" },
  name: { fontWeight: "600" },
});