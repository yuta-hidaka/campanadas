import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import Clock from './Clock';


const isIos = Platform.OS === 'ios';
export default function Count() {
    const text = 'Prepararos para comer las uvas !!!'
    const Cuartos = 'Los Cuartos  !!!'
    const Campanadas = 'Las Campanadas  !!!'
    const feliz = 'Feliz año nuevo!!!🥳'
    const [time, setTime] = useState('0000-00-00 00:00:00');
    const [Sec, setSec] = useState(0);
    const [hide, setHide] = useState(false);
    const [isTest, setIsTest] = useState(false);
    const [testText, setTestText] = useState('TEST');
    const [bellSound, setBellSound]: any = useState();
    const [bellSound2, setBellSound2]: any = useState();
    const [CuartosSound, setCuartosSound]: any = useState();
    const [cheerSound, setCheerSound]: any = useState();
    const [displayCount, setDisplayCount]: any = useState([]);
    const [displayText, setDisplayText] = useState(text);


    const countCalc: any = (sec: number | null) => {
        const position: number = (Number(sec) / 3) + 1;
        const __chckColor = (v: number) => {
            if (v <= position && position <= 12) return styles.countDownNumberDark;
            return styles.countDownNumberWhite;
        }
        const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

        const countNode = count.map((v) => {
            return (
                <View key={v} style={[styles.countDownNumberWrapper, __chckColor(v)]}>
                    <Text style={[styles.countDownNumber, __chckColor(v)]}>
                        {v}
                    </Text>
                </View>
            )
        })
        setDisplayCount(countNode)
    }
    const playBellSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/bell.mp3')
        );
        setBellSound(sound);
        await sound.playAsync();
    }
    const playBellSound2 = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/bell2.mp3')
        );
        setBellSound2(sound);
        await sound.playAsync();
    }
    const playCuartos = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/cuartos.mp3')
        );
        setCuartosSound(sound);
        await sound.playAsync();
    }
    const playCheerSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/cheer.mp3')
        );
        setCheerSound(sound);
        await sound.playAsync();
    }

    useEffect(() => {
        return bellSound ? () => bellSound.unloadAsync() : undefined;
    }, [bellSound]);

    const setClock = async () => {
        const now = new Date();
        const year = now.getFullYear()
        const month = ('0' + (now.getMonth() + 1)).slice(-2)
        const date = ('0' + now.getDate()).slice(-2)
        const hour = ('0' + now.getHours()).slice(-2)
        const min = ('0' + now.getMinutes()).slice(-2)
        const sec = ('0' + now.getSeconds()).slice(-2)
        const secNumber = now.getSeconds()
        const minNumber = now.getMinutes()
        let monthNumber = minNumber % 1 === 0 ? 12 : minNumber % 2 === 0 ? 1 : now.getMonth() + 1
        let dateNumber = minNumber % 1 === 0 ? 31 : minNumber % 2 === 0 ? 1 : now.getDate
        if (secNumber === Sec) return;
        setTime(`${year}-${month}-${date} ${hour}:${min}:${sec}`)
        if (isTest || monthNumber === 12 && dateNumber === 31 || monthNumber === 1 && dateNumber === 1) {
            if ((secNumber === 0 || secNumber % 3 === 0) && secNumber <= 33 && monthNumber === 1) {
                countCalc(secNumber);
                playBellSound();
                setSec(secNumber)
            }

            switch (secNumber) {
                case 0:
                    if (cheerSound) cheerSound.unloadAsync();
                    if (bellSound) bellSound.unloadAsync();
                    if (CuartosSound) CuartosSound.unloadAsync();
                    if (bellSound2) bellSound2.unloadAsync();
                    break;
                case 34:
                    if (monthNumber === 12) break;
                    countCalc(-1);
                    let tmpText = '';
                    setHide(true);
                    const max = 50
                    for (let i = 0; i < max; i++) {
                        tmpText += '🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉'
                        if (i === (max / 2)) {
                            tmpText += feliz
                        }
                        setDisplayText(tmpText);
                    }
                    playCheerSound();
                    break;
                case 36:
                    if (monthNumber === 12) break;
                    setHide(false);
                    setDisplayText(text)
                    if (isTest || minNumber === 59) {
                        playBellSound2();
                    }
                    break;
                case 44:
                    if (monthNumber === 1) break;
                    playCuartos()
                    setDisplayText(Cuartos);
                    break;
                case 58:
                    if (isTest || minNumber === 59 && monthNumber === 1) {
                        setDisplayText(Campanadas);
                    } else {
                        setDisplayText(text);
                    }
                    break;
            }
        }

    }

    useEffect(() => {
        const interval = setInterval(() => setClock(), 10);
        return () => clearInterval(interval);
    })
    useEffect(() => {
        const testText = isTest ? 'TEST STOP' : 'TEST'
        setTestText(testText)
        if (!isTest) {
            if (cheerSound) cheerSound.unloadAsync();
            if (bellSound) bellSound.unloadAsync();
            if (bellSound2) bellSound2.unloadAsync();
            if (CuartosSound) CuartosSound.unloadAsync();
            setDisplayText(text)
            setHide(false)
            countCalc(-1);
        }
    }, [isTest])

    return (
        <View style={styles.container}>

            <Text style={styles.displayText}>
                {displayText}
            </Text>
            {!hide &&
                (<View style={styles.container}>
                    <View style={{ marginTop: 5 }}>
                        <Clock />
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.time}>
                            {time}
                        </Text>
                    </View>
                    <View style={styles.displayCount}>
                        {displayCount}
                    </View>
                </View>
                )
            }
            <View>
                <Button
                    icon="play-circle-outline"
                    style={{ marginTop: 20, marginBottom: 50 }}
                    color="#000000"
                    mode="outlined"
                    onPress={() => { setIsTest(!isTest) }}
                >
                    {testText}
                </Button>
            </View>
        </View >
    )
}


const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: RFValue(15),
    },
    displayCount: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    countDown: {
        fontSize: RFValue(15),
        fontWeight: "bold"
    },
    displayText: {
        fontSize: RFValue(35),
        fontWeight: "bold"
    },
    time: {
        fontSize: RFValue(25),
    },
    img: {
        width: 30,
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
        margin: 3
    },
    countDownNumberWhite: {
        backgroundColor: '#fff',
        color: '#000000'
    },
    countDownNumberDark: {
        backgroundColor: '#000000',
        color: '#fff'
    },


});
