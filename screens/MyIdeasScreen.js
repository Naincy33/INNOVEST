import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";

// 🔥 FIREBASE
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function MyIdeasScreen() {
  const [ideas, setIdeas] = useState([]);

  // 🔥 FETCH ONLY MY IDEAS
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "ideas"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setIdeas(data);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 DELETE
  const handleDelete = (item) => {
    Alert.alert("Delete Idea", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "ideas", item.id));
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.title}>My Ideas 💡</Text>
      </LinearGradient>

      {/* LIST */}
      {ideas.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.title2}>{item.title}</Text>
          <Text style={styles.category}>{item.category}</Text>

          <Text style={styles.desc}>🧠 {item.problem}</Text>
          <Text style={styles.desc}>💡 {item.solution}</Text>

          <View style={styles.row}>
            <Text>💰 {item.coins || 0}</Text>
            <Text>❤️ {item.likes || 0}</Text>
          </View>
          <View style={styles.footerBox}>
            <Text style={styles.footerTitle}>💡 Your Ideas</Text>
            <Text style={styles.footerSub}>
              Manage, edit or delete your posted ideas
            </Text>
          </View>

          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Text style={styles.delete}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* EMPTY */}
      {ideas.length === 0 && (
        <Text style={styles.empty}>You haven’t posted anything yet 😢</Text>
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

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 20,
  },

  title2: {
    fontWeight: "bold",
    fontSize: 16,
  },

  category: {
    color: "#888",
    marginBottom: 5,
  },

  desc: {
    marginTop: 5,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  delete: {
    color: "red",
    marginTop: 10,
    textAlign: "right",
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
  },

  footerBox: {
    margin: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
  },

  footerTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  footerSub: {
    color: "#888",
    fontSize: 12,
    marginTop: 5,
  },
});
