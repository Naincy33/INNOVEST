import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";



// Screens
import SplashScreen from "../screens/SplashScreen";
import SignInScreen from "../screens/SignInScreen";
import HomeScreen from "../screens/HomeScreen";
import IdeaDetailScreen from "../screens/IdeaDetailScreen";

import PostScreen from "../screens/PostScreen";
import PortfolioScreen from "../screens/PortfolioScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// 🔥 BOTTOM TAB NAVIGATION
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#FF8C94",

        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Post") iconName = "add-circle";
          else if (route.name === "Portfolio") iconName = "briefcase";
          else if (route.name === "Leaderboard") iconName = "trophy";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


// 🔥 MAIN STACK NAVIGATION
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />

        {/* 👉 LOGIN ke baad yaha navigate karna */}
        <Stack.Screen name="HomeTabs" component={BottomTabs} />

        {/* Detail */}
        <Stack.Screen name="IdeaDetail" component={IdeaDetailScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}