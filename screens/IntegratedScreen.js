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
import { Alert } from "react-native";

import {
  bundleResourceIO,
  decodeJpeg,
  resizeBilinear,
} from "@tensorflow/tfjs-react-native";

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
    await tf.ready();
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setCapturedImage(photo);

      // Convert image to black and white
      const reformattedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      const imgB64 = reformattedImage.base64;

      // Use TensorFlow.js utility functions to process the image
      const imgBuffer = tf.util.encodeString(imgB64, "base64").buffer;
      const raw = new Uint8Array(imgBuffer);

      // Decode and resize the image
      const imageTensor = decodeJpeg(raw);
      const resizedImageTensor = tf.image.resizeBilinear(imageTensor, [28, 28]);

      const grayscaleImageTensor = tf.image.rgbToGrayscale(resizedImageTensor);

      const inputData = grayscaleImageTensor.toFloat().arraySync().flat();
      const normalizedInputData = inputData.map((value) => value / 255.0);

      try {
        const feeds = {};
        feeds[model.inputNames[0]] = new ort.Tensor(
          new Float32Array(normalizedInputData),
          [1, 28, 28]
        );
        const fetches = await model.run(feeds);
        const output = fetches[model.outputNames[0]];
        if (!output) {
          Alert.alert("failed to get output", `${model.outputNames[0]}`);
        } else {
          Alert.alert(
            "model inference successfully",
            `output shape: ${output.dims}, output data: ${output.data}`
          );
        }
      } catch (e) {
        Alert.alert("failed to inference model", `${e}`);
        throw e;
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
