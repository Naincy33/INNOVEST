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
  sendEmailVerification,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export default function SignInScreen({
  navigation,
}) {
  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // 🔥 CLEAN EMAIL/PASSWORD
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const normalizedPassword =
    password.trim();

  // ✅ VALIDATION
  const validateAuthForm = () => {
    if (
      !normalizedEmail ||
      !normalizedPassword
    ) {
      alert(
        "Please enter email and password 😅"
      );
      return false;
    }

    // 🔥 VALID EMAIL
    if (
      !normalizedEmail.includes("@") ||
      !normalizedEmail.includes(".")
    ) {
      alert("Enter valid email 😢");
      return false;
    }

    // 🔥 PASSWORD LENGTH
    if (
      normalizedPassword.length < 6
    ) {
      alert(
        "Password must be at least 6 characters 😅"
      );
      return false;
    }

    return true;
  };

  // 🔥 CREATE USER PROFILE
  const ensureUserProfile =
    async (user) => {
      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const userSnap = await getDoc(
        userRef
      );

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: normalizedEmail,
          name: "User",
          coins: 10000,
          createdAt: Date.now(),
        });
      }
    };

  // 🔐 LOGIN
  const handleLogin = async () => {
    if (!validateAuthForm()) return;

    try {
      setIsSubmitting(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          normalizedPassword
        );

      const user =
        userCredential.user;

      // 🔥 CHECK EMAIL VERIFIED
      if (!user.emailVerified) {
        alert(
          "Please verify your email first 📩"
        );
        return;
      }

      await ensureUserProfile(user);

      navigation.replace(
        "HomeTabs"
      );

    } catch (error) {
      console.log(error);

      if (
        error.code ===
        "auth/invalid-email"
      ) {
        alert("Invalid email 😢");
      } else if (
        error.code ===
        "auth/user-not-found"
      ) {
        alert(
          "Account not found 😢"
        );
      } else if (
        error.code ===
        "auth/wrong-password"
      ) {
        alert(
          "Wrong password 😢"
        );
      } else {
        alert(error.message);
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  // 🆕 SIGNUP
  const handleSignup = async () => {
    if (!validateAuthForm()) return;

    try {
      setIsSubmitting(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          normalizedPassword
        );

      const user =
        userCredential.user;

      // 🔥 SEND VERIFICATION
      await sendEmailVerification(
        user
      );

      // 🔥 CREATE USER PROFILE
      await ensureUserProfile(user);

      alert(
        "📩 Verification email sent!\nPlease verify before login."
      );

    } catch (error) {
      console.log(error);

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        alert(
          "Email already exists 😢"
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        alert("Invalid email 😢");
      } else {
        alert(error.message);
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 FORGOT PASSWORD
  const handleForgotPassword =
    async () => {
      if (!normalizedEmail) {
        alert(
          "Enter your email first 😅"
        );
        return;
      }

      try {
        await sendPasswordResetEmail(
          auth,
          normalizedEmail
        );

        alert(
          "📩 Reset link sent to email"
        );

      } catch (err) {
        console.log(err);
        alert(err.message);
      }
    };

  return (
    <LinearGradient
      colors={[
        "#FF8C94",
        "#FFB6C1",
        "#FFC4D0",
      ]}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Ionicons
            name="bulb"
            size={30}
            color="#FFD700"
          />
        </View>

        <Text style={styles.title}>
          Welcome to Innovest
        </Text>

        <Text style={styles.subtitle}>
          Invest in startup ideas 🚀
        </Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        
        {/* EMAIL */}
        <Text style={styles.label}>
          Email
        </Text>

        <TextInput
          placeholder="Enter email"
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        {/* PASSWORD */}
        <Text style={styles.label}>
          Password
        </Text>

        <View style={styles.passwordBox}>
          <TextInput
            placeholder="Enter password"
            secureTextEntry={
              !showPassword
            }
            style={{ flex: 1 }}
            onChangeText={setPassword}
            value={password}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            onPress={() =>
              setShowPassword(
                !showPassword
              )
            }
          >
            <Ionicons
              name={
                showPassword
                  ? "eye-off"
                  : "eye"
              }
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {/* FORGOT */}
        <TouchableOpacity
          onPress={
            handleForgotPassword
          }
        >
          <Text style={styles.forgot}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* LOGIN */}
        <TouchableOpacity
          style={[
            styles.loginBtn,

            isSubmitting &&
              styles.disabledBtn,
          ]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={styles.loginText}
            >
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* SIGNUP */}
        <TouchableOpacity
          style={[
            styles.signupBtn,

            isSubmitting &&
              styles.disabledBtn,
          ]}
          onPress={handleSignup}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FF8C94" />
          ) : (
            <Text
              style={
                styles.signupText
              }
            >
              Create Account
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },

  header: {
    alignItems: "center",
    marginTop: 60,
  },

  logoBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "#fff",
    opacity: 0.9,
    marginTop: 5,
  },

  card: {
    marginTop: 35,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 22,
    elevation: 5,
  },

  label: {
    marginTop: 12,
    marginBottom: 5,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 15,
  },

  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 14,
    borderRadius: 15,
  },

  forgot: {
    color: "#FF8C94",
    marginTop: 12,
    textAlign: "right",
    fontWeight: "600",
  },

  loginBtn: {
    backgroundColor: "#FF8C94",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 25,
  },

  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  signupBtn: {
    borderColor: "#FF8C94",
    borderWidth: 1.5,
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 12,
  },

  signupText: {
    color: "#FF8C94",
    fontWeight: "bold",
    fontSize: 16,
  },

  disabledBtn: {
    opacity: 0.7,
  },
});