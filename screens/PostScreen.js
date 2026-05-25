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

import OpenAI from "openai";

export default function PostScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Technology");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [showCategories, setShowCategories] = useState(false);

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

  // 🤖 LOCAL HIGH-FIDELITY AI GENERATOR
  const localAIGenerator = (titleVal, catVal) => {
    const cat = catVal.toLowerCase();
    
    let prob = "";
    let sol = "";
    let score = Math.floor(Math.random() * 15) + 80; // 80-95
    let demand = "High";
    let risk = "Medium";
    
    if (cat.includes("tech") || cat.includes("ai")) {
      prob = `Businesses and individuals struggle to process massive amounts of unstructured data efficiently, leading to slow decision-making, missed opportunities, and high operational overhead. Current software tools lack predictive intelligence and real-time adaptation.`;
      sol = `Deploying "${titleVal}", an advanced AI-powered orchestration platform that uses cognitive workflows to automate operations, analyze telemetry in real-time, and deliver hyper-personalized, actionable recommendations.`;
      score = 94;
      demand = "Extreme 🚀";
      risk = "Low";
    } else if (cat.includes("finance") || cat.includes("business")) {
      prob = `Traditional retail investors and startups face a massive barrier to entry in complex venture markets due to confusing terminology, lack of transparent risk indicators, and fragmented portfolio tools that don't reflect true real-time volatility.`;
      sol = `Launching "${titleVal}", a frictionless micro-investing and portfolio simulation client that gamifies financial literacy, provides instant risk-hedging suggestions, and streamlines capital allocation with decentralized security protocols.`;
      score = 89;
      demand = "High";
      risk = "High ⚠️";
    } else if (cat.includes("health")) {
      prob = `Patients suffer from long diagnosis queues and fragmented medical history transfers, making early-stage preventative care extremely difficult for local clinics to coordinate without expensive diagnostic hardware.`;
      sol = `Introducing "${titleVal}", a cloud-native preventative care diagnostics suite that analyzes patient biomarkers and medical patterns locally, providing clinicians with instant risk telemetry and automated scheduling.`;
      score = 91;
      demand = "High";
      risk = "Medium";
    } else if (cat.includes("education")) {
      prob = `Generic, one-size-fits-all digital learning materials fail to adapt to neurodivergent students and diverse student retention paces, leading to high drop-out rates in online schooling and traditional classrooms.`;
      sol = `Building "${titleVal}", a fully gamified, responsive curriculum builder that uses adaptive cognitive pacing algorithms to create customized lessons, interactive quizzes, and visual study decks.`;
      score = 87;
      demand = "Moderate";
      risk = "Low";
    } else {
      prob = `Consumers and businesses currently lack access to specialized, automated solutions in the ${catVal} sector, resulting in high manual overhead, sub-optimal user experience, and disjointed coordination.`;
      sol = `Implementing "${titleVal}", a state-of-the-art social utility app specifically optimized for ${catVal} challenges, introducing frictionless transaction channels and modern, responsive community feedback loops.`;
      score = 85;
      demand = "Steady Growth";
      risk = "Medium";
    }
    
    return { prob, sol, score, demand, risk };
  };

  // 🤖 AI BRAINSTORM HANDLER
  const generateAIPitch = async () => {
    if (!title.trim()) {
      alert("Please enter an Idea Title first to let AI co-pilot brainstorm! 😅");
      return;
    }
    
    setLoadingSubmit(true);
    
    // Check for OpenAI API Key
    const apiKey = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    if (apiKey) {
      try {
        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert venture capitalist and startup incubator director. Help the founder draft a high-fidelity startup pitch.",
            },
            {
              role: "user",
              content: `Create a professional pitch for a startup idea called "${title}" in the category "${category}". Respond with a JSON object containing: "problem" (1-2 sentences of the pain point), "solution" (1-2 sentences of the innovative product solution), "success" (estimated percentage 70-98), "demand" ("High", "Extreme", "Steady Growth", or "Moderate").`,
            }
          ],
          response_format: { type: "json_object" }
        });
        
        const res = JSON.parse(response.choices[0].message.content);
        setProblem(res.problem || "");
        setSolution(res.solution || "");
        setPrediction({
          score: res.success || 85,
          demand: res.demand || "High",
          risk: "Medium"
        });
        setLoadingSubmit(false);
        return;
      } catch (err) {
        console.log("OpenAI failed, falling back to local generative engine", err);
      }
    }
    
    // Fallback to local high-fidelity generator
    setTimeout(() => {
      const res = localAIGenerator(title, category);
      setProblem(res.prob);
      setSolution(res.sol);
      setPrediction({
        score: res.score,
        demand: res.demand,
        risk: res.risk
      });
      setLoadingSubmit(false);
    }, 800);
  };

  // 🤖 SIMPLE ML
  const predictIdea = () => {
    if (prediction) return prediction;

    let score = Math.floor(Math.random() * 25) + 70;
    let demand = "Medium";
    let risk = "Medium";

    if (category.toLowerCase().includes("ai")) {
      score += 10;
      demand = "High";
      risk = "Low";
    }

    if (category.toLowerCase().includes("finance")) {
      score += 5;
      risk = "High";
    }

    if (problem.length > 80) score += 4;
    if (solution.length > 80) score += 4;
    if (score > 98) score = 98;

    return {
      score,
      demand,
      risk,
    };
  };

  // 🚀 SUBMIT
  const handleSubmit = async () => {
    if (!title || !category || !problem || !solution) {
      alert("Fill all fields 😅");
      return;
    }

    try {
      setLoadingSubmit(true);

      const user = auth.currentUser;
      if (!user) {
        alert("Login required 😢");
        return;
      }

      // 🔥 AI RESULT
      const result = predictIdea();

      // 🔥 SAVE
      await addDoc(collection(db, "ideas"), {
        title,
        category,
        problem,
        solution,
        userId: user.uid,
        likes: 0,
        coins: 0,
        weakCount: 0,
        likedBy: [],
        weakBy: [],
        predictionScore: result.score,
        marketDemand: result.demand,
        riskLevel: result.risk,
        createdAt: Date.now(),
      });

      // 🔥 COINS
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      let currentCoins = 0;

      if (snap.exists()) {
        currentCoins = snap.data().coins || 0;
      }

      await updateDoc(userRef, {
        coins: currentCoins + 200,
      });

      alert("🚀 Idea Published +200 Coins");

      setTitle("");
      setProblem("");
      setSolution("");
      setPrediction(null);

      navigation.goBack();
    } catch (err) {
      console.log(err);
      alert("Error: " + err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🔥 HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>Post an Idea</Text>
        <Text style={styles.subHeading}>Share your vision with investors</Text>
      </View>

      {/* 🔥 TITLE */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Idea Title</Text>
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
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowCategories(!showCategories)}
        >
          <Text style={styles.dropdownText}>{category}</Text>
          <Ionicons
            name={showCategories ? "chevron-up" : "chevron-down"}
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

      {/* 🤖 AI CO-PILOT BUTTON */}
      <TouchableOpacity
        style={styles.aiCoPilotBtn}
        onPress={generateAIPitch}
        disabled={loadingSubmit}
        activeOpacity={0.7}
      >
        <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.aiCoPilotBtnText}>
          {loadingSubmit ? "AI brainstorming..." : "Draft Pitch with AI Co-Pilot 🪄"}
        </Text>
      </TouchableOpacity>

      {/* 🔥 PROBLEM */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>The Problem</Text>
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
        <Text style={styles.label}>The Solution</Text>
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
          <Text style={styles.predictionTitle}>📊 AI Market Analysis</Text>
          <Text style={styles.predictionText}>🚀 Success Rate: {prediction.score}%</Text>
          <Text style={styles.predictionText}>🔥 Market Demand: {prediction.demand}</Text>
          <Text style={styles.predictionText}>⚠️ Risk Level: {prediction.risk}</Text>
        </View>
      )}

      {/* 🔥 BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        {loadingSubmit ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Publish Idea</Text>
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
  aiCoPilotBtn: {
    backgroundColor: "#FF6B6B",
    marginHorizontal: 24,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  aiCoPilotBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
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