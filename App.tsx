import Constants from "expo-constants";
import React, { useEffect } from "react";
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import Count from "./screens/Count";
import * as StoreReview from "expo-store-review";

const AD_UNIT_ID_IOS_BANNER = Constants.manifest.extra.adIdIosBanner;
const AD_UNIT_ID_ANDROID_BANNER = Constants.manifest.extra.adIdAndroidBanner;

const unitIdBanner = __DEV__
  ? "ca-app-pub-3940256099942544/6300978111"
  : Platform.select({
      ios: AD_UNIT_ID_IOS_BANNER,
      android: AD_UNIT_ID_ANDROID_BANNER,
    });

export default function App() {
  useEffect(() => {
    (async () => {
      if (await StoreReview.hasAction()) {
        StoreReview.requestReview();
      }
    })();
  });
  return (
    <SafeAreaView style={styles.container}>
      <Count />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  bottomBanner: {
    position: "absolute",
    bottom: 0,
  },
});
