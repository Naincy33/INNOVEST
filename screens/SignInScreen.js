import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

// 🔥 AUTH
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// 🔥 FIRESTORE
import { doc, setDoc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

export default function SignInScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 LOGIN
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: "User",
          coins: 10000,
          createdAt: Date.now(),
        });
      }

      navigation.replace("HomeTabs");
    } catch (error) {
      alert(error.message);
    }
  };

  // 🔥 SIGNUP
  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: "User",
        coins: 10000,
        createdAt: Date.now(),
      });

      alert("Account Created 🎉");
      navigation.replace("HomeTabs");
    } catch (error) {
      alert(error.message);
    }
  };

  // 🔐 FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter email first 😅");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Reset link sent 📩 Check your email");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <LinearGradient
      colors={["#FF8C94", "#FFB6C1", "#FFC4D0"]}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Ionicons name="bulb" size={28} color="#FFD700" />
        </View>

        <Text style={styles.title}>Welcome to Innovest</Text>
        <Text style={styles.subtitle}>
          Invest in ideas & grow your coins 🚀
        </Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter email"
          style={styles.input}
          onChangeText={setEmail}
          value={email}
        />

        {/* PASSWORD */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordBox}>
          <TextInput
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            style={{ flex: 1 }}
            onChangeText={setPassword}
            value={password}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {/* 🔐 FORGOT PASSWORD */}
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* LOGIN */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>Sign In</Text>
        </TouchableOpacity>

        {/* SIGNUP */}
        <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
          <Text style={styles.signupText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },

  header: { alignItems: "center", marginTop: 60 },

  logoBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },

  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  subtitle: { color: "#fff", opacity: 0.9 },

  card: {
    marginTop: 30,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 20,
  },

  label: { marginTop: 10 },

  input: {
    backgroundColor: "#f3f3f3",
    padding: 12,
    borderRadius: 15,
  },

  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    padding: 12,
    borderRadius: 15,
  },

  forgot: {
    color: "#FF8C94",
    marginTop: 10,
    textAlign: "right",
  },

  loginBtn: {
    backgroundColor: "#FF8C94",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },

  loginText: { color: "#fff", fontWeight: "bold" },

  signupBtn: {
    borderColor: "#FF8C94",
    borderWidth: 1,
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },

  signupText: {
    color: "#FF8C94",
    fontWeight: "bold",
  },
});