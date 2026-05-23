import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { useState } from "react";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db, auth } from "../firebase";

import { Ionicons } from "@expo/vector-icons";

export default function PostScreen({ navigation }) {

  const [title, setTitle] =
    useState("");

  const [category, setCategory] =
    useState("Technology");

  const [problem, setProblem] =
    useState("");

  const [solution, setSolution] =
    useState("");

  const [loadingSubmit, setLoadingSubmit] =
    useState(false);

  const [prediction, setPrediction] =
    useState(null);

  const [showCategories, setShowCategories] =
    useState(false);

  const categories = [
    "Technology",
    "AI",
    "Finance",
    "Education",
    "Healthcare",
    "Gaming",
    "Environment",
    "Business",
  ];

  // 🤖 SIMPLE ML
  const predictIdea = () => {

    let score =
      Math.floor(Math.random() * 25) + 70;

    let demand = "Medium";

    let risk = "Medium";

    if (
      category.toLowerCase().includes("ai")
    ) {
      score += 10;
      demand = "High";
      risk = "Low";
    }

    if (
      category.toLowerCase().includes("finance")
    ) {
      score += 5;
      risk = "High";
    }

    if (problem.length > 80)
      score += 4;

    if (solution.length > 80)
      score += 4;

    if (score > 98)
      score = 98;

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

      const user =
        auth.currentUser;

      if (!user) {
        alert(
          "Login required 😢"
        );
        return;
      }

      // 🔥 AI RESULT
      const result =
        predictIdea();

      setPrediction(result);

      // 🔥 SAVE
      await addDoc(
        collection(db, "ideas"),
        {
          title,
          category,
          problem,
          solution,

          userId: user.uid,

          likes: 0,
          coins: 0,

          likedBy: [],

          predictionScore:
            result.score,

          marketDemand:
            result.demand,

          riskLevel:
            result.risk,

          createdAt:
            Date.now(),
        }
      );

      // 🔥 COINS
      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const snap =
        await getDoc(userRef);

      let currentCoins = 0;

      if (snap.exists()) {
        currentCoins =
          snap.data().coins || 0;
      }

      await updateDoc(
        userRef,
        {
          coins:
            currentCoins + 200,
        }
      );

      alert(
        "🚀 Idea Published +200 Coins"
      );

      setTitle("");
      setProblem("");
      setSolution("");

      navigation.goBack();

    } catch (err) {

      console.log(err);

      alert(
        "Error: " + err.message
      );

    } finally {

      setLoadingSubmit(false);

    }
  };

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* 🔥 HEADER */}
      <View style={styles.header}>

        <Text style={styles.heading}>
          Post an Idea
        </Text>

        <Text style={styles.subHeading}>
          Share your vision with investors
        </Text>

      </View>

      {/* 🔥 TITLE */}
      <View style={styles.inputGroup}>

        <Text style={styles.label}>
          Idea Title
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="E.g., AI-Powered Personal Stylist"
          placeholderTextColor="#A1A1A1"
        />

      </View>

      {/* 🔥 CATEGORY */}
      <View style={styles.inputGroup}>

        <Text style={styles.label}>
          Category
        </Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() =>
            setShowCategories(
              !showCategories
            )
          }
        >

          <Text style={styles.dropdownText}>
            {category}
          </Text>

          <Ionicons
            name={
              showCategories
                ? "chevron-up"
                : "chevron-down"
            }
            size={22}
            color="#777"
          />

        </TouchableOpacity>

        {/* DROPDOWN */}
        {showCategories && (

          <View style={styles.dropdownMenu}>

            {categories.map((cat) => (

              <TouchableOpacity
                key={cat}
                style={styles.categoryItem}
                onPress={() => {

                  setCategory(cat);

                  setShowCategories(false);

                }}
              >

                <Text
                  style={[
                    styles.categoryText,

                    category === cat && {
                      color: "#000",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {cat}
                </Text>

              </TouchableOpacity>

            ))}

          </View>

        )}

      </View>

      {/* 🔥 PROBLEM */}
      <View style={styles.inputGroup}>

        <Text style={styles.label}>
          The Problem
        </Text>

        <TextInput
          value={problem}
          onChangeText={setProblem}
          multiline
          style={styles.bigInput}
          placeholder="Describe the problem you are solving..."
          placeholderTextColor="#A1A1A1"
        />

      </View>

      {/* 🔥 SOLUTION */}
      <View style={styles.inputGroup}>

        <Text style={styles.label}>
          The Solution
        </Text>

        <TextInput
          value={solution}
          onChangeText={setSolution}
          multiline
          style={styles.bigInput}
          placeholder="Explain how your idea solves this problem..."
          placeholderTextColor="#A1A1A1"
        />

      </View>

      {/* 🔥 AI RESULT */}
      {prediction && (

        <View style={styles.predictionCard}>

          <Text style={styles.predictionTitle}>
            📊 AI Market Analysis
          </Text>

          <Text style={styles.predictionText}>
            🚀 Success Rate:{" "}
            {prediction.score}%
          </Text>

          <Text style={styles.predictionText}>
            🔥 Market Demand:{" "}
            {prediction.demand}
          </Text>

          <Text style={styles.predictionText}>
            ⚠️ Risk Level:{" "}
            {prediction.risk}
          </Text>

        </View>

      )}

      {/* 🔥 BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
      >

        {loadingSubmit ? (

          <ActivityIndicator color="#fff" />

        ) : (

          <Text style={styles.buttonText}>
            Publish Idea
          </Text>

        )}

      </TouchableOpacity>

      <View style={{ height: 40 }} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7F2EA",
  },

  // 🔥 HEADER
  header: {
    paddingHorizontal: 24,
    paddingTop: 70,
    marginBottom: 25,
  },

  heading: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#0D0D0D",
    letterSpacing: -1,
  },

  subHeading: {
    marginTop: 10,
    fontSize: 18,
    color: "#6B6B6B",
    fontWeight: "500",
  },

  // 🔥 INPUT GROUP
  inputGroup: {
    marginBottom: 26,
    paddingHorizontal: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  // 🔥 INPUT
  input: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    paddingHorizontal: 22,
    paddingVertical: 18,

    fontSize: 16,

    color: "#111",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 3,
  },

  // 🔥 BIG INPUT
  bigInput: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    paddingHorizontal: 22,
    paddingVertical: 18,

    fontSize: 16,

    color: "#111",

    minHeight: 170,

    textAlignVertical: "top",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 3,
  },

  // 🔥 DROPDOWN
  dropdown: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    paddingHorizontal: 22,
    paddingVertical: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 3,
  },

  dropdownText: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },

  // 🔥 DROPDOWN MENU
  dropdownMenu: {
    backgroundColor: "#FFFFFF",

    marginTop: 10,

    borderRadius: 22,

    paddingVertical: 10,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 5,
  },

  categoryItem: {
    paddingVertical: 14,
    paddingHorizontal: 22,
  },

  categoryText: {
    fontSize: 16,
    color: "#555",
  },

  // 🔥 AI RESULT
  predictionCard: {
    backgroundColor: "#FFFFFF",

    marginHorizontal: 24,
    marginBottom: 25,

    padding: 22,

    borderRadius: 24,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 3,
  },

  predictionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },

  predictionText: {
    fontSize: 15,
    color: "#444",
    marginTop: 8,
    lineHeight: 22,
  },

  // 🔥 BUTTON
  button: {
    backgroundColor: "#050505",

    marginHorizontal: 24,
    marginTop: 10,

    paddingVertical: 20,

    borderRadius: 999,

    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,

    elevation: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});