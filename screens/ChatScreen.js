import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import { useState, useEffect, useRef } from "react";

import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
} from "firebase/firestore";

import { db, auth } from "../firebase";

import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen({ navigation }) {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null); // teamRequest item
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const flatListRef = useRef(null);

  // ==========================================
  // 📁 FETCH COLLABORATIONS (Owner & Sender Accepted Requests)
  // ==========================================
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Two parallel listeners to merge Owner & Sender accepted requests
    const qOwner = query(
      collection(db, "teamRequests"),
      where("status", "==", "accepted"),
      where("ownerId", "==", user.uid)
    );

    const qSender = query(
      collection(db, "teamRequests"),
      where("status", "==", "accepted"),
      where("senderId", "==", user.uid)
    );

    const activeCollabsMap = {};

    const unsubOwner = onSnapshot(qOwner, (snap) => {
      snap.docs.forEach((d) => {
        activeCollabsMap[d.id] = { id: d.id, ...d.data(), isOwner: true };
      });
      setCollaborations(Object.values(activeCollabsMap));
      setLoading(false);
    });

    const unsubSender = onSnapshot(qSender, (snap) => {
      snap.docs.forEach((d) => {
        activeCollabsMap[d.id] = { id: d.id, ...d.data(), isOwner: false };
      });
      setCollaborations(Object.values(activeCollabsMap));
      setLoading(false);
    });

    return () => {
      unsubOwner();
      unsubSender();
    };
  }, []);

  // ==========================================
  // 💬 STREAM CHAT MESSAGES
  // ==========================================
  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("teamRequestId", "==", activeRoom.id),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMessages(data);
    });

    return () => unsub();
  }, [activeRoom]);

  // ==========================================
  // 🚀 SEND MESSAGE
  // ==========================================
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const txt = messageText.trim();
      setMessageText(""); // Clear instantly for optimal UX

      await addDoc(collection(db, "chats"), {
        teamRequestId: activeRoom.id,
        senderId: user.uid,
        senderEmail: user.email,
        text: txt,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.log(err);
      alert("Failed to send message: " + err.message);
    }
  };

  // ==========================================
  // 🎨 RENDER TEAM LISTS
  // ==========================================
  if (activeRoom === null) {
    return (
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.heading}>💬 Team Chat</Text>
          <Text style={styles.subHeading}>Brainstorm and scale your startups</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
        ) : (
          <FlatList
            data={collaborations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="chatbubbles-outline" size={60} color="#DDD6C8" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No Collaboration Chats</Text>
                <Text style={styles.emptySub}>
                  When you accept join requests or get accepted onto other teams, your collaborative rooms will unlock here!
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const partner = item.isOwner ? item.senderEmail : "Founder Team";
              return (
                <TouchableOpacity
                  style={styles.collabCard}
                  onPress={() => setActiveRoom(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.collabIconBox}>
                    <Ionicons name="people" size={26} color="#FF6B6B" />
                  </View>
                  <View style={styles.collabInfo}>
                    <Text style={styles.ideaTitle} numberOfLines={1}>
                      🚀 {item.ideaTitle}
                    </Text>
                    <Text style={styles.partnerText} numberOfLines={1}>
                      Teammate: {partner}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    );
  }

  // ==========================================
  // 🎨 RENDER CHAT ROOM ROOM
  // ==========================================
  const roomPartnerName = activeRoom.isOwner ? activeRoom.senderEmail : "Founder Team";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* CHAT ROOM HEADER */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setActiveRoom(null)} style={styles.chatHeaderBackBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.chatHeaderTitleBox}>
          <Text style={styles.chatHeaderTitle} numberOfLines={1}>
            🚀 {activeRoom.ideaTitle}
          </Text>
          <Text style={styles.chatHeaderPartner} numberOfLines={1}>
            Teammate: {roomPartnerName}
          </Text>
        </View>
      </View>

      {/* MESSAGES FLATLIST */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMe = item.senderId === auth.currentUser?.uid;
          return (
            <View style={[styles.bubbleWrapper, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
              {!isMe && <Text style={styles.bubbleSender}>{item.senderEmail?.split("@")[0]}</Text>}
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubblePartner]}>
                <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextPartner]}>
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* INPUT BAR */}
      <View style={styles.inputBar}>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          style={styles.textInput}
          multiline
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
          activeOpacity={0.7}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F2EA",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  backBtn: {
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  heading: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#0D0D0D",
    letterSpacing: -1,
  },
  subHeading: {
    fontSize: 14,
    color: "#6B6B6B",
    marginTop: 2,
    fontWeight: "500",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  emptyBox: {
    marginTop: 100,
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },
  collabCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  collabIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFEAEB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  collabInfo: {
    flex: 1,
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  partnerText: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
    fontWeight: "500",
  },

  // ==========================================
  // CHAT ROOM SPECIFIC STYLES
  // ==========================================
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#FF6B6B",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  chatHeaderBackBtn: {
    padding: 5,
    marginRight: 10,
  },
  chatHeaderTitleBox: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  chatHeaderPartner: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
    fontWeight: "500",
  },
  messagesList: {
    padding: 20,
    paddingBottom: 10,
  },
  bubbleWrapper: {
    marginBottom: 14,
    maxWidth: "80%",
  },
  bubbleLeft: {
    alignSelf: "flex-start",
  },
  bubbleRight: {
    alignSelf: "flex-end",
  },
  bubbleSender: {
    fontSize: 10,
    color: "#888",
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 6,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: "#FF6B6B",
    borderTopRightRadius: 4,
  },
  bubblePartner: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: "#EAEAEA",
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: "#FFFFFF",
  },
  bubbleTextPartner: {
    color: "#111",
  },
  inputBar: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F7F2EA",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
    maxHeight: 100,
    textAlignVertical: "center",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
});
