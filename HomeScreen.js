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

    ZoomIn,
    SlideInRight,
    BounceInRight

} from 'react-native-reanimated';

import axios from 'axios';
import multiavatar from '@multiavatar/multiavatar';
import { hexToRgbA, hexify, moveArr, uniqByKeepFirst, ScaleView, ScaleAcitveView } from "./config";
import DraggableFlatList, {
    ScaleDecorator,
    useOnCellActiveAnimation,
    ShadowDecorator,

} from "react-native-draggable-flatlist";

import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { Context } from "./ContextProvider"
import { createContext, useContextSelector } from 'use-context-selector';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';

import {
    StyleSheet, Dimensions, TouchableOpacity, TouchableNativeFeedback, Pressable, TouchableHighlight, TouchableWithoutFeedback, Vibration,
    BackHandler

} from 'react-native';
//import Svg, { Circle, Rect, SvgUri } from 'react-native-svg';
//import * as Svg from 'react-native-svg';
import SvgUri from 'react-native-svg-uri';
import { SharedElement } from 'react-navigation-shared-element';
import * as FileSystem from 'expo-file-system';
import { ListItem, Avatar, LinearProgress, Button, Icon, Overlay, Badge } from 'react-native-elements'
const { View, Text, Image, ScrollView: ScrollV, Extrapolate, createAnimatedComponent } = ReAnimated

const AnimatedComponent = createAnimatedComponent(View)

export function HomeScreen({ }) {


    const url = useContextSelector(Context, (state) => (state.serverAddress))
    const navigation = useNavigation()
    const route = useRoute()

    //  console.log("========", route.params)
    const userName = useContextSelector(Context, (state) => (state.userName));
    const peopleList = useContextSelector(Context, (state) => (state.peopleList));
    const setPeopleList = useContextSelector(Context, (state) => (state.setPeopleList));
    const token = useContextSelector(Context, (state) => (state.token));

    const initialRouter = useContextSelector(Context, (state) => (state.initialRouter));
    const setUnreadCountObj = useContextSelector(Context, (state) => (state.setUnreadCountObj));
   

    useEffect(() => {

        axios.get(`${url}/api/user/fetchuserlist`, { headers: { "x-auth-token": token } }).then(response => {
            setPeopleList((pre) => {
                return uniqByKeepFirst([...pre, ...response.data], function (msg) { return msg.name })
            })
        }).catch(e => console.log(e))

        HomeScreen.sharedElements = null

    }, [])




    useEffect(() => {

        if (navigation.getState().routes[0].name === "RegScreen") {
            const unsubscribe = navigation.addListener("beforeRemove", function (e) {
                // console.log(navigation.getState().routes[0].name === "RegScreen")
                e.preventDefault()
                BackHandler.exitApp()
            })

            return unsubscribe
        }
    }, [])


    useEffect(function () {

        const promiseArr = []
        peopleList.forEach((people, index) => {
          const sender = people.name
          const folderUri = FileSystem.documentDirectory + "UnreadFolder/" + sender + "/"
          promiseArr.push(FileSystem.readDirectoryAsync(folderUri).then(unreadArr => {
            return { [sender]: unreadArr.length }
          }))
        })
    
        Promise.all(promiseArr).then(objArr => {
          let obj = {}
          objArr.forEach(o => {
            obj = { ...obj, ...o }
          })
          setUnreadCountObj(obj)
         
        })
    
      }, [peopleList])






    return (
        <>
            {/* <View style={{ width: 120, height: 120, backgroundColor: "pink" }}>
                <SharedElement id={userName}  >
                    <SvgUri style={{}}
                        width={120} height={120} svgXmlData={multiavatar(userName)} />
                </SharedElement>
            </View> */}
            <DraggableFlatList
                data={peopleList}
                //  onDragEnd={({ data }) => setData(data)}

                onDragEnd={function ({ data, ...props }) {

                    axios.post(`${url}/api/user/resortuserlist`, data.map(item => item.name), { headers: { "x-auth-token": token } })
                    setPeopleList(data)
                }}
                keyExtractor={(item) => (item.name)}
                renderItem={renderItem}
                showsVerticalScrollIndicator={true}


            />
        </>
    )

}

function renderItem(props) {
    const url = useContextSelector(Context, (state) => (state.serverAddress))
    const navigation = useNavigation()
    const route = useRoute()
    const { drag, isActive, getIndex, item: { name, hasAvatar, randomStr = Math.random(), localImage = null } } = props

    const avatarString = multiavatar(name)
    const bgColor = hexify(hexToRgbA(avatarString.match(/#[a-zA-z0-9]*/)[0]))
    const showSnackBar = useContextSelector(Context, (state) => (state.showSnackBar));
    const userName = useContextSelector(Context, (state) => (state.userName));
   
    const unreadCountObj = useContextSelector(Context, (state) => (state.unreadCountObj));
    const setUnreadCountObj = useContextSelector(Context, (state) => (state.setUnreadCountObj));


    const scale = useDerivedValue(() => isActive ? 0.8 : 1)

    const panelCss = useAnimatedStyle(() => {

        // console.log("HOME", name)
        return {
            backgroundColor: bgColor,
            height: 80,
            transform: [{ scale: withTiming(scale.value) }],
            elevation: withTiming(isActive ? 5 : 3),
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 10

        }

    })

    return (

        // <AnimatedComponent entering={getIndex() === 0 ? null : SlideInRight.delay(Math.min(getIndex() * 150,))} >
        <AnimatedComponent entering={route.params?.fromRegScreen && getIndex() === 0 ? null : SlideInRight.delay(Math.min(getIndex() * 150, 3000)).duration(300)}  >

            < Pressable onLongPress={drag} onPress={
                function () {
                    navigation.navigate("ChatScreen", { name, hasAvatar, localImage, randomStr })
                    //showSnackBar(name)
                }
            } >

                <View style={[panelCss]}>
                    <SharedElement id={name}  >
                        {hasAvatar
                            ? <Image source={{ uri: localImage || `${url}/api/image/avatar/${name}?${randomStr}` }} resizeMode="cover"
                                style={{ margin: 0, width: 60, height: 60, borderRadius: 1000 }}
                            />
                            : <SvgUri style={{ margin: 0 }} width={60} height={60} svgXmlData={multiavatar(name)} />
                        }
                    </SharedElement>

                    <Badge
                        value={unreadCountObj[name] || 0}
                       
                        status="error"
                        containerStyle={{
                            position: 'absolute', top: 10, left: 58, zIndex: 100,
                            transform: [{ scale: Boolean(unreadCountObj[name]) ? 1.2 : 0 }],
                          
                            display: "flex", justifyContent: "center", alignItems: "center"
                        }}
                        badgeStyle={{
                            //     color: "blue",
                            //      position: 'absolute', top: 10, left: 60, zIndex: 100,
                            //      backgroundColor:"yellow",
                            // transform: [{ scale: 1.8 }],
                            display: "flex", justifyContent: "center", alignItems: "center"
                        }}
                        textStyle={{
                            transform: [{ translateY: -2 }],
                            fontSize:10
                        }}
                    />



                    <View style={{ marginHorizontal: 10 }}><Text>{name}</Text></View>
                </View>


            </Pressable >
        </AnimatedComponent >
    )
}


HomeScreen.sharedElements = (route, otherRoute, showing) => {
    // console.log("sharedElements",route.params.name)

    return [
        { id: route.params.name, animation: "move", resize: "auto", align: "left", }, // ...messageArr,   // turn back image transition off
    ]
};