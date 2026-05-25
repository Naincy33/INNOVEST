import { View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Ionicons } from "@expo/vector-icons";

// 🔥 SCREENS
import SplashScreen from "../screens/SplashScreen";

import SignInScreen from "../screens/SignInScreen";

import HomeScreen from "../screens/HomeScreen";

import IdeaDetailScreen from "../screens/IdeaDetailScreen";

import QuizScreen from "../screens/QuizScreen";

import PostScreen from "../screens/PostScreen";

import PortfolioScreen from "../screens/PortfolioScreen";

import LeaderboardScreen from "../screens/LeaderboardScreen";

import ProfileScreen from "../screens/ProfileScreen";

import MyIdeasScreen from "../screens/MyIdeasScreen";

import CommentsScreen from "../screens/CommentsScreen";

import TeamRequestsScreen from "../screens/TeamRequestsScreen";

import ChatScreen from "../screens/ChatScreen";

const Stack =
  createNativeStackNavigator();

const Tab =
  createBottomTabNavigator();


// 🔥 BOTTOM TABS
function BottomTabs() {

  return (

    <Tab.Navigator

      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor:
            "#FFFFFF",

          height: 78,

          borderTopWidth: 0,

          elevation: 10,

          shadowColor: "#000",

          shadowOpacity: 0.08,

          shadowRadius: 10,

          borderTopLeftRadius: 30,

          borderTopRightRadius: 30,

          position: "absolute",
        },

        tabBarActiveTintColor:
          "#FF6B6B",

        tabBarInactiveTintColor:
          "#999",

        tabBarLabelStyle: {
          fontSize: 12,

          marginBottom: 8,

          fontWeight: "600",
        },
      }}
    >

      {/* HOME */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}

        options={{
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* PORTFOLIO */}
      <Tab.Screen
        name="Portfolio"
        component={
          PortfolioScreen
        }

        options={{
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="pie-chart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* POST */}
      <Tab.Screen
        name="Post"
        component={PostScreen}

        options={{
          tabBarLabel: "",

          tabBarIcon: () => (

            <View
              style={{
                width: 65,

                height: 65,

                borderRadius: 40,

                backgroundColor:
                  "#000",

                justifyContent:
                  "center",

                alignItems:
                  "center",

                marginBottom: 35,

                shadowColor:
                  "#000",

                shadowOpacity: 0.25,

                shadowRadius: 10,

                elevation: 10,
              }}
            >

              <Ionicons
                name="add"
                size={34}
                color="#fff"
              />

            </View>
          ),
        }}
      />

      {/* LEADERBOARD */}
      <Tab.Screen
        name="Leaderboard"
        component={
          LeaderboardScreen
        }

        options={{
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="trophy-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}

        options={{
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

    </Tab.Navigator>
  );
}


// 🔥 MAIN NAVIGATION
export default function AppNavigator() {

  return (

    <NavigationContainer>

      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >

        <Stack.Screen
          name="Splash"
          component={
            SplashScreen
          }
        />

        <Stack.Screen
          name="SignIn"
          component={
            SignInScreen
          }
        />

        <Stack.Screen
          name="HomeTabs"
          component={
            BottomTabs
          }
        />

        <Stack.Screen
          name="IdeaDetail"
          component={
            IdeaDetailScreen
          }
        />

        <Stack.Screen
          name="Comments"
          component={
            CommentsScreen
          }
        />

        <Stack.Screen
          name="Quiz"
          component={
            QuizScreen
          }
        />

        <Stack.Screen
          name="MyIdeas"
          component={
            MyIdeasScreen
          }
        />

        <Stack.Screen
          name="TeamRequests"
          component={
            TeamRequestsScreen
          }
        />

        <Stack.Screen
          name="Chat"
          component={
            ChatScreen
          }
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}