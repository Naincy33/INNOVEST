import {

  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";

// 🔥 FIREBASE
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  getDoc, 
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

export default function HomeScreen({ navigation }) {
  const [ideas, setIdeas] = useState([]);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);

  // 🔥 GET USER + COINS
  useEffect(() => {
    let unsubscribeUser;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        // 🔥 fetch user coins
        unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setBalance(docSnap.data().coins || 0);
          }
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  // 🔥 FETCH IDEAS (LIVE)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "ideas"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setIdeas(data);
    });

    return () => unsubscribe();
  }, []);

  // ❤️ LIKE
  const handleLike = async (item) => {
  await updateDoc(doc(db, "ideas", item.id), {
    likes: (item.likes || 0) + 1,
  });

  // 🔥 owner ko coins do
  const ownerRef = doc(db, "users", item.userId);
  const snap = await getDoc(ownerRef);

  await updateDoc(ownerRef, {
    coins: snap.data().coins + 10,
  });
};

  // 💰 INVEST (FULL SYSTEM 🔥)
  // same imports as before

// 🔥 INVEST FIX (IMPORTANT CHANGE)
const handleInvest = async (item) => {
  if (balance < 100) {
    alert("Not enough coins 😢");
    return;
  }

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    // 1️⃣ update idea coins
    await updateDoc(doc(db, "ideas", item.id), {
      coins: (item.coins || 0) + 100,
    });

    // 2️⃣ update user coins
    await updateDoc(userRef, {
      coins: userData.coins - 100,
    });

    // 3️⃣ save investment WITH NAME
    await addDoc(collection(db, "investments"), {
      userId: userId,
      userName: userData.name,
      ideaId: item.id,
      ideaTitle: item.title,
      amount: 100,
      createdAt: Date.now(),
    });

    alert("Invested 🚀");
  } catch (err) {
    alert(err.message);
  }
};

  return (
    <ScrollView style={styles.container}>
      
      {/* 🔥 HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.heading}>Discover Ideas 💡</Text>
            <Text style={styles.coins}>💰 {balance}</Text>
          </View>

          <Ionicons name="notifications" size={20} color="#fff" />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput placeholder="Search ideas..." style={styles.input} />
        </View>
      </LinearGradient>

      {/* 🔥 IDEAS */}
      {ideas.map((item) => (
        <View key={item.id} style={styles.cardFull}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.category}</Text>

          <View style={styles.row}>
            <Text>💰 {item.coins || 0}</Text>
            <Text>❤️ {item.likes || 0}</Text>
          </View>

          <View style={styles.row}>
            <TouchableOpacity onPress={() => handleLike(item)}>
              <Text style={styles.like}>❤️ Like</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.investBtn}
              onPress={() => handleInvest(item)}
            >
              <Text style={styles.btnText}>Invest</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
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

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heading: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  coins: {
    color: "#fff",
    marginTop: 5,
  },

  bell: {
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 8,
    borderRadius: 20,
  },

  searchBox: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    borderRadius: 20,
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    padding: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    marginLeft: 15,
    width: 220,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  cardFull: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 2,
  },

  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  cardDesc: {
    color: "#666",
    marginVertical: 5,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },

  investBtn: {
    backgroundColor: "#FF8C94",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  like: {
    color: "#FF6B81",
  },
});
