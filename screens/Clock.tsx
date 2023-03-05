import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  size?: number;
  onChange?: (v: Date) => void;
};

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function Clock(props: Props) {
  const [minDegree, setMinDegree] = useState(0);
  const [secDegree, setSecDegree] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval2 = setInterval(() => {
      const now = new Date();
      setTime(now);
      setMinDegree(now.getMinutes() * 6);
      setSecDegree((now.getSeconds() + now.getMilliseconds() / 1000) * 6);
    }, 100);
    return () => clearInterval(interval2);
  }, []);

  useEffect(() => props?.onChange && props.onChange(time), [time]);

  return (
    <>
      <View style={styles.container}>
        {/* Time */}
        <View style={[styles.datetimeContainer]}>
          <View style={[styles.dateContainer]}>
            <Text style={[styles.dateText]}>
              {`0${time.getMonth() + 1}`.slice(-2)}
            </Text>
            {/* <Text style={[styles.dateText]}></Text> */}
            <Text style={[styles.dateText]}>
              {`0${time.getDate()}`.slice(-2)}
            </Text>
          </View>
          <View style={[styles.timeContainer]}>
            <Text style={[styles.timeText]}>
              {`0${time.getHours()}`.slice(-2)}
            </Text>
            <Text style={[styles.timeText]}>
              {`0${time.getMinutes()}`.slice(-2)}
            </Text>
            <Text style={[styles.timeText]}>
              {`0${time.getSeconds()}`.slice(-2)}
            </Text>
          </View>
        </View>
        <View style={styles.clockContainer}>
          {HOURS.map((v, i) => {
            return (
              <View
                key={i}
                style={[
                  styles.objContainer,
                  { transform: [{ rotate: `${v * 30}deg` }] },
                ]}
              >
                <View
                  style={[
                    styles.obj,
                    Math.abs(time.getHours() - 12) === v && {
                      backgroundColor: "#aacf53",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.objText,
                      Math.abs(time.getHours() - 12) === v && {
                        color: "white",
                      },
                    ]}
                  >
                    {v}
                  </Text>
                </View>
              </View>
            );
          })}
          {HOURS.map((v, i) => {
            return (
              <View
                key={i}
                style={[
                  styles.objContainerMin,
                  { transform: [{ rotate: `${v * 30}deg` }] },
                ]}
              >
                <View style={[styles.objMin]}>
                  <Text style={[styles.objTextMin]}>{v * 5}</Text>
                </View>
              </View>
            );
          })}
          <View
            style={[
              styles.center,
              { transform: [{ rotate: `${minDegree}deg` }] },
            ]}
          >
            <View style={styles.min}></View>
          </View>
          <View
            style={[
              styles.center,
              { transform: [{ rotate: `${secDegree}deg` }] },
            ]}
          >
            <View style={styles.sec}></View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: "auto",
    textAlign: "center",
  },
  datetimeContainer: {
    width: 150,
    height: "100%",
    position: "absolute",
    flex: 1,
    alignSelf: "center",
    paddingVertical: "50%",
  },
  timeContainer: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "center",
  },
  dateContainer: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "center",
  },
  dateText: {
    fontSize: 40,
    // fontSize: RFValue(40),
    flex: 1,
    alignSelf: "center",
    textAlign: "center",
    color: "grey",
  },
  timeText: {
    fontSize: 30,
    flex: 1,
    textAlign: "center",
    color: "grey",
  },
  clockContainer: {
    width: 20,
    height: 300,
    margin: "auto",
    textAlign: "center",
    display: "flex",
  },
  center: {
    width: 20,
    height: "100%",
    position: "absolute",
    textAlign: "center",
    margin: "auto",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  min: {
    height: 15,
    width: 10,
    backgroundColor: "#aacf53",
    borderRadius: 9999,
    top: "15%",
  },
  sec: {
    height: 15,
    width: 10,
    // backgroundColor: "grey",
    backgroundColor: "#aacf53",
    borderRadius: 9999,
    top: "15%",
  },
  obj: {
    color: "grey",
    position: "absolute",
    borderRadius: 999999,
    flex: 1,
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    height: 25,
    width: 25,
  },
  objContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    textAlign: "center",
  },
  objText: {
    fontWeight: "bold",
    textAlign: "center",
    color: "grey",
    flex: 1,
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: "auto",
  },
  objMin: {
    color: "grey",
    position: "absolute",
    borderRadius: 999999,
    flex: 1,
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    height: 25,
    width: 25,
    marginTop: 20,
  },
  objContainerMin: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
    margin: 0,
  },
  objTextMin: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    color: "grey",
    flex: 1,
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: "auto",
  },
});
