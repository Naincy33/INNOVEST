import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function LeaderboardScreen() {
  const [tab, setTab] = useState("ideas");
  const [ideas, setIdeas] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubIdeas = onSnapshot(collection(db, "ideas"), (snap) => {
      const data = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.coins || 0) - (a.coins || 0));

      setIdeas(data);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const data = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.coins || 0) - (a.coins || 0));

      setUsers(data);
    });

    return () => {
      unsubIdeas();
      unsubUsers();
    };
  }, []);

  const data = tab === "ideas" ? ideas : users;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>

        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab("ideas")}>
            <Text style={tab === "ideas" ? styles.active : styles.inactive}>
              Ideas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTab("users")}>
            <Text style={tab === "users" ? styles.active : styles.inactive}>
              Investors
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {data.map((item, i) => (
        <View key={item.id} style={styles.card}>
          <Text>#{i + 1}</Text>

          <Text>
            {tab === "ideas" ? item.title : item.name || "User"}
          </Text>

          <Text>💰 {item.coins || 0}</Text>
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
    borderRadius: 30,
  },

  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },

  tabs: {
    flexDirection: "row",
    marginTop: 10,
    gap: 20,
  },

  active: {
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
});