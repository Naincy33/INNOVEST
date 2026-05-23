import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase";

export default function TeamRequestsScreen() {

  const [requests, setRequests] =
    useState([]);

  // 🔥 FETCH REQUESTS
  useEffect(() => {

    const user =
      auth.currentUser;

    if (!user) return;

    const q = query(
      collection(
        db,
        "teamRequests"
      ),
      where(
        "ownerId",
        "==",
        user.uid
      )
    );

    const unsub =
      onSnapshot(
        q,
        (snapshot) => {

          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setRequests(data);
        }
      );

    return () => unsub();

  }, []);

  // ✅ ACCEPT
  const handleAccept =
    async (item) => {

      try {

        // 🔥 UPDATE STATUS
        await updateDoc(
          doc(
            db,
            "teamRequests",
            item.id
          ),
          {
            status:
              "accepted",
          }
        );

        // 🔥 GIVE 100 COINS
        await updateDoc(
          doc(
            db,
            "users",
            item.senderId
          ),
          {
            coins:
              increment(100),
          }
        );

        Alert.alert(
          "✅ Accepted",
          "User received 100 coins 🚀"
        );

      } catch (err) {
        console.log(err);
      }
    };

  // ❌ REJECT
  const handleReject =
    async (item) => {

      try {

        await updateDoc(
          doc(
            db,
            "teamRequests",
            item.id
          ),
          {
            status:
              "rejected",
          }
        );

        Alert.alert(
          "❌ Rejected"
        );

      } catch (err) {
        console.log(err);
      }
    };

  const renderStatus =
    (status) => {

      if (
        status ===
        "accepted"
      ) {

        return (
          <View
            style={
              styles.acceptedBadge
            }
          >

            <Text
              style={
                styles.badgeText
              }
            >
              ✅ Accepted
            </Text>

          </View>
        );
      }

      if (
        status ===
        "rejected"
      ) {

        return (
          <View
            style={
              styles.rejectedBadge
            }
          >

            <Text
              style={
                styles.badgeText
              }
            >
              ❌ Rejected
            </Text>

          </View>
        );
      }

      return (
        <View
          style={
            styles.pendingBadge
          }
        >

          <Text
            style={
              styles.badgeText
            }
          >
            ⏳ Pending
          </Text>

        </View>
      );
    };

  return (

    <View
      style={styles.container}
    >

      {/* HEADER */}
      <View
        style={styles.header}
      >

        <Text
          style={styles.heading}
        >
          🤝 Team Requests
        </Text>

        <Text
          style={styles.subHeading}
        >
          Collaborate with innovators
        </Text>

      </View>

      {/* LIST */}
      <FlatList
        data={requests}
        keyExtractor={(item) =>
          item.id
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={{
          paddingBottom: 120,
        }}

        ListEmptyComponent={

          <View
            style={
              styles.emptyBox
            }
          >

            <Text
              style={
                styles.emptyEmoji
              }
            >
              🤝
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No Requests Yet
            </Text>

            <Text
              style={
                styles.emptySub
              }
            >
              Team requests will appear here
            </Text>

          </View>
        }

        renderItem={({
          item,
        }) => (

          <View
            style={styles.card}
          >

            {/* TOP */}
            <View
              style={
                styles.topRow
              }
            >

              <View
                style={{
                  flex: 1,
                }}
              >

                <Text
                  style={
                    styles.ideaTitle
                  }
                >
                  🚀{" "}
                  {
                    item.ideaTitle
                  }
                </Text>

                <Text
                  style={
                    styles.email
                  }
                >
                  {
                    item.senderEmail
                  }
                </Text>

              </View>

              {renderStatus(
                item.status
              )}

            </View>

            {/* BUTTONS */}
            {item.status ===
              "pending" && (

              <View
                style={
                  styles.actions
                }
              >

                {/* ACCEPT */}
                <TouchableOpacity
                  style={
                    styles.acceptBtn
                  }
                  onPress={() =>
                    handleAccept(
                      item
                    )
                  }
                >

                  <Text
                    style={
                      styles.btnText
                    }
                  >
                    Accept
                  </Text>

                </TouchableOpacity>

                {/* REJECT */}
                <TouchableOpacity
                  style={
                    styles.rejectBtn
                  }
                  onPress={() =>
                    handleReject(
                      item
                    )
                  }
                >

                  <Text
                    style={
                      styles.rejectText
                    }
                  >
                    Reject
                  </Text>

                </TouchableOpacity>

              </View>
            )}

          </View>
        )}
      />

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F7F2EA",
    },

    header: {
      paddingTop: 65,
      paddingHorizontal: 24,
      paddingBottom: 10,
    },

    heading: {
      fontSize: 34,
      fontWeight: "bold",
      color: "#111",
    },

    subHeading: {
      marginTop: 8,
      color: "#777",
      fontSize: 15,
    },

    card: {
      backgroundColor:
        "#fff",

      marginHorizontal: 20,

      marginTop: 18,

      borderRadius: 28,

      padding: 22,

      shadowColor: "#000",

      shadowOpacity: 0.05,

      shadowRadius: 10,

      elevation: 3,
    },

    topRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",
    },

    ideaTitle: {
      fontSize: 21,

      fontWeight: "bold",

      color: "#111",
    },

    email: {
      marginTop: 10,

      color: "#777",

      fontSize: 14,
    },

    pendingBadge: {
      backgroundColor:
        "#F5F0E6",

      paddingHorizontal: 14,

      paddingVertical: 8,

      borderRadius: 999,
    },

    acceptedBadge: {
      backgroundColor:
        "#DFF5E1",

      paddingHorizontal: 14,

      paddingVertical: 8,

      borderRadius: 999,
    },

    rejectedBadge: {
      backgroundColor:
        "#FFE2E2",

      paddingHorizontal: 14,

      paddingVertical: 8,

      borderRadius: 999,
    },

    badgeText: {
      fontWeight: "bold",

      color: "#111",

      fontSize: 12,
    },

    actions: {
      flexDirection: "row",

      marginTop: 24,
    },

    acceptBtn: {
      flex: 1,

      backgroundColor:
        "#111",

      padding: 16,

      borderRadius: 20,

      alignItems: "center",

      marginRight: 8,
    },

    rejectBtn: {
      flex: 1,

      backgroundColor:
        "#F5F0E6",

      padding: 16,

      borderRadius: 20,

      alignItems: "center",

      marginLeft: 8,
    },

    btnText: {
      color: "#fff",

      fontWeight: "bold",

      fontSize: 15,
    },

    rejectText: {
      color: "#111",

      fontWeight: "bold",

      fontSize: 15,
    },

    emptyBox: {
      marginTop: 120,

      alignItems: "center",

      paddingHorizontal: 30,
    },

    emptyEmoji: {
      fontSize: 60,
    },

    emptyTitle: {
      marginTop: 20,

      fontSize: 24,

      fontWeight: "bold",

      color: "#111",
    },

    emptySub: {
      marginTop: 10,

      color: "#777",

      textAlign: "center",

      lineHeight: 22,
    },
  });