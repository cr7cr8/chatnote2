import React, { useState, useRef, useEffect, useContext, useLayoutEffect } from 'react';
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
  withDecay,
  ZoomIn

} from 'react-native-reanimated';
import { ListItem, Avatar, LinearProgress, Tooltip, Icon, Input } from 'react-native-elements';
//import Image from 'react-native-scalable-image';
import multiavatar from '@multiavatar/multiavatar';
const { View, Text, ScrollView: ScrollV, Image, createAnimatedComponent } = ReAnimated
const AnimatedComponent = createAnimatedComponent(View)
import { PanGestureHandler, ScrollView, FlatList, NativeViewGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
const { width, height } = Dimensions.get('screen');
const WINDOW_HEIGHT = Dimensions.get('window').height;
const STATUS_HEIGHT = getStatusBarHeight();
const BOTTOM_HEIGHT = Math.max(0, height - WINDOW_HEIGHT - STATUS_HEIGHT);
import { SharedElement } from 'react-navigation-shared-element';
import SvgUri from 'react-native-svg-uri';
import { Context } from "./ContextProvider";
import ViewTransformer from "react-native-easy-view-transformer";
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { createContext, useContextSelector } from 'use-context-selector';
import { useHeaderHeight } from '@react-navigation/elements';
//import Image from 'react-native-scalable-image';
import { OverlayDownloader } from './OverlayDownloader';
import { Overlay } from 'react-native-elements/dist/overlay/Overlay';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export function ImageScreen({ navigation, route, }) {


  const HEADER_HEIGHT = useHeaderHeight()

  // console.log(height, getStatusBarHeight(), HEADER_HEIGHT, route.params.name)

  const showSnackBar = useContextSelector(Context, (state) => (state.showSnackBar));
  const { currentPos, imageMessageArr, name, hasAvatar, localImage, url, randomStr } = route.params
  const scrollRef = useRef()
  const scrollX = useSharedValue(currentPos * width)

  const [visible, setVisible] = useState(false)
  const [overLayOn, setOverLayOn] = useState(false)



  return (
    <>
      <View style={{
        position: "absolute", display: "flex", justifyContent: "center", alignItems: "center",
        transform: [{ translateY: -HEADER_HEIGHT }],
        backgroundColor: "skyblue", width,
        flexDirection: "row", height: HEADER_HEIGHT + 6,

      }}>

        {/* <SharedElement id={name}  >
          {hasAvatar
            ? <ImageV source={{ uri: localImage || `${url}/api/image/avatar/${name}?${randomStr}` }} resizeMode="cover"
              style={{ margin: 10, width: 40, height: 40, transform: [{ translateY: 6 }, { translateX: 0 }], borderRadius: 1000 }}
            />
            : <SvgUri style={{
              margin: 10,
              transform: [{ translateY: 6 }, { translateX: 0 }]

            }} width={40} height={40} svgXmlData={multiavatar(name)} />
          }
        </SharedElement> */}

        <SharedElement id={name}  >
          {hasAvatar
            ? <Image source={{ uri: localImage || `${url}/api/image/avatar/${name}?${randomStr}` }} resizeMode="cover"
              style={{
                margin: 10, width: 40, height: 40, transform: [{ translateY: HEADER_HEIGHT }, { translateX: -width / 2 - 40 }, { scale: 1 }],
                borderRadius: 1000
              }}
            />

            : <SvgUri style={{
              margin: 10,
              transform: [{ translateY: HEADER_HEIGHT }, { translateX: -width / 2 - 40 }, { scale: 1 }]
            }} width={40} height={40} svgXmlData={multiavatar(name)} />
          }
        </SharedElement>
      </View>





      <ScrollView
        contentOffset={{ x: currentPos * width, y: 0 }}
        scrollEnabled={false}
        ref={scrollRef}
        horizontal={true}
        onScroll={function (e) { scrollX.value = e.nativeEvent.contentOffset.x }}
        snapToInterval={width}
        contentContainerStyle={{
          display: "flex", justifyContent: "center", alignItems: "center",
          //backgroundColor: "pink"
          // backgroundColor: "#333"
          //backgroundColor: "pink",
          backgroundColor: "#333",
          height: height,
        }}

      >

        {
          imageMessageArr.map((item, index, arr) => {

            return (
              <ViewTransformer
                maxScale={2.5}
                key={item._id || index}
                arrLength={arr.length}
                onTransformStart={function () { }}
                onTransformGestureReleased={function ({ scale, translateX, translateY }) {

                  if (scale === 1 && translateX < (-10)) {
                    scrollRef.current.scrollTo({ x: (index + 1) * width, y: 0, animated: true })
                  }
                  else if (scale === 1 && translateX > (10)) {
                    scrollRef.current.scrollTo({ x: (index - 1) * width, y: 0, animated: true })
                  }
                }}
              >
                <Pressable onLongPress={function () { Vibration.vibrate(50); setVisible(true) }}>
                  <SharedElement id={String(item._id)}>

                    <Image source={{ uri: item.image, headers: { token: "hihihi" } }} resizeMode="contain"
                      // style={{ width, height: height - HEADER_HEIGHT - getStatusBarHeight() }}
                      // style={{ width, height: height - HEADER_HEIGHT - getStatusBarHeight() }}
                      style={{ width, height }}

                    />

                  </SharedElement>
                </Pressable>
              </ViewTransformer>

            )

          })

        }
      </ScrollView>

      {/* <OverlayDownloader
        overLayOn={overLayOn}
        setOverLayOn={setOverLayOn}
        uri={imageMessageArr[Math.floor(scrollX.value / width)].image}
        fileName={Date.now() + ".jpg"}
      /> */}
      <Overlay isVisible={visible} fullScreen={false}
        onBackdropPress={function () {
          setVisible(false)
        }}
        backdropStyle={{ backgroundColor: "transparent" }}
        overlayStyle={{
          //  backgroundColor: "rgba(50,50,50,0)",
          backgroundColor: "transparent",
          position: "absolute",
          left: width / 2 - 35,
          top: height / 3,
          elevation: 0,
        }}
      >

        <AnimatedComponent entering={ZoomIn.duration(200)} style={{
          display: "flex", flexDirection: "row", backgroundColor: "rgba(50,50,50,0.8)",
          borderRadius: 8, justifyContent: "center", alignItems: "center",
          width: 60, height: 60
        }}>

          <Icon name="arrow-down-circle-outline" type='ionicon' color='white' size={50}

            onPress={async function () {
              setVisible(false)
              const uri = imageMessageArr[Math.floor(scrollX.value / width)].image
              const fileName = Date.now()
              const fileUri = `${FileSystem.documentDirectory}${fileName}.jpg`


              if (uri.indexOf("file:") === 0) {
                const { granted } = await MediaLibrary.requestPermissionsAsync().catch(e => { console.log(e) })
                if (!granted) { return }

                const asset = await MediaLibrary.createAssetAsync(uri)
                console.log(uri)
                let album = await MediaLibrary.getAlbumAsync('expoDownload')
                if (album == null) { await MediaLibrary.createAlbumAsync('expoDownload', asset, false) }
                else { await MediaLibrary.addAssetsToAlbumAsync([asset], album, false) }
                return showSnackBar("local image copied")
            }




              const downloadResumable = FileSystem.createDownloadResumable(uri, fileUri, { headers: { token: "hihihi" } },);

              const { status } = await downloadResumable.downloadAsync(uri, fileUri, { headers: { token: "hihihi" } }).catch(e => { console.log(e) })

              if (status == 200) {
                const { granted } = await MediaLibrary.requestPermissionsAsync().catch(e => { console.log(e); alert(JSON.stringify(e)) })
                if (!granted) { setBtnText("100%"); return }

                const asset = await MediaLibrary.createAssetAsync(fileUri).catch(e => { console.log(e); alert(JSON.stringify(e)) });
                let album = await MediaLibrary.getAlbumAsync('expoDownload').catch(e => { console.log(e); alert(JSON.stringify(e)) });

                if (album == null) { await MediaLibrary.createAlbumAsync('expoDownload', asset, false).catch(e => { console.log(e); alert(JSON.stringify(e)) }); }
                else {
                  await MediaLibrary.addAssetsToAlbumAsync([asset], album, false).catch(e => { console.log(e); alert(JSON.stringify(e)) });
                }
                await FileSystem.deleteAsync(fileUri, { idempotent: true })
                //console.log(asset); alert(JSON.stringify(asset))
                showSnackBar(fileName + ".jpg downloaded")
              }
              else { alert("server refuse to send"); }


            }}


          />


        </AnimatedComponent>
      </Overlay>
    </>



  )
}



ImageScreen.sharedElements = (route, otherRoute, showing) => {

  // console.log("image screen other route ---", otherRoute.params.name)
  const imageMessageArr = route.params.imageMessageArr
  const currentPos = route.params.currentPos
  //console.log(route)
  //  return [
  // { id: route.params.item, animation: "move", resize: "auto", align: "left", },
  // ...messageArr,
  // ]

  // return route.params.imageMessageArr.map(item=>({_id:item._id,image:item.image}))
  // return route.params.imageMessageArr.map(item => ({ id: item._id, animation: "move", resize: "auto", align: "left", }))

  return [{ id: route.params.name }, { id: imageMessageArr[currentPos]._id, animation: "move", resize: "auto", align: "left" }]


};
;
