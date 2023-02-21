//eas build --profile production --platform android
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import ContextProvider from './ContextProvider';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from "./StackNavigator";

import SnackBar from './SnackBar';
import OverLayText from './OverLayText';

import { createContext, useContextSelector } from 'use-context-selector';

import { Context } from "./ContextProvider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import jwtDecode from 'jwt-decode';
import defaultUrl, { createFolder } from "./config";
import { io } from "socket.io-client";
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';


export default function App() {

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

  }, [])


  // return (
  //   <View style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
  //     <Button title='aaa' onPress={async function () {

  //       await Notifications.scheduleNotificationAsync({
  //         content: {
  //           title: "You've got mail! 📬",
  //         //  sound: 'mySoundFile.wav', // Provide ONLY the base filename
  //         },
  //         trigger: {
  //           seconds: 2,
  //           channelId: 'new-emails',
  //         },
  //       });

  //     }} />
  //   </View>

  // )


  return (
    <ContextProvider><StatusBar /><AppStarter /></ContextProvider>
  );
}



function AppStarter() {


  const initialRouter = useContextSelector(Context, (state) => (state.initialRouter))
  const setInitialRouter = useContextSelector(Context, (state) => (state.setInitialRouter))
  const userName = useContextSelector(Context, (state) => (state.userName))
  const setUserName = useContextSelector(Context, (state) => (state.setUserName))
  const token = useContextSelector(Context, (state) => (state.token))
  const setToken = useContextSelector(Context, (state) => (state.setToken))

  const notiToken = useContextSelector(Context, (state) => (state.notiToken))
  const setNotiToken = useContextSelector(Context, (state) => (state.setNotiToken))



  const socket = useContextSelector(Context, (state) => (state.socket))
  const setSocket = useContextSelector(Context, (state) => (state.setSocket))

  const serverAddress = useContextSelector(Context, (state) => (state.serverAddress))
  const setServerAddress = useContextSelector(Context, (state) => (state.setServerAddress))

  const peopleList = useContextSelector(Context, (state) => (state.peopleList))
  const setPeopleList = useContextSelector(Context, (state) => (state.setPeopleList))


  const appState = useContextSelector(Context, (state) => (state.appState))

  const unreadCountObj = useContextSelector(Context, (state) => (state.unreadCountObj))
  const setUnreadCountObj = useContextSelector(Context, (state) => (state.setUnreadCountObj))

  const latestMsgObj = useContextSelector(Context, (state) => (state.latestMsgObj))
  const setLatestMsgObj = useContextSelector(Context, (state) => (state.setLatestMsgObj))


  //initialize userName , token and server address
  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      token && setUserName(jwtDecode(token).userName)
      token && setToken(token)
      Boolean(token)
        ? setInitialRouter("HomeScreen")
        : setInitialRouter("RegScreen")
    })
    AsyncStorage.getItem("serverAddress").then((serverAddress) => {
      Boolean(serverAddress)
        ? setServerAddress(serverAddress)
        : AsyncStorage.setItem("serverAddress", defaultUrl, function () { setServerAddress(defaultUrl) })
    })
  }, [])

  //create folder for each contact once token and servre address is assigned
  useEffect(() => {

    if (serverAddress && token) {
      axios.get(`${serverAddress}/api/user/fetchuserlist2`, { headers: { "x-auth-token": token } }).then(response => {
        Array.from(response.data).forEach(item => {
          createFolder(item)
        })
      })
    }

    const socket = io(`${serverAddress}`, {
      auth: {
        userName: userName,
        token: token
      }
    })
    assignListenning({ socket, userName, appState, serverAddress, token, setPeopleList, setUnreadCountObj, latestMsgObj, setLatestMsgObj, setNotiToken })
    setSocket(socket)
    if (!token && socket) { socket.offAny() }  //socket.disconnect()

  }, [serverAddress, token])


  return (
    initialRouter && serverAddress
      ? <><NavigationContainer><StackNavigator /></NavigationContainer><SnackBar /></>
      : <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text style={{ fontSize: 25 }}>Loading</Text></View>
  )

}

function assignListenning({ socket, userName, appState, serverAddress, token, setPeopleList, setUnreadCountObj, latestMsgObj, setLatestMsgObj, setNotiToken }) {

  const url = serverAddress

  socket.on("connect", async function () {

    console.log(`socket ${Constants.deviceName} ${userName} ,  ${socket.id} is connected`)


    const { status } = await Notifications.requestPermissionsAsync();
    console.log("notification", status)


    Notifications.scheduleNotificationAsync({
      identifier: "default1",
      content: {
        title: "ok",
        body: "just a test"
      },
      trigger: null// { seconds: 2 },
    });


    // AsyncStorage.getItem("notiToken").then(notiToken => {

    //   registerForPushNotificationsAsync().then(newNotiToken => {

    //     //console.log("reconnect notitoken is:", newNotiToken)
    //     if ((typeof newNotiToken === "string") && (newNotiToken !== "[Error: Fetching the token failed: SERVICE_NOT_AVAILABLE]") && (notiToken !== newNotiToken)) {

    //       //console.log("register notitoken is:", notiToken)
    //       setNotiToken(newNotiToken)
    //       AsyncStorage.setItem("notiToken", newNotiToken)
    //     }
    //     else if ((typeof newNotiToken === "string") && (newNotiToken === notiToken)) {
    //       console.log(Constants.deviceName, "reconnect notitoken same",newNotiToken)
    //       // console.log("notiToken not avaliable")
    //     }
    //     else if (typeof newNotiToken !== "string") {
    //       console.log(Constants.deviceName, "reconnect notitoken fail")
    //     }

    //   })
    //     .catch(err => {
    //       console.log(Constants.deviceName, "error in context.js get notitoken", err)
    //     })
    // })









    axios.get(`${url}/api/user/fecthunread`, { headers: { "x-auth-token": token } }).then(response => {



      const msgArr = response.data
      if (msgArr.length === 0) { setPeopleList(pre => [...pre]); return } //causing recount unread in homepage return }

      msgArr.forEach((msg, index) => {
        let sender = msg.toPerson === "AllUser" ? "AllUser" : msg.sender
        const fileUri = FileSystem.documentDirectory + "MessageFolder/" + sender + "/" + sender + "---" + msg.createdTime
        const fileUri2 = FileSystem.documentDirectory + "UnreadFolder/" + sender + "/" + sender + "---" + msg.createdTime


        if (msg.toPerson !== "AllUser") {
          FileSystem.writeAsStringAsync(fileUri, JSON.stringify(msg))
            .then(() => {

              return FileSystem.writeAsStringAsync(fileUri2, JSON.stringify(msg))

            })
            .then(() => {
              setLatestMsgObj((pre) => { return { ...pre, [msg.sender]: msg } })

              if (index === msgArr.length - 1) setPeopleList(pre => [...pre]) //causing recount unread in homepage
            })

        }

      })

    })

  });

  socket.on("updateList", function () {

    axios.get(`${url}/api/user/fetchuserlist`, { headers: { "x-auth-token": token } }).then(response => {

      const promiseArr = []

      response.data.forEach(item => {
        promiseArr.push(createFolder(item.name))
      })

      Promise.all(promiseArr)
        .then(function () {
          setPeopleList(pre => { return response.data })
        })

    })

  })

  socket.on("writeMessage", function (sender, msgArr) {

    const folderUri = FileSystem.documentDirectory + "MessageFolder/" + sender + "/"

    Array.from(msgArr).forEach((msg) => {
      const fileUri = FileSystem.documentDirectory + "MessageFolder/" + sender + "/" + sender + "---" + msg.createdTime

      FileSystem.getInfoAsync(folderUri)
        .then(info => {
          if (!info.exists) {
            return FileSystem.makeDirectoryAsync(folderUri).catch(err => { console.log(">>", err) })
          }
          else {
            return info
          }
        })
        .then(() => {
          return FileSystem.writeAsStringAsync(fileUri, JSON.stringify(msg))
        })
        .then(() => {
          setLatestMsgObj((pre) => {

            return { ...pre, [msg.sender]: msg }

          })

         



        })


    })


  })


  socket.on("saveUnread", function (sender, msgArr) {

    if ((socket.listeners("displayMessage" + sender).length === 0) || appState.current === "background" || appState.current === "inactive") {

      const folderUri = FileSystem.documentDirectory + "UnreadFolder/" + sender + "/"
      msgArr.forEach((msg) => {
        const fileUri = FileSystem.documentDirectory + "UnreadFolder/" + sender + "/" + sender + "---" + msg.createdTime
        FileSystem.getInfoAsync(folderUri)
          .then(info => {
            if (!info.exists) {
              return FileSystem.makeDirectoryAsync(folderUri).catch(err => { console.log(">>>", err) })
            }
            else {
              return info
            }
          })
          .then(() => {
            return FileSystem.writeAsStringAsync(fileUri, JSON.stringify(msg))
          })
      })

      setUnreadCountObj(unreadCountObj => {

        msgArr.forEach(msg => {
          const sender = msg.sender
          if (!unreadCountObj[sender]) { unreadCountObj[sender] = 0 }
          unreadCountObj[sender]++
        })
        return { ...unreadCountObj }

      })


    }

  })



  socket.on("disconnect", function (msg) {
    console.log(`${userName} is disconnected`)

  })



}




function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    Notifications.getPermissionsAsync().then(({ status: existingStatus }) => {

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        Notifications.requestPermissionsAsync().then(({ status }) => {
          finalStatus = status;
          console.log(">>>>", finalStatus)
        })
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        alert('Failed to get push token for push notification!');
        return;
      }

    })
      .catch(err => { console.log(err) })


    return Notifications.getExpoPushTokenAsync().then(({ data }) => {
      token = data
      if (!token) {
        console.log('Unable to get notiToken on client site');
        alert('Unable to get notiToken on client site');
      }
      return token;
    })
      .catch(err => {
        //   console.log("====>", err)
        return err

      })
  }
  else {
    alert('Must use physical device for Push Notifications');
  }
}

