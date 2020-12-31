import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Count() {
    const [time, setTime] = useState('0000-00-00 00:00:00');
    const [countDown, setCountDown] = useState('①②③④⑤⑥⑦⑧⑨⑩⑪⑫');
    const setClock = () => {
        const now = new Date();
        const year = now.getFullYear()
        const month = ('0' + (now.getMonth() + 1)).slice(-2)
        const date = ('0' + now.getDate()).slice(-2)
        const hour = ('0' + now.getHours()).slice(-2)
        const min = ('0' + now.getMinutes()).slice(-2)
        const sec = ('0' + now.getSeconds()).slice(-2)
        const secNumber = now.getSeconds()
        const minNumber = now.getMinutes()
        const dateNumber = now.getDate()
        const monthNumber = (now.getMonth() + 1)
        const text = 'Prepararos para comer las uvas !!!'
        const feliz = 'Feliz año nuevo !!!'
        setTime(`${year}-${month}-${date} ${hour}:${min}:${sec}`)

        if (monthNumber !== 12 && dateNumber !== 31) return;

        switch (secNumber) {
            case 45:
                if (minNumber !== 59) break;
                setCountDown(text)
                break;
            case 46:
                if (minNumber !== 59) break;
                setCountDown(text)
                break;
            case 47:
                if (minNumber !== 59) break;
                setCountDown(text)
                break;
            case 48:
                if (minNumber !== 59) break;
                setCountDown(text)
                break;
            case 49:
                if (minNumber !== 59) break;
                setCountDown('❶②③④⑤⑥⑦⑧⑨⑩⑪⑫')
                break;
            case 50:
                if (minNumber !== 59) break;
                setCountDown('❶❷③④⑤⑥⑦⑧⑨⑩⑪⑫')
                break;
            case 51:
                if (minNumber !== 59) break;
                setCountDown('❶❷❸④⑤⑥⑦⑧⑨⑩⑪⑫')
                break;
            case 52:
                if (minNumber !== 59) break;
                setCountDown('❶❷❸❹⑤⑥⑦⑧⑨⑩⑪⑫')
                break;
            case 53:
                if (minNumber !== 59) break;
                setCountDown('❶❷❸❹❺⑥⑦⑧⑨⑩⑪⑫')
                break;
            case 54:
                if (minNumber !== 59) break;
                setCountDown('❶❷❸❹❺❻⑦⑧⑨⑩⑪⑫')
                break;
            case 55:
                if (minNumber !== 59) break;
                setCountDown('❶❷❸❹❺❻❼⑧⑨⑩⑪⑫')
                break;
            case 56:
                if (minNumber !== 59) break;
                setCountDown('❶❷❸❹❺❻❼❽⑨⑩⑪⑫')
                break;
            case 57:
                if (minNumber !== 59) break;
                setCountDown('❶❷❸❹❺❻❼❽❾⑩⑪⑫')
                break;
            case 58:
                if (minNumber !== 59) break;
                setCountDown('❶❷❸❹❺❻❼❽❾❿⑪⑫')
                break;
            case 59:
                if (minNumber !== 59) break;
                setCountDown('❶❷❸❹❺❻❼❽❾❿⓫⑫')
                break;
            case 0:
                if (minNumber !== 0) break;
                setCountDown('❶❷❸❹❺❻❼❽❾❿⓫⓬')
                break;
            case 1:
                if (minNumber !== 0) break;
                setCountDown(feliz)
                break;
            case 2:
                if (minNumber !== 0) break;
                setCountDown(feliz)
                break;
            case 3:
                if (minNumber !== 0) break;
                setCountDown(feliz)
                break;
            case 4:
                if (minNumber !== 0) break;
                setCountDown(feliz)
                break;
            case 5:
                if (minNumber !== 0) break;
                setCountDown(feliz)
                break;
            case 6:
                if (minNumber !== 0) break;
                setCountDown(feliz)
                break;
            case 7:
                if (minNumber !== 0) break;
                setCountDown(feliz)
                break;
            case 8:
                if (minNumber !== 0) break;
                setCountDown(feliz)
                break;
            case 9:
                if (minNumber !== 0) break;
                setCountDown(feliz)
                break;
            case 10:
                if (minNumber !== 0) break;
                setCountDown(feliz)
                break;
        }
    }
    setInterval(() => setClock(), 500);
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.time}>
                    {time}
                </Text>
            </View>
            <Text style={styles.countDown}>
                {countDown}
            </Text>
            {/* <View style={{ flexDirection: 'row' }}>
                <Text style={styles.countDownNumber}>
                    1
                </Text>
                <Text style={styles.countDownNumber}>
                    1
                </Text>
                <Text style={styles.countDownNumber}>
                    1
                </Text>
                <Text style={styles.countDownNumber}>
                    1
                </Text>
                <Text style={styles.countDownNumber}>
                    1
                </Text>
                <Text style={styles.countDownNumber}>
                    1
                </Text>
                <Text style={styles.countDownNumber}>
                    1
                </Text>
                <Text style={styles.countDownNumber}>
                    1
                </Text>
                <Text style={styles.countDownNumber}>
                    1
                </Text>
            </View> */}
            <View>
                <Image source={require('../assets/tenor.gif')} />
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
    },
    countDown: {
        fontSize: 30,
        fontWeight: "bold"
    },
    time: {
        fontSize: 30,
    },
    img: {
        width: 30,
    },
    countDownNumber: {
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#000000",
        textAlign: "center",
        fontWeight: "bold",
        padding: 5,
        width: 50,
        height: 50,
        fontSize: 27,
    },
    countDownNumberWhite: {
        borderColor: "#000000"
    },
    countDownNumberDark: {
        borderColor: "#000000"
    },

});
