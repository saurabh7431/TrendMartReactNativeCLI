import 'react-native-gesture-handler'; // Make sure this is at the top of the file
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import Home from './src/components/UI/Home';
import Search from './src/components/UI/Search';
import Cart from './src/components/UI/Cart';
import ProfileDrawer from './src/components/UI/ProfileDrawer';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './src/components/UI/Login';
import { createStackNavigator } from '@react-navigation/stack';
import AddressPage from './src/components/UI/AddressPage';
import ConformationPage from './src/components/UI/ConformationPage';
import OrderDetails from './src/components/UI/OrderDetails';
import "./global.css"
import StackNavigator from './src/components/StackNavigator/StackNavigator';

// Stack Navigator for AddressPage and other screens
const Stack = createStackNavigator();

// Tab Navigator
const Tab = createBottomTabNavigator();


const TabNavigator = ({ isLoggedIn, setIsLoading, onLogout, onLoginSuccess, onSkipLogin }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#025486',
        tabBarInactiveTintColor: 'black',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarStyle: {
          height: 50,
        },
        headerStyle: {
          backgroundColor: '#033452',
        },
        headerTitleStyle: {
          color: 'white',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: () => <Entypo name="home" size={30} color="#033452" />,
        }}
      >
        {(props) => (
          <Home
            {...props}
            isLoggedIn={isLoggedIn}
            onLogout={onLogout}
            onLoginSuccess={onLoginSuccess}
            onSkipLogin={onSkipLogin}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: () => <Ionicons name="search" size={30} color="#033452" />,
        }}
      />

      <Tab.Screen
        name="Cart"
        options={{
          tabBarIcon: (tabinfo) => <Entypo name="shopping-cart" style={{color:tabinfo.focused ? "#025486":"#033452"}} size={30}  />,
        }}
      >
        {(props) => (
          <Cart
            {...props}
            isLoggedIn={isLoggedIn}
            onLogout={onLogout}
            onLoginSuccess={onLoginSuccess}
            setIsLoading={setIsLoading}
            onSkipLogin={onSkipLogin}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="ProfileDrawer"
        options={{
          tabBarIcon: () => <Entypo name="user" size={30} color="#033452" />,
        headerShown:false}}
      >
        {(props) => (
          <ProfileDrawer
            {...props}
            navigation={props.navigation}
            isLoggedIn={isLoggedIn}
            onLogout={onLogout}
            onLoginSuccess={onLoginSuccess}
            setIsLoading={setIsLoading}
            onSkipLogin={onSkipLogin}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = async (responseData) => {
    console.log('handleLoginSuccess', responseData.token);

    try {
      await AsyncStorage.setItem('userToken', responseData.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error storing token', error);
    }
  };

  const handleSkipLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsLoggedIn(false);
    console.log('User logged out');
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking login status', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name="TabNavigator"
              options={{ headerShown: false }}
            >
              {(props) => (
                <TabNavigator
                  {...props}
                  isLoggedIn={isLoggedIn}
                  onLogout={handleLogout}
                  onLoginSuccess={handleLoginSuccess}
                  onSkipLogin={handleSkipLogin}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="AddressPage" options={{headerShown: true}} component={AddressPage} />
            <Stack.Screen name="ConformationPage" component={ConformationPage} />
            <Stack.Screen name="OrderDetails" component={OrderDetails} />
            
            
          </>
        ) : (
          <Stack.Screen
            name="Login"
            options={{
              headerShown: false,
            }}
          >
            {(props) => (
              <Login
                {...props}
                isLoggedIn={isLoggedIn}
                onLoginSuccess={handleLoginSuccess}
                onSkipLogin={handleSkipLogin}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
