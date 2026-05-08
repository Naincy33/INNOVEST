import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useState, useEffect } from "react";

import { LinearGradient } from "expo-linear-gradient";

// 🔥 FIREBASE
import {
  doc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { db, auth } from "../firebase";

export default function QuizScreen() {

  // 🔥 HUGE QUESTION BANK
  const allQuestions = [
    {
      question: "What is Profit?",
      options: [
        "Revenue - Cost",
        "Only Revenue",
        "Tax",
        "Loss",
      ],
      answer: "Revenue - Cost",
    },

    {
      question: "What is ROI?",
      options: [
        "Return on Investment",
        "Rate of Income",
        "Revenue of India",
        "Risk of Investment",
      ],
      answer: "Return on Investment",
    },

    {
      question:
        "Which is safest investment?",
      options: [
        "Savings Account",
        "Lottery",
        "Betting",
        "Gambling",
      ],
      answer: "Savings Account",
    },

    {
      question:
        "What is startup funding?",
      options: [
        "Money raised for business",
        "Salary",
        "Tax",
        "Shopping",
      ],
      answer:
        "Money raised for business",
    },

    {
      question:
        "Which reduces investment risk?",
      options: [
        "Diversification",
        "Random investing",
        "No savings",
        "Single stock",
      ],
      answer: "Diversification",
    },

    {
      question:
        "What is inflation?",
      options: [
        "Price increase",
        "Price decrease",
        "Profit",
        "Tax",
      ],
      answer: "Price increase",
    },

    {
      question:
        "What does IPO mean?",
      options: [
        "Initial Public Offering",
        "Income Profit Output",
        "Investment Plan Order",
        "Internet Public Office",
      ],
      answer:
        "Initial Public Offering",
    },

    {
      question:
        "What is passive income?",
      options: [
        "Income with minimal effort",
        "Salary",
        "Tax return",
        "Business loss",
      ],
      answer:
        "Income with minimal effort",
    },

    {
      question:
        "Best thing before investing?",
      options: [
        "Research",
        "Guessing",
        "Random buying",
        "Ignoring risk",
      ],
      answer: "Research",
    },

    {
      question:
        "Which is a digital asset?",
      options: [
        "Cryptocurrency",
        "Shoes",
        "Food",
        "Furniture",
      ],
      answer: "Cryptocurrency",
    },
  ];

  // 🔥 RANDOMIZE QUESTIONS
  const shuffled = [...allQuestions].sort(
    () => 0.5 - Math.random()
  );

  const quizQuestions =
    shuffled.slice(0, 5);

  // 🔥 STATES
  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [score, setScore] =
    useState(0);

  const [selected, setSelected] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [alreadyPlayed, setAlreadyPlayed] =
    useState(false);

  const question =
    quizQuestions[currentQuestion];

  // 🔥 CHECK DAILY PLAY
  useEffect(() => {
    checkQuizStatus();
  }, []);

  const checkQuizStatus = async () => {
    try {
      const user =
        auth.currentUser;

      if (!user) return;

      const today =
        new Date().toDateString();

      const quizRef = doc(
        db,
        "dailyQuiz",
        user.uid
      );

      const snap = await getDoc(
        quizRef
      );

      if (
        snap.exists() &&
        snap.data().date === today
      ) {
        setAlreadyPlayed(true);
      }

      setLoading(false);

    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // 🚀 ANSWER
  const handleAnswer = async (
    option
  ) => {
    setSelected(option);

    let updatedScore = score;

    // ✅ CORRECT
    if (
      option === question.answer
    ) {
      updatedScore += 1;
      setScore(updatedScore);
    }

    // ⏭ NEXT
    setTimeout(async () => {

      if (
        currentQuestion <
        quizQuestions.length - 1
      ) {
        setCurrentQuestion(
          currentQuestion + 1
        );

        setSelected(null);

      } else {

        // 🔥 FINAL RESULT
        const user =
          auth.currentUser;

        if (!user) return;

        const today =
          new Date().toDateString();

        // 🔥 SAVE QUIZ STATUS
        await setDoc(
          doc(
            db,
            "dailyQuiz",
            user.uid
          ),
          {
            date: today,
            score: updatedScore,
            userId: user.uid,
            createdAt: Date.now(),
          }
        );

        // 🔥 REWARD
        let reward = updatedScore * 100;

        // 💀 PERFECT BONUS
        if (updatedScore === 5) {
          reward += 500;
        }

        // 🔥 UPDATE COINS
        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            coins: increment(
              reward
            ),
          }
        );

        Alert.alert(
          "🏆 Quiz Finished",
          `Score: ${updatedScore}/5

💰 Coins Earned: ${reward}

🔥 Come back tomorrow for new quiz!`
        );

        setAlreadyPlayed(true);
      }
    }, 1000);
  };

  // 🔥 LOADING
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#FF6B81"
        />
      </View>
    );
  }

  // 🔥 ALREADY PLAYED
  if (alreadyPlayed) {
    return (
      <View style={styles.center}>
        
        <Text style={styles.done}>
          🎉 Today&apos;s Quiz Completed
        </Text>

        <Text style={styles.sub}>
          Come back tomorrow 😎
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient
        colors={[
          "#FF8C94",
          "#FFB6C1",
        ]}
        style={styles.header}
      >
        <Text style={styles.heading}>
          🏆 Daily Finance Quiz
        </Text>

        <Text style={styles.subHeading}>
          Random questions every day
        </Text>
      </LinearGradient>

      {/* QUESTION CARD */}
      <View style={styles.card}>
        
        <Text style={styles.count}>
          Question{" "}
          {currentQuestion + 1}/5
        </Text>

        <Text style={styles.question}>
          {question.question}
        </Text>
      </View>

      {/* OPTIONS */}
      <View style={styles.options}>
        {question.options.map(
          (option, index) => {

            const isCorrect =
              option ===
              question.answer;

            const isSelected =
              option === selected;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionBtn,

                  isSelected &&
                    (isCorrect
                      ? styles.correct
                      : styles.wrong),
                ]}
                onPress={() =>
                  handleAnswer(
                    option
                  )
                }
                disabled={
                  selected !== null
                }
              >
                <Text
                  style={
                    styles.optionText
                  }
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </View>

      {/* SCORE */}
      <View style={styles.scoreBox}>
        
        <Text style={styles.score}>
          🏆 Score: {score}
        </Text>

        <Text style={styles.score}>
          💰 Potential:{" "}
          {score * 100}
        </Text>
      </View>
    </View>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF5F7",
  },

  done: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B81",
  },

  sub: {
    marginTop: 10,
    color: "#666",
  },

  header: {
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  heading: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  subHeading: {
    color: "#fff",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },

  count: {
    color: "#888",
    marginBottom: 10,
  },

  question: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  options: {
    marginHorizontal: 20,
  },

  optionBtn: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
  },

  optionText: {
    fontWeight: "600",
    fontSize: 15,
  },

  correct: {
    backgroundColor: "#C8F7C5",
  },

  wrong: {
    backgroundColor: "#FFD6D6",
  },

  scoreBox: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },

  score: {
    fontWeight: "bold",
    fontSize: 16,
  },
});