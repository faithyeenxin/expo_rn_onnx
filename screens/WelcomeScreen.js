/** @format */

import React from "react";
import { StyleSheet, View, Button } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import the useNavigation hook

const WelcomeScreen = () => {
  const navigation = useNavigation(); // Use the useNavigation hook here

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          gap: 80,
        }}
      >
        <Button
          onPress={() => {
            navigation.navigate("MLScreen");
          }}
          title="ML Screen"
        />
        <Button
          onPress={() => {
            navigation.navigate("CameraScreen");
          }}
          title="Camera Screen"
        />
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: "50%",
    justifyContent: "space-between",
  },
  image: {
    resizeMode: "cover",
  },
});
