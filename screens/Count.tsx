import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  AdEventType,
  InterstitialAd,
  TestIds
} from "react-native-google-mobile-ads";
import { Button } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import NewClock from "./Clock";

const isIos = Platform.OS === "ios";
const GRAPE = 12;

const interstitial = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios: "ca-app-pub-8220669417943263/7232574839",
      android: "ca-app-pub-8220669417943263/9947750974",
    }) ?? "";

const interstitialAd = InterstitialAd.createForAdRequest(interstitial, {
  requestNonPersonalizedAdsOnly: true,
});

export default function Count() {
  const text = "Prepararos para comer las uvas !!!";
  const Cuartos = "Los Cuartos  !!!";
  const Campanadas = "Las Campanadas  !!!";
  const feliz = "Feliz año nuevo!!!🥳";
  const [Sec, setSec] = useState(0);
  const [grape, setGrape] = useState(GRAPE);
  const [canon, setCanon] = useState<any>();
  const [isTest, setIsTest] = useState(false);
  const [testText, setTestText] = useState("TEST");
  const [bellSound, setBellSound]: any = useState();
  const [bellSound2, setBellSound2]: any = useState();
  const [CuartosSound, setCuartosSound]: any = useState();
  const [cheerSound, setCheerSound]: any = useState();
  const [displayText, setDisplayText] = useState(text);
  // Ads
  const [loaded, setLoaded] = useState(false);

  const playCampanadas = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/bell.mp3")
    );
    setBellSound(sound);
    await sound.playAsync();
  };
  const playReadyToCampanadas = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/bell2.mp3")
    );
    setBellSound2(sound);
    await sound.playAsync();
  };
  const playCuartos = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/cuartos.mp3")
    );
    setCuartosSound(sound);
    await sound.playAsync();
  };
  const playCheerSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/cheer.mp3")
    );
    setCheerSound(sound);
    await sound.playAsync();
  };

  const unloadSounds = () => {
    if (cheerSound) cheerSound.unloadAsync();
    if (bellSound) bellSound.unloadAsync();
    if (CuartosSound) CuartosSound.unloadAsync();
    if (bellSound2) bellSound2.unloadAsync();
  };

  const onChange = (now: Date) => {
    const secNumber = now.getSeconds();
    if (secNumber === Sec) return;
    setSec(secNumber);

    const min = now.getMinutes();
    const month = now.getMonth() + 1;
    const date = now.getDate();

    const ready =
      isTest || (month === 12 && date === 31) || (month === 1 && date === 1);
    if (!ready) return;

    const campanadas =
      (secNumber === 0 || secNumber % 3 === 0) &&
      secNumber <= 33 &&
      (month === 1 || isTest);
    if (campanadas) {
      setGrape(GRAPE - Sec === 60 ? 0 : Math.round(Sec / 3));
      playCampanadas();
    }
    switch (secNumber) {
      case 0:
        unloadSounds();
        break;
      case 34:
        if (!isTest && month === 12) break;
        playCheerSound();
        setGrape(GRAPE);
        setDisplayText(feliz);
        setTimeout(() => canon.stop(), 10000);
        setTimeout(() => interstitialAd.show(), 4000);
        if (canon) canon.start();
        break;
      case 36:
        if (!isTest && month === 12) break;
        setDisplayText(text);
        if (isTest || min === 59) playReadyToCampanadas();
        break;
      case 44:
        if (!isTest && month === 1) break;
        playCuartos();
        setDisplayText(Cuartos);
        break;
      case 58:
        const ring = isTest || (min === 59 && month === 1);
        ring ? setDisplayText(Campanadas) : setDisplayText(text);
        break;
    }
  };

  useEffect(() => {
    const unsubscribe = interstitialAd.addAdEventsListener(
      ({ type }) => {
        switch (type) {
          case AdEventType.CLOSED:
            interstitialAd.load();
            break;
          default:
            break;
        }
      }
    );

    // Start loading the interstitial straight away
    interstitialAd.load();

    // Unsubscribe from events on unmount
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!interstitialAd.loaded) interstitialAd.load();
  }, [interstitialAd.loaded]);

  useEffect(() => {
    return CuartosSound ? () => CuartosSound.unloadAsync() : undefined;
  }, [CuartosSound]);

  useEffect(() => {
    const testText = isTest ? "TEST STOP" : "TEST";
    setTestText(testText);
    if (!isTest) {
      if (cheerSound) cheerSound.unloadAsync();
      if (bellSound) bellSound.unloadAsync();
      if (bellSound2) bellSound2.unloadAsync();
      if (CuartosSound) CuartosSound.unloadAsync();
      setDisplayText(text);
    }
  }, [isTest]);

  return (
    <>
      <ConfettiCannon
        fadeOut
        explosionSpeed={500}
        fallSpeed={4000}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        ref={(ref) => setCanon(ref)}
      />
      <View style={styles.container}>
        <View style={styles.displayTextContainer}>
          <Text style={styles.displayText}>{displayText}</Text>
          <Text style={styles.displayGrapeText}>{grape}</Text>
        </View>
        <View style={styles.container}>
          <View style={{ marginTop: 5 }}>
            <NewClock onChange={onChange} />
          </View>
        </View>
        <View
          style={{
            marginTop: 20,
            marginBottom: 50,
            position: "absolute",
            bottom: 0,
          }}
        >
          <Button
            icon="play-circle-outline"
            color="grey"
            mode="outlined"
            onPress={() => setIsTest(!isTest)}
          >
            {testText}
          </Button>
          <Button
            onPress={() => {
              if (interstitialAd.loaded) {
                interstitialAd.show();
              } else {
                interstitialAd.load();
              }
            }}
          >
            show
          </Button>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    fontSize: RFValue(15),
  },
  displayText: {
    fontSize: RFValue(18),
    fontWeight: "bold",
    color: "grey",
    textAlign: "center",
  },
  displayGrapeText: {
    fontSize: RFValue(45),
    fontWeight: "bold",
    marginTop: "5%",
    color: "grey",
    textAlign: "center",
  },
  displayGrape: {
    fontSize: RFValue(40),
    marginTop: "8%",
    fontWeight: "bold",
    color: "grey",
    textAlign: "center",
  },
  displayTextContainer: {
    position: "absolute",
    top: 20,
    width: "100%",
  },
  countDownNumber: {
    textAlign: "center",
    fontWeight: "bold",
    padding: 5,
    fontSize: RFValue(14),
  },
  countDownNumberWrapper: {
    borderRadius: 50,
    borderWidth: 0.5,
    textAlign: "center",
    fontWeight: "bold",
    padding: 5,
    width: isIos ? 35 : 50,
    height: isIos ? 35 : 50,
    fontSize: RFValue(20),
    margin: 3,
  },
  countDownNumberWhite: {
    backgroundColor: "#fff",
    color: "#000000",
  },
  countDownNumberDark: {
    backgroundColor: "#000000",
    color: "#fff",
  },
});
