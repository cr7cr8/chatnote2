import React, { useState, useEffect, useRef, useContext, useTransition } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import { createStackNavigator, CardStyleInterpolators, TransitionPresets, HeaderTitle, Header } from '@react-navigation/stack';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import { useNavigation, useRoute } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { AdressScreen } from './AddressScreen';
import { RegScreen } from './RegScreen';
import { HomeScreen } from './HomeScreen';
import { ChatScreen } from './ChatScreen';
import { ImageScreen } from './ImageScreen';
import { Context } from "./ContextProvider";

import { createContext, useContextSelector } from 'use-context-selector';
import { hexToRgbA, hexify, moveArr, uniqByKeepFirst, ScaleView, ScaleAcitveView, deleteFolder,createFolder } from "./config";
import multiavatar from '@multiavatar/multiavatar';
import SvgUri from 'react-native-svg-uri';
import { SharedElement } from 'react-navigation-shared-element';
import SnackBar from './SnackBar';
import jwtDecode from 'jwt-decode';

const Stack = createSharedElementStackNavigator()
const screenOptions = function ({ navigation, route }) {

  return {
    headerShown: true, //not supported in Android  //route.name!=="Chat",//true,//route.name==="Home",//true,
    gestureEnabled: true,
    gestureDirection: "horizontal",
    headerTitleAlign: 'center',
    ...TransitionPresets.SlideFromRightIOS,
    //title: getFocusedRouteNameFromRoute(route) || "People",
    //header:function (props) {
    //  console.log("=====***==============")
    //  console.log(props)
    //},


    // headerStyle: {
    //   height: getStatusBarHeight() > 24 ? 70 : 60,
    //   elevation: 1,
    //   // backgroundColor: bgColor
    // },




  }
}




export default function StackNavigator() {

  const navigation = useNavigation()
  const [isTransitionPending, startTrasition] = useTransition()
  const initialRouter = useContextSelector(Context, (state) => (state.initialRouter))
  return (
    <>

      <Stack.Navigator
        initialRouteName={initialRouter}
        screenOptions={screenOptions}
        // headerMode="float"
        headerMode="screen"
      >

        <Stack.Screen name="AddressScreen"
          component={AdressScreen}
          options={function ({ navigation, router }) {

            return {
              headerShown: true,
              headerTitle: "Address"
              // headerRight: () => (
              //   <Button
              //     title="delete"
              //     onPress={function () {

              //       AsyncStorage.getItem("token").then(token => {
              //         console.log(token)
              //         token && deleteFolder(token.userName)
              //         token && AsyncStorage.removeItem("token")
              //       })




              //     }}
              //   />
              // ),
            }

          }}
        />


        <Stack.Screen name="RegScreen"
          component={RegScreen}

          options={function ({ navigation, router }) {

            return {
              headerShown: false,
              header: (props) => <Header {...props} />,
              headerStyle: {
                backgroundColor: "wheat",
                elevation: 0
              },
              headerRight: () => (
                <Button
                  title="delete"
                  onPress={function () {

                    AsyncStorage.getItem("token").then(token => {
                      console.log(token)
                      token && deleteFolder(token.userName)
                      token && AsyncStorage.removeItem("token")
                    })

                    AsyncStorage.getItem("serverAddress").then(serverAddress => {
                      serverAddress && AsyncStorage.removeItem("serverAddress")
                    })


                  }}
                />
              ),
            }

          }}
        />

        <Stack.Screen name="HomeScreen"

          component={HomeScreen}

          // header={function (props) {     console.log(props)  return <Header {...props} /> }}

          options={function ({ navigation, route }) {

            return {
              headerShown: true,
              gestureEnabled: false,

              header: (props) => <Header {...props} />,

              headerLeft: () => null,
              headerStyle: {
                height: getStatusBarHeight() > 24 ? 70 : 60,
                //height: 60,
                elevation: 0,
                backgroundColor: "wheat"
              },
              headerRight: () => (
                <Button
                  title="delete"
                  onPress={function () {
                    AsyncStorage.getItem("token").then(token => {
                      console.log(token)
                      token && deleteFolder(token.userName)
                      token && AsyncStorage.removeItem("token")
                    })

                    AsyncStorage.getItem("serverAddress").then(serverAddress => {
                      serverAddress && AsyncStorage.removeItem("serverAddress")
                    })


                  }}
                />
              ),

              // color:"#fff",    


            }

          }}

        />


        <Stack.Screen name="ChatScreen"

          component={ChatScreen}

          // header={function (props) {     console.log(props)  return <Header {...props} /> }}

          options={function ({ navigation, route }) {
            const name = route.params.item
            const avatarString = multiavatar(name)
            const bgColor = hexify(hexToRgbA(avatarString.match(/#[a-zA-z0-9]*/)[0]))


            return {
              headerShown: true,
              gestureEnabled: false,
              //     headerTintColor: 'orange',
              header: (props) => <Header {...props} />,

              //   headerLeft: () => null,
              headerStyle: {
                height: getStatusBarHeight() > 24 ? 70 : 60,
                //height: 60,
                elevation: 0,
                //backgroundColor: bgColor
                // backgroundColor:"transparent"
                backgroundColor: "rgba(0,0,255 ,0)",
              },
              headerTitle: function (props) { return <></> },
              headerRight: () => (
                <Button
                  title="delete"
                  onPress={async function () {
                    await deleteFolder(route.params.name)
                    createFolder(route.params.name)
                    // AsyncStorage.getItem("token").then(token => {
                    //   console.log(token)
                    //   token && deleteFolder(token.userName)
                    //   token && AsyncStorage.removeItem("token")
                    // })

                    // AsyncStorage.getItem("serverAddress").then(serverAddress => {
                    //   serverAddress && AsyncStorage.removeItem("serverAddress")
                    // })


                  }}
                />
              ),

            }

          }}

        />
        <Stack.Screen name="ImageScreen"
          component={ImageScreen}
          options={function ({ navigation, route }) {
            return {
              headerShown: true,
              gestureEnabled: false,
              // header: (props) => <Header {...props} />,
              header: (props) => <></>,
              headerTitle: function (props) { return <></> },
              headerStyle: {
                height: getStatusBarHeight() > 24 ? 70 : 60,
                elevation: 0,
                //backgroundColor: "lightgreen",
                backgroundColor: "#333",

              },
              // headerRight: () => (
              //   <Button
              //     title={"Image"}
              //     onPress={function () {
              //       navigation.navigate("ChatScreen")
              //     }}
              //   />
              // ),

            }
          }

          }

        />


      </Stack.Navigator>
    </>
  )

}

