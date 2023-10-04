/** @format */

import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, Text, Button } from "react-native";
import { Camera } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import * as ort from "onnxruntime-react-native";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import * as ImageManipulator from "expo-image-manipulator";
import { Asset } from "expo-asset";
import { fetch } from "@tensorflow/tfjs-react-native";
import { AssetUtils } from "expo-asset-utils";
const IntegratedScreen = () => {
  const navigation = useNavigation(); // Use the useNavigation hook here
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [model, setModel] = useState(null);

  async function loadModel() {
    const assets = await Asset.loadAsync(require("../assets/mnist.ort"));
    const modelUri = assets[0].localUri;
    if (!modelUri) {
      console.error("Failed to get model URI");
    } else {
      const loadedModel = await ort.InferenceSession.create(modelUri);
      setModel(loadedModel);
    }
  }
  const getCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };
  useEffect(() => {
    getCameraPermission();
    loadModel();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setCapturedImage(photo);

      // Convert image to black and white
      const blackAndWhiteImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 28, height: 28 } }],
        { format: ImageManipulator.SaveFormat.PNG, base64: true }
      );
      const inputTensor = tf.node.decodeImage(blackAndWhiteImage.base64);
      // Convert base64 string to tensor
      //   const inputTensor = tf.node.decodeImage(blackAndWhiteImage.base64);
      //   const inputTensor = await fetch(
      //     `data:image/png;base64,${blackAndWhiteImage.base64}`
      //   );
      //   console.log(inputTensor);
      //   const uint8Array = AssetUtils.base64ToByteArray(
      //     blackAndWhiteImage.base64
      //   );

      // Decode the PNG image to a tensor
      //   const inputTensor = decodePng(uint8Array);

      // Prepare input data for the model
      const inputData = inputTensor.dataSync();
      const feeds = {};
      feeds[model.inputNames[0]] = new ort.Tensor(
        new Float32Array(inputData),
        [1, 28, 28, 1]
      );
      // Run the model
      try {
        const fetches = await model.run(feeds);
        const output = fetches[model.outputNames[0]];
        if (output) {
          Alert("Model output:", output.data);
          // Process the model output as needed
        } else {
          Alert("Failed to get model output");
        }
      } catch (error) {
        Alert("Failed to run model:", error);
      }
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
            type={Camera.Constants.Type.back}
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

export default IntegratedScreen;
