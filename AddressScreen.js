import React, { useState, useRef, useEffect, useContext, useLayoutEffect, useTransition } from 'react';
import {
    StyleSheet, Dimensions, TouchableOpacity, TouchableNativeFeedback, Pressable, TouchableHighlight,
    TouchableWithoutFeedback, ImageBackground,

    PermissionsAndroid,
    Platform,
    Animated,
    Vibration
} from 'react-native';



import ReAnimated, {
    useAnimatedStyle, useSharedValue, useDerivedValue,
    withTiming, cancelAnimation, runOnUI, useAnimatedReaction, runOnJS,
    useAnimatedGestureHandler,
    interpolate,
    withDelay,
    withSpring,
    useAnimatedScrollHandler,
    Extrapolate,
    //interpolateColors,

    useAnimatedProps,
    withSequence,
    withRepeat,
    withDecay,
    Keyframe,
    Transition,
    Layout,
    CurvedTransition,
    ZoomIn,
    PinwheelIn,
    PinwheelOut,
    BounceIn,
    BounceInDown
} from 'react-native-reanimated';
//import Svg, { Circle, Rect, SvgUri } from 'react-native-svg';
import SvgUri from 'react-native-svg-uri';
const { View, Text, ScrollView: ScrollV, Image, createAnimatedComponent } = ReAnimated
const AnimatedComponent = createAnimatedComponent(View)

import multiavatar from '@multiavatar/multiavatar';
import base64 from 'react-native-base64';
import { PanGestureHandler, ScrollView, FlatList, NativeViewGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';

import { ListItem, Avatar, LinearProgress, Button, Icon, Overlay, Input } from 'react-native-elements'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useHeaderHeight } from '@react-navigation/elements';
const { width, height } = Dimensions.get('screen');
const WINDOW_HEIGHT = Dimensions.get('window').height;
const STATUS_HEIGHT = getStatusBarHeight();
const BOTTOM_HEIGHT = Math.max(0, height - WINDOW_HEIGHT - STATUS_HEIGHT);

import { createContext, useContextSelector } from 'use-context-selector';
import { SharedElement } from 'react-navigation-shared-element';
import { Context } from "./ContextProvider";

//import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultUrl, { hexToRgbA, hexify, moveArr, uniqByKeepFirst, ScaleView, ScaleAcitveView, createFolder, deleteFolder, useKeyboardHeight } from "./config";
import { useNavigation } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { Keyboard } from 'react-native'


export function AdressScreen() {

    const HEADER_HEIGHT = useHeaderHeight()
    const navigation = useNavigation()
    const inputRef = useRef()

    const userName = useContextSelector(Context, (state) => (state.userName))
    const serverAddress = useContextSelector(Context, (state) => (state.serverAddress))
    const setServerAddress = useContextSelector(Context, (state) => (state.setServerAddress))

    const showSnackBar = useContextSelector(Context, (state) => (state.showSnackBar));

    useEffect(() => {



    }, [])


    return (
        <View style={{ width, height, backgroundColor: "wheat" }}>

            <View style={{ width, height: HEADER_HEIGHT, backgroundColor: "wheat" }} />

            <AnimatedComponent style={{ backgroundColor: "wheat", width }}>
                <Input
                    value={serverAddress}
                    ref={inputRef}
                    containerStyle={{ top: 15 }}
                    onPressIn={function () {

                        inputRef.current.blur()
                        inputRef.current.focus()

                    }}
                    onChangeText={function (text) {

                        setServerAddress(text)
                    }}

                />


            </AnimatedComponent >

            <Button title="save" containerStyle={{ marginTop: 20, width: width * 0.8, left: width * 0.1, }}
                onPress={function () {

                    AsyncStorage.setItem("serverAddress", serverAddress, function () {
                        Keyboard.dismiss()
                        navigation.goBack()
                        setTimeout(function () {

                            // showSnackBar(serverAddress)
                        }, 100)


                    })
                }}
            />


            <AnimatedComponent style={{ marginTop: 200, width, alignItems: "center", justifyContent: "flex-end" }}>
                <Button type="outline" title="default" containerStyle={{ width: width * 0.8, marginBottom: 10 }}
                    onPress={function () {

                        AsyncStorage.setItem("serverAddress", defaultUrl, function () {

                            setServerAddress(defaultUrl)
                            //  showSnackBar(defaultUrl)


                        })


                    }}


                />
                <Button type="outline" title="back" containerStyle={{ width: width * 0.8, marginBottom: 10 }}

                    onPress={function () {
                        navigation.goBack()
                    }}

                />

                {userName && <Button
                    title="Delete Account"
                    buttonStyle={{ backgroundColor: 'rgba(214, 71, 67, 1)' }}
                    containerStyle={{
                        width: width * 0.8,
                        marginHorizontal: 50,
                        marginVertical: 10,
                    }}
                    titleStyle={{ color: 'white', marginHorizontal: 20 }}
                    onPress={async function () {

                        userName && deleteFolder(userName)
                        AsyncStorage.removeItem("token")
                        AsyncStorage.removeItem("serverAddress")
                        AsyncStorage.removeItem("notiToken")

                        // AsyncStorage.getItem("token").then(token => {
                        //     console.log(token)
                        //    deleteFolder(userName)
                        //     token && AsyncStorage.removeItem("token")
                        // })

                        // AsyncStorage.getItem("serverAddress").then(serverAddress => {
                        //     serverAddress && AsyncStorage.removeItem("serverAddress")
                        // })



                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'RegScreen',
                                    // params: { item: { name: value, hasAvatar: false } },
                                },
                            ],
                        })


                    }}

                />}



            </AnimatedComponent>

        </View>

    )


}