import { AdMobBanner, requestPermissionsAsync } from 'expo-ads-admob';
import Constants from 'expo-constants';
import React, { useEffect } from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import Count from './screens/Count';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';


const AD_UNIT_ID_IOS_BANNER = Constants.manifest.extra.adIdIosBanner;
const AD_UNIT_ID_ANDROID_BANNER = Constants.manifest.extra.adIdAndroidBanner;
const unitIdBanner = __DEV__ ?
  "ca-app-pub-3940256099942544/6300978111" : Platform.select({
    ios: AD_UNIT_ID_IOS_BANNER,
    android: AD_UNIT_ID_ANDROID_BANNER,
  })
export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await requestTrackingPermissionsAsync();
      if (status === 'granted') {
        await requestPermissionsAsync();
      }
    })();
  })
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Count />
        <AdMobBanner
          style={styles.bottomBanner}
          adUnitID={unitIdBanner}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bottomBanner: {
    position: "absolute",
    bottom: 0
  },
});
