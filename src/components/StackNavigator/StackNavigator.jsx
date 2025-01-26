import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

const Stack=createStackNavigator()
const StackNavigator = () => {
  return (
    <Stack.Screen>
            <Stack.Screen name="AddressPage" component={AddressPage} />
            <Stack.Screen name="ConformationPage" component={ConformationPage} />
            <Stack.Screen name="OrderDetails" component={OrderDetails} />
    </Stack.Screen>
  )
}

export default StackNavigator