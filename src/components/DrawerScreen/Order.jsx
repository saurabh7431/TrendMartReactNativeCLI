import { View, Text } from 'react-native'
import React from 'react'

const Order = ({isLoggedIn}) => {
    console.log("isLoggedIn",  isLoggedIn);
    
  return (
    <View>
      <Text>Order</Text>
    </View>
  )
}

export default Order