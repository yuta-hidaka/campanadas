import Constants from "expo-constants";
import React, { useEffect } from "react";
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import Count from "./screens/Count";
import * as StoreReview from "expo-store-review";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { AppOpenAd, InterstitialAd, RewardedAd, BannerAd, TestIds } from 'react-native-google-mobile-ads';

/*
IOS
  App
  ca-app-pub-8220669417943263~7955364104
  banner
  ca-app-pub-8220669417943263/1171112255
  interstitial
  ca-app-pub-8220669417943263/7232574839

Android
  App
  ca-app-pub-8220669417943263~8421256202
  banner
  ca-app-pub-8220669417943263/3425191760
  Interstitial
  ca-app-pub-8220669417943263/9947750974
  

*/
const banner = __DEV__
  ? "ca-app-pub-3940256099942544/6300978111"
  : Platform.select({
      ios: "ca-app-pub-8220669417943263/1171112255",
      android: "ca-app-pub-8220669417943263/3425191760",
    });

const interstitial = __DEV__
  ? "ca-app-pub-3940256099942544/6300978111"
  : Platform.select({
      ios: "ca-app-pub-8220669417943263/7232574839",
      android: "ca-app-pub-8220669417943263/9947750974",
    });

export default function App() {
  useEffect(() => {
    (async () => {
      if (await StoreReview.hasAction()) {
        StoreReview.requestReview();
      }
      const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      if (result === RESULTS.DENIED) {
        await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      }
    })();
  });
  return (
    <SafeAreaView style={styles.container}>
      <Count />
      <BannerAd unitId={TestIds.BANNER} />
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
