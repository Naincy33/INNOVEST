import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useState, useEffect } from "react";

import {
  doc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

import { db, auth } from "../firebase";

import { Ionicons } from "@expo/vector-icons";

export default function QuizScreen({ navigation }) {
  // 🔥 PERSISTENT STATES
  const [activeGame, setActiveGame] = useState("menu"); // "menu" | "quiz" | "predictor" | "scramble"
  const [userCoins, setUserCoins] = useState(0);
  const [loadingCoins, setLoadingCoins] = useState(true);

  // ==========================================
  // 💾 FIREBASE REAL-TIME COINS SYNC
  // ==========================================
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoadingCoins(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setUserCoins(snap.data().coins || 0);
      }
      setLoadingCoins(false);
    });

    return () => unsub();
  }, []);

  // Helper to safely reward/charge coins in Firestore
  const updateFirebaseCoins = async (amount) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid), {
        coins: increment(amount),
      });
    } catch (err) {
      console.log("Failed to update coins", err);
    }
  };

  // ==========================================
  // 🧠 GAME A: DAILY FINANCE QUIZ
  // ==========================================
  const quizQuestions = [
    {
      question: "What is Profit?",
      options: ["Revenue - Cost", "Only Revenue", "Tax", "Loss"],
      answer: "Revenue - Cost",
      explanation: "Profit is the financial gain earned when the revenue generated from a business activity exceeds the expenses, costs, and taxes needed to sustain it.",
    },
    {
      question: "What is ROI?",
      options: ["Return on Investment", "Rate of Income", "Revenue of India", "Risk of Investment"],
      answer: "Return on Investment",
      explanation: "Return on Investment (ROI) evaluates the efficiency or profitability of an investment. It is calculated as: (Net Profit / Investment Cost) x 100%.",
    },
    {
      question: "Which is the safest investment?",
      options: ["Savings Account", "Lottery", "Betting", "Gambling"],
      answer: "Savings Account",
      explanation: "A savings account is considered one of the safest assets because it is typically federally insured and carries virtually zero risk of principal loss.",
    },
    {
      question: "What is startup funding?",
      options: ["Money raised for business", "Salary", "Tax", "Shopping"],
      answer: "Money raised for business",
      explanation: "Startup funding is the capital raised by founders to launch, operate, and scale a new business, typically obtained from venture capitalists or angel investors.",
    },
    {
      question: "Which reduces investment risk?",
      options: ["Diversification", "Random investing", "No savings", "Single stock"],
      answer: "Diversification",
      explanation: "Diversification is the strategy of spreading your investments across different asset classes, industries, or categories to minimize exposure to any single risk.",
    },
    {
      question: "What is Equity?",
      options: ["Ownership in a company", "A type of loan", "Government tax", "Cash in bank"],
      answer: "Ownership in a company",
      explanation: "Equity represents ownership interest in a firm, usually in the form of shares of stock. Equity holders share in the company's growth as well as its risks.",
    },
    {
      question: "What is Inflation?",
      options: ["Decline in purchasing power", "Increase in stock prices", "Free government money", "Savings interest rate"],
      answer: "Decline in purchasing power",
      explanation: "Inflation is the general increase in prices over time, causing the purchasing power of a currency to fall (you need more money to buy the same items).",
    },
    {
      question: "What is a Venture Capitalist (VC)?",
      options: ["High-growth investor", "Bank teller", "Debt collector", "Tax accountant"],
      answer: "High-growth investor",
      explanation: "A Venture Capitalist (VC) is a private equity investor who provides capital to early-stage, high-potential startups in exchange for an ownership stake.",
    }
  ];

  // Daily Quiz States
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizStatus, setQuizStatus] = useState("playing"); // "playing" | "answered"
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizPlayedToday, setQuizPlayedToday] = useState(false);
  const [checkingQuiz, setCheckingQuiz] = useState(true);

  // Daily Quiz Mount Check
  useEffect(() => {
    checkQuizStatus();
  }, []);

  const checkQuizStatus = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setCheckingQuiz(false);
        return;
      }
      const today = new Date().toDateString();
      const quizRef = doc(db, "dailyQuiz", user.uid);
      const snap = await getDoc(quizRef);
      if (snap.exists() && snap.data().date === today) {
        setQuizPlayedToday(true);
      }
      setCheckingQuiz(false);
    } catch (err) {
      console.log(err);
      setCheckingQuiz(false);
    }
  };

  const startQuiz = () => {
    // Select 5 random questions
    const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
    setSelectedQuestions(shuffled.slice(0, 5));
    setCurrentQuestionIdx(0);
    setQuizScore(0);
    setSelectedOption(null);
    setQuizStatus("playing");
    setShowExplanation(false);
  };

  const handleQuizAnswer = (option) => {
    setSelectedOption(option);
    setQuizStatus("answered");
    const currentQ = selectedQuestions[currentQuestionIdx];
    if (option === currentQ.answer) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = async () => {
    if (currentQuestionIdx < selectedQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setQuizStatus("playing");
      setShowExplanation(false);
    } else {
      // Finished Quiz
      const user = auth.currentUser;
      if (!user) return;
      const today = new Date().toDateString();
      const finalScore = selectedOption === selectedQuestions[currentQuestionIdx].answer ? quizScore + 1 : quizScore;

      try {
        await setDoc(doc(db, "dailyQuiz", user.uid), {
          date: today,
          score: finalScore,
          userId: user.uid,
          createdAt: Date.now(),
        });

        let coinsReward = finalScore * 100;
        if (finalScore === 5) {
          coinsReward += 500; // Perfect bonus!
        }
        await updateFirebaseCoins(coinsReward);

        Alert.alert(
          finalScore === 5 ? "🏆 PERFECT SCORE!" : "🎉 Quiz Finished",
          `You scored ${finalScore}/5!\n\n💰 Coins Earned: ${coinsReward}\n\n${
            finalScore === 5 ? "🔥 Perfect score bonus +500 coins added!" : ""
          }\n\nCome back tomorrow for a new challenge!`
        );
        setQuizPlayedToday(true);
        setActiveGame("menu");
      } catch (err) {
        Alert.alert("Error", err.message);
      }
    }
  };

  // ==========================================
  // 📈 GAME B: MARKET PREDICTOR SIMULATOR
  // ==========================================
  const generateSimulatedStartup = () => {
    const names = ["EcoGrid AI", "NeuraHealth", "FlexPay", "EduPulse", "SolarWave", "LedgerFlow", "AeroGrow", "CyberShield"];
    const sectors = ["Clean Energy", "BioHealth", "FinTech", "EdTech", "CleanTech", "SaaS Enterprise", "AgriTech", "Cybersecurity"];
    const descriptions = [
      "AI-driven decentralized power distribution network for smart grids.",
      "Predictive machine learning models for early stage cardiac anomaly detection.",
      "Micro-lending platform with decentralized credit scoring algorithms.",
      "Gamified educational curriculum adapting to neurodivergent students.",
      "High-efficiency thin-film solar modules integrating transparent window glass.",
      "Automated tax optimization protocol for cross-border digital companies.",
      "Hydroponic vertical farming systems optimized by thermal micro-imaging.",
      "Zero-trust cloud network shielding scaling startups from ransomware."
    ];
    const hypes = ["High Hype", "Moderate", "Extreme 🚀", "Steady Growth"];
    const strengths = ["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐"];
    const risks = ["Low Risk", "Medium Risk", "High Risk ⚠️", "Medium Risk"];

    const index = Math.floor(Math.random() * names.length);
    const sector = sectors[index];
    const name = names[index];
    const description = descriptions[index];

    const hypeVal = hypes[Math.floor(Math.random() * hypes.length)];
    const teamVal = strengths[Math.floor(Math.random() * strengths.length)];
    const riskVal = risks[Math.floor(Math.random() * risks.length)];

    let probability = 50;
    if (hypeVal.includes("Extreme") || hypeVal.includes("High")) probability += 20;
    if (teamVal.includes("⭐⭐⭐⭐⭐")) probability += 15;
    if (riskVal.includes("High")) probability -= 10;

    return { name, sector, description, hype: hypeVal, team: teamVal, risk: riskVal, bullChance: probability };
  };

  const [predictorStartup, setPredictorStartup] = useState(null);
  const [predictorStake, setPredictorStake] = useState(100);
  const [predictorStatus, setPredictorStatus] = useState("betting"); // "betting" | "simulating" | "resolved"
  const [predictorResult, setPredictorResult] = useState(null);

  const startPredictor = () => {
    setPredictorStartup(generateSimulatedStartup());
    setPredictorStatus("betting");
    setPredictorResult(null);
  };

  const handlePredict = async (prediction) => {
    if (userCoins < predictorStake) {
      Alert.alert("Insufficient Balance", "You do not have enough coins to place this stake! 😢");
      return;
    }

    setPredictorStatus("simulating");
    // Simulate loading for 1.8 seconds
    setTimeout(async () => {
      const roll = Math.floor(Math.random() * 100) + 1;
      const isBull = roll <= predictorStartup.bullChance;
      const success = (prediction === "BULL" && isBull) || (prediction === "BEAR" && !isBull);

      if (success) {
        await updateFirebaseCoins(predictorStake); // add stake profit (net +stake)
        setPredictorResult({
          win: true,
          outcome: isBull ? "BULL" : "BEAR",
          percentage: Math.floor(Math.random() * 40) + 40,
          payout: predictorStake * 2,
        });
      } else {
        await updateFirebaseCoins(-predictorStake); // lose stake (net -stake)
        setPredictorResult({
          win: false,
          outcome: isBull ? "BULL" : "BEAR",
          percentage: Math.floor(Math.random() * 30) + 20,
          payout: 0,
        });
      }
      setPredictorStatus("resolved");
    }, 1800);
  };

  // ==========================================
  // 🔠 GAME C: TERM UNSCRAMBLER
  // ==========================================
  const scrambleTerms = [
    { word: "MUTUAL", clue: "A diversified fund managed professionally by investing in many companies." },
    { word: "INFLATION", clue: "The general increase in prices and fall in currency purchasing value." },
    { word: "STOCKS", clue: "Shares of ownership in a business corporation representing capital assets." },
    { word: "INTEREST", clue: "Money paid regularly at a particular rate for the use of money lent." },
    { word: "PROFIT", clue: "Financial gain representing a company's total revenue minus expenses." },
    { word: "EQUITY", clue: "Ownership value in a scaling business, asset, or startup." },
    { word: "LIQUIDITY", clue: "The speed and ease with which an asset can be converted into spendable cash." },
    { word: "LIABILITY", clue: "A financial debt or legal obligation owed to another entity." },
  ];

  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [letterBank, setLetterBank] = useState([]);
  const [userGuess, setUserGuess] = useState([]);
  const [scrambleStatus, setScrambleStatus] = useState("playing"); // "playing" | "correct" | "incorrect"

  const startScramble = (index = 0) => {
    const safeIdx = index % scrambleTerms.length;
    setScrambleIndex(safeIdx);
    const item = scrambleTerms[safeIdx];
    const letters = item.word.split("");
    // Shuffle
    const shuffled = letters
      .map((l, i) => ({ id: i, letter: l }))
      .sort(() => 0.5 - Math.random());

    setLetterBank(shuffled);
    setUserGuess([]);
    setScrambleStatus("playing");
  };

  const handleBankPress = (item) => {
    if (scrambleStatus !== "playing") return;
    setLetterBank((prev) => prev.filter((l) => l.id !== item.id));
    setUserGuess((prev) => [...prev, item]);
  };

  const handleGuessPress = (item) => {
    if (scrambleStatus !== "playing") return;
    setUserGuess((prev) => prev.filter((l) => l.id !== item.id));
    setLetterBank((prev) => [...prev, item]);
  };

  const verifyScramble = async () => {
    const item = scrambleTerms[scrambleIndex];
    const guessString = userGuess.map((g) => g.letter).join("");

    if (guessString === item.word) {
      setScrambleStatus("correct");
      await updateFirebaseCoins(100);
    } else {
      setScrambleStatus("incorrect");
    }
  };

  const revealHint = () => {
    const item = scrambleTerms[scrambleIndex];
    Alert.alert("💡 Hint", `The word starts with the letter "${item.word[0]}".`);
  };

  const solveTerm = () => {
    const item = scrambleTerms[scrambleIndex];
    const letters = item.word.split("").map((l, i) => ({ id: i, letter: l }));
    setUserGuess(letters);
    setLetterBank([]);
    setScrambleStatus("incorrect");
  };

  // ==========================================
  // 🎨 RENDER ROUTER
  // ==========================================

  // Menu Loader
  if (loadingCoins || checkingQuiz) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Syncing Game Stats...</Text>
      </View>
    );
  }

  // GAME MENU DASHBOARD
  if (activeGame === "menu") {
    return (
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.menuHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <Ionicons name="arrow-back" size={26} color="#111" />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <View>
              <Text style={styles.hubTitle}>Game Hub</Text>
              <Text style={styles.hubSubtitle}>Boost Finance IQ & Earn Coins! 🏆</Text>
            </View>
            <View style={styles.coinsDisplay}>
              <Text style={styles.coinsDisplayText}>💰 {userCoins}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.menuScroll} showsVerticalScrollIndicator={false}>
          {/* DAILY QUIZ CARD */}
          <View style={styles.gameCard}>
            <View style={[styles.gameCardGlow, { backgroundColor: "rgba(255, 107, 107, 0.15)" }]} />
            <View style={styles.gameCardHeader}>
              <View style={[styles.gameIconBox, { backgroundColor: "#FFEAEB" }]}>
                <Ionicons name="bulb-outline" size={28} color="#FF6B6B" />
              </View>
              <View style={styles.gameTitleBox}>
                <Text style={styles.gameTitle}>Daily Finance Quiz</Text>
                <Text style={styles.gameReward}>Earn up to 1,000 Coins Daily</Text>
              </View>
            </View>
            <Text style={styles.gameDesc}>
              Answer 5 finance questions. Standard multi-choice, but now with instant explanations to learn from mistake reviews!
            </Text>
            {quizPlayedToday ? (
              <View style={styles.playedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#30B566" />
                <Text style={styles.playedBadgeText}>Completed For Today</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.playBtn, { backgroundColor: "#FF6B6B" }]}
                onPress={() => {
                  startQuiz();
                  setActiveGame("quiz");
                }}
              >
                <Text style={styles.playBtnText}>Launch Quiz 🧠</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* MARKET PREDICTOR CARD */}
          <View style={styles.gameCard}>
            <View style={[styles.gameCardGlow, { backgroundColor: "rgba(78, 172, 255, 0.15)" }]} />
            <View style={styles.gameCardHeader}>
              <View style={[styles.gameIconBox, { backgroundColor: "#E6F3FF" }]}>
                <Ionicons name="trending-up-outline" size={28} color="#4EACFF" />
              </View>
              <View style={styles.gameTitleBox}>
                <Text style={styles.gameTitle}>Market Predictor</Text>
                <Text style={styles.gameReward}>Double Your Staked Coins</Text>
              </View>
            </View>
            <Text style={styles.gameDesc}>
              {"Analyze a simulated startup's hype, team, and risk. Decide if it goes BULL 📈 or BEAR 📉!"}
            </Text>
            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: "#4EACFF" }]}
              onPress={() => {
                startPredictor();
                setActiveGame("predictor");
              }}
            >
              <Text style={styles.playBtnText}>Predict Market 🚀</Text>
            </TouchableOpacity>
          </View>

          {/* TERM UNSCRAMBLER CARD */}
          <View style={styles.gameCard}>
            <View style={[styles.gameCardGlow, { backgroundColor: "rgba(182, 115, 252, 0.15)" }]} />
            <View style={styles.gameCardHeader}>
              <View style={[styles.gameIconBox, { backgroundColor: "#F7EEFF" }]}>
                <Ionicons name="text-outline" size={28} color="#B673FC" />
              </View>
              <View style={styles.gameTitleBox}>
                <Text style={styles.gameTitle}>Vocabulary Unscrambler</Text>
                <Text style={styles.gameReward}>100 Coins Per Term</Text>
              </View>
            </View>
            <Text style={styles.gameDesc}>
              Unravel scrambled letter tokens using deep finance clues. Broaden your investor vocab!
            </Text>
            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: "#B673FC" }]}
              onPress={() => {
                startScramble(0);
                setActiveGame("scramble");
              }}
            >
              <Text style={styles.playBtnText}>Unscramble Term 🧩</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // GAME A: RENDER DAILY QUIZ
  // ==========================================
  if (activeGame === "quiz") {
    if (selectedQuestions.length === 0) return null;
    const currentQ = selectedQuestions[currentQuestionIdx];

    return (
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={() => setActiveGame("menu")} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.gameHeaderTitle}>Daily Quiz Challenge</Text>
          <View style={styles.headerCoins}>
            <Text style={styles.headerCoinsText}>💰 {userCoins}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.gameScroll} showsVerticalScrollIndicator={false}>
          {/* PROGRESS */}
          <View style={styles.progressContainer}>
            <Text style={styles.questionCountText}>Question {currentQuestionIdx + 1} of 5</Text>
            <View style={styles.progressRow}>
              {[0, 1, 2, 3, 4].map((idx) => (
                <View
                  key={idx}
                  style={[
                    styles.progressDot,
                    currentQuestionIdx >= idx && { backgroundColor: "#FF6B6B" },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* QUESTION BOX */}
          <View style={styles.quizQuestionCard}>
            <Text style={styles.quizQuestionText}>{currentQ.question}</Text>
          </View>

          {/* OPTIONS */}
          <View style={styles.quizOptionsBox}>
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === currentQ.answer;
              const isAnswered = quizStatus === "answered";

              let optionStyle = styles.quizOptionBtn;
              let optionTextStyle = styles.quizOptionText;

              if (isAnswered) {
                if (isCorrectOption) {
                  optionStyle = [styles.quizOptionBtn, styles.quizCorrectOption];
                  optionTextStyle = [styles.quizOptionText, styles.quizCorrectText];
                } else if (isSelected) {
                  optionStyle = [styles.quizOptionBtn, styles.quizWrongOption];
                  optionTextStyle = [styles.quizOptionText, styles.quizWrongText];
                }
              }

              return (
                <TouchableOpacity
                  key={idx}
                  disabled={isAnswered}
                  style={optionStyle}
                  onPress={() => handleQuizAnswer(option)}
                  activeOpacity={0.7}
                >
                  <Text style={optionTextStyle}>{option}</Text>
                  {isAnswered && isCorrectOption && (
                    <Ionicons name="checkmark-circle" size={22} color="#30B566" />
                  )}
                  {isAnswered && isSelected && !isCorrectOption && (
                    <Ionicons name="close-circle" size={22} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* FEEDBACK & EXPLANATION */}
          {quizStatus === "answered" && (
            <View style={styles.quizFeedbackCard}>
              <View style={styles.feedbackTitleRow}>
                {selectedOption === currentQ.answer ? (
                  <Text style={styles.feedbackTitleCorrect}>✅ Magnificent! Correct Answer</Text>
                ) : (
                  <Text style={styles.feedbackTitleWrong}>❌ Incorrect Answer</Text>
                )}
                <TouchableOpacity
                  style={styles.explainToggleBtn}
                  onPress={() => setShowExplanation(!showExplanation)}
                >
                  <Text style={styles.explainToggleText}>
                    {showExplanation ? "Hide Explanation ✖" : "💡 Explain Why"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showExplanation && (
                <View style={styles.quizExplanationCard}>
                  <Text style={styles.quizExplanationLabel}>FINANCE CONTEXT:</Text>
                  <Text style={styles.quizExplanationText}>{currentQ.explanation}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.quizNextBtn} onPress={handleNextQuizQuestion}>
                <Text style={styles.quizNextBtnText}>
                  {currentQuestionIdx < 4 ? "Next Question →" : "Finish Quiz 🏆"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // GAME B: RENDER MARKET PREDICTOR
  // ==========================================
  if (activeGame === "predictor") {
    if (!predictorStartup) return null;

    return (
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={() => setActiveGame("menu")} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.gameHeaderTitle}>Market Predictor</Text>
          <View style={styles.headerCoins}>
            <Text style={styles.headerCoinsText}>💰 {userCoins}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.gameScroll} showsVerticalScrollIndicator={false}>
          {/* SIMULATED PITCH CARD */}
          <View style={styles.predictorPitchCard}>
            <View style={styles.pitchHeader}>
              <View>
                <Text style={styles.pitchName}>{predictorStartup.name}</Text>
                <Text style={styles.pitchSector}>🚀 {predictorStartup.sector} Sector</Text>
              </View>
              <View style={styles.pitchHypeBadge}>
                <Text style={styles.pitchHypeText}>{predictorStartup.hype}</Text>
              </View>
            </View>

            <Text style={styles.pitchDesc}>{predictorStartup.description}</Text>

            <View style={styles.pitchStatsDivider} />

            <View style={styles.pitchStatsRow}>
              <View style={styles.pitchStatBox}>
                <Text style={styles.pitchStatLabel}>TEAM STRENGTH</Text>
                <Text style={styles.pitchStatVal}>{predictorStartup.team}</Text>
              </View>
              <View style={styles.pitchStatBox}>
                <Text style={styles.pitchStatLabel}>SECTOR RISK</Text>
                <Text style={styles.pitchStatVal}>{predictorStartup.risk}</Text>
              </View>
            </View>
          </View>

          {predictorStatus === "betting" && (
            <View style={styles.predictorBettingCard}>
              <Text style={styles.bettingLabel}>SELECT YOUR STAKE:</Text>
              <View style={styles.stakeRow}>
                {[50, 100, 200].map((stake) => (
                  <TouchableOpacity
                    key={stake}
                    style={[
                      styles.stakeBtn,
                      predictorStake === stake && styles.activeStakeBtn,
                    ]}
                    onPress={() => setPredictorStake(stake)}
                  >
                    <Text
                      style={[
                        styles.stakeBtnText,
                        predictorStake === stake && styles.activeStakeBtnText,
                      ]}
                    >
                      💰 {stake}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.predictorInstruction}>
                Do you think this startup will BULL (go Up 📈) or BEAR (go Down 📉) in the next virtual market cycle?
              </Text>

              <View style={styles.predictorActionsRow}>
                <TouchableOpacity
                  style={[styles.predictBtn, styles.bullBtn]}
                  onPress={() => handlePredict("BULL")}
                >
                  <Ionicons name="trending-up" size={24} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.predictBtnText}>BULL (Up 📈)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.predictBtn, styles.bearBtn]}
                  onPress={() => handlePredict("BEAR")}
                >
                  <Ionicons name="trending-down" size={24} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.predictBtnText}>BEAR (Down 📉)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {predictorStatus === "simulating" && (
            <View style={styles.simulatingCard}>
              <ActivityIndicator size="large" color="#4EACFF" />
              <Text style={styles.simulatingText}>Simulating Market Cycle...</Text>
              <Text style={styles.tickerText}>Calculating volatility spreads...</Text>
            </View>
          )}

          {predictorStatus === "resolved" && predictorResult && (
            <View style={styles.resolutionCard}>
              <View style={styles.resolutionHeader}>
                {predictorResult.win ? (
                  <View style={[styles.resIcon, { backgroundColor: "#DDF8E4" }]}>
                    <Ionicons name="trophy-outline" size={42} color="#30B566" />
                  </View>
                ) : (
                  <View style={[styles.resIcon, { backgroundColor: "#FFE2E2" }]}>
                    <Ionicons name="alert-circle-outline" size={42} color="#FF6B6B" />
                  </View>
                )}
                <Text style={predictorResult.win ? styles.resTitleWin : styles.resTitleLoss}>
                  {predictorResult.win ? "WINNING PREDICTION!" : "MARKET DECLINED"}
                </Text>
              </View>

              <Text style={styles.resDescription}>
                During this virtual cycle, <Text style={{ fontWeight: "bold" }}>{predictorStartup.name}</Text> resolved as a{" "}
                <Text
                  style={{
                    color: predictorResult.outcome === "BULL" ? "#30B566" : "#FF6B6B",
                    fontWeight: "bold",
                  }}
                >
                  {predictorResult.outcome} ({predictorResult.outcome === "BULL" ? "+" : "-"}{predictorResult.percentage}%)
                </Text>
                .
              </Text>

              <View style={styles.payoutCard}>
                <Text style={styles.payoutLabel}>PAYOUT RETURN</Text>
                <Text style={styles.payoutCoins}>
                  {predictorResult.win ? `+💰 ${predictorResult.payout}` : `-💰 ${predictorStake}`}
                </Text>
              </View>

              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#4EACFF" }]} onPress={startPredictor}>
                <Text style={styles.actionBtnText}>Analyze New Pitch ⏭</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // GAME C: RENDER TERM UNSCRAMBLER
  // ==========================================
  if (activeGame === "scramble") {
    const term = scrambleTerms[scrambleIndex];

    return (
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={() => setActiveGame("menu")} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.gameHeaderTitle}>Vocabulary Builder</Text>
          <View style={styles.headerCoins}>
            <Text style={styles.headerCoinsText}>💰 {userCoins}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.gameScroll} showsVerticalScrollIndicator={false}>
          {/* DEFINITION CARD */}
          <View style={styles.clueCard}>
            <Text style={styles.clueLabel}>DEFINING CLUE:</Text>
            <Text style={styles.clueText}>&quot;{term.clue}&quot;</Text>
          </View>

          {/* GUESS AREA */}
          <View style={styles.guessBox}>
            <Text style={styles.guessBoxLabel}>YOUR GUESS:</Text>
            <View style={styles.guessLettersRow}>
              {userGuess.length === 0 ? (
                <Text style={styles.guessPlaceholder}>Tap letters below to spell word...</Text>
              ) : (
                userGuess.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={styles.guessLetterToken}
                    onPress={() => handleGuessPress(g)}
                  >
                    <Text style={styles.letterTokenText}>{g.letter}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          {/* BANK AREA */}
          {scrambleStatus === "playing" && (
            <View style={styles.bankBox}>
              <Text style={styles.bankLabel}>LETTER BANK:</Text>
              <View style={styles.bankLettersRow}>
                {letterBank.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={styles.bankLetterToken}
                    onPress={() => handleBankPress(b)}
                  >
                    <Text style={styles.letterTokenText}>{b.letter}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* RESULT STATUS */}
          {scrambleStatus !== "playing" && (
            <View
              style={[
                styles.scrambleResCard,
                scrambleStatus === "correct" ? styles.scrambleResCorrect : styles.scrambleResWrong,
              ]}
            >
              <Text
                style={
                  scrambleStatus === "correct" ? styles.scrambleResTextCorrect : styles.scrambleResTextWrong
                }
              >
                {scrambleStatus === "correct" ? "🎉 CORRECT! +100 COINS" : `❌ INCORRECT!`}
              </Text>
              <Text style={styles.scrambleSolutionText}>The financial term is: {term.word}</Text>
            </View>
          )}

          {/* GAME CONTROLS */}
          <View style={styles.scrambleControlsBox}>
            {scrambleStatus === "playing" ? (
              <>
                <TouchableOpacity
                  style={[styles.scrambleVerifyBtn, userGuess.length < term.word.length && { opacity: 0.5 }]}
                  disabled={userGuess.length < term.word.length}
                  onPress={verifyScramble}
                >
                  <Text style={styles.scrambleVerifyText}>Verify Answer 🚀</Text>
                </TouchableOpacity>

                <View style={styles.scrambleAltActions}>
                  <TouchableOpacity style={styles.scrambleSubBtn} onPress={revealHint}>
                    <Text style={styles.scrambleSubText}>💡 Show Hint</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.scrambleSubBtn} onPress={solveTerm}>
                    <Text style={styles.scrambleSubText}>🏳️ Solve Term</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#B673FC" }]}
                onPress={() => startScramble(scrambleIndex + 1)}
              >
                <Text style={styles.actionBtnText}>Next Term 🧩</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F2EA",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F2EA",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#6B6B6B",
    fontWeight: "600",
  },

  // ==========================================
  // GAME MENU DASHBOARD STYLES
  // ==========================================
  menuHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerBackBtn: {
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hubTitle: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#0D0D0D",
    letterSpacing: -1,
  },
  hubSubtitle: {
    fontSize: 14,
    color: "#6B6B6B",
    fontWeight: "500",
    marginTop: 2,
  },
  coinsDisplay: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  coinsDisplayText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  menuScroll: {
    padding: 24,
    paddingBottom: 60,
  },
  gameCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  gameCardGlow: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  gameCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  gameIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  gameTitleBox: {
    marginLeft: 14,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D0D0D",
  },
  gameReward: {
    fontSize: 13,
    color: "#777",
    fontWeight: "600",
    marginTop: 1,
  },
  gameDesc: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 18,
  },
  playBtn: {
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  playBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  playedBadge: {
    flexDirection: "row",
    backgroundColor: "#EBF7EE",
    paddingVertical: 12,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A9E2B9",
  },
  playedBadgeText: {
    color: "#279653",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },

  // ==========================================
  // SHARED SUBGAME HEADER STYLES
  // ==========================================
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  gameHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D0D0D",
  },
  headerCoins: {
    backgroundColor: "#F7F2EA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  headerCoinsText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#444",
  },
  gameScroll: {
    padding: 24,
    paddingBottom: 80,
  },

  // ==========================================
  // GAME A: DAILY QUIZ SPECIFIC STYLES
  // ==========================================
  progressContainer: {
    marginBottom: 20,
  },
  questionCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressDot: {
    flex: 1,
    height: 6,
    backgroundColor: "#DDD6C8",
    borderRadius: 10,
    marginRight: 6,
  },
  quizQuestionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  quizQuestionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D0D0D",
    lineHeight: 32,
  },
  quizOptionsBox: {
    marginBottom: 20,
  },
  quizOptionBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  quizOptionText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "600",
    width: "85%",
  },
  quizCorrectOption: {
    backgroundColor: "#EBF7EE",
    borderWidth: 1.5,
    borderColor: "#30B566",
  },
  quizCorrectText: {
    color: "#279653",
  },
  quizWrongOption: {
    backgroundColor: "#FFEAEA",
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
  },
  quizWrongText: {
    color: "#D84A4A",
  },
  quizFeedbackCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  feedbackTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feedbackTitleCorrect: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#279653",
  },
  feedbackTitleWrong: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D84A4A",
  },
  explainToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F7F2EA",
    borderRadius: 8,
  },
  explainToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
  },
  quizExplanationCard: {
    marginTop: 15,
    backgroundColor: "#F7F5EE",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#DDD6C8",
  },
  quizExplanationLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 4,
  },
  quizExplanationText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  quizNextBtn: {
    backgroundColor: "#050505",
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: "center",
    marginTop: 18,
  },
  quizNextBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  // ==========================================
  // GAME B: PREDICTOR SPECIFIC STYLES
  // ==========================================
  predictorPitchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  pitchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  pitchName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D0D0D",
  },
  pitchSector: {
    fontSize: 14,
    color: "#777",
    fontWeight: "600",
    marginTop: 2,
  },
  pitchHypeBadge: {
    backgroundColor: "#E6F3FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  pitchHypeText: {
    color: "#4EACFF",
    fontWeight: "700",
    fontSize: 12,
  },
  pitchDesc: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  pitchStatsDivider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginVertical: 18,
  },
  pitchStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pitchStatBox: {
    width: "48%",
  },
  pitchStatLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#999",
    marginBottom: 4,
  },
  pitchStatVal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  predictorBettingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  bettingLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#777",
    marginBottom: 12,
  },
  stakeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  stakeBtn: {
    flex: 1,
    backgroundColor: "#F7F2EA",
    paddingVertical: 14,
    borderRadius: 14,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  activeStakeBtn: {
    backgroundColor: "#FFFFFF",
    borderColor: "#4EACFF",
  },
  stakeBtnText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#555",
  },
  activeStakeBtnText: {
    color: "#4EACFF",
  },
  predictorInstruction: {
    fontSize: 14,
    color: "#6B6B6B",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  predictorActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  predictBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 99,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bullBtn: {
    backgroundColor: "#30B566",
  },
  bearBtn: {
    backgroundColor: "#FF6B6B",
  },
  predictBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  simulatingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  simulatingText: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  tickerText: {
    marginTop: 8,
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
  },
  resolutionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  resolutionHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  resIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  resTitleWin: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#279653",
  },
  resTitleLoss: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#D84A4A",
  },
  resDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  payoutCard: {
    backgroundColor: "#F7F2EA",
    width: "100%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 22,
  },
  payoutLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 4,
  },
  payoutCoins: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },
  actionBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  // ==========================================
  // GAME C: UNSCRAMBLER SPECIFIC STYLES
  // ==========================================
  clueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  clueLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#999",
    marginBottom: 6,
  },
  clueText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    lineHeight: 26,
  },
  guessBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  guessBoxLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#999",
    marginBottom: 14,
  },
  guessLettersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    minHeight: 48,
    alignItems: "center",
  },
  guessPlaceholder: {
    fontSize: 14,
    color: "#AAA",
    fontStyle: "italic",
  },
  guessLetterToken: {
    backgroundColor: "#333",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    margin: 4,
    minWidth: 40,
    alignItems: "center",
  },
  letterTokenText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  bankBox: {
    backgroundColor: "#F7F2EA",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#DDD6C8",
    borderStyle: "dashed",
  },
  bankLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 14,
  },
  bankLettersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  bankLetterToken: {
    backgroundColor: "#B673FC",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    margin: 4,
    minWidth: 40,
    alignItems: "center",
    shadowColor: "#B673FC",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  scrambleResCard: {
    borderRadius: 24,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
  },
  scrambleResCorrect: {
    backgroundColor: "#EBF7EE",
    borderWidth: 1.5,
    borderColor: "#30B566",
  },
  scrambleResWrong: {
    backgroundColor: "#FFEAEA",
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
  },
  scrambleResTextCorrect: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#279653",
    marginBottom: 4,
  },
  scrambleResTextWrong: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D84A4A",
    marginBottom: 4,
  },
  scrambleSolutionText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  scrambleControlsBox: {
    width: "100%",
  },
  scrambleVerifyBtn: {
    width: "100%",
    backgroundColor: "#050505",
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  scrambleVerifyText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  scrambleAltActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scrambleSubBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  scrambleSubText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
  },
});