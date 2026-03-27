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

export default function PostScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");

  const handleSubmit = () => {
    if (!title || !problem || !solution) {
      alert("Fill all fields 😅");
      return;
    }

    alert("🎉 Idea Posted!");
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.heading}>Post Your Idea 🚀</Text>
      </LinearGradient>

      {/* FORM */}
      <View style={styles.card}>
        <Text>Title</Text>
        <TextInput
          placeholder="Enter idea"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text>Category</Text>
        <TextInput
          placeholder="Tech / AI / etc"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text>Problem</Text>
        <TextInput
          placeholder="Problem"
          value={problem}
          onChangeText={setProblem}
          style={styles.input}
          multiline
        />
      </View>

      <View style={styles.card}>
        <Text>Solution</Text>
        <TextInput
          placeholder="Solution"
          value={solution}
          onChangeText={setSolution}
          style={styles.input}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={{ color: "#fff" }}>Submit Idea</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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