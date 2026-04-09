import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

// 🔥 Firebase
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export default function PostScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 SUBMIT FUNCTION (REAL FIRESTORE)
  const handleSubmit = async () => {
    if (!title || !problem || !solution) {
      alert("Fill all fields 😅");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "ideas"), {
        title,
        category,
        problem,
        solution,
        coins: 0,
        likes: 0,
        createdAt: Date.now(),
      });

      alert("🎉 Idea Posted Successfully!");

      // reset fields
      setTitle("");
      setCategory("");
      setProblem("");
      setSolution("");

      navigation.goBack();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 🔥 HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.heading}>Post Your Idea 🚀</Text>
      </LinearGradient>

      {/* 🔥 FORM */}
      <View style={styles.card}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          placeholder="Enter your idea title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Category</Text>
        <TextInput
          placeholder="Tech / AI / Health etc"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Problem</Text>
        <TextInput
          placeholder="What problem are you solving?"
          value={problem}
          onChangeText={setProblem}
          style={[styles.input, { height: 100 }]}
          multiline
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Solution</Text>
        <TextInput
          placeholder="Describe your solution"
          value={solution}
          onChangeText={setSolution}
          style={[styles.input, { height: 100 }]}
          multiline
        />
      </View>

      {/* 🔥 BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Posting..." : "Submit Idea"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7",
  },

  header: {
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  heading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },

  label: {
    fontWeight: "600",
    marginBottom: 5,
  },

  input: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginTop: 5,
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