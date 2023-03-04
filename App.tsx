import * as StoreReview from "expo-store-review";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import React, { useEffect } from "react";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import Count from "./screens/Count";
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
      const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      if (result === RESULTS.DENIED) {
        // The permission has not been requested, so request it.
        await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      }
      const adapterStatuses = await mobileAds().initialize();
      // console.log(adapterStatuses);
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
