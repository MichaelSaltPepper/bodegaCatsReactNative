import { createUserName } from "constants/createUserName";
import type { User } from "constants/DataTypes";
import React, { useEffect, useState } from "react";
import { Alert, Button, Text, View } from "react-native";
import { db } from "../../components/db/db";

// TODO allow switching from prod and dev
// TODO create users based on whether an existing
// already exists
// TODO update submission to include the status
// TODO handle failure if the user enters an already existing user id

import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";

export default function Index() {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function initAuth() {
      // Get the current Supabase session
      const session = await db.auth.getSession();
      console.log("my sesssion", session);
      if (session.data.session) {
        // sesssion.data.session.user.id
        const supabaseUserId = session.data.session.user.id;
        setSignedIn(true);
        const { data, error, status } = await db
          .from("User")
          .select("*")
          .eq("user_id", supabaseUserId);
        if (error && status !== 406) {
          throw error;
        }
        if (data) {
          const currUser: User[] = data.map((row: User) => ({
            user_name: row.user_name,
            user_id: row.user_id,
          }));
          setUser(currUser[0]);
        }
        // retrieve the user
      } else {
        setSignedIn(false);
      }
    }

    initAuth();

    // Listen for auth state changes (SIGN_IN / SIGN_OUT)
    const { data: listener } = db.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setSignedIn(true);
      } else if (event === "SIGNED_OUT") {
        setSignedIn(false);
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {}, []);

  const signIn = async () => {
    try {
      // Configure Google Sign-In right before login
      GoogleSignin.configure({
        iosClientId:
          "331869008608-fdajk1vkuu0ttfd0vdq4gutg72ntq1co.apps.googleusercontent.com",
      });

      // Trigger native Google Sign-In flow
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      // Send ID token to Supabase
      const { data, error } = await db.auth.signInWithIdToken({
        provider: "google",
        token: tokens.idToken,
      });

      if (error) {
        console.error(error);
      } else {
        const supabaseUserId = data.user.id;
        try {
          // select user entry with same id
          const { data, error, status } = await db
            .from("User")
            .select("*")
            .eq("user_id", supabaseUserId);
          console.log("data", data);
          if (error && status !== 406) {
            throw error;
          }
          if (data) {
            console.log("success");
            const newUser: User[] = data.map((row: User) => ({
              user_name: row.user_name,
              user_id: row.user_id,
            }));

            if (newUser.length === 0) {
              let newUserName = createUserName();
              // dont allow duplcate usernames
              while (true) {
                const { data, error, status } = await db
                  .from("User")
                  .select("*")
                  .eq("user_name", newUserName);
                console.log("data", data);
                if (error && status !== 406) {
                  throw error;
                }
                if (!data || data.length !== 0) {
                  newUserName = createUserName();
                } else {
                  break;
                }
              }

              /// create a new user
              await db
                .from("User") // your table name
                .insert([
                  {
                    user_id: supabaseUserId,
                    user_name: newUserName,
                  },
                ]);
              setUser({
                user_id: supabaseUserId,
                user_name: newUserName,
              });
            } else {
              // set the user name
              setUser(newUser[0]);
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            Alert.alert(error.message);
          }
        }
      }
    } catch (err) {
      console.error("Google Sign-In failed:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      await db.auth.signOut();
      Alert.alert("Signed out", "You have been signed out of Google");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Something went wrong while signing out");
    }
    setUser(null);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center", // vertical centering
        alignItems: "center", // horizontal centering
        bottom: 50,
      }}
    >
      {!signedIn && (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signIn}
        />
      )}
      {signedIn && <Button title="Sign Out" onPress={handleSignOut} />}
      <Text style={{ color: "white", top: 20 }}>
        {user !== null ? `Signed In as ${user?.user_name}` : "Not Logged In"}
      </Text>
      {/* <Button onPress={() => console.log(user)} title="debug"></Button> */}
    </View>
  );
}
