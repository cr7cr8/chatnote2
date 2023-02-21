import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});






export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const [isWheat,setIsWheat] = useState(false) 


  useEffect(() => {

    //get notitoken for remote push notification, not local, https://expo.dev/notifications 
    //https://docs.expo.dev/push-notifications/push-notifications-setup/#get-credentials-for-development-builds
    registerForPushNotificationsAsync(setExpoPushToken)

    //triggers when notification fires
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    //triggers when press the notification rectangle
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      
      console.log("click me to change color")
      setIsWheat(pre=>!pre)
     
      alert("You touched the notification") // alert is not working
    
    //  console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: isWheat?"wheat":"white",
      }}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Local notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
      <Button
        title="Get Token"
        onPress={() => {
          setExpoPushToken("fetching...")
          registerForPushNotificationsAsync(setExpoPushToken);
        }}
      />
    </View>
  );
}

async function schedulePushNotification() {


  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: "default1",
    content: {
      title: "You've got mail! 📬",
      body: 'Click to change color',
      data: { data: new Date().getHours() +":"+new Date().getMinutes()+":"+new Date().getSeconds()},
    },
    trigger: null
    //   trigger: { seconds: 3,repeats:false },
  });

  // await Notifications.cancelScheduledNotificationAsync(identifier);

}

async function registerForPushNotificationsAsync(setExpoPushToken) {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    try {
      const { status: existingStatus } = await Notifications.requestPermissionsAsync();
      let finalStatus = existingStatus;
      console.log(finalStatus)
      if (finalStatus !== 'granted') {
        setExpoPushToken("denied")
        console.log('Failed to get push token for push notification!' + finalStatus)
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token)
      console.log(token);
    }
    catch (e) {
      setExpoPushToken("granted, but no token received")
      console.log("granted, but no token received", Device.deviceName, e)
    }

  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}