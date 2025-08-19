import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signIn, signUp } from "../../components/auth";
import { db } from "../../components/db/db";

// TODO sign-user in immediately once they make an account
// TODO make app compatible with key chain passwords
// TODO allow users to reset passwords

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  // Check if user is already signed in
  useEffect(() => {
    async function checkUser() {
      const userRes = await db.auth.getUser();
      if (userRes.data.user) setSignedIn(true);
    }
    checkUser();
  }, []);

  const handleAuth = async () => {
    if (isSigningUp) {
      const { data, error } = await signUp(email, password);
      if (error) Alert.alert("Sign-up Error", error.message);
      else
        Alert.alert(
          "Success",
          `Account created for ${data.user?.email}. Please verify your email if required.`
        );
    } else {
      const { data, error } = await signIn(email, password);
      if (error) Alert.alert("Sign-in Error", error.message);
      else {
        Alert.alert("Success", `Logged in as ${data.user?.email}`);
        setSignedIn(true);
      }
    }
  };

  const handleSignOut = async () => {
    const { error } = await db.auth.signOut();
    if (error) Alert.alert("Error", error.message);
    else setSignedIn(false);
  };

  if (signedIn) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Welcome! You are signed in.</Text>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    );
  }

  return (
    <View style={{ padding: 20, backgroundColor: "white" }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          marginBottom: 10,
          borderWidth: 1,
          padding: 5,
          borderRadius: 5,
        }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          marginBottom: 10,
          borderWidth: 1,
          padding: 5,
          borderRadius: 5,
        }}
      />
      <Button
        title={isSigningUp ? "Sign Up" : "Sign In"}
        onPress={handleAuth}
      />
      <TouchableOpacity
        style={{ marginTop: 10 }}
        onPress={() => setIsSigningUp(!isSigningUp)}
      >
        <Text style={{ color: "blue" }}>
          {isSigningUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Index;
