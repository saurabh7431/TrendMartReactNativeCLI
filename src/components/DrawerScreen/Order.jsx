import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, } from 'react-native';

const Order = () => {
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get token from AsyncStorage
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('Token not found');
        }

        const response = await fetch('http://192.168.29.170:3000/user/userOrders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("data", data);
        
        if (data.success && data.orders) {
          setOrders(data.orders);
        } else {
          setError('No orders found or there was an issue with the response data');
        }
      } catch (err) {
        setError('An error occurred while fetching orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const bufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return `data:image/jpeg;base64,${btoa(binary)}`;
  };


  if (loading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <Text className='text-lg text-blue-500'>Loading Orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex-1 justify-center items-center'>
        <Text className='text-lg text-red-500'>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className='p-4'>
      {orders.length === 0 ? (
        <Text className='text-lg text-center text-gray-500'>No orders found</Text>
      ) : (
        orders.map((order) => (
          <View key={order.orderId} className='bg-white p-4 rounded-lg shadow-lg mb-4'>
            <Text className='text-xl font-bold text-gray-800'>Order ID: {order.orderId}</Text>
            <Text className='text-sm text-gray-500'>
              Status:  <Text className={order.status === 'Paid' ? 'text-green-500' : 'text-red-500'}>
                {order.status}
              </Text>
            </Text>
            <Text className='text-sm text-gray-500'>Order Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
            
            <View className='flex-row justify-between items-center mt-4'>
              <Image
                
                source={{ uri: bufferToBase64(order?.product?.productImage.data) }}
                className='w-[80] h-[110] rounded-md'
              />
              <View className='ml-4'>
                <Text className='text-lg font-semibold text-gray-800'>{order.product.productName}</Text>
                <Text className='text-sm text-gray-600'>Price: ₹{order.product.productPrice}</Text>
                <Text className='text-sm text-gray-600'>Quantity: {order.quantity}</Text>
                <Text className='text-lg font-bold text-gray-800 mt-2'>
                  Total: ₹{order.totalMRP}
                </Text>
              </View>
            </View>

            <View className='mt-4'>
              <Text className='text-sm text-gray-500'>
                Payable Amount: ₹{order.payableAmount}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default Order;
