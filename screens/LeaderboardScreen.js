import { View, Text } from "react-native";

export default function LeaderboardScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20 }}>🏆 Leaderboard</Text>
      <Text>1. User A - 5000 coins</Text>
      <Text>2. User B - 3000 coins</Text>
    </View>
  );
}