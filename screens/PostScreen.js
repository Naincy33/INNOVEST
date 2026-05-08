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

  const [loadingSubmit, setLoadingSubmit] =
    useState(false);

  // 🔥 ML RESULT
  const [prediction, setPrediction] =
    useState(null);

  // 🤖 SIMPLE ML LOGIC
  const predictIdea = () => {
    let score =
      Math.floor(Math.random() * 40) + 60;

    let demand = "Medium";
    let risk = "Medium";

    // 🔥 CATEGORY BASED
    if (
      category
        .toLowerCase()
        .includes("ai")
    ) {
      score += 12;
      demand = "High";
      risk = "Low";
    }

    if (
      category
        .toLowerCase()
        .includes("tech")
    ) {
      score += 8;
      demand = "High";
    }

    if (
      category
        .toLowerCase()
        .includes("finance")
    ) {
      score += 5;
      demand = "Medium";
      risk = "High";
    }

    if (
      category
        .toLowerCase()
        .includes("education")
    ) {
      score += 6;
      demand = "Medium";
    }

    // 🔥 DETAILED IDEA BONUS
    if (problem.length > 80) {
      score += 5;
    }

    if (solution.length > 80) {
      score += 5;
    }

    // 🔥 LIMIT
    if (score > 98) score = 98;

    return {
      score,
      demand,
      risk,
    };
  };

  // 🚀 SUBMIT
  const handleSubmit = async () => {
    if (
      !title ||
      !category ||
      !problem ||
      !solution
    ) {
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

      // 🔥 GENERATE ML RESULT
      const result = predictIdea();

      // 🔥 SHOW RESULT
      setPrediction(result);

      // 🔥 SAVE IDEA
      await addDoc(collection(db, "ideas"), {
        title,
        category,
        problem,
        solution,

        userId: user.uid,

        likes: 0,
        coins: 0,

        likedBy: [],

        // 🔥 ML
        predictionScore: result.score,
        marketDemand: result.demand,
        riskLevel: result.risk,

        createdAt: Date.now(),
      });

      // 🔥 USER COINS
      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const snap = await getDoc(userRef);

      let currentCoins = 0;

      if (snap.exists()) {
        currentCoins =
          snap.data().coins || 0;
      }

      await updateDoc(userRef, {
        coins: currentCoins + 200,
      });

      alert(
        "🎉 Idea Posted Successfully +200 Coins"
      );

      // 🔥 CLEAR
      setTitle("");
      setCategory("");
      setProblem("");
      setSolution("");

      // 🔥 BACK
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
      <LinearGradient
        colors={["#FF8C94", "#FFB6C1"]}
        style={styles.header}
      >
        <Text style={styles.heading}>
          Post Your Idea 🚀
        </Text>
      </LinearGradient>

      {/* INFO */}
      <Text style={styles.info}>
        ✨ Share your startup vision
      </Text>

      {/* TITLE */}
      <View style={styles.card}>
        <Text style={styles.label}>
          Title
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Enter idea title"
        />
      </View>

      {/* CATEGORY */}
      <View style={styles.card}>
        <Text style={styles.label}>
          Category
        </Text>

        <TextInput
          value={category}
          onChangeText={setCategory}
          style={styles.input}
          placeholder="AI / Tech / Education..."
        />
      </View>

      {/* PROBLEM */}
      <View style={styles.card}>
        <Text style={styles.label}>
          Problem
        </Text>

        <TextInput
          value={problem}
          onChangeText={setProblem}
          multiline
          style={[
            styles.input,
            { minHeight: 70 },
          ]}
          placeholder="What problem are you solving?"
        />
      </View>

      {/* SOLUTION */}
      <View style={styles.card}>
        <Text style={styles.label}>
          Solution
        </Text>

        <TextInput
          value={solution}
          onChangeText={setSolution}
          multiline
          style={[
            styles.input,
            { minHeight: 70 },
          ]}
          placeholder="Describe your solution"
        />
      </View>

      {/* 🔥 AI RESULT */}
      {prediction && (
        <View style={styles.predictionCard}>
          <Text
            style={styles.predictionTitle}
          >
            📊 AI Market Analysis
          </Text>

          <Text
            style={styles.predictionText}
          >
            🚀 Success Rate:{" "}
            {prediction.score}%
          </Text>

          <Text
            style={styles.predictionText}
          >
            🔥 Market Demand:{" "}
            {prediction.demand}
          </Text>

          <Text
            style={styles.predictionText}
          >
            ⚠️ Risk Level:{" "}
            {prediction.risk}
          </Text>
        </View>
      )}

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
      >
        {loadingSubmit ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>
            Submit Idea
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
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
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  heading: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
  },

  info: {
    textAlign: "center",
    marginTop: 15,
    color: "#777",
    fontSize: 14,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 18,
    elevation: 3,
  },

  label: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 15,
  },

  input: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    fontSize: 14,
  },

  predictionCard: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFD1D8",
  },

  predictionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FF6B81",
    marginBottom: 10,
  },

  predictionText: {
    fontSize: 14,
    marginTop: 7,
    color: "#444",
  },

  button: {
    backgroundColor: "#FF8C94",
    margin: 20,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});