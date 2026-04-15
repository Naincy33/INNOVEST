import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

// 🔥 FIREBASE
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

import { generateIdea } from "../utils/ai";

export default function PostScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");

  // 🔥 AI FUNCTION (FIXED)
  const handleAI = async () => {
    try {
      const idea = await generateIdea();

      // 👉 agar object return ho raha hai
      if (typeof idea === "object") {
        setTitle(idea.title || "");
        setProblem(idea.problem || "");
        setSolution(idea.solution || "");
        setCategory("AI Generated");
      } else {
        alert(idea); // fallback
      }
    } catch (err) {
      console.log(err);
      alert("AI error 😢");
    }
  };

  // 🔥 SUBMIT
  const handleSubmit = async () => {
    if (!title || !problem || !solution) {
      alert("Fill all fields 😅");
      return;
    }

    try {
      const user = auth.currentUser;

      // 🔥 SAVE IDEA
      await addDoc(collection(db, "ideas"), {
        title,
        category,
        problem,
        solution,
        userId: user.uid,
        coins: 0,
        likes: 0,
        createdAt: Date.now(),
      });

      // 🔥 USER COINS +200
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      const currentCoins = snap.data().coins;

      await updateDoc(userRef, {
        coins: currentCoins + 200,
      });

      alert("🎉 Idea Posted +200 coins earned!");
      navigation.goBack();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.heading}>Post Your Idea 🚀</Text>
      </LinearGradient>

      {/* AI BUTTON 🔥 */}
      <TouchableOpacity style={styles.aiBtn} onPress={handleAI}>
        <Text style={{ color: "#fff" }}>🤖 Generate Idea</Text>
      </TouchableOpacity>

      {/* FORM */}
      <View style={styles.card}>
        <Text>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text>Category</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text>Problem</Text>
        <TextInput
          value={problem}
          onChangeText={setProblem}
          style={styles.input}
          multiline
        />
      </View>

      <View style={styles.card}>
        <Text>Solution</Text>
        <TextInput
          value={solution}
          onChangeText={setSolution}
          style={styles.input}
          multiline
        />
      </View>

      {/* SUBMIT */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={{ color: "#fff" }}>Submit Idea</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF5F7" },

  header: {
    padding: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  heading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  aiBtn: {
    backgroundColor: "#6C63FF",
    margin: 15,
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },

  input: {
    borderBottomWidth: 1,
    marginTop: 10,
    padding: 5,
  },

  button: {
    backgroundColor: "#FF8C94",
    margin: 20,
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
});