import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
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

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const navigation = useNavigation();

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.15, { duration: 1200 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <LinearGradient
      colors={["#F28C8C", "#F8D7DA"]}
      style={styles.container}
    >
      {/* TOP DESIGN WAVES */}
      <View style={styles.wave1} />
      <View style={styles.wave2} />

      {/* BULB */}
      <Animated.Image
        source={require("../assets/images/bulb.png")}
        style={[styles.bulb, animatedStyle]}
        resizeMode="contain"
      />

      {/* TEXT */}
      <View style={styles.textBox}>
        <Text style={styles.title}>Welcome to</Text>

        <Text style={styles.brand}>Innovest</Text>

        <Text style={styles.subtitle}>
          Turn your ideas into investments 💰
        </Text>
      </View>

      {/* BOTTOM CARD */}
      <View style={styles.bottomCard}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("SignIn")}
        >
          <Text style={styles.buttonText}>Continue →</Text>
        </TouchableOpacity>

        {/* DOTS */}
        <View style={styles.dots}>
          <View style={styles.activeDot} />
          <View style={styles.dot} />
        </View>
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 80,
  },

  /* WAVES (FIGMA STYLE BACKGROUND) */
  wave1: {
    position: "absolute",
    top: 0,
    width: "120%",
    height: 200,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
  },

  wave2: {
    position: "absolute",
    top: 80,
    width: "140%",
    height: 200,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },

  /* BULB (BIG + CENTERED 🔥) */
  bulb: {
    width: width * 0.5,   // BIG SIZE
    height: width * 0.5,
    marginTop: 40,
  },

  textBox: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "600",
  },

  brand: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFE5B4",

    textShadowColor: "rgba(255, 223, 120, 0.9)",
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 12,
  },

  subtitle: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },

  /* BOTTOM CARD */
  bottomCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },

  button: {
    backgroundColor: "#F28C8C",
    width: "90%",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",

    shadowColor: "#F28C8C",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  dots: {
    flexDirection: "row",
    marginTop: 15,
  },

  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: "#F28C8C",
    borderRadius: 4,
    margin: 5,
  },

  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#ccc",
    borderRadius: 4,
    margin: 5,
  },
});