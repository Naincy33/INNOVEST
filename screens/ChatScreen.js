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
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const flatListRef = useRef(null);

  // ==========================================
  // FETCH COLLABORATIONS
  // ==========================================
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

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
        activeCollabsMap[d.id] = {
          id: d.id,
          ...d.data(),
          isOwner: true,
        };
      });

      setCollaborations(Object.values(activeCollabsMap));
      setLoading(false);
    });

    const unsubSender = onSnapshot(qSender, (snap) => {
      snap.docs.forEach((d) => {
        activeCollabsMap[d.id] = {
          id: d.id,
          ...d.data(),
          isOwner: false,
        };
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
  // STREAM MESSAGES
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
  // SEND MESSAGE
  // ==========================================
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const user = auth.currentUser;

      const txt = messageText.trim();

      setMessageText("");

      await addDoc(collection(db, "chats"), {
        teamRequestId: activeRoom.id,
        senderId: user.uid,
        senderEmail: user.email,
        text: txt,
        createdAt: Date.now(),
      });

    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  // ==========================================
  // TEAM LIST SCREEN
  // ==========================================
  if (activeRoom === null) {
    return (
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#111"
            />
          </TouchableOpacity>

          <Text style={styles.heading}>
            Team Chats 💬
          </Text>

          <Text style={styles.subHeading}>
            Collaborate with your startup team
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color="#D4AF37"
            />
          </View>
        ) : (
          <FlatList
            data={collaborations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={70}
                  color="#D4AF37"
                />

                <Text style={styles.emptyTitle}>
                  No Team Chats
                </Text>

                <Text style={styles.emptySub}>
                  Accept collaboration requests to unlock chats
                </Text>
              </View>
            }
            renderItem={({ item }) => {

              const partner =
                item.isOwner
                  ? item.senderEmail
                  : "Founder Team";

              return (
                <TouchableOpacity
                  style={styles.collabCard}
                  activeOpacity={0.8}
                  onPress={() => setActiveRoom(item)}
                >
                  <View style={styles.collabIconBox}>
                    <Ionicons
                      name="people"
                      size={22}
                      color="#111"
                    />
                  </View>

                  <View style={styles.collabInfo}>
                    <Text
                      style={styles.ideaTitle}
                      numberOfLines={1}
                    >
                      🚀 {item.ideaTitle}
                    </Text>

                    <Text
                      style={styles.partnerText}
                      numberOfLines={1}
                    >
                      {partner}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    );
  }

  // ==========================================
  // CHAT ROOM
  // ==========================================
  const roomPartnerName =
    activeRoom.isOwner
      ? activeRoom.senderEmail
      : "Founder Team";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >

      {/* CHAT HEADER */}
      <View style={styles.chatHeader}>

        <TouchableOpacity
          onPress={() => setActiveRoom(null)}
          style={styles.chatHeaderBackBtn}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={styles.chatHeaderTitleBox}>

          <Text
            style={styles.chatHeaderTitle}
            numberOfLines={1}
          >
            🚀 {activeRoom.ideaTitle}
          </Text>

          <Text
            style={styles.chatHeaderPartner}
            numberOfLines={1}
          >
            {roomPartnerName}
          </Text>
        </View>
      </View>

      {/* MESSAGES */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({
            animated: true,
          })
        }
        renderItem={({ item }) => {

          const isMe =
            item.senderId === auth.currentUser?.uid;

          return (
            <View
              style={[
                styles.bubbleWrapper,
                isMe
                  ? styles.bubbleRight
                  : styles.bubbleLeft,
              ]}
            >

              {!isMe && (
                <Text style={styles.bubbleSender}>
                  {item.senderEmail?.split("@")[0]}
                </Text>
              )}

              <View
                style={[
                  styles.bubble,
                  isMe
                    ? styles.bubbleMe
                    : styles.bubblePartner,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    isMe
                      ? styles.bubbleTextMe
                      : styles.bubbleTextPartner,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* INPUT */}
      <View style={styles.inputBar}>

        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          style={styles.textInput}
          multiline
        />

        <TouchableOpacity
          style={styles.sendBtn}
          activeOpacity={0.8}
          onPress={handleSendMessage}
        >
          <Ionicons
            name="send"
            size={18}
            color="#111"
          />
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
    paddingBottom: 18,

    backgroundColor: "#FFFFFF",

    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 3,
  },

  backBtn: {
    marginBottom: 12,
  },

  heading: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#111",
  },

  subHeading: {
    marginTop: 4,
    fontSize: 14,
    color: "#777",
  },

  listContainer: {
    padding: 20,
    paddingBottom: 60,
  },

  emptyBox: {
    marginTop: 120,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
  },

  emptySub: {
    marginTop: 6,
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    paddingHorizontal: 40,
  },

  collabCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 18,

    marginBottom: 15,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 2,
  },

  collabIconBox: {
    width: 50,
    height: 50,

    borderRadius: 16,

    backgroundColor: "#F3E7C3",

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
    marginTop: 4,
    fontSize: 13,
    color: "#777",
  },

  // CHAT HEADER
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",

    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,

    backgroundColor: "#111111",

    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  chatHeaderBackBtn: {
    marginRight: 10,
  },

  chatHeaderTitleBox: {
    flex: 1,
  },

  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  chatHeaderPartner: {
    marginTop: 3,
    fontSize: 12,
    color: "#D4AF37",
    fontWeight: "600",
  },

  // MESSAGES
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
    marginBottom: 4,
    marginLeft: 6,

    fontSize: 10,
    color: "#888",

    fontWeight: "600",
  },

  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,

    borderRadius: 20,
  },

  bubbleMe: {
    backgroundColor: "#111111",
    borderTopRightRadius: 5,
  },

  bubblePartner: {
    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#ECE3D3",

    borderTopLeftRadius: 5,
  },

  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },

  bubbleTextMe: {
    color: "#FFFFFF",
  },

  bubbleTextPartner: {
    color: "#111111",
  },

  // INPUT BAR
  inputBar: {
    flexDirection: "row",
    alignItems: "center",

    padding: 14,

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,
    borderTopColor: "#ECE3D3",

    paddingBottom:
      Platform.OS === "ios"
        ? 28
        : 14,
  },

  textInput: {
    flex: 1,

    backgroundColor: "#F7F2EA",

    borderRadius: 24,

    paddingHorizontal: 18,
    paddingVertical: 10,

    fontSize: 15,
    color: "#111",

    borderWidth: 1,
    borderColor: "#E8E1D5",

    maxHeight: 100,
  },

  sendBtn: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: "#D4AF37",

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 12,

    shadowColor: "#D4AF37",
    shadowOpacity: 0.25,
    shadowRadius: 6,

    elevation: 4,
  },
});