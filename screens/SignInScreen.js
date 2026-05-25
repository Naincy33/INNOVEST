import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

import { useState, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

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

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  auth,
  db,
} from "../firebase";

export default function SignInScreen({
  navigation,
}) {

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  // 💾 PRE-FILL SAVED EMAIL
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("saved_email");
        const savedRemember = await AsyncStorage.getItem("remember_me");
        if (savedEmail && savedRemember === "true") {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (err) {
        console.log("Failed to load saved email", err);
      }
    };
    loadSavedEmail();
  }, []);

  // 🔥 CLEAN EMAIL/PASSWORD
  const normalizedEmail =
    email.trim().toLowerCase();

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

    // ✅ PROFESSIONAL EMAIL VALIDATION
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        normalizedEmail
      )
    ) {

      alert(
        "Enter valid email 😢"
      );

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

      const userSnap =
        await getDoc(userRef);

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

      // 🔥 REFRESH USER
      await user.reload();

      // ❌ EMAIL NOT VERIFIED
      if (!user.emailVerified) {

        alert(
          "Please verify your email first 📩"
        );

        await auth.signOut();

        return;
      }

      // ✅ CREATE PROFILE IF MISSING
      await ensureUserProfile(user);

      // 💾 SAVE/CLEAR EMAIL ON SUCCESS
      if (rememberMe) {
        await AsyncStorage.setItem("saved_email", normalizedEmail);
        await AsyncStorage.setItem("remember_me", "true");
      } else {
        await AsyncStorage.removeItem("saved_email");
        await AsyncStorage.setItem("remember_me", "false");
      }

      // ✅ LOGIN SUCCESS
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

      } else if (
        error.code ===
        "auth/invalid-credential"
      ) {

        alert(
          "Invalid email or password 😢"
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

      // 🔥 SEND EMAIL VERIFICATION
      await sendEmailVerification(
        user
      );

      // 🔥 CREATE PROFILE
      await ensureUserProfile(user);

      // 🔥 LOGOUT USER
      await auth.signOut();

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

        alert(
          "Invalid email 😢"
        );

      } else if (
        error.code ===
        "auth/weak-password"
      ) {

        alert(
          "Weak password 😢"
        );

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

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

      <View style={styles.container}>

        <StatusBar
          barStyle="dark-content"
        />

        {/* 🔥 CONTENT */}
        <View style={styles.content}>

          {/* 🔥 HEADER */}
          <View style={styles.header}>

            <Text style={styles.heading}>
              Sign In
            </Text>

            <Text style={styles.subHeading}>
              Welcome back to Innovest
            </Text>

          </View>

          {/* 🔥 EMAIL */}
          <View style={styles.inputGroup}>

            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              placeholder="name@example.com"
              placeholderTextColor="#999"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

          </View>

          {/* 🔥 PASSWORD */}
          <View style={styles.inputGroup}>

            <Text style={styles.label}>
              Password
            </Text>

            <View style={styles.passwordBox}>

              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry={
                  !showPassword
                }
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
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
                  size={22}
                  color="#888"
                />

              </TouchableOpacity>

            </View>

          </View>

          {/* 🔥 REMEMBER + FORGOT */}
          <View style={styles.row}>

            <TouchableOpacity
              style={styles.rememberBox}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >

              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && (
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color="#fff"
                  />
                )}
              </View>

              <Text style={styles.rememberText}>
                Remember me
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                handleForgotPassword
              }
            >

              <Text style={styles.forgot}>
                Forgot password?
              </Text>

            </TouchableOpacity>

          </View>

        {/* 🔥 LOGIN BUTTON */}
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

            <ActivityIndicator
              color="#fff"
            />

          ) : (

            <Text style={styles.loginText}>
              Sign In
            </Text>

          )}

        </TouchableOpacity>

        {/* 🔥 SIGNUP */}
        <TouchableOpacity
          onPress={handleSignup}
          disabled={isSubmitting}
        >

          <Text style={styles.signupText}>
            {"Don't have an account? "}

            <Text style={styles.signupHighlight}>
              Sign up
            </Text>

          </Text>

        </TouchableOpacity>

        </View>

      </View>

    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7F2EA",
  },

  // 🔥 MAIN CONTENT
  content: {
    flex: 1,

    justifyContent: "center",

    paddingHorizontal: 28,
  },

  // 🔥 HEADER
  header: {
    marginBottom: 45,
  },

  heading: {
    fontSize: 52,

    fontWeight: "bold",

    color: "#0D0D0D",

    letterSpacing: -2,
  },

  subHeading: {
    marginTop: 10,

    color: "#6B6B6B",

    fontSize: 18,

    fontWeight: "500",
  },

  // 🔥 INPUT GROUP
  inputGroup: {
    marginBottom: 24,
  },

  label: {
    fontSize: 16,

    fontWeight: "700",

    color: "#333",

    marginBottom: 10,
  },

  // 🔥 INPUT
  input: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    paddingHorizontal: 22,

    paddingVertical: 18,

    fontSize: 16,

    color: "#111",

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 10,

    elevation: 2,
  },

  // 🔥 PASSWORD BOX
  passwordBox: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    paddingHorizontal: 22,

    paddingVertical: 5,

    flexDirection: "row",

    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 10,

    elevation: 2,
  },

  passwordInput: {
    flex: 1,

    fontSize: 16,

    color: "#111",

    paddingVertical: 14,
  },

  // 🔥 ROW
  row: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginTop: 5,
  },

  // 🔥 REMEMBER
  rememberBox: {
    flexDirection: "row",

    alignItems: "center",
  },

  checkbox: {
    width: 20,
    height: 20,

    borderRadius: 6,

    borderWidth: 2,

    borderColor: "#D8D1C7",

    backgroundColor: "#FFFFFF",

    marginRight: 10,

    justifyContent: "center",

    alignItems: "center",
  },

  checkboxChecked: {
    backgroundColor: "#FF6B6B",

    borderColor: "#FF6B6B",
  },

  rememberText: {
    color: "#444",

    fontWeight: "600",

    fontSize: 14,
  },

  // 🔥 FORGOT
  forgot: {
    color: "#FF6B6B",

    fontWeight: "700",

    fontSize: 14,
  },

  // 🔥 BUTTON
  loginBtn: {
    backgroundColor: "#050505",

    paddingVertical: 20,

    borderRadius: 999,

    alignItems: "center",

    marginTop: 40,

    shadowColor: "#000",

    shadowOpacity: 0.12,

    shadowRadius: 14,

    elevation: 6,
  },

  loginText: {
    color: "#fff",

    fontWeight: "bold",

    fontSize: 20,
  },

  // 🔥 SIGNUP
  signupText: {
    marginTop: 40,

    textAlign: "center",

    color: "#6B6B6B",

    fontSize: 16,

    fontWeight: "500",
  },

  signupHighlight: {
    color: "#FF6B6B",

    fontWeight: "bold",
  },

  disabledBtn: {
    opacity: 0.7,
  },
});