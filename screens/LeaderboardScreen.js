import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { useState, useEffect } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

export default function LeaderboardScreen() {

  const [tab, setTab] =
    useState("ideas");

  const [ideas, setIdeas] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  useEffect(() => {

    const unsubIdeas =
      onSnapshot(
        collection(db, "ideas"),
        (snap) => {

          const data =
            snap.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .sort(
                (a, b) =>
                  (b.coins || 0) -
                  (a.coins || 0)
              );

          setIdeas(data);
        }
      );

    const unsubUsers =
      onSnapshot(
        collection(db, "users"),
        (snap) => {

          const data =
            snap.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .sort(
                (a, b) =>
                  (b.coins || 0) -
                  (a.coins || 0)
              );

          setUsers(data);
        }
      );

    return () => {
      unsubIdeas();
      unsubUsers();
    };

  }, []);

  const data =
    tab === "ideas"
      ? ideas
      : users;

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}
      <View style={styles.header}>

        <Text style={styles.heading}>
          🏆 Leaderboard
        </Text>

        <Text style={styles.subHeading}>
          Top creators & investors
        </Text>

        {/* TABS */}
        <View style={styles.tabs}>

          <TouchableOpacity
            style={[
              styles.tabBtn,

              tab === "ideas" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setTab("ideas")
            }
          >

            <Text
              style={[
                styles.tabText,

                tab === "ideas" &&
                  styles.activeText,
              ]}
            >
              Ideas
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,

              tab === "users" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setTab("users")
            }
          >

            <Text
              style={[
                styles.tabText,

                tab === "users" &&
                  styles.activeText,
              ]}
            >
              Investors
            </Text>

          </TouchableOpacity>

        </View>

      </View>

      {/* LIST */}
      <View style={styles.listContainer}>

        {data.map((item, i) => (

          <View
            key={item.id}
            style={styles.card}
          >

            {/* LEFT */}
            <View style={styles.left}>

              <View
                style={styles.rankCircle}
              >

                <Text
                  style={styles.rank}
                >
                  #{i + 1}
                </Text>

              </View>

              <View>

                <Text
                  style={styles.name}
                >
                  {tab === "ideas"
                    ? item.title
                    : item.name ||
                      "Investor"}
                </Text>

                <Text
                  style={styles.small}
                >
                  {tab === "ideas"
                    ? item.category ||
                      "Startup"
                    : "Top Investor"}
                </Text>

              </View>

            </View>

            {/* RIGHT */}
            <View
              style={styles.coinBox}
            >

              <Text
                style={styles.coin}
              >
                💰{" "}
                {item.coins || 0}
              </Text>

            </View>

          </View>

        ))}

      </View>

      <View
        style={{ height: 40 }}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7F2EA",
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  heading: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#0D0D0D",
  },

  subHeading: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },

  tabs: {
    flexDirection: "row",
    marginTop: 24,
  },

  tabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,

    borderRadius: 999,

    marginRight: 14,

    backgroundColor: "#ECE7DE",
  },

  activeTab: {
    backgroundColor: "#0D0D0D",
  },

  tabText: {
    color: "#666",
    fontWeight: "600",
  },

  activeText: {
    color: "#fff",
  },

  listContainer: {
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#fff",

    borderRadius: 24,

    padding: 18,

    marginBottom: 16,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 10,

    elevation: 4,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  rankCircle: {
    width: 52,
    height: 52,

    borderRadius: 26,

    backgroundColor: "#F5F0E6",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 14,
  },

  rank: {
    fontWeight: "bold",
    color: "#111",
  },

  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111",
    maxWidth: 180,
  },

  small: {
    marginTop: 4,
    color: "#777",
    fontSize: 13,
  },

  coinBox: {
    backgroundColor: "#0D0D0D",

    paddingVertical: 10,
    paddingHorizontal: 16,

    borderRadius: 999,
  },

  coin: {
    color: "#fff",
    fontWeight: "bold",
  },
});