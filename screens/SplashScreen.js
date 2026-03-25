/*import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/colors";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      
      <View style={styles.centerContent}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.brand}>Innovest</Text>

        <Text style={styles.subtitle}>
          Discover and invest in innovative ideas from creators around the world.
        </Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Continue →</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },

  centerContent: {
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 5,
  },

  brand: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFE5B4",
  },

  subtitle: {
    textAlign: "center",
    marginTop: 20,
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },

  button: {
    backgroundColor: COLORS.primary,
    width: "90%",
    padding: 18,
    borderRadius: 40,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
*/

import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

export default function SplashScreen() {
  
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>

      {/* Top Illustration */}
      <Animated.Image
        source={require("../assets/images/bulb.jpeg")}
        style={[styles.image, animatedStyle]}
      />

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.brand}>Innovest</Text>
        <Text style={styles.subtitle}>
          Discover and invest in innovative ideas from creators around the world.
        </Text>
      </View>

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Continue →</Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          <View style={styles.dotActive} />
          <View style={styles.dot} />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8D7DA",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 80,
  },

  image: {
    width: 180,
    height: 180,
    marginTop: 40,
  },

  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "600",
  },

  brand: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFE5B4",
    marginVertical: 10,
  },

  subtitle: {
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
  },

  bottomCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    alignItems: "center",
  },

  button: {
    backgroundColor: "#F28C8C",
    width: "90%",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  dots: {
    flexDirection: "row",
    marginTop: 15,
  },

  dotActive: {
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