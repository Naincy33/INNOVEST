import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

import { Ionicons } from "@expo/vector-icons";

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function CommentsScreen({ route, navigation }) {
  const { idea } = route.params;

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  // 🔥 FETCH COMMENTS (sorted latest first)
  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("ideaId", "==", idea.id),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(data);
    });

    return () => unsub();
  }, []);

  // 🔥 ADD COMMENT
  const handleAdd = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Login required 😢");
        return;
      }

      if (!text.trim()) {
        alert("Write something 😅");
        return;
      }

      await addDoc(collection(db, "comments"), {
        ideaId: idea.id,
        userId: user.uid,
        text,
        createdAt: Date.now(),
      });

      setText("");
    } catch (err) {
      console.log(err);
      alert("Failed 😢");
    }
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient
        colors={["#FF8C94", "#FFB6C1"]}
        style={styles.header}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 10, padding: 3 }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <Text style={styles.heading}>💬 Comments</Text>
        </View>
        <Text style={styles.ideaTitle}>{idea.title}</Text>
      </LinearGradient>

      {/* COMMENTS LIST */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <View style={styles.commentCard}>
            
            {/* avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.userId?.slice(0, 1).toUpperCase()}
              </Text>
            </View>

            {/* content */}
            <View style={{ flex: 1 }}>
              <Text style={styles.username}>
                User {item.userId?.slice(0, 5)}
              </Text>

              <Text style={styles.commentText}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
      />

      {/* INPUT */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Add a comment..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleAdd}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7",
  },

  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  heading: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  ideaTitle: {
    color: "#fff",
    marginTop: 5,
    opacity: 0.9,
  },

  commentCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF8C94",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },

  username: {
    fontWeight: "600",
    fontSize: 13,
    color: "#555",
  },

  commentText: {
    marginTop: 2,
    fontSize: 14,
  },

  inputWrapper: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },

  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 20,
  },

  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#FF8C94",
    borderRadius: 20,
    paddingHorizontal: 15,
    justifyContent: "center",
  },

  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});