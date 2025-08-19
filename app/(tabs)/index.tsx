import React, { useEffect, useState } from "react";
import { Alert, Button, View } from "react-native";
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

function Index() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    async function initAuth() {
      // Get the current Supabase session
      const session = await db.auth.getSession();

      if (session.data.session) {
        setSignedIn(true);

        // Check if provider is Google
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
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

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
    </View>
  );
}

export default Index;
