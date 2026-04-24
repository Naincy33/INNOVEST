import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";

// 🔥 FIREBASE
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  increment,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function HomeScreen({ navigation }) {
  const [ideas, setIdeas] = useState([]);
  const [search, setSearch] = useState("");
  const [userCoins, setUserCoins] = useState(0);

  // 🔥 FETCH IDEAS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "ideas"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIdeas(data);
    });

    return () => unsub();
  }, []);

  // 🔥 FETCH USER COINS
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setUserCoins(snap.data().coins || 0);
      }
    });

    return () => unsub();
  }, []);

  // ❤️ LIKE
  const handleLike = async (item) => {
    try {
      await updateDoc(doc(db, "ideas", item.id), {
        likes: increment(1),
      });
    } catch (err) {
      console.log("LIKE ERROR:", err);
      alert("Like failed 😢");
    }
  };

  // 💰 INVEST
  const handleInvest = async (item) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Login required 😢");
        return;
      }

      if (userCoins < 100) {
        alert("Not enough coins 😢");
        return;
      }

      // 🔥 update idea coins
      await updateDoc(doc(db, "ideas", item.id), {
        coins: increment(100),
      });

      // 🔥 update user coins
      await updateDoc(doc(db, "users", user.uid), {
        coins: increment(-100),
      });

      // 🔥 save investment
      await addDoc(collection(db, "investments"), {
        userId: user.uid,
        ideaId: item.id,
        ideaTitle: item.title,
        amount: 100,
        createdAt: Date.now(),
      });

      alert("Invested 🚀");
    } catch (err) {
      console.log("INVEST ERROR:", err);
      alert("Investment failed 😢");
    }
  };

  // 🔍 SEARCH
  const filteredIdeas = ideas.filter(
    (item) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.heading}>Discover Ideas 💡</Text>
        <Text style={styles.coins}>💰 {userCoins}</Text>

        <TextInput
          placeholder="Search ideas..."
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />
      </LinearGradient>

      {/* IDEAS */}
      {filteredIdeas.map((item) => {
        const isTrending =
          (item.coins || 0) > 500 || (item.likes || 0) > 5;

        return (
          <View key={item.id} style={styles.card}>
            {/* TITLE */}
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{item.title}</Text>

              {isTrending && (
                <Text style={styles.trending}>🔥 Trending</Text>
              )}
            </View>

            {/* CATEGORY */}
            <Text style={styles.category}>{item.category}</Text>

            {/* CONTENT */}
            <Text style={styles.text}>🧠 {item.problem}</Text>
            <Text style={styles.text}>💡 {item.solution}</Text>

            {/* STATS */}
            <View style={styles.rowBetween}>
              <Text>💰 {item.coins || 0}</Text>
              <Text>❤️ {item.likes || 0}</Text>
            </View>

            {/* ACTIONS */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleLike(item)}>
                <Text style={styles.like}>❤️ Like</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Comments", { idea: item })
                }
              >
                <Text style={styles.comment}>💬 Comments</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.investBtn}
                onPress={() => handleInvest(item)}
              >
                <Text style={styles.btnText}>Invest</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {filteredIdeas.length === 0 && (
        <Text style={styles.empty}>No results 😢</Text>
      )}
    </ScrollView>
  );
}

// 🎨 STYLES
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

  heading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  coins: {
    color: "#fff",
    marginTop: 5,
  },

  search: {
    backgroundColor: "#fff",
    marginTop: 15,
    borderRadius: 20,
    padding: 10,
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 20,
    elevation: 2,
  },

  title: {
    fontWeight: "bold",
    fontSize: 16,
  },

  category: {
    color: "#888",
    marginBottom: 5,
  },

  text: {
    marginTop: 5,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },

  like: {
    color: "#FF6B81",
  },

  comment: {
    color: "#555",
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

  trending: {
    backgroundColor: "#FFE066",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 10,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
  },
});