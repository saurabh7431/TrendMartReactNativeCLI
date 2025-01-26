import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DrawerNavigator from '../Templates/DrawerNavigator';
import Login from './Login';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const ProfileDrawer = ({ onLogout, isLoggedIn, onLoginSuccess, setIsLoading, onSkipLogin }) => {
  const navigation = useNavigation(); // Access navigation object
  const [showLogin, setShowLogin] = useState(isLoggedIn);
  const [loading , setLoading]=useState(true)

  // Check login status when the component is focused
  useFocusEffect(
    React.useCallback(() => {
      const checkLoginStatus = async () => {
        try {
          setLoading(true)
         const token= await AsyncStorage.getItem('userToken');
          if (token) {
            setShowLogin(false);
          } else {
            setShowLogin(true);
          }
        } catch (error) {
          console.error("Error checking token:", error);
        }finally{
          setLoading(false)
        }
      };

      checkLoginStatus();
    }, [isLoggedIn])
  );

  // Handle successful login
  const handleLoginSuccess = async (token) => {
    try {
      await AsyncStorage.getItem('userToken');
      setShowLogin(false);
      onLoginSuccess();
    } catch (error) {
      console.error("Error storing token:", error);
    }
  };

  // Handle skip login
  const handleSkipLogin = () => {
    setShowLogin(false);
    onSkipLogin();
    navigation.navigate("Home"); // Navigate to "Home" screen when login is skipped
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
              <View className='flex-1 justify-center items-center'>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>  
              ) : showLogin ? ( 
        <View style={styles.loginContainer}>
          <Login onLoginSuccess={handleLoginSuccess} onSkipLogin={handleSkipLogin} />
        </View>
      ) : (
        <DrawerNavigator
          navigation={navigation}
          isLoggedIn={isLoggedIn}
          onLogout={onLogout}
          onLoginSuccess={onLoginSuccess}
          setIsLoading={setIsLoading}
          onSkipLogin={onSkipLogin}
        />
      )}
    </View>
  );
};

export default ProfileDrawer;

const styles = StyleSheet.create({
  loginContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 1,
  },
});
