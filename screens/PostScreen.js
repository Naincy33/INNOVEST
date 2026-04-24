import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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

export default function PostScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // 🔥 SUBMIT
  const handleSubmit = async () => {
    if (!title || !problem || !solution) {
      alert("Fill all fields 😅");
      return;
    }

    try {
      setLoadingSubmit(true);

      const user = auth.currentUser;

      if (!user) {
        alert("User not logged in 😢");
        return;
      }

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

      let currentCoins = 0;
      if (snap.exists()) {
        currentCoins = snap.data().coins || 0;
      }

      await updateDoc(userRef, {
        coins: currentCoins + 200,
      });

      alert("🎉 Idea Posted +200 coins earned!");

      // 🔥 CLEAR FORM
      setTitle("");
      setCategory("");
      setProblem("");
      setSolution("");

      navigation.goBack();
    } catch (err) {
      console.log(err);
      alert("Error: " + err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.heading}>Post Your Idea 🚀</Text>
      </LinearGradient>

      {/* 💡 SMALL INFO TEXT */}
      <Text style={styles.info}>
        ✨ Got a unique idea? Share it with the world 🚀
      </Text>

      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Enter idea title"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Category</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          style={styles.input}
          placeholder="Tech / AI / Business..."
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Problem</Text>
        <TextInput
          value={problem}
          onChangeText={setProblem}
          style={styles.input}
          multiline
          placeholder="What problem are you solving?"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Solution</Text>
        <TextInput
          value={solution}
          onChangeText={setSolution}
          style={styles.input}
          multiline
          placeholder="Your solution"
        />
      </View>

      {/* SUBMIT */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        {loadingSubmit ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Submit Idea</Text>
        )}
      </TouchableOpacity>
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
    padding: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  heading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  info: {
    textAlign: "center",
    marginTop: 15,
    color: "#888",
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },

  label: {
    fontWeight: "600",
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

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});