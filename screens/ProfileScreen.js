import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";

import * as ImagePicker from "expo-image-picker";

import { db, auth } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [coins, setCoins] = useState(0);
  const [image, setImage] = useState(null);
  const [editing, setEditing] = useState(false);

  const user = auth.currentUser;

  // 🔥 FETCH USER DATA
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

  // 🔥 SAVE PROFILE
  const handleSave = async () => {
    await updateDoc(doc(db, "users", user.uid), {
      name,
      bio,
      photo: image,
    });

    setEditing(false);
    alert("Profile Updated 🚀");
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#FF8C94", "#FFB6C1"]} style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </LinearGradient>

      {/* CARD */}
      <View style={styles.card}>
        
        {/* PROFILE IMAGE */}
        <TouchableOpacity onPress={editing ? pickImage : null}>
          <Image
            source={{
              uri:
                image ||
                "https://i.pravatar.cc/150?img=12",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        {/* NAME */}
        {editing ? (
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Enter name"
          />
        ) : (
          <Text style={styles.name}>{name || "Your Name"}</Text>
        )}

        {/* BIO */}
        {editing ? (
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={styles.bioInput}
            placeholder="Write bio..."
            multiline
          />
        ) : (
          <Text style={styles.bio}>{bio || "No bio yet..."}</Text>
        )}

        {/* COINS */}
        <Text style={styles.coins}>💰 {coins}</Text>

        {/* STATS */}
        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{coins}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>--</Text>
            <Text style={styles.statLabel}>Investments</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>--</Text>
            <Text style={styles.statLabel}>Ideas</Text>
          </View>
        </View>

        {/* BUTTON */}
        {editing ? (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logout}
          onPress={() => navigation.replace("SignIn")}
        >
          <Text style={{ color: "#FF6B81" }}>Logout</Text>
        </TouchableOpacity>
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

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    elevation: 3,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: -60,
    borderWidth: 3,
    borderColor: "#fff",
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },

  bio: {
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },

  coins: {
    marginTop: 10,
    fontWeight: "600",
  },

  stats: {
    flexDirection: "row",
    marginTop: 20,
    width: "100%",
    justifyContent: "space-between",
  },

  statBox: {
    alignItems: "center",
    flex: 1,
  },

  statNumber: {
    fontWeight: "bold",
  },

  statLabel: {
    color: "#888",
    fontSize: 12,
  },

  editBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#FF8C94",
    padding: 10,
    borderRadius: 20,
    width: "60%",
    alignItems: "center",
  },

  editText: {
    color: "#FF8C94",
  },

  saveBtn: {
    marginTop: 20,
    backgroundColor: "#FF8C94",
    padding: 10,
    borderRadius: 20,
    width: "60%",
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  input: {
    borderBottomWidth: 1,
    width: "60%",
    textAlign: "center",
    marginTop: 10,
  },

  bioInput: {
    borderWidth: 1,
    width: "80%",
    marginTop: 10,
    borderRadius: 10,
    padding: 8,
    textAlign: "center",
  },

  logout: {
    marginTop: 15,
  },
});