import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import { LineChart } from "react-native-chart-kit";

// 🔥 FIREBASE
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
  const [investments, setInvestments] = useState([]);
  const [detailed, setDetailed] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    let unsubscribeFirestore;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const q = query(
        collection(db, "investments"),
        where("userId", "==", user.uid)
      );

      unsubscribeFirestore = onSnapshot(q, async (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setInvestments(data);

        let totalEarn = 0;
        let detailedData = [];

        for (let inv of data) {
          try {
            const ideaRef = doc(db, "ideas", inv.ideaId);
            const ideaSnap = await getDoc(ideaRef);

            if (!ideaSnap.exists()) continue;

            const idea = ideaSnap.data();
            const ideaCoins = idea.coins || 0;

            // 🔥 earning logic
            const earning = (ideaCoins * inv.amount) / 1000;
            const roi = ((earning / inv.amount) * 100).toFixed(1);

            totalEarn += earning;

            detailedData.push({
              ...inv,
              earning: Math.floor(earning),
              roi,
            });
          } catch (err) {
            console.log("Error:", err);
          }
        }

        setDetailed(detailedData);
        setTotalEarnings(Math.floor(totalEarn));
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // 🔥 TOTAL INVESTED
  const totalInvested = investments.reduce(
    (sum, i) => sum + (i.amount || 0),
    0
  );

  // 🔥 GRAPH DATA
  const screenWidth = Dimensions.get("window").width;

  const grouped = {};
  investments.forEach((item) => {
    const date = new Date(item.createdAt).toLocaleDateString();

    if (!grouped[date]) grouped[date] = 0;
    grouped[date] += item.amount;
  });

  const chartData = {
    labels: Object.keys(grouped).map((d) => d.slice(0, 5)),
    datasets: [
      {
        data: Object.values(grouped).length
          ? Object.values(grouped)
          : [0],
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient
        colors={["#FF8C94", "#FFB6C1"]}
        style={styles.header}
      >
        <Text style={styles.title}>My Portfolio</Text>
        <Text style={styles.subtitle}>Smart investing 📈</Text>
      </LinearGradient>

      {/* STATS */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.big}>{totalInvested}</Text>
          <Text>Total Invested</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.big}>{totalEarnings}</Text>
          <Text>Total Earnings</Text>
        </View>
      </View>

      {/* 🔥 GRAPH */}
      {investments.length > 0 && (
        <View style={{ margin: 20 }}>
          <Text style={styles.section}>📈 Investment Trend</Text>

          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) =>
                `rgba(255, 140, 148, ${opacity})`,
              labelColor: () => "#555",
            }}
            bezier
            style={{ borderRadius: 20 }}
          />
        </View>
      )}

      {/* LIST */}
      <Text style={styles.section}>Your Investments</Text>

      {detailed.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.idea}>{item.ideaTitle}</Text>

          <View style={styles.rowBetween}>
            <Text>💰 Invested: {item.amount}</Text>
            <Text style={styles.green}>+{item.earning}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.gray}>ROI: {item.roi}%</Text>
            <Text style={styles.tag}>📈 Growing</Text>
          </View>
        </View>
      ))}

      {detailed.length === 0 && (
        <Text style={styles.empty}>
          No investments yet 😢
        </Text>
      )}
    </ScrollView>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7",
  },

  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#fff",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "40%",
    alignItems: "center",
  },

  big: {
    fontSize: 22,
    fontWeight: "bold",
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 15,
  },

  item: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 20,
  },

  idea: {
    fontWeight: "bold",
    fontSize: 16,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  green: {
    color: "green",
    fontWeight: "bold",
  },

  gray: {
    color: "#666",
  },

  tag: {
    color: "#FF8C94",
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
  },
});