import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

export default function SignInScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  const validateAuthForm = () => {
    if (!normalizedEmail || !normalizedPassword) {
      alert("Please enter both email and password.");
      return false;
    }

    if (normalizedPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return false;
    }

    return true;
  };

  const ensureUserProfile = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: normalizedEmail,
        name: "User",
        coins: 10000,
        createdAt: Date.now(),
      });
    }
  };

  const handleLogin = async () => {
    if (!validateAuthForm()) return;

    try {
      setIsSubmitting(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        normalizedPassword
      );

      await ensureUserProfile(userCredential.user);
      navigation.replace("HomeTabs");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async () => {
    if (!validateAuthForm()) return;

    try {
      setIsSubmitting(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        normalizedPassword
      );

      try {
        await ensureUserProfile(userCredential.user);
      } catch (profileError) {
        console.log("Profile creation failed:", profileError);
      }

      alert("Account created successfully.");
      navigation.replace("HomeTabs");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!normalizedEmail) {
      alert("Enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      alert("Reset link sent. Check your email.");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <LinearGradient
      colors={["#FF8C94", "#FFB6C1", "#FFC4D0"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Ionicons name="bulb" size={28} color="#FFD700" />
        </View>

        <Text style={styles.title}>Welcome to Innovest</Text>
        <Text style={styles.subtitle}>Invest in ideas and grow your coins</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter email"
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordBox}>
          <TextInput
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            style={{ flex: 1 }}
            onChangeText={setPassword}
            value={password}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, isSubmitting && styles.disabledBtn]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signupBtn, isSubmitting && styles.disabledBtn]}
          onPress={handleSignup}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FF8C94" />
          ) : (
            <Text style={styles.signupText}>Create Account</Text>
          )}
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

  disabledBtn: {
    opacity: 0.7,
  },
});
