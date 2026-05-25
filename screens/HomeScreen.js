import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";

import {
  useState,
  useEffect,
} from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  increment,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase";

export default function HomeScreen({
  navigation,
}) {

  const [ideas, setIdeas] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [userCoins, setUserCoins] =
    useState(0);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

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

    const unsub =
      onSnapshot(
        collection(db, "ideas"),
        (snapshot) => {

          const data =
            snapshot.docs.map(
              (docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
              })
            );

          // 🔥 TRENDING SORT
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

  // 🔥 USER COINS
  useEffect(() => {

    const user =
      auth.currentUser;

    if (!user) return;

    const unsub =
      onSnapshot(
        doc(
          db,
          "users",
          user.uid
        ),
        (snap) => {

          if (
            snap.exists()
          ) {

            setUserCoins(
              snap.data().coins || 0
            );
          }
        }
      );

    return () => unsub();

  }, []);

  // ❤️ SUPPORT
  const handleLike = async (item) => {

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

      // ❤️ REMOVE SUPPORT
      if (alreadyLiked) {

        await updateDoc(
          doc(
            db,
            "ideas",
            item.id
          ),
          {
            likes:
              increment(-1),

            likedBy:
              arrayRemove(
                user.uid
              ),
          }
        );

      } else {

        // ❌ REMOVE WEAK
        if (
          item.weakBy?.includes(
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
                arrayRemove(
                  user.uid
                ),
            }
          );
        }

        // ❤️ ADD SUPPORT
        await updateDoc(
          doc(
            db,
            "ideas",
            item.id
          ),
          {
            likes:
              increment(1),

            likedBy:
              arrayUnion(
                user.uid
              ),
          }
        );
      }

    } catch (err) {

      console.log(err);

      alert(
        "Error: " + err.message
      );
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

        const alreadyWeak =
          item.weakBy?.includes(
            user.uid
          );

        // ❌ REMOVE WEAK
        if (alreadyWeak) {

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
                arrayRemove(
                  user.uid
                ),
            }
          );

        } else {

          // ❤️ REMOVE SUPPORT
          if (
            item.likedBy?.includes(
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
                  increment(-1),

                likedBy:
                  arrayRemove(
                    user.uid
                  ),
              }
            );
          }

          // 📉 ADD WEAK
          await updateDoc(
            doc(
              db,
              "ideas",
              item.id
            ),
            {
              weakCount:
                increment(1),

              weakBy:
                arrayUnion(
                  user.uid
                ),
            }
          );
        }

      } catch (err) {

        console.log(err);

        alert(
          "Error: " + err.message
        );
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

        if (
          userCoins < 100
        ) {

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
            userId:
              user.uid,

            ideaId:
              item.id,

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
          "Error: " + err.message
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
            "You cannot join your own team 😭"
          );

          return;
        }

        // 🔥 SAVE REQUEST
        await addDoc(
          collection(
            db,
            "teamRequests"
          ),
          {
            ownerId:
              item.userId,

            senderId:
              user.uid,

            senderEmail:
              user.email,

            ideaId:
              item.id,

            ideaTitle:
              item.title,

            status:
              "pending",

            createdAt:
              serverTimestamp(),
          }
        );

        alert(
          "🤝 Team request sent!"
        );

      } catch (err) {

        console.log(err);

        alert(
          "Error: " + err.message
        );
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
      <View style={styles.header}>

        <Text style={styles.heading}>
          Discover Ideas
        </Text>

        <Text style={styles.coins}>
          💰 {userCoins}
        </Text>

        {/* SEARCH */}
        <TextInput
          placeholder="Search startup ideas..."
          placeholderTextColor="#999"
          style={styles.search}
          value={search}
          onChangeText={
            setSearch
          }
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
            style={
              styles.quizText
            }
          >
            🏆 Play Finance Arcade & Earn Coins 🎮
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

      </View>

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

          const isTrending =
            (item.likes || 0) > 5 ||
            (item.coins || 0) > 500;

          return (

            <View
              key={item.id}
              style={styles.card}
            >

              {/* TOP */}
              <View
                style={
                  styles.topRow
                }
              >

                <View
                  style={{
                    flex: 1,
                  }}
                >

                  <Text
                    style={
                      styles.title
                    }
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={
                      styles.category
                    }
                  >
                    {item.category}
                  </Text>

                  {/* 🔥 USER NAME */}
                  <Text
                    style={
                      styles.username
                    }
                  >
                    👤 by{" "}
                    {item.userName ||
                      "Anonymous"}
                  </Text>

                </View>

                {isTrending && (

                  <View
                    style={
                      styles.trending
                    }
                  >

                    <Text
                      style={
                        styles.trendingText
                      }
                    >
                      🔥 Trending
                    </Text>

                  </View>
                )}

              </View>

              {/* AI */}
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
                  styles.statsRow
                }
              >

                <Text
                  style={
                    styles.stat
                  }
                >
                  💰{" "}
                  {item.coins || 0}
                </Text>

                <Text
                  style={
                    styles.stat
                  }
                >
                  ❤️{" "}
                  {item.likes || 0}
                </Text>

                <Text
                  style={
                    styles.stat
                  }
                >
                  📉{" "}
                  {item.weakCount || 0}
                </Text>

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
                      styles.emoji
                    }
                  >
                    {isSupported
                      ? "❤️"
                      : "🤍"}
                  </Text>

                  <Text
                    style={[
                      styles.actionText,

                      {
                        color:
                          isSupported
                            ? "#fff"
                            : "#111",
                      },
                    ]}
                  >
                    {isSupported
                      ? "Supported"
                      : "Support"}
                  </Text>

                </TouchableOpacity>

                {/* WEAK */}
                <TouchableOpacity
                  style={[
                    styles.likeBtn,

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
                      styles.emoji
                    }
                  >
                    📉
                  </Text>

                  <Text
                    style={[
                      styles.actionText,

                      {
                        color:
                          isWeak
                            ? "#fff"
                            : "#111",
                      },
                    ]}
                  >
                    Weak Pitch
                  </Text>

                </TouchableOpacity>

              </View>

              {/* BUTTONS */}
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

                {/* TEAM */}
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
                      styles.teamBtnText
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
        style={{ height: 120 }}
      />

    </ScrollView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F7F2EA",
    },

    header: {
      paddingTop: 65,
      paddingHorizontal: 22,
      paddingBottom: 24,
    },

    heading: {
      fontSize: 38,
      fontWeight: "bold",
      color: "#111",
    },

    coins: {
      marginTop: 8,
      color: "#666",
      fontSize: 16,
    },

    search: {
      backgroundColor:
        "#fff",
      marginTop: 22,
      borderRadius: 22,
      padding: 18,
      fontSize: 15,
      elevation: 2,
    },

    quizBtn: {
      backgroundColor:
        "#FF6B6B",
      marginTop: 18,
      padding: 18,
      borderRadius: 22,
      alignItems: "center",
      shadowColor: "#FF6B6B",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
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
      backgroundColor:
        "#fff",
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 999,
      marginRight: 10,
    },

    activeFilter: {
      backgroundColor:
        "#111",
    },

    filterText: {
      color: "#444",
      fontWeight: "600",
    },

    activeFilterText: {
      color: "#fff",
    },

    card: {
      backgroundColor:
        "#fff",
      marginHorizontal: 18,
      marginBottom: 18,
      borderRadius: 30,
      padding: 22,
      elevation: 3,
    },

    topRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#111",
    },

    category: {
      marginTop: 6,
      color: "#777",
    },

    username: {
      marginTop: 8,
      color: "#999",
      fontSize: 13,
      fontWeight: "600",
    },

    trending: {
      backgroundColor:
        "#111",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
    },

    trendingText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 12,
    },

    aiBox: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      backgroundColor:
        "#F5F0E6",
      borderRadius: 20,
      padding: 16,
      marginTop: 18,
    },

    aiText: {
      color: "#444",
      fontWeight: "600",
    },

    text: {
      marginTop: 16,
      color: "#444",
      lineHeight: 24,
      fontSize: 15,
    },

    statsRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 22,
    },

    stat: {
      fontWeight: "600",
      color: "#444",
    },

    actions: {
      flexDirection: "row",
      marginTop: 22,
    },

    likeBtn: {
      flex: 1,
      backgroundColor:
        "#F5F0E6",
      padding: 16,
      borderRadius: 20,
      alignItems: "center",
      marginRight: 8,
    },

    activeLikeBtn: {
      backgroundColor:
        "#111",
    },

    activeWeakBtn: {
      backgroundColor:
        "#2C2C2C",
    },

    emoji: {
      fontSize: 26,
    },

    actionText: {
      marginTop: 8,
      fontWeight: "bold",
    },

    bottomActions: {
      flexDirection: "row",
      marginTop: 22,
    },

    investBtn: {
      flex: 1,
      backgroundColor:
        "#111",
      padding: 18,
      borderRadius: 22,
      alignItems: "center",
      marginRight: 8,
    },

    teamBtn: {
      flex: 1,
      backgroundColor:
        "#D9B44A",
      padding: 18,
      borderRadius: 22,
      alignItems: "center",
      marginLeft: 8,
    },

    btnText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 15,
    },

    teamBtnText: {
      color: "#111",
      fontWeight: "bold",
      fontSize: 15,
    },
  });