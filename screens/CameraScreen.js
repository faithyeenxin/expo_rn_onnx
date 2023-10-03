/** @format */

import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, Text } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

const CameraScreen = () => {
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
      savePicture(photo);
    }
  };

  const savePicture = async (photo) => {
    const asset = await MediaLibrary.createAssetAsync(photo.uri);
    const album = await MediaLibrary.getAlbumAsync("ExpoCameraExample");

    if (album === null) {
      await MediaLibrary.createAlbumAsync("ExpoCameraExample", asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {hasPermission === null ? (
        <View />
      ) : hasPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
        <View style={{ flex: 1 }}>
          <Camera
            style={{ flex: 1 }}
            type={Camera.Constants.Type.back}
            ref={(ref) => setCameraRef(ref)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  alignItems: "center",
                  backgroundColor: "transparent",
                }}
                onPress={takePicture}
              >
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                >
                  Take Photo
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
          {capturedImage && (
            <View
              style={{
                flex: 1,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
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
      )}
    </View>
  );
};

export default CameraScreen;
