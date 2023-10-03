/** @format */

import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, Text, Button } from "react-native";
import { Camera } from "expo-camera";
import { useNavigation } from "@react-navigation/native";

const CameraScreen = () => {
  const navigation = useNavigation(); // Use the useNavigation hook here
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setCapturedImage(photo);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {hasPermission === null ?? <View />}
      {hasPermission === false ?? <Text>No access to camera</Text>}
      <View style={{ flex: 1 }}>
        {hasPermission !== null && hasPermission !== false && (
          <Camera
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            type={Camera.Constants.Type.front}
            ref={(ref) => setCameraRef(ref)}
          >
            <View
              style={{
                position: "absolute",
                bottom: 10,
                justifyContent: "center",
                padding: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 10,
                }}
                onPress={takePicture}
              >
                <Text
                  style={{
                    fontSize: 18,
                    marginBottom: 10,
                    color: "white",
                  }}
                >
                  Take Photo
                </Text>
                <Button
                  title="Return to Welcome Screen"
                  onPress={() => navigation.navigate("WelcomeScreen")}
                />
              </TouchableOpacity>
            </View>
          </Camera>
        )}
        {capturedImage && (
          <View
            style={{
              flex: 1,
              position: "absolute",
              width: "30%",
              height: "30%",
              right: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: capturedImage.uri }}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default CameraScreen;
