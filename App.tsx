import * as StoreReview from "expo-store-review";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import React, { useEffect } from "react";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import Count from "./screens/Count";

const banner = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: "ca-app-pub-8220669417943263/1171112255",
      android: "ca-app-pub-8220669417943263/3425191760",
    }) ?? "";

export default function App() {
  useEffect(() => {
    (async () => {
      if (!__DEV__ && (await StoreReview.hasAction())) {
        StoreReview.requestReview();
      }
      await requestTrackingPermissionsAsync();
      await mobileAds().initialize();
    })();
  });
  return (
    <SafeAreaView style={styles.container}>
      <Count />
      <BannerAd size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} unitId={banner} />
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
