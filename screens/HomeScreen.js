import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const categories = [
    "All",
    "AI",
    "Tech",
    "Healthcare",
    "Education",
    "Finance",
    "Gaming",
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

  // ❤️ SUPPORT
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

      const likedUsers =
        item.likedBy || [];

      const alreadyLiked =
        likedUsers.includes(
          user.uid
        );

      if (alreadyLiked) {
        // REMOVE SUPPORT
        await updateDoc(
          doc(
            db,
            "ideas",
            item.id
          ),
          {
            likes: increment(-1),

            likedBy:
              likedUsers.filter(
                (id) =>
                  id !== user.uid
              ),
          }
        );
      } else {
        // REMOVE WEAK IF EXIST
        const weakUsers =
          item.weakBy || [];

        if (
          weakUsers.includes(
            user.uid
          )
        ) {
          await updateDoc(
            doc(
              db,
              "ideas",
              item.id
            ),
            {
              weakCount:
                increment(-1),

              weakBy:
                weakUsers.filter(
                  (
                    id
                  ) =>
                    id !==
                    user.uid
                ),
            }
          );
        }

        // ADD SUPPORT
        await updateDoc(
          doc(
            db,
            "ideas",
            item.id
          ),
          {
            likes: increment(1),

            likedBy: [
              ...likedUsers,
              user.uid,
            ],
          }
        );
      }

    } catch (err) {
      console.log(err);
    }
  };

  // 📉 WEAK PITCH
  const handleWeakPitch =
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

        const weakUsers =
          item.weakBy || [];

        const alreadyWeak =
          weakUsers.includes(
            user.uid
          );

        if (alreadyWeak) {
          // REMOVE WEAK
          await updateDoc(
            doc(
              db,
              "ideas",
              item.id
            ),
            {
              weakCount:
                increment(-1),

              weakBy:
                weakUsers.filter(
                  (
                    id
                  ) =>
                    id !==
                    user.uid
                ),
            }
          );
        } else {
          // REMOVE SUPPORT
          const likedUsers =
            item.likedBy || [];

          if (
            likedUsers.includes(
              user.uid
            )
          ) {
            await updateDoc(
              doc(
                db,
                "ideas",
                item.id
              ),
              {
                likes:
                  increment(
                    -1
                  ),

                likedBy:
                  likedUsers.filter(
                    (
                      id
                    ) =>
                      id !==
                      user.uid
                  ),
              }
            );
          }

          // ADD WEAK
          await updateDoc(
            doc(
              db,
              "ideas",
              item.id
            ),
            {
              weakCount:
                increment(1),

              weakBy: [
                ...weakUsers,
                user.uid,
              ],
            }
          );
        }

      } catch (err) {
        console.log(err);
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

        // IDEA COINS +
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

        // USER COINS -
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

        // SAVE INVESTMENT
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
      }
    };

  // 🔍 FILTER
  const filteredIdeas =
    ideas.filter((item) => {
      const matchesSearch =
        item.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

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

        {/* QUIZ */}
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
          const isSupported =
            item.likedBy?.includes(
              auth.currentUser?.uid
            );

          const isWeak =
            item.weakBy?.includes(
              auth.currentUser?.uid
            );

          return (
            <View
              key={item.id}
              style={styles.card}
            >
              {/* TITLE */}
              <Text
                style={styles.title}
              >
                {item.title}
              </Text>

              {/* CATEGORY */}
              <Text
                style={
                  styles.category
                }
              >
                {item.category}
              </Text>

              {/* AI BOX */}
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
                    84}
                  % Success
                </Text>

                <Text
                  style={
                    styles.aiText
                  }
                >
                  🔥{" "}
                  {item.marketDemand ||
                    "High"}{" "}
                  Demand
                </Text>
              </View>

              {/* PROBLEM */}
              <Text
                style={styles.text}
              >
                🧠 {item.problem}
              </Text>

              {/* SOLUTION */}
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

                <View
                  style={{
                    flexDirection:
                      "row",
                    gap: 10,
                  }}
                >
                  <Text>
                    ❤️{" "}
                    {item.likes ||
                      0}
                  </Text>

                  <Text>
                    📉{" "}
                    {item.weakCount ||
                      0}
                  </Text>
                </View>
              </View>

              {/* REACTIONS */}
              <View
                style={
                  styles.actions
                }
              >
                {/* SUPPORT */}
                <TouchableOpacity
                  style={[
                    styles.likeBtn,

                    isSupported &&
                      styles.activeLikeBtn,
                  ]}
                  onPress={() =>
                    handleLike(
                      item
                    )
                  }
                >
                  <Text
                    style={
                      styles.heart
                    }
                  >
                    {isSupported
                      ? "❤️"
                      : "🤍"}
                  </Text>

                  <View>
                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      {isSupported
                        ? "Supported"
                        : "Support"}
                    </Text>

                    <Text
                      style={
                        styles.countText
                      }
                    >
                      ❤️{" "}
                      {item.likes ||
                        0}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* WEAK */}
                <TouchableOpacity
                  style={[
                    styles.commentBtn,

                    isWeak &&
                      styles.activeWeakBtn,
                  ]}
                  onPress={() =>
                    handleWeakPitch(
                      item
                    )
                  }
                >
                  <Text
                    style={
                      styles.weakEmoji
                    }
                  >
                    {isWeak
                      ? "📉"
                      : "📊"}
                  </Text>

                  <View>
                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      Weak Pitch
                    </Text>

                    <Text
                      style={
                        styles.countText
                      }
                    >
                      📉{" "}
                      {item.weakCount ||
                        0}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* BUTTONS */}
              <View
                style={
                  styles.bottomActions
                }
              >
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

                <TouchableOpacity
                  style={
                    styles.teamBtn
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

      <View
        style={{ height: 40 }}
      />
    </ScrollView>
  );
}

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
    fontSize: 24,
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
      "#352D90",
    marginTop: 15,
    padding: 15,
    borderRadius: 18,
    alignItems: "center",
  },

  quizText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  filterRow: {
    marginTop: 20,
  },

  filterBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },

  activeFilter: {
    backgroundColor:
      "#FF4D8D",
  },

  filterText: {
    color: "#444",
  },

  activeFilterText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 18,
    borderRadius: 25,
    elevation: 5,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  category: {
    color: "#888",
    marginTop: 5,
  },

  aiBox: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    backgroundColor:
      "#FFF0F3",
    padding: 12,
    borderRadius: 15,
    marginTop: 15,
  },

  aiText: {
    fontWeight: "600",
    color: "#444",
  },

  text: {
    marginTop: 15,
    fontSize: 15,
    color: "#444",
    lineHeight: 24,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  actions: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginTop: 20,
  },

  likeBtn: {
    flex: 1,
    backgroundColor:
      "#FFE7EC",
    padding: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },

  activeLikeBtn: {
    backgroundColor:
      "#FFD4DF",
    borderWidth: 1,
    borderColor: "#FF4D8D",
  },

  commentBtn: {
    flex: 1,
    backgroundColor:
      "#FFF0E8",
    padding: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },

  activeWeakBtn: {
    backgroundColor:
      "#FFD6D6",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },

  heart: {
    fontSize: 28,
    marginRight: 10,
  },

  weakEmoji: {
    fontSize: 24,
    marginRight: 10,
  },

  actionText: {
    fontWeight: "bold",
    color: "#444",
  },

  countText: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },

  bottomActions: {
    flexDirection: "row",
    marginTop: 20,
  },

  investBtn: {
    flex: 1,
    backgroundColor:
      "#FF6B81",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginRight: 8,
  },

  teamBtn: {
    flex: 1,
    backgroundColor:
      "#352D90",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginLeft: 8,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});