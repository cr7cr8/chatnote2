import {
  StyleSheet, Dimensions, TouchableOpacity, TouchableNativeFeedback, Keyboard, Pressable, Vibration, UIManager, findNodeHandle,

  SafeAreaView,
  KeyboardAvoidingView,

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
  measure,
  useAnimatedRef,
  withRepeat

} from 'react-native-reanimated';
import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';

const { View, Text, Image: ImageV, ScrollView: ScrollV, } = ReAnimated

import * as FileSystem from 'expo-file-system';



const defaultUrl = "http://192.168.0.100";
//const defaultUrl = "https://noteschat.herokuapp.com";


export default defaultUrl

export function uniqByKeepFirst(a, key) {
  let seen = new Set();
  return a.filter(item => {
    let k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}



export function hexToRgbA(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.2)';
  }
  throw new Error('Bad Hex');
}

export function hexToRgbA2(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.99)';
  }
  throw new Error('Bad Hex');
}


export function hexify(color) {
  var values = color
    .replace(/rgba?\(/, '')
    .replace(/\)/, '')
    .replace(/[\s+]/g, '')
    .split(',');
  var a = parseFloat(values[3] || 1),
    r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255),
    g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255),
    b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255);
  return "#" +
    ("0" + r.toString(16)).slice(-2) +
    ("0" + g.toString(16)).slice(-2) +
    ("0" + b.toString(16)).slice(-2);
}





export function moveArr(arr, old_index, new_index) {
  while (old_index < 0) {
    old_index += arr.length;
  }
  while (new_index < 0) {
    new_index += arr.length;
  }
  if (new_index >= arr.length) {
    let k = new_index - arr.length;
    while ((k--) + 1) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
}





export function ScaleView(props) {

  const scale = useSharedValue(0)
  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(scale.value, { duration: 200 }) },



        //   {translateX: withTiming(interpolate(scale.value, [0, 1], [-100, 0]), {duration: 2000 }) }
      ],
      //  opacity: withTiming(scale.value, {duration: 200 }),
      overflow: "hidden",
    }
  })

  // useEffect(function () {

  // }, [])

  return (
    <View style={scaleStyle} onLayout={function () { scale.value = 1 }}  >
      {props.children}
    </View>
  )
}



export function ScaleAcitveView({ active, onPress, ...props }) {

  // const scale = useSharedValue(active ? 0.7 : 1)

  const scale_ = useSharedValue(0)

  const scale = useDerivedValue(() => {
    return active ? 0.8 : scale_.value
  })

  useEffect(function () {
    scale_.value = 1

  }, [])

  // const viewStyle = useAnimatedStyle(() => {

  //   return {
  //     elevation: 15,
  //   }
  // })




  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(scale.value, { duration: 200 }) },

        //   {translateX: withTiming(interpolate(scale.value, [0, 1], [-100, 0]), {duration: 2000 }) }
      ],

      //  opacity: withTiming(scale.value, {duration: 200 }),
      overflow: "hidden",
    }
  })


  return (

    <View style={scaleStyle}>
      {props.children}
    </View>

  )
}

export function createFolder(name) {


  return Promise.all(

    [
      FileSystem.getInfoAsync(FileSystem.documentDirectory + "MessageFolder/" + name + "/")
        .then(({ exists }) => {
          if (!exists) {
            return FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "MessageFolder/" + name + "/", { intermediates: true })
          }
        })
        .catch(err => console.log("config.js ==>>", err)),

      FileSystem.getInfoAsync(FileSystem.documentDirectory + "UnreadFolder/" + name + "/")
        .then(({ exists }) => {
          if (!exists) {
            return FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "UnreadFolder/" + name + "/", { intermediates: true })
          }
        })
        .catch(err => console.log("config.js ==>>", err)),

      FileSystem.getInfoAsync(FileSystem.documentDirectory + "Audio/" + name + "/")
        .then(({ exists }) => {
          if (!exists) {
            return FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "Audio/" + name + "/", { intermediates: true })
          }
        })
        .catch(err => console.log("config.js ==>>", err)),

      FileSystem.getInfoAsync(FileSystem.documentDirectory + "ImagePicker/" + name + "/")
        .then(({ exists }) => {
          if (!exists) {
            return FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "ImagePicker/" + name + "/", { intermediates: true })
          }
        })
        .catch(err => console.log("config.js ==>>", err)),


      FileSystem.getInfoAsync(FileSystem.cacheDirectory + "ImagePicker/" + name + "/")
        .then(({ exists }) => {
          if (!exists) {
            return FileSystem.makeDirectoryAsync(FileSystem.cacheDirectory + "ImagePicker/" + name + "/", { intermediates: true })
          }
        })
        .catch(err => console.log("config.js ==>>", err)),



    ]
  )
}

export function deleteFolder(name) {

  return Promise.all(
    [
      FileSystem.deleteAsync(FileSystem.cacheDirectory + "ImagePicker/" + name, { idempotent: true }),
      FileSystem.deleteAsync(FileSystem.documentDirectory + "MessageFolder/" + name, { idempotent: true }),
      FileSystem.deleteAsync(FileSystem.documentDirectory + "UnreadFolder/" + name, { idempotent: true }),
      FileSystem.deleteAsync(FileSystem.documentDirectory + "Audio/" + name, { idempotent: true }),
      FileSystem.deleteAsync(FileSystem.documentDirectory + "ImagePicker/" + name, { idempotent: true }),
    ]
  )
}

export function deleteAllFolder() {

  return Promise.all(
    [
      FileSystem.deleteAsync(FileSystem.cacheDirectory + "ImagePicker/", { idempotent: true }),
      FileSystem.deleteAsync(FileSystem.documentDirectory + "MessageFolder/", { idempotent: true }),
      FileSystem.deleteAsync(FileSystem.documentDirectory + "UnreadFolder/", { idempotent: true }),
      FileSystem.deleteAsync(FileSystem.documentDirectory + "Audio/", { idempotent: true }),
      FileSystem.deleteAsync(FileSystem.documentDirectory + "ImagePicker/", { idempotent: true }),
    ]
  )
}


/*
async function startRecording0(setRecording) {
  try {
    console.log('Requesting permissions..');
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    console.log('Starting recording..');
    const { recording } = await Audio.Recording.createAsync(
      Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
    );
    setRecording(recording);
    console.log('Recording started');
  } catch (err) {
    console.error('Failed to start recording', err);
  }
}
 
 
async function stopRecording0({ recording, setRecording }) {
  console.log('Stopping recording..');
  setRecording(undefined);
  await recording.stopAndUnloadAsync();
 
  const { sound, status } = await recording.createNewLoadedSoundAsync();
  await sound.replayAsync()
  const uri = recording.getURI();
  console.log(recording)
 
  console.log('Recording stopped and stored at', uri);
}
 
*/












// useEffect(() => {
//   const unsubscribe1 = navigation.addListener('focus', () => {
//     //console.log(latestChattingMsg.current)





//     //   if (latestChattingMsg.current) {
//     //     const obj = latestChattingMsg.current
//     //     latestChattingMsg.current = ""
//     //     const sender = obj.sender === userName ? obj.toPerson : obj.sender
//     //     let objText = ""
//     //     if (obj.audio) {
//     //       objText = "[audio]"
//     //     }
//     //     else if (obj.image) {
//     //       objText = "[image]"
//     //     }
//     //     else if (obj.text) {
//     //       objText = obj.text
//     //     }
//     //     if (obj.sender === userName) { objText = "\u2b05 " + objText }

//     //  //   setImmediate(function () {

//     //       setTimeout(() => {
//     //         setLatestMsgObj(pre => {

//     //           return { ...pre, [sender]: objText }
//     //         })
//     //       }, 0);
//     // //    })
//     //   }





//     //console.log("xxx", Date.now(), chattingUser.current)
//     /*
//     if (chattingUser.current) {
//       const sender = chattingUser.current

//       const folderUri = FileSystem.documentDirectory + "MessageFolder/" + sender + "/"


//       FileSystem.readDirectoryAsync(folderUri).then(msgNameArr => {


//         msgNameArr.sort()
//         const lastName = msgNameArr.pop()
//         console.log(lastName)

//         if (lastName) {
//           FileSystem.readAsStringAsync(folderUri + lastName).then(data => {


//             // console.log(data)
//             const obj = JSON.parse(data)

//             let objText = ""

//             if (obj.audio) {
//               objText = "[audio]"
//             }
//             else if (obj.image) {
//               objText = "[image]"
//             }
//             else if (obj.text) {
//               objText = obj.text
//             }

//             if (obj.sender === userName) { objText = "\u2b05 " + objText }

//             Boolean(objText) && setLatestMsgObj(pre => { return { ...pre, [sender]: objText } })
//           })

//         }



//       })



//     }
// */
//   });

//   // const unsubscribe2 = navigation.addListener('blur', () => {
//   //  console.log("---", Date.now(), chattingUser.current)
//   // });

//   return function () { unsubscribe1(); }
// }, [navigation]);


export const useKeyboardHeight = function (platforms = ['ios', 'android']) {
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