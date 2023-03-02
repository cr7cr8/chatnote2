import React, { useState, useRef, useEffect, useContext } from 'react';

const { compareAsc, format, formatDistanceToNow, } = require("date-fns");
const { zhCN } = require('date-fns/locale');


import {
    StyleSheet, Dimensions, TouchableOpacity, TouchableNativeFeedback, Pressable, TouchableHighlight, TouchableWithoutFeedback,
    Vibration, TextInput, Alert, Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ReAnimated, {
    useAnimatedStyle, useSharedValue, useDerivedValue,
    withTiming, cancelAnimation, runOnUI, useAnimatedReaction, runOnJS,
    useAnimatedGestureHandler,
    interpolate,
    withDelay,
    withSpring,
    useAnimatedScrollHandler,

    //interpolateColors,

    useAnimatedProps,
    withSequence,
    withDecay,


} from 'react-native-reanimated';
//import Svg, { Circle, Rect, SvgUri } from 'react-native-svg';
import SvgUri from 'react-native-svg-uri';
const { View, Text, Image, ScrollView, Extrapolate } = ReAnimated

import multiavatar from '@multiavatar/multiavatar';

//const src_ = "data:image/svg+xml;base64," + btoa(personName && multiavatar(personName))
import base64 from 'react-native-base64';
import { PanGestureHandler, FlatList, NativeViewGestureHandler } from 'react-native-gesture-handler';

import { ListItem, Avatar, LinearProgress, Button, Icon, Overlay, Badge, Switch, Input, Divider } from 'react-native-elements'
const { width, height } = Dimensions.get('screen');


import { CommonActions } from '@react-navigation/native';

import url, { hexToRgbA, hexToRgbA2, hexify, moveArr, uniqByKeepFirst, ScaleView, ScaleAcitveView, deleteFolder, createFolder } from "./config";
import { SharedElement } from 'react-navigation-shared-element';
import { Context } from "./ContextProvider";
import axios from 'axios';
import { useNavigation, useNavigationState, useRoute } from '@react-navigation/core';
import { getStatusBarHeight } from "react-native-status-bar-height";

import { useHeaderHeight } from '@react-navigation/elements';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';


import { createContext, useContextSelector } from 'use-context-selector';





export function ProfileScreen() {

    const navigation = useNavigation()
    const route = useRoute()
    //  const navigationState = useNavigationState()

    const url = useContextSelector(Context, (state) => (state.serverAddress))
    const token = useContextSelector(Context, (state) => (state.token))

    const peopleList = useContextSelector(Context, (state) => (state.peopleList));
    const setPeopleList = useContextSelector(Context, (state) => (state.setPeopleList));

    const showSnackBar = useContextSelector(Context, (state) => (state.showSnackBar));

    const { name, userName, hasAvatar, randomStr, localImage } = route.params

    const avatarString = multiavatar(name)
    const bgColor = hexify(hexToRgbA(avatarString.match(/#[a-zA-z0-9]*/)[0]))

    const [avatarUri, setAvatarUri] = useState("")


    const HEADER_HEIGHT = useHeaderHeight()
    const inputRef = useRef()
    const [description, setDescription] = useState("")

    useEffect(() => {
        axios.get(`${url}/api/user/getdescription/${name}`, { headers: { "x-auth-token": token } }).then(response => {
            setDescription(response.data)
        })
    }, [])





    const [disableUpload, setDisableUpload] = useState(true)
    const [disableDelete, setDisableDelete] = useState(true)

    const keyboardHeight = useKeyboardHeight()



    const style = useAnimatedStyle(() => {

        return {
            backgroundColor: bgColor,
            transform: [{ translateY: withTiming(-keyboardHeight * 0.5) }], //zIndex: 150,
            width: width * 0.8,

        }

    })


    return (

        <View style={{ width, height, backgroundColor: bgColor, alignItems: "center" }}>
            <View style={{ width, height: getStatusBarHeight() * 2, backgroundColor: "transparent", backgroundColor: bgColor }} />

            <View



                style={{ backgroundColor: bgColor, width, paddingBottom: 10, justifyContent: "flex-start", alignItems: "center" }}>

                <Icon name="trash-outline" type='ionicon' color='gray'
                    disabled={disableDelete}
                    disabledStyle={{ transform: [{ scale: 0 }] }}
                    containerStyle={{ position: "absolute", top: 0 + getStatusBarHeight(), right: 50 }} size={30}
                    onPress={function () {
                        FileSystem.readDirectoryAsync(FileSystem.cacheDirectory + "ImagePicker/").then(data => {
                            data.forEach(filename_ => {
                                //console.log(FileSystem.cacheDirectory + "ImagePicker/" + filename_)
                                FileSystem.deleteAsync(FileSystem.cacheDirectory + "ImagePicker/" + filename_, { idempotent: true })
                            })

                        })
                        setDisableDelete(true)
                        setDisableUpload(true)
                        setAvatarUri("")
                    }}
                />


                <Icon name="checkmark-circle-outline" type='ionicon' color='gray'
                    containerStyle={{ position: "absolute", top: 0 + getStatusBarHeight(), left: 50 }} size={30}
                    disabled={disableUpload}
                    disabledStyle={{ transform: [{ scale: 0 }] }}
                    onPress={function () {
                        setDisableDelete(true)
                        setDisableUpload(true)
                        showSnackBar("avatar start")
                        const localUri = avatarUri
                        let match = /\.(\w+)$/.exec(localUri.split('/').pop());
                        let type = match ? `image/${match[1]}` : `image`;

                        const formData = new FormData();
                        formData.append('file', { uri: localUri, name: name, type });
                        formData.append("obj", JSON.stringify({ ownerName: name }))
                        formData.append("userName", name)

                        return axios.post(`${url}/api/image//updateavatar`, formData, { headers: { 'content-type': 'multipart/form-data', "x-auth-token": token } })
                            .then((response) => {

                                console.log(token)

                                setPeopleList(prepleList => {
                                    return peopleList.map(people => {
                                        if (people.name !== name) { return people }
                                        else {
                                            return {
                                                ...people,
                                                hasAvatar: true,
                                                randomStr: Math.random()
                                            }
                                        }
                                    })

                                })
                                showSnackBar("avatar updated")
                                navigation.dispatch(state => {
                                    // Remove the home route from the stack
                                    const routes = state.routes.filter(r => r.name !== 'ChatScreen');

                                    return CommonActions.reset({
                                        ...state,
                                        routes,
                                        index: routes.length - 1,
                                    });
                                });

                            })
                            .catch(e => {
                                console.log(e)
                                showSnackBar("avatar change failed")
                            })
                    }}
                />


                <Pressable onPress={function () {
                    userName === name && pickImage(setAvatarUri, setDisableDelete, setDisableUpload)
                    console.log("")
                }}>
                    {
                        hasAvatar || avatarUri
                            ? <Image source={{ uri: avatarUri || localImage || `${url}/api/image/avatar/${name}?${randomStr}` }} resizeMode="cover"
                                style={{ width: 120, height: 120, borderRadius: 1000, margin: 10 }} />
                            : <SvgUri style={{ margin: 10, }} width={120} height={120} svgXmlData={multiavatar(name || Math.random())} />
                    }
                </Pressable>

                <Text style={{ fontSize: 20 }}>{name}</Text>



            </View>

            {userName !== name && <View style={{ backgroundColor: bgColor, width: width * 0.8, height: 200 }}>
                <ScrollView
                    contentContainerStyle={{
                        backgroundColor: bgColor, width: width * 0.8,
                        position: "absolute", top: 0,
                        //alignItems: "center",

                    }}>
                    <Text>{description}</Text>
                </ScrollView>
            </View>
            }


            {userName === name && <View
                style={style}
            >

                <Input
                    containerStyle={{
                        borderWidth: 0, display: "flex", alignItems: "center", backgroundColor: "lightgray",
                        width: 0.8 * width, marginBottom: 0, paddingBottom: 0, marginBottom: 0, height: 200
                    }}
                    ref={inputRef} placeholder='Enter a decription' multiline={true}

                    inputContainerStyle={{ width: 0.8 * width, borderWidth: 0, borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0, backgroundColor: "white" }}
                    //style={{ fontSize: 20 }}
                    value={description}
                    textAlign={"left"}
                    onPressIn={function () { inputRef.current.focus() }}
                    //  errorMessage={userName.match(reg) ? "" : userName ? "At least 3  letters andor kanji " : ""}
                    onChangeText={function (text) {
                        setDescription(text)
                    }}
                />
                <Button title="submit" type='clear' onPress={function () {

                    axios.post(`${url}/api/user/updatedescription`, { description }, { headers: { "x-auth-token": token } }).then(response => {


                        Keyboard.dismiss()


                    })


                }} />

            </View>}


            {/* <Button title="Empty dialogue" type="outline" containerStyle={{ width: width * 0.8, marginTop: 40, }}
                onPress={function () {
                    deleteFolder(name).then(() => {
                        return createFolder(name)
                    }).then(() => {

                        //navigation.navigate("HomeScreen")

                        navigation.dispatch(state => {
                            // Remove the home route from the stack
                            const routes = state.routes.filter(r => r.name !== 'ChatScreen' && r.name !== 'ChatAllScreen');

                            return CommonActions.reset({
                                ...state,
                                routes,
                                index: routes.length - 1,
                            });
                        });

                    })

                }}


            /> */}



            {/* {userName === name && <Button title={url} type="clear" containerStyle={{ width: width * 0.8, marginTop: 10, }}
                onPress={function () {
                    navigation.navigate("AddressScreen")
                }}

            />} */}

        </View>
    )

}

async function pickImage(setAvatarUri, setDisableDelete, setDisableUpload) {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: false,
    });

    if (!result.canceled) {

        //console.log(result.assets[0].uri)
        setAvatarUri(result.assets[0].uri)
        setDisableDelete(false)
        setDisableUpload(false)
    }
};



const useKeyboardHeight = function (platforms = ['ios', 'android']) {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    useEffect(() => {
        if (isEventRequired(platforms)) {
            const listen1 = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
            const listen2 = Keyboard.addListener('keyboardDidHide', keyboardDidHide); // cleanup function



            return () => {
                // Keyboard.removeListener('keyboardDidShow', keyboardDidShow);
                // Keyboard.removeListener('keyboardDidHide', keyboardDidHide);

                listen1.remove()
                listen2.remove()

            };
        } else {
            return () => { };
        }
    }, []);

    const isEventRequired = platforms => {
        try {
            return (platforms === null || platforms === void 0 ? void 0 : platforms.map(p => p === null || p === void 0 ? void 0 : p.toLowerCase()).indexOf(Platform.OS)) !== -1 || !platforms;
        } catch (ex) { }

        return false;
    };

    const keyboardDidShow = frames => {

        setKeyboardHeight(frames.endCoordinates.height);
    };

    const keyboardDidHide = () => {

        setKeyboardHeight(0);
    };

    return keyboardHeight;
};