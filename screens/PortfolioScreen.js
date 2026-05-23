import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";

import { useState, useEffect } from "react";

import { LineChart } from "react-native-chart-kit";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { db, auth } from "../firebase";

export default function PortfolioScreen() {

  const [investments, setInvestments] =
    useState([]);

  const [detailed, setDetailed] =
    useState([]);

  const [totalEarnings, setTotalEarnings] =
    useState(0);

  useEffect(() => {

    let unsubscribeFirestore;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {

          if (!user) return;

          const q = query(
            collection(
              db,
              "investments"
            ),
            where(
              "userId",
              "==",
              user.uid
            )
          );

          unsubscribeFirestore =
            onSnapshot(
              q,
              async (snapshot) => {

                const data =
                  snapshot.docs.map(
                    (doc) => ({
                      id: doc.id,
                      ...doc.data(),
                    })
                  );

                setInvestments(data);

                let totalEarn = 0;

                let detailedData = [];

                for (let inv of data) {

                  try {

                    const ideaRef =
                      doc(
                        db,
                        "ideas",
                        inv.ideaId
                      );

                    const ideaSnap =
                      await getDoc(
                        ideaRef
                      );

                    if (
                      !ideaSnap.exists()
                    )
                      continue;

                    const idea =
                      ideaSnap.data();

                    const ideaCoins =
                      idea.coins || 0;

                    const earning =
                      (ideaCoins *
                        inv.amount) /
                      1000;

                    const roi = (
                      (earning /
                        inv.amount) *
                      100
                    ).toFixed(1);

                    totalEarn +=
                      earning;

                    detailedData.push({
                      ...inv,
                      earning:
                        Math.floor(
                          earning
                        ),
                      roi,
                    });

                  } catch (err) {
                    console.log(err);
                  }
                }

                setDetailed(
                  detailedData
                );

                setTotalEarnings(
                  Math.floor(
                    totalEarn
                  )
                );
              }
            );
        }
      );

    return () => {

      unsubscribeAuth();

      if (
        unsubscribeFirestore
      ) {
        unsubscribeFirestore();
      }
    };

  }, []);

  // 🔥 TOTAL
  const totalInvested =
    investments.reduce(
      (sum, i) =>
        sum + (i.amount || 0),
      0
    );

  const screenWidth =
    Dimensions.get("window")
      .width;

  // 🔥 GRAPH DATA
  const chartData = {
    labels: [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
    ],

    datasets: [
      {
        data: [
          20,
          45,
          28,
          80,
          totalInvested || 0,
        ],
      },
    ],
  };

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}
      <View style={styles.header}>

        <Text style={styles.heading}>
          My Portfolio
        </Text>

        <Text style={styles.subHeading}>
          Smart investing 📈
        </Text>

      </View>

      {/* STATS */}
      <View style={styles.statsRow}>

        <View style={styles.statCard}>

          <Text style={styles.big}>
            {totalInvested}
          </Text>

          <Text style={styles.small}>
            Total Invested
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text style={styles.big}>
            {totalEarnings}
          </Text>

          <Text style={styles.small}>
            Total Earnings
          </Text>

        </View>

      </View>

      {/* GRAPH */}
      <View style={styles.chartBox}>

        <Text style={styles.section}>
          📈 Investment Trend
        </Text>

        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}

          bezier

          chartConfig={{
            backgroundColor:
              "#fff",

            backgroundGradientFrom:
              "#fff",

            backgroundGradientTo:
              "#fff",

            decimalPlaces: 0,

            color: (
              opacity = 1
            ) =>
              `rgba(255,107,129,${opacity})`,

            labelColor: () =>
              "#777",

            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#FF6B81",
            },
          }}

          style={styles.chart}
        />

      </View>

      {/* LIST */}
      <Text style={styles.section2}>
        Your Investments
      </Text>

      {detailed.map((item) => (

        <View
          key={item.id}
          style={styles.item}
        >

          <View
            style={
              styles.rowBetween
            }
          >

            <Text
              style={styles.idea}
            >
              {item.ideaTitle}
            </Text>

            <Text
              style={styles.green}
            >
              +
              {item.earning}
            </Text>

          </View>

          <Text style={styles.gray}>
            💰 Invested:{" "}
            {item.amount}
          </Text>

          <View
            style={
              styles.rowBetween
            }
          >

            <Text
              style={styles.gray}
            >
              ROI: {item.roi}%
            </Text>

            <View
              style={styles.tag}
            >

              <Text
                style={
                  styles.tagText
                }
              >
                📈 Growing
              </Text>

            </View>

          </View>

        </View>

      ))}

      {/* EMPTY */}
      {detailed.length === 0 && (

        <Text style={styles.empty}>
          No investments yet 😢
        </Text>

      )}

      <View
        style={{ height: 50 }}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      "#F7F2EA",
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 24,
  },

  heading: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#111",
  },

  subHeading: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },

  statsRow: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    paddingHorizontal: 20,

    marginTop: 28,
  },

  statCard: {
    backgroundColor: "#fff",

    width: "47%",

    borderRadius: 26,

    paddingVertical: 30,

    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 10,

    elevation: 4,
  },

  big: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#111",
  },

  small: {
    marginTop: 8,
    color: "#777",
    fontSize: 15,
  },

  chartBox: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  chart: {
    marginTop: 10,
    borderRadius: 28,
  },

  section: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },

  section2: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",

    marginTop: 28,
    marginBottom: 18,

    paddingHorizontal: 20,
  },

  item: {
    backgroundColor: "#fff",

    marginHorizontal: 20,

    marginBottom: 18,

    padding: 22,

    borderRadius: 28,

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 10,

    elevation: 4,
  },

  rowBetween: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",
  },

  idea: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },

  green: {
    color: "#16A34A",
    fontWeight: "bold",
    fontSize: 24,
  },

  gray: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
  },

  tag: {
    backgroundColor:
      "#F3F4F6",

    paddingVertical: 8,

    paddingHorizontal: 14,

    borderRadius: 999,
  },

  tagText: {
    color: "#111",
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    marginTop: 60,
    color: "#888",
    fontSize: 16,
  },
});