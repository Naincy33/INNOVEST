import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  useState,
  useEffect,
} from "react";

import {
  doc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase";

export default function QuizScreen() {

  // 🔥 QUESTIONS
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
      answer:
        "Return on Investment",
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
      answer:
        "Savings Account",
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
      answer:
        "Diversification",
    },
  ];

  // 🔥 RANDOM QUESTIONS
  const shuffled =
    [...allQuestions].sort(
      () => 0.5 - Math.random()
    );

  const quizQuestions =
    shuffled.slice(0, 5);

  // 🔥 STATES
  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState(0);

  const [score, setScore] =
    useState(0);

  const [
    selected,
    setSelected,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    alreadyPlayed,
    setAlreadyPlayed,
  ] = useState(false);

  const [
    answerStatus,
    setAnswerStatus,
  ] = useState("");

  const question =
    quizQuestions[currentQuestion];

  // 🔥 DAILY CHECK
  useEffect(() => {
    checkQuizStatus();
  }, []);

  const checkQuizStatus =
    async () => {

      try {

        const user =
          auth.currentUser;

        if (!user) return;

        const today =
          new Date().toDateString();

        const quizRef =
          doc(
            db,
            "dailyQuiz",
            user.uid
          );

        const snap =
          await getDoc(
            quizRef
          );

        if (
          snap.exists() &&
          snap.data().date ===
            today
        ) {
          setAlreadyPlayed(true);
        }

        setLoading(false);

      } catch (err) {

        console.log(err);

        setLoading(false);
      }
    };

  // 🔥 ANSWER
  const handleAnswer =
    async (option) => {

      setSelected(option);

      let updatedScore =
        score;

      // ✅ CORRECT
      if (
        option ===
        question.answer
      ) {

        updatedScore += 1;

        setScore(
          updatedScore
        );

        setAnswerStatus(
          "correct"
        );

      } else {

        setAnswerStatus(
          "wrong"
        );
      }

      // ⏭ NEXT
      setTimeout(async () => {

        if (
          currentQuestion <
          quizQuestions.length -
            1
        ) {

          setCurrentQuestion(
            currentQuestion +
              1
          );

          setSelected(null);

          setAnswerStatus("");

        } else {

          const user =
            auth.currentUser;

          if (!user) return;

          const today =
            new Date().toDateString();

          // 🔥 SAVE QUIZ
          await setDoc(
            doc(
              db,
              "dailyQuiz",
              user.uid
            ),
            {
              date: today,
              score:
                updatedScore,
              userId:
                user.uid,
              createdAt:
                Date.now(),
            }
          );

          // 💰 REWARD
          let reward =
            updatedScore *
            100;

          // 🔥 PERFECT BONUS
          if (
            updatedScore ===
            5
          ) {
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
              coins:
                increment(
                  reward
                ),
            }
          );

          Alert.alert(
            updatedScore === 5
              ? "🏆 PERFECT SCORE!"
              : "🎉 Quiz Finished",

            `You scored ${updatedScore}/5

💰 Coins Earned: ${reward}

${
  updatedScore === 5
    ? "🔥 Bonus +500 coins added!"
    : ""
}

Come back tomorrow 🚀`
          );

          setAlreadyPlayed(
            true
          );
        }
      }, 1300);
    };

  // 🔥 LOADING
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111"
        />
      </View>
    );
  }

  // 🔥 ALREADY PLAYED
  if (alreadyPlayed) {
    return (
      <View style={styles.center}>

        <View
          style={styles.doneCard}
        >

          <Text
            style={styles.doneEmoji}
          >
            🎉
          </Text>

          <Text
            style={styles.done}
          >
            Quiz Completed
          </Text>

          <Text
            style={styles.sub}
          >
            Come back tomorrow
            for a new challenge 🚀
          </Text>

        </View>

      </View>
    );
  }

  return (

    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Text style={styles.heading}>
          Daily Quiz
        </Text>

        <Text
          style={styles.subHeading}
        >
          Learn investing &
          earn coins 💰
        </Text>

      </View>

      {/* PROGRESS */}
      <View
        style={styles.progressRow}
      >

        {[1, 2, 3, 4, 5].map(
          (item) => (

            <View
              key={item}
              style={[
                styles.progressDot,

                currentQuestion + 1 >=
                  item &&
                  styles.progressActive,
              ]}
            />
          )
        )}

      </View>

      {/* QUESTION CARD */}
      <View style={styles.card}>

        <Text style={styles.count}>
          Question{" "}
          {currentQuestion + 1}
          /5
        </Text>

        <Text
          style={styles.question}
        >
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
              option ===
              selected;

            return (

              <TouchableOpacity
                key={index}
                disabled={
                  selected !==
                  null
                }
                style={[
                  styles.optionBtn,

                  isSelected &&
                    isCorrect &&
                    styles.correct,

                  isSelected &&
                    !isCorrect &&
                    styles.wrong,
                ]}
                onPress={() =>
                  handleAnswer(
                    option
                  )
                }
              >

                <Text
                  style={
                    styles.optionText
                  }
                >
                  {option}
                </Text>

                {isSelected &&
                  isCorrect && (
                    <Text
                      style={
                        styles.icon
                      }
                    >
                      ✅
                    </Text>
                  )}

                {isSelected &&
                  !isCorrect && (
                    <Text
                      style={
                        styles.icon
                      }
                    >
                      ❌
                    </Text>
                  )}

              </TouchableOpacity>
            );
          }
        )}

      </View>

      {/* RESULT */}
      {answerStatus ===
        "correct" && (

        <View
          style={styles.resultBox}
        >

          <Text
            style={
              styles.correctText
            }
          >
            ✅ Correct Answer!
          </Text>

        </View>
      )}

      {answerStatus ===
        "wrong" && (

        <View
          style={styles.resultBox}
        >

          <Text
            style={
              styles.wrongText
            }
          >
            ❌ Wrong Answer
          </Text>

          <Text
            style={
              styles.answerText
            }
          >
            Correct:{" "}
            {
              question.answer
            }
          </Text>

        </View>
      )}

      {/* SCORE */}
      <View
        style={styles.scoreBox}
      >

        <View>

          <Text
            style={
              styles.scoreLabel
            }
          >
            Current Score
          </Text>

          <Text
            style={styles.score}
          >
            {score}/5
          </Text>

        </View>

        <View>

          <Text
            style={
              styles.scoreLabel
            }
          >
            Coins
          </Text>

          <Text
            style={styles.score}
          >
            💰 {score * 100}
          </Text>

        </View>

      </View>

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F5F0E6",

      paddingTop: 70,
    },

    center: {
      flex: 1,
      justifyContent:
        "center",

      alignItems: "center",

      backgroundColor:
        "#F5F0E6",
    },

    doneCard: {
      backgroundColor:
        "#fff",

      padding: 40,

      borderRadius: 30,

      alignItems: "center",

      width: "85%",
    },

    doneEmoji: {
      fontSize: 50,
    },

    done: {
      fontSize: 28,
      fontWeight: "bold",

      color: "#111",

      marginTop: 15,
    },

    sub: {
      color: "#777",

      marginTop: 10,

      textAlign: "center",

      lineHeight: 24,
    },

    header: {
      paddingHorizontal: 24,
    },

    heading: {
      fontSize: 38,
      fontWeight: "bold",
      color: "#111",
    },

    subHeading: {
      color: "#777",
      marginTop: 8,
      fontSize: 16,
    },

    progressRow: {
      flexDirection: "row",

      marginTop: 30,

      paddingHorizontal: 24,
    },

    progressDot: {
      flex: 1,

      height: 8,

      backgroundColor:
        "#DDD6C8",

      borderRadius: 10,

      marginRight: 6,
    },

    progressActive: {
      backgroundColor:
        "#111",
    },

    card: {
      backgroundColor:
        "#fff",

      margin: 24,

      padding: 28,

      borderRadius: 30,

      shadowColor: "#000",

      shadowOpacity: 0.05,

      shadowRadius: 10,

      elevation: 4,
    },

    count: {
      color: "#888",
      marginBottom: 16,
      fontWeight: "600",
    },

    question: {
      fontSize: 26,
      fontWeight: "bold",
      color: "#111",

      lineHeight: 38,
    },

    options: {
      paddingHorizontal: 24,
    },

    optionBtn: {
      backgroundColor:
        "#fff",

      borderRadius: 22,

      padding: 20,

      marginBottom: 14,

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      shadowColor: "#000",

      shadowOpacity: 0.04,

      shadowRadius: 8,

      elevation: 3,
    },

    optionText: {
      color: "#111",

      fontSize: 16,

      fontWeight: "600",

      width: "85%",
    },

    icon: {
      fontSize: 22,
    },

    correct: {
      backgroundColor:
        "#DDF8E4",

      borderWidth: 2,

      borderColor:
        "#30B566",
    },

    wrong: {
      backgroundColor:
        "#FFE2E2",

      borderWidth: 2,

      borderColor:
        "#FF6B6B",
    },

    resultBox: {
      marginHorizontal: 24,

      marginTop: 10,

      backgroundColor:
        "#fff",

      borderRadius: 24,

      padding: 18,

      alignItems: "center",
    },

    correctText: {
      color: "#30B566",

      fontWeight: "bold",

      fontSize: 18,
    },

    wrongText: {
      color: "#FF6B6B",

      fontWeight: "bold",

      fontSize: 18,
    },

    answerText: {
      marginTop: 8,

      color: "#666",

      fontWeight: "600",
    },

    scoreBox: {
      backgroundColor:
        "#111",

      margin: 24,

      borderRadius: 30,

      padding: 24,

      flexDirection: "row",

      justifyContent:
        "space-between",
    },

    scoreLabel: {
      color: "#AAA",

      marginBottom: 8,
    },

    score: {
      color: "#fff",

      fontSize: 28,

      fontWeight: "bold",
    },
  });