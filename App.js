//eas build --profile production --platform android
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
export default function App() {
 
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
    assignListenning({ socket, userName, appState, serverAddress, token, setPeopleList, setUnreadCountObj, latestMsgObj, setLatestMsgObj })
    setSocket(socket)
    if (!token && socket) { socket.offAny() }  //socket.disconnect()

  }, [serverAddress, token])


  return (
    initialRouter && serverAddress
      ? <><NavigationContainer><StackNavigator /></NavigationContainer><SnackBar /></>
      : <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text style={{ fontSize: 25 }}>Loading</Text></View>
  )

}

function assignListenning({ socket, userName, appState, serverAddress, token, setPeopleList, setUnreadCountObj, latestMsgObj, setLatestMsgObj }) {
  const url = serverAddress
  socket.on("connect", function () {

    console.log(`socket ${Constants.deviceName} ${userName} ,  ${socket.id} is connected`)

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
             
              if (index === msgArr.length - 1) setPeopleList(pre => [...pre]) //causing recount unread in homepage
            })


        }


      })



    })

  });



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


          if (socket.listeners("displayMessage" + sender).length === 0) {
            // setLatestMsgObj(pre => {



            //   let objText = ""

            //   if (msg.audio) {
            //     objText = "[audio]"
            //   }
            //   else if (msg.image) {
            //     objText = "[image]"
            //   }
            //   else if (msg.text) {
            //     objText = msg.text
            //   }

            //   return { ...pre, [msg.sender]: { content: objText, saidTime: msg.createdAt } }
            // })
          }



        })


    })


    // FileSystem.getInfoAsync(folderUri)
    //   .then(info => {
    //     if (!info.exists) {
    //       return FileSystem.makeDirectoryAsync(folderUri).catch(err => { console.log(">>", err) })
    //     }
    //     else {
    //       return info
    //     }
    //   })



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



