import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const initialIdeas = [
  {
    id: 1,
    title: "AI Resume Builder",
    desc: "Smart AI resumes",
    coins: 5420,
    likes: 328,
  },
  {
    id: 2,
    title: "Eco Packaging",
    desc: "Sustainable business idea",
    coins: 3850,
    likes: 215,
  },
];

export default function HomeScreen({ navigation }) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [balance, setBalance] = useState(10000);

  // ❤️ LIKE
  const handleLike = (id) => {
    const updated = ideas.map((item) =>
      item.id === id ? { ...item, likes: item.likes + 1 } : item
    );
    setIdeas(updated);
  };

  // 💰 INVEST
  const handleInvest = (item) => {
    if (balance < 100) {
      alert("Not enough coins 😢");
      return;
    }

    setBalance(balance - 100);

    navigation.navigate("IdeaDetail", { idea: item });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 🔥 HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.heading}>Discover Ideas 💡</Text>
            <Text style={styles.coins}>💰 {balance}</Text>
          </View>

          <TouchableOpacity style={styles.bell}>
            <Ionicons name="notifications" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput placeholder="Search ideas..." style={styles.input} />
        </View>
      </LinearGradient>

      {/* 🔥 TRENDING */}
      <Text style={styles.sectionTitle}>🔥 Trending</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {ideas.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>

            <View style={styles.row}>
              <Text>💰 {item.coins}</Text>
              <Text>❤️ {item.likes}</Text>
            </View>

            <View style={styles.row}>
              <TouchableOpacity onPress={() => handleLike(item.id)}>
                <Text style={styles.like}>❤️ Like</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.investBtn}
                onPress={() => handleInvest(item)}
              >
                <Text style={styles.btnText}>Invest</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 🔥 NEW IDEAS */}
      <Text style={styles.sectionTitle}>✨ New Ideas</Text>

      {ideas.map((item) => (
        <View key={item.id} style={styles.cardFull}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.desc}</Text>

          <View style={styles.row}>
            <Text>💰 {item.coins}</Text>
            <Text>❤️ {item.likes}</Text>
          </View>

          <View style={styles.row}>
            <TouchableOpacity onPress={() => handleLike(item.id)}>
              <Text style={styles.like}>❤️ Like</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.investBtn}
              onPress={() => handleInvest(item)}
            >
              <Text style={styles.btnText}>Invest</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7",
  },

  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heading: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  coins: {
    color: "#fff",
    marginTop: 5,
  },

  bell: {
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 8,
    borderRadius: 20,
  },

  searchBox: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    borderRadius: 20,
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    padding: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    marginLeft: 15,
    width: 220,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  cardFull: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 2,
  },

  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  cardDesc: {
    color: "#666",
    marginVertical: 5,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },

  investBtn: {
    backgroundColor: "#FF8C94",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  like: {
    color: "#FF6B81",
  },
});