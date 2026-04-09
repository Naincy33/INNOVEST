import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { db } from "../firebase";

export default function ProfileScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const user = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    coins: 10000,
    ideas: 3,
    invested: 5,
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <ScrollView style={styles.container}>

      {/* 🔥 HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSub}>Manage your account</Text>
      </LinearGradient>

      {/* 🔥 PROFILE CARD */}
      <View style={styles.card}>
        
        {/* Avatar */}
        <View style={styles.center}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.coins}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.ideas}</Text>
            <Text style={styles.statLabel}>Ideas</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.invested}</Text>
            <Text style={styles.statLabel}>Invested</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace("SignIn")}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 ACCOUNT DETAILS */}
      <Text style={styles.section}>Account Details</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.value}>{user.name}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      {/* 🔥 SETTINGS */}
      <Text style={styles.section}>Settings</Text>

      <View style={styles.settingBox}>
        <View>
          <Text style={styles.settingTitle}>Notifications</Text>
          <Text style={styles.settingSub}>
            Receive updates on investments
          </Text>
        </View>

        <Switch value={notifications} onValueChange={setNotifications} />
      </View>

      <View style={styles.settingBox}>
        <View>
          <Text style={styles.settingTitle}>Dark Mode</Text>
          <Text style={styles.settingSub}>Switch theme</Text>
        </View>

        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

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

  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  headerSub: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 25,
    marginTop: -40,
    elevation: 5,
  },

  center: {
    alignItems: "center",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF8C94",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },

  email: {
    color: "#777",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  statBox: {
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },

  statLabel: {
    color: "#777",
  },

  editBtn: {
    backgroundColor: "#FF8C94",
    padding: 12,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
  },

  editText: {
    color: "#fff",
    fontWeight: "bold",
  },

  logoutBtn: {
    marginTop: 10,
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  logoutText: {
    color: "#555",
    fontWeight: "bold",
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 15,
  },

  infoBox: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 20,
  },

  label: {
    color: "#999",
  },

  value: {
    fontWeight: "bold",
  },

  settingBox: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  settingTitle: {
    fontWeight: "bold",
  },

  settingSub: {
    color: "#777",
    fontSize: 12,
  },
});