import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View, StyleSheet, Button, Image, TouchableOpacity } from 'react-native';
import Config from 'react-native-config';

const OrderDetails = ({ route, navigation }) => {
  const { verifyData } = route.params;
  const orderId = verifyData.orderId;

  const [order, setOrder] = useState({});
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(10);

  //API Keys
  const hostApiKey="https://trendmart-3.onrender.com";
const orderDetails=`${hostApiKey}/user/userOrders/${orderId}`

  // Fetch order data
  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const response = await fetch(orderDetails, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            Alert.alert("Order not found");
            return;
          }

          const data = await response.json();
          setOrder(data);
        } catch (error) {
          console.error(error);
          Alert.alert("Error fetching order");
        } finally {
          setLoading(false); 
        }
      };

      fetchOrder();
    } else {
      Alert.alert("No orderId provided");
    }
  }, [orderId]);

  // Countdown functionality for 10 seconds
  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1); 
      }, 1000);

      return () => clearInterval(timer);
    } else {
        navigation.reset({
            index: 0, // Reset to the first screen in the stack
            routes: [{ name: 'TabNavigator', params: { screen: 'ProfileDrawer', params: { screen: 'Profile' } } }],
          });
        }
  }, [secondsLeft, navigation]);

  const bufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return `data:image/jpeg;base64,${btoa(binary)}`;
  };

  const redirectToProfile = () => {
    navigation.reset({
        index: 0, // Reset to the first screen in the stack
        routes: [{ name: 'TabNavigator', params: { screen: 'ProfileDrawer', params: { screen: 'Profile' } } }],
      });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Order Placed</Text>
        <Text style={{ textAlign: 'center', color: 'green', fontSize: 18 }}>
          Thank you, {order?.user?.name}! Your order has been placed successfully!
        </Text>

        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>Order Details</Text>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: 140,
              height: 150,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: order?.product?.bgcolor,
            }}
          >
            <Image
              source={{ uri: bufferToBase64(order?.product?.image.data) }}
              style={{ width: 80, height: 130 }}
            />
          </View>

          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold' }}>Order ID</Text>
            <Text style={{ fontSize: 13 }}>{order?.order?._id}</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Text style={{ fontWeight: 'bold' }}>Product Name: </Text>
              <Text>{order?.product?.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Text style={{ fontWeight: 'bold' }}>Quantity: </Text>
              <Text>{order?.order?.quantity}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Text style={{ fontWeight: 'bold' }}>Total Amount: </Text>
              <Text>₹{order?.order?.payableAmount}</Text>
            </View>
          </View>

          {/* Countdown Timer */}
          <Text style={{ marginTop: 16, fontSize: 18 }}>
            Redirecting in {secondsLeft} seconds...
          </Text>

          {/* Button to manually redirect */}
            <TouchableOpacity onPress={redirectToProfile} className=' bg-sky-950 w-[100] justify-center items-center rounded mt-5 h-[30]'>
                <Text className='text-white'> Go to Profile</Text>
            </TouchableOpacity>
          {/* <Button title="Go to Profile" onPress={redirectToProfile} /> */}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
  },
});

export default OrderDetails;
