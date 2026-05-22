import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";

// 🔥 FIREBASE
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  increment,
} from "firebase/firestore";

import { db, auth } from "../firebase";

export default function HomeScreen({ navigation }) {
  const [ideas, setIdeas] = useState([]);
  const [search, setSearch] = useState("");
  const [userCoins, setUserCoins] =
    useState(0);

  // 🔥 FILTER
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // 🔥 CATEGORIES
  const categories = [
    "All",
    "AI",
    "Tech",
    "Healthcare",
    "Education",
    "Finance",
  ];

  // 🔥 FETCH IDEAS
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "ideas"),
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        // 🔥 TRENDING TOP
        data.sort((a, b) => {
          const scoreA =
            (a.likes || 0) +
            (a.coins || 0);

          const scoreB =
            (b.likes || 0) +
            (b.coins || 0);

          return scoreB - scoreA;
        });

        setIdeas(data);
      }
    );

    return () => unsub();
  }, []);

  // 🔥 FETCH USER COINS
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        if (snap.exists()) {
          setUserCoins(
            snap.data().coins || 0
          );
        }
      }
    );

    return () => unsub();
  }, []);

  // ❤️ LIKE / UNLIKE
  const handleLike = async (
    item
  ) => {
    try {
      const user =
        auth.currentUser;

      if (!user) {
        alert(
          "Login required 😢"
        );
        return;
      }

      const alreadyLiked =
        item.likedBy?.includes(
          user.uid
        );

      if (alreadyLiked) {
        // 💔 UNLIKE
        await updateDoc(
          doc(
            db,
            "ideas",
            item.id
          ),
          {
            likes: increment(-1),

            likedBy:
              item.likedBy.filter(
                (id) =>
                  id !== user.uid
              ),
          }
        );
      } else {
        // ❤️ LIKE
        await updateDoc(
          doc(
            db,
            "ideas",
            item.id
          ),
          {
            likes: increment(1),

            likedBy: [
              ...(item.likedBy ||
                []),
              user.uid,
            ],
          }
        );
      }

    } catch (err) {
      console.log(err);
      alert("Like failed 😢");
    }
  };

  // 💰 INVEST
  const handleInvest =
    async (item) => {
      try {
        const user =
          auth.currentUser;

        if (!user) {
          alert(
            "Login required 😢"
          );
          return;
        }

        if (userCoins < 100) {
          alert(
            "Not enough coins 😢"
          );
          return;
        }

        // 🔥 IDEA COINS +
        await updateDoc(
          doc(
            db,
            "ideas",
            item.id
          ),
          {
            coins:
              increment(100),
          }
        );

        // 🔥 USER COINS -
        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            coins:
              increment(-100),
          }
        );

        // 🔥 SAVE INVESTMENT
        await addDoc(
          collection(
            db,
            "investments"
          ),
          {
            userId: user.uid,
            ideaId: item.id,
            ideaTitle:
              item.title,
            amount: 100,
            createdAt:
              Date.now(),
          }
        );

        alert(
          "🚀 Invested Successfully"
        );

      } catch (err) {
        console.log(err);
        alert(
          "Investment failed 😢"
        );
      }
    };

  // 🤝 JOIN TEAM
  const handleJoinTeam =
    async (item) => {
      try {
        const user =
          auth.currentUser;

        if (!user) {
          alert(
            "Login required 😢"
          );
          return;
        }

        // ❌ OWN IDEA
        if (
          user.uid ===
          item.userId
        ) {
          alert(
            "This is your own idea 😭"
          );
          return;
        }

        await addDoc(
          collection(
            db,
            "teamRequests"
          ),
          {
            ideaId: item.id,
            ownerId:
              item.userId,

            senderId: user.uid,
            senderEmail:
              user.email,

            ideaTitle:
              item.title,

            status:
              "pending",

            createdAt:
              Date.now(),
          }
        );

        Alert.alert(
          "🚀 Request Sent",
          "Team request sent successfully"
        );

      } catch (err) {
        console.log(err);
        alert(
          "Failed to send request 😢"
        );
      }
    };

  // 🔍 SEARCH + FILTER
  const filteredIdeas =
    ideas.filter((item) => {
      const matchesSearch =
        item.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        item.category
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      // 🔥 SMART FILTER
      const matchesCategory =
        selectedCategory ===
          "All" ||
        item.category
          ?.toLowerCase()
          .includes(
            selectedCategory.toLowerCase()
          );

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HEADER */}
      <LinearGradient
        colors={[
          "#FF8C94",
          "#FFB6C1",
        ]}
        style={styles.header}
      >
        <Text
          style={styles.heading}
        >
          Discover Ideas 💡
        </Text>

        <Text style={styles.coins}>
          💰 {userCoins}
        </Text>

        {/* SEARCH */}
        <TextInput
          placeholder="Search ideas..."
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />

        {/* QUIZ BUTTON */}
        <TouchableOpacity
          style={styles.quizBtn}
          onPress={() =>
            navigation.navigate(
              "Quiz"
            )
          }
        >
          <Text
            style={styles.quizText}
          >
            🎮 Play Finance Quiz
          </Text>
        </TouchableOpacity>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={styles.filterRow}
        >
          {categories.map(
            (cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterBtn,

                  selectedCategory ===
                    cat &&
                    styles.activeFilter,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    cat
                  )
                }
              >
                <Text
                  style={[
                    styles.filterText,

                    selectedCategory ===
                      cat &&
                      styles.activeFilterText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </LinearGradient>

      {/* IDEAS */}
      {filteredIdeas.map(
        (item) => {
          const isTrending =
            (item.coins || 0) >
              500 ||
            (item.likes || 0) >
              5;

          return (
            <View
              key={item.id}
              style={styles.card}
            >
              {/* TITLE */}
              <View
                style={
                  styles.rowBetween
                }
              >
                <Text
                  style={
                    styles.title
                  }
                >
                  {item.title}
                </Text>

                {isTrending && (
                  <Text
                    style={
                      styles.trending
                    }
                  >
                    🔥 Trending
                  </Text>
                )}
              </View>

              {/* CATEGORY */}
              <Text
                style={
                  styles.category
                }
              >
                {item.category}
              </Text>

              {/* AI SCORE */}
              <View
                style={
                  styles.aiBox
                }
              >
                <Text
                  style={
                    styles.aiText
                  }
                >
                  📈{" "}
                  {item.predictionScore ||
                    75}
                  % Success
                </Text>

                <Text
                  style={
                    styles.aiText
                  }
                >
                  🔥{" "}
                  {item.marketDemand ||
                    "Medium"}{" "}
                  Demand
                </Text>
              </View>

              {/* CONTENT */}
              <Text
                style={styles.text}
              >
                🧠 {item.problem}
              </Text>

              <Text
                style={styles.text}
              >
                💡 {item.solution}
              </Text>

              {/* STATS */}
              <View
                style={
                  styles.rowBetween
                }
              >
                <Text>
                  💰{" "}
                  {item.coins ||
                    0}
                </Text>

                <Text>
                  ❤️{" "}
                  {item.likes ||
                    0}
                </Text>
              </View>

              {/* ACTIONS */}
              <View
                style={
                  styles.actions
                }
              >
                {/* LIKE */}
                <TouchableOpacity
                  onPress={() =>
                    handleLike(
                      item
                    )
                  }
                >
                  <Text
                    style={
                      styles.like
                    }
                  >
                    {item.likedBy?.includes(
                      auth
                        .currentUser
                        ?.uid
                    )
                      ? "💔 Unlike"
                      : "❤️ Like"}
                  </Text>
                </TouchableOpacity>

                {/* COMMENTS */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(
                      "Comments",
                      {
                        idea: item,
                      }
                    )
                  }
                >
                  <Text
                    style={
                      styles.comment
                    }
                  >
                    💬 Comments
                  </Text>
                </TouchableOpacity>
              </View>

              {/* BOTTOM ACTIONS */}
              <View
                style={
                  styles.bottomActions
                }
              >
                {/* INVEST */}
                <TouchableOpacity
                  style={
                    styles.investBtn
                  }
                  onPress={() =>
                    handleInvest(
                      item
                    )
                  }
                >
                  <Text
                    style={
                      styles.btnText
                    }
                  >
                    💰 Invest
                  </Text>
                </TouchableOpacity>

                {/* JOIN TEAM */}
                <TouchableOpacity
                  style={
                    styles.teamBtn
                  }
                  onPress={() =>
                    handleJoinTeam(
                      item
                    )
                  }
                >
                  <Text
                    style={
                      styles.btnText
                    }
                  >
                    🤝 Join Team
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }
      )}

      {/* EMPTY */}
      {filteredIdeas.length ===
        0 && (
        <Text style={styles.empty}>
          No ideas found 😢
        </Text>
      )}

      <View
        style={{ height: 40 }}
      />
    </ScrollView>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#FFF5F7",
  },

  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  heading: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  coins: {
    color: "#fff",
    marginTop: 5,
    fontSize: 16,
  },

  search: {
    backgroundColor: "#fff",
    marginTop: 15,
    borderRadius: 20,
    padding: 12,
  },

  quizBtn: {
    backgroundColor:
      "#6C63FF",
    marginTop: 15,
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
  },

  quizText: {
    color: "#fff",
    fontWeight: "bold",
  },

  filterRow: {
    marginTop: 15,
  },

  filterBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  activeFilter: {
    backgroundColor:
      "#FF6B81",
  },

  filterText: {
    color: "#555",
  },

  activeFilterText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 22,
    elevation: 4,
  },

  title: {
    fontWeight: "bold",
    fontSize: 20,
    flex: 1,
  },

  category: {
    color: "#888",
    marginTop: 5,
    fontSize: 14,
  },

  aiBox: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginTop: 12,
    backgroundColor:
      "#FFF0F3",
    padding: 10,
    borderRadius: 12,
  },

  aiText: {
    fontSize: 12,
    color: "#444",
    fontWeight: "600",
  },

  text: {
    marginTop: 10,
    color: "#444",
    lineHeight: 22,
    fontSize: 14,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  actions: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginTop: 18,
  },

  bottomActions: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginTop: 15,
  },

  like: {
    color: "#FF6B81",
    fontWeight: "bold",
  },

  comment: {
    color: "#666",
    fontWeight: "bold",
  },

  investBtn: {
    backgroundColor:
      "#FF8C94",
    flex: 1,
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    marginRight: 8,
  },

  teamBtn: {
    backgroundColor:
      "#6C63FF",
    flex: 1,
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    marginLeft: 8,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  trending: {
    backgroundColor:
      "#FFE066",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
    fontSize: 16,
  },
});