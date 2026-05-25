import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase";

export default function MyIdeasScreen({ navigation }) {

  const [ideas, setIdeas] =
    useState([]);

  // 🔥 FETCH MY IDEAS
  useEffect(() => {

    const user =
      auth.currentUser;

    if (!user) return;

    const q = query(
      collection(db, "ideas"),
      where(
        "userId",
        "==",
        user.uid
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {

          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setIdeas(data);
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // 🔥 DELETE IDEA
  const handleDelete =
    (item) => {

      Alert.alert(
        "Delete Idea",
        "Are you sure you want to delete this idea?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Delete",
            style:
              "destructive",

            onPress:
              async () => {

                await deleteDoc(
                  doc(
                    db,
                    "ideas",
                    item.id
                  )
                );
              },
          },
        ]
      );
    };

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color="#111"
          />
        </TouchableOpacity>

        <Text style={styles.heading}>
          My Ideas
        </Text>

        <Text style={styles.subheading}>
          Manage your posted startup ideas 🚀
        </Text>

      </View>

      {/* IDEAS */}
      {ideas.map((item) => (

        <View
          key={item.id}
          style={styles.card}
        >

          {/* TOP */}
          <View style={styles.topRow}>

            <View>

              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.category}>
                {item.category}
              </Text>

            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Active
              </Text>
            </View>

          </View>

          {/* CONTENT */}
          <Text style={styles.label}>
            Problem
          </Text>

          <Text style={styles.desc}>
            {item.problem}
          </Text>

          <Text style={styles.label}>
            Solution
          </Text>

          <Text style={styles.desc}>
            {item.solution}
          </Text>

          {/* STATS */}
          <View style={styles.statsRow}>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                💰 {item.coins || 0}
              </Text>

              <Text style={styles.statLabel}>
                Coins
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                ❤️ {item.likes || 0}
              </Text>

              <Text style={styles.statLabel}>
                Likes
              </Text>
            </View>

          </View>

          {/* DELETE */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() =>
              handleDelete(item)
            }
          >

            <Text style={styles.deleteText}>
              Delete Idea
            </Text>

          </TouchableOpacity>

        </View>
      ))}

      {/* EMPTY */}
      {ideas.length === 0 && (

        <View style={styles.emptyBox}>

          <Text style={styles.emptyTitle}>
            No Ideas Yet
          </Text>

          <Text style={styles.emptySub}>
            Start posting innovative startup ideas 🚀
          </Text>

        </View>
      )}

      <View style={{ height: 50 }} />

    </ScrollView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F5F0E6",
    },

    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      marginBottom: 20,
    },

    backBtn: {
      marginBottom: 15,
      alignSelf: "flex-start",
      padding: 5,
    },

    heading: {
      fontSize: 38,
      fontWeight: "bold",
      color: "#111",
    },

    subheading: {
      marginTop: 8,
      color: "#777",
      fontSize: 16,
    },

    card: {
      backgroundColor:
        "#fff",

      marginHorizontal: 20,

      marginBottom: 18,

      borderRadius: 28,

      padding: 22,

      shadowColor: "#000",

      shadowOpacity: 0.05,

      shadowRadius: 10,

      elevation: 4,
    },

    topRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginBottom: 18,
    },

    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#111",
    },

    category: {
      color: "#888",
      marginTop: 5,
      fontSize: 14,
    },

    badge: {
      backgroundColor:
        "#F4EFE6",

      paddingHorizontal: 14,

      paddingVertical: 8,

      borderRadius: 999,
    },

    badgeText: {
      color: "#111",
      fontWeight: "600",
      fontSize: 12,
    },

    label: {
      marginTop: 10,
      marginBottom: 5,

      fontWeight: "700",

      color: "#111",

      fontSize: 15,
    },

    desc: {
      color: "#666",
      lineHeight: 24,
      fontSize: 15,
    },

    statsRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      marginTop: 24,
    },

    statBox: {
      backgroundColor:
        "#F8F5EE",

      width: "48%",

      borderRadius: 20,

      padding: 18,

      alignItems: "center",
    },

    statValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#111",
    },

    statLabel: {
      marginTop: 6,
      color: "#888",
      fontWeight: "600",
    },

    deleteBtn: {
      marginTop: 24,

      borderWidth: 1.5,

      borderColor:
        "#FF6B6B",

      borderRadius: 999,

      paddingVertical: 16,

      alignItems: "center",
    },

    deleteText: {
      color: "#FF6B6B",
      fontWeight: "bold",
      fontSize: 16,
    },

    emptyBox: {
      backgroundColor:
        "#fff",

      margin: 20,

      borderRadius: 28,

      padding: 40,

      alignItems: "center",
    },

    emptyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#111",
    },

    emptySub: {
      marginTop: 10,
      color: "#777",
      textAlign: "center",
      lineHeight: 22,
    },
  });