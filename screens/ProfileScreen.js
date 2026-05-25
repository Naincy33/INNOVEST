import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";

import { useState, useEffect } from "react";

import * as ImagePicker from "expo-image-picker";

import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot as fireSnapshot,
} from "firebase/firestore";

import { signOut } from "firebase/auth";

import { db, auth } from "../firebase";

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [coins, setCoins] = useState(0);
  const [image, setImage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [ideaCount, setIdeaCount] = useState(0);
  const [investmentCount, setInvestmentCount] = useState(0);

  const user = auth.currentUser;

  // 🔥 USER DATA
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        setName(data.name || "");
        setBio(data.bio || "");
        setCoins(data.coins || 0);
        setImage(data.photo || null);
      }
    });

    return () => unsub();
  }, []);

  // 🔥 IDEA COUNT
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "ideas"), where("userId", "==", user.uid));

    const unsub = fireSnapshot(q, (snap) => {
      setIdeaCount(snap.docs.length);
    });

    return () => unsub();
  }, []);

  // 🔥 INVESTMENT COUNT
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "investments"),
      where("userId", "==", user.uid)
    );

    const unsub = fireSnapshot(q, (snap) => {
      setInvestmentCount(snap.docs.length);
    });

    return () => unsub();
  }, []);

  // 🔥 PICK IMAGE
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🔥 SAVE
  const handleSave = async () => {
    await updateDoc(doc(db, "users", user.uid), {
      name,
      bio,
      photo: image,
    });

    setEditing(false);

    alert("Profile Updated 🚀");
  };

  // 🔥 LOGOUT
  const handleLogout = async () => {
    await signOut(auth);

    navigation.replace("SignIn");
  };

  // 🏆 DYNAMIC ACHIEVEMENTS
  const getAchievements = () => {
    return [
      {
        id: "founder",
        title: "Future Founder",
        emoji: "💡",
        description: "Post at least 1 startup idea",
        unlocked: ideaCount >= 1,
      },
      {
        id: "vc",
        title: "Venture Mogul",
        emoji: "📈",
        description: "Invest in 1 startup idea",
        unlocked: investmentCount >= 1,
      },
      {
        id: "millionaire",
        title: "Coin Tycoon",
        emoji: "💰",
        description: "Accumulate 11,000+ coins",
        unlocked: coins >= 11000,
      },
      {
        id: "wizard",
        title: "Quiz Wizard",
        emoji: "🧠",
        description: "Accumulate 10,500+ coins",
        unlocked: coins >= 10500,
      },
    ];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>Profile</Text>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={editing ? pickImage : null}>
          <Image
            source={{
              uri: image || "https://i.pravatar.cc/300",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        {/* NAME */}
        {editing ? (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            style={styles.input}
          />
        ) : (
          <Text style={styles.name}>{name || "Innovator"}</Text>
        )}

        {/* BIO */}
        {editing ? (
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Bio..."
            multiline
            style={styles.bioInput}
          />
        ) : (
          <Text style={styles.bio}>{bio || "Building the future 🚀"}</Text>
        )}
      </View>

      {/* 🏆 ACHIEVEMENTS CAROUSEL */}
      <Text style={styles.section}>🏆 Ranks & Achievements</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgeScroll}
      >
        {getAchievements().map((badge) => (
          <View
            key={badge.id}
            style={[
              styles.badgeCard,
              !badge.unlocked && styles.badgeCardLocked,
            ]}
          >
            <Text style={[styles.badgeEmoji, !badge.unlocked && styles.badgeEmojiLocked]}>
              {badge.emoji}
            </Text>
            <Text style={styles.badgeTitle}>{badge.title}</Text>
            <Text style={styles.badgeDesc}>{badge.description}</Text>
            <View
              style={[
                styles.badgeStatus,
                badge.unlocked ? styles.badgeStatusUnlocked : styles.badgeStatusLocked,
              ]}
            >
              <Text style={styles.badgeStatusText}>
                {badge.unlocked ? "UNLOCKED 🎉" : "LOCKED 🔒"}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* IMPACT */}
      <Text style={styles.section}>Your Impact</Text>

      <View style={styles.grid}>
        <View style={styles.box}>
          <Text style={styles.big}>{ideaCount}</Text>
          <Text style={styles.small}>IDEAS POSTED</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.big}>{investmentCount}</Text>
          <Text style={styles.small}>INVESTMENTS</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.big}>{coins}</Text>
          <Text style={styles.small}>COINS</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.big}>
            {coins >= 11000 ? "Top 1%" : coins >= 10500 ? "Top 5%" : "Top 20%"}
          </Text>
          <Text style={styles.small}>RANKING</Text>
        </View>
      </View>

      {/* MENU */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("MyIdeas")}
        >
          <Text style={styles.menuText}>💡 My Ideas</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("TeamRequests")}
        >
          <Text style={styles.menuText}>🤝 Team Requests</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* 💬 REAL-TIME TEAM CHAT */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Chat")}
        >
          <Text style={styles.menuText}>💬 Team Chat</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* BUTTON */}
      {editing ? (
        <TouchableOpacity style={styles.editBtn} onPress={handleSave}>
          <Text style={styles.editText}>Save Profile</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      {/* SIGN OUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* EXTRA SPACE */}
      <View style={{ height: 140 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F2EA",
  },
  header: {
    paddingTop: 65,
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  heading: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#111",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 32,
    paddingVertical: 34,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 999,
    marginBottom: 20,
    backgroundColor: "#EEE",
  },
  name: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#111",
  },
  bio: {
    marginTop: 10,
    color: "#777",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 28,
    marginBottom: 18,
    marginHorizontal: 24,
    color: "#111",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  box: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  big: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111",
  },
  small: {
    marginTop: 12,
    color: "#8A8A8A",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 22,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  menuText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  arrow: {
    fontSize: 28,
    color: "#999",
  },
  editBtn: {
    backgroundColor: "#111",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  editText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF7F7",
    marginHorizontal: 20,
    marginTop: 18,
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: "center",
  },
  logoutText: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: 17,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  bioInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#FAFAFA",
  },
  badgeScroll: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  badgeCard: {
    backgroundColor: "#FFFFFF",
    width: 145,
    borderRadius: 24,
    padding: 16,
    marginRight: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: "#EAEAEA",
  },
  badgeCardLocked: {
    opacity: 0.65,
    backgroundColor: "#ECE7DE",
    borderColor: "transparent",
  },
  badgeEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  badgeEmojiLocked: {
    opacity: 0.5,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 10,
    color: "#6B6B6B",
    textAlign: "center",
    lineHeight: 13,
    marginBottom: 10,
    height: 26,
  },
  badgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeStatusUnlocked: {
    backgroundColor: "#EBF7EE",
  },
  badgeStatusLocked: {
    backgroundColor: "#F5F0E6",
  },
  badgeStatusText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#555",
  },
});