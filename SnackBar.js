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
    useAnimatedRef,
    ZoomIn,
    SlideInRight,
    SlideInDown,
    SlideInUp,
    ZoomInLeft,
    ZoomInEasyUp,
    ZoomOut,
    SlideOutRight,
    SlideOutUp,
    SlideOutDown

} from 'react-native-reanimated';
import multiavatar from '@multiavatar/multiavatar';
import { Overlay } from 'react-native-elements/dist/overlay/Overlay';
import { SharedElement } from 'react-navigation-shared-element';
import SvgUri from 'react-native-svg-uri';
import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { Context } from "./ContextProvider"
import { createContext, useContextSelector } from 'use-context-selector';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    GiftedChat, Bubble, InputToolbar, Avatar as AvatarIcon, Message, Time, MessageContainer, MessageText, SystemMessage, Day, Send, Composer, MessageImage,
    Actions,
} from 'react-native-gifted-chat'
import url, { hexToRgbA, hexify, moveArr, uniqByKeepFirst, ScaleView, ScaleAcitveView, createFolder, deleteFolder } from "./config";
import { useHeaderHeight } from '@react-navigation/elements';
import { PanGestureHandler, ScrollView, FlatList, NativeViewGestureHandler } from 'react-native-gesture-handler';
import { Video, AVPlaybackStatus, Audio, ExponentAV } from 'expo-av';

import { getStatusBarHeight } from 'react-native-status-bar-height';
const { width, height } = Dimensions.get('screen');
const WINDOW_HEIGHT = Dimensions.get('window').height;
const STATUS_HEIGHT = getStatusBarHeight();
const BOTTOM_HEIGHT = Math.max(0, height - WINDOW_HEIGHT - STATUS_HEIGHT);

import {
    StyleSheet, Dimensions, TouchableOpacity, TouchableNativeFeedback, Pressable, TouchableHighlight, TouchableWithoutFeedback, Vibration, Button,
    findNodeHandle, UIManager, Keyboard, Platform
} from 'react-native';

import { OverlayDownloader } from './OverlayDownloader';
import { ListItem, Avatar, LinearProgress, Tooltip, Icon, Input } from 'react-native-elements';
import Image from 'react-native-scalable-image';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
const { View, Text, ScrollView: ScrollV, Extrapolate, createAnimatedComponent } = ReAnimated

const AnimatedComponent = createAnimatedComponent(View)

export default function SnackBar({ ...props }) {


    const isSnackVisible = useContextSelector(Context, (state) => (state.isSnackVisible));
    const setSnackVisible = useContextSelector(Context, (state) => (state.setSnackVisible));
    const snackMessage = useContextSelector(Context, (state) => (state.snackMessage));

    
   

    useEffect(function () {
        if (isSnackVisible) {
            setTimeout(() => {
                setSnackVisible(false)
            }, 3000);
        }

    }, [isSnackVisible])

    return (
        <>
            {isSnackVisible && <AnimatedComponent entering={SlideInDown.duration(300)} exiting={SlideOutDown.duration(300)} style={{
                width, height: 40, backgroundColor: "#333",
                position: "absolute", bottom: 0, left: 0, zIndex: 999999,
                justifyContent: "center", alignItems: "center",
            }}>
                <Pressable onPress={function () {
                    setSnackVisible(false)
                }}>
                    <View style={{  backgroundColor:"#333",  width, justifyContent: "center", alignItems: "center", }}>
                        <Text style={{color:"white"}}>{snackMessage}</Text>
                    </View>
                </Pressable>
            </AnimatedComponent>}
        </>

    )

}