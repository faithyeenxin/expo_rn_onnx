/** @format */

import React from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import * as ort from "onnxruntime-react-native";
import { Asset } from "expo-asset";
import { useNavigation } from "@react-navigation/native";

const exampleAssetsResults = [
  {
    hash: "e01f841f71737573ccdb47d7e3024d11",
    localUri:
      "file:///var/mobile/Containers/Data/Application/EAA6DCB8-B8D1-464A-808A-9E6E5B80151B/Library/Caches/ExponentAsset-e01f841f71737573ccdb47d7e3024d11.ort",
    width: null,
    height: null,
    downloading: false,
    downloaded: true,
    _downloadCallbacks: [],
    name: "mnist",
    type: "ort",
    uri: "http://192.168.203.40:8081/assets/assets/mnist.ort?platform=ios&hash=e01f841f71737573ccdb47d7e3024d11",
  },
];

let myModel;
async function loadModel() {
  try {
    // const assets = await Asset.loadAsync(require("./assets/yolov5s.onnx"));
    const assets = await Asset.loadAsync(require("../assets/mnist.ort"));
    console.log(JSON.stringify(assets));

    const modelUri = assets[0].localUri;
    if (!modelUri) {
      Alert.alert("failed to get model URI", `${assets[0]}`);
    } else {
      myModel = await ort.InferenceSession.create(modelUri);
      Alert.alert(
        "model loaded successfully",
        `myModel: ${JSON.stringify(myModel)}, input names: ${
          myModel.inputNames
        }, output names: ${myModel.outputNames}`
      );
    }
  } catch (e) {
    Alert.alert("failed to load model", `${e}`);
    throw e;
  }
}

async function runModel() {
  try {
    const inputData = new Float32Array(28 * 28);
    console.log(`inputData: ${inputData}`);
    const feeds = {};
    feeds[myModel.inputNames[0]] = new ort.Tensor(inputData, [1, 28, 28]);
    const fetches = await myModel.run(feeds);
    const output = fetches[myModel.outputNames[0]];
    if (!output) {
      Alert.alert("failed to get output", `${myModel.outputNames[0]}`);
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

const MLScreen = () => {
  const navigation = useNavigation(); // Use the useNavigation hook here

  return (
    <View style={styles.container}>
      <Text>using ONNX Runtime for React Native</Text>
      <Button title="Load model" onPress={loadModel}></Button>
      <Button title="Run" onPress={runModel}></Button>
      <Button
        title="Return to Welcome Screen"
        onPress={() => navigation.navigate("WelcomeScreen")}
      />
    </View>
  );
};

export default MLScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
