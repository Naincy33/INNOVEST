import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useEffect } from "react";

import { useNavigation } from "@react-navigation/native";

const { width } =
  Dimensions.get("window");

export default function SplashScreen() {

  const navigation =
    useNavigation();

  // 🔥 ANIMATION
  const scale =
    useSharedValue(1);

  useEffect(() => {

    scale.value =
      withRepeat(
        withTiming(1.04, {
          duration: 1400,
        }),
        -1,
        true
      );

  }, []);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale:
            scale.value,
        },
      ],
    }));

  return (

    <LinearGradient
      colors={[
        "#F7F2EA",
        "#F3ECE2",
      ]}
      style={styles.container}
    >

      <StatusBar
        barStyle="dark-content"
      />

      {/* 🔥 REDDISH GLOW */}
      <View style={styles.topGlow} />

      {/* 🔥 LOGO */}
      <Animated.View
        style={[
          styles.logoContainer,
          animatedStyle,
        ]}
      >

        <Animated.Image
          source={require("../assets/images/bulb.png")}
          resizeMode="contain"
          style={styles.logo}
        />

      </Animated.View>

      {/* 🔥 TEXT */}
      <View style={styles.textBox}>

        <Text style={styles.title}>
          Innovest
        </Text>

        <Text style={styles.subtitle}>
          Invest in Ideas
        </Text>

      </View>

      {/* 🔥 BUTTON AREA */}
      <View style={styles.bottomArea}>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              "SignIn"
            )
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Continue →
          </Text>
        </TouchableOpacity>

        {/* 🔥 DOTS */}
        <View style={styles.dots}>

          <View
            style={
              styles.activeDot
            }
          />

          <View
            style={styles.dot}
          />

        </View>

      </View>

    </LinearGradient>
  );
}

const styles =
  StyleSheet.create({

    // 🔥 MAIN
    container: {
      flex: 1,

      backgroundColor:
        "#F7F2EA",

      alignItems: "center",

      justifyContent:
        "space-between",

      paddingTop: 120,

      paddingBottom: 45,
    },

    // 🔥 BIG TOP GLOW
    topGlow: {
      position: "absolute",

      top: -220,

      width: 760,
      height: 760,

      borderRadius: 380,

      backgroundColor:
        "rgba(255,107,107,0.10)",
    },

    // 🔥 WHITE CIRCLE
    logoContainer: {
      width: width * 0.36,

      height: width * 0.36,

      borderRadius: 999,

      backgroundColor:
        "#FFFFFF",

      alignItems: "center",

      justifyContent:
        "center",

      shadowColor: "#000",

      shadowOpacity: 0.10,

      shadowRadius: 16,

      elevation: 6,
    },

    // 🔥 BULB BIGGER
    logo: {
      width: width * 0.28,

      height: width * 0.28,
    },

    // 🔥 TEXT
    textBox: {
      alignItems: "center",

      marginTop: -160,
    },

    title: {
      fontSize: 52,

      fontWeight: "bold",

      color: "#0D0D0D",

      letterSpacing: -1.5,
    },

    subtitle: {
      marginTop: 10,

      color: "#6B6B6B",

      fontSize: 18,

      fontWeight: "500",
    },

    // 🔥 BOTTOM
    bottomArea: {
      width: "100%",

      alignItems: "center",
    },

    // 🔥 BUTTON
    button: {
      width: "82%",

      backgroundColor:
        "#050505",

      paddingVertical: 19,

      borderRadius: 999,

      alignItems: "center",

      shadowColor: "#000",

      shadowOpacity: 0.16,

      shadowRadius: 14,

      elevation: 8,
    },

    buttonText: {
      color: "#fff",

      fontWeight: "bold",

      fontSize: 17,

      letterSpacing: 0.3,
    },

    // 🔥 DOTS
    dots: {
      flexDirection: "row",

      marginTop: 22,
    },

    activeDot: {
      width: 10,
      height: 10,

      borderRadius: 5,

      backgroundColor:
        "#FF6B6B",

      marginHorizontal: 5,
    },

    dot: {
      width: 10,
      height: 10,

      borderRadius: 5,

      backgroundColor:
        "#D8D1C7",

      marginHorizontal: 5,
    },
  });