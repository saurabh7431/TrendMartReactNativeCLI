import { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import About from '../DrawerScreen/About';
import Order from '../DrawerScreen/Order';
import Profile from '../DrawerScreen/Profile';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Importing Ionicons for the logout button icon
import AboutIcon from 'react-native-vector-icons/AntDesign'; 
import Entypo from 'react-native-vector-icons/Entypo'; 
import OrderIcon from 'react-native-vector-icons/FontAwesome5'; 

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ isLoggedIn, onLogout, onLoginSuccess, setIsLoading, onSkipLogin, navigation }) => {
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.navigate('Home'); // Navigate to Home when logged out
    }
  }, [isLoggedIn, navigation]); // Dependency array ensures this effect runs when `isLoggedIn` changes

  
  const handleLogout = () => {
    onLogout(); // Perform the logout operation
  };

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          drawerActiveTintColor: 'green',
          drawerActiveBackgroundColor: '#003CB3',
          width: 240,
        },
        drawerLabelStyle: {
          color: 'black',
          fontSize: 20,
          fontFamily: 'Georgia',
        },
      }}
    >
      {/* Profile Component......... */}
      <Drawer.Screen
        name="Profile"
        options={{
          drawerIcon: () => <Entypo name="user" size={30} color="#033452" />,
          headerShown: true,
        }}
      >
        {(props) => (
          <Profile
            {...props}
            navigation={props.navigation}
            isLoggedIn={isLoggedIn}
            onLogout={onLogout}
            onLoginSuccess={onLoginSuccess}
            setIsLoading={setIsLoading}
            onSkipLogin={onSkipLogin}
          />
        )}
      </Drawer.Screen>

         {/* Order Component......... */}
      <Drawer.Screen options={{
          drawerIcon: () => <OrderIcon name="box-tissue" size={30} color="#033452" />,
          headerShown: true,
        }} name="Orders" component={Order} />
        
         {/* About Component......... */}
      <Drawer.Screen  options={{
          drawerIcon: () => <AboutIcon name="infocirlceo" size={30} color="#033452" />,
          headerShown: true,
        }} name="About" component={About} />

         {/* Logout Route......... */}
      <Drawer.Screen
        name="Logout"
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="log-out-outline" size={24} color={color} /> // Logout Icon
          ),
          drawerLabel: 'Logout',
          headerShown: false, 
        }}
      >
        {() => {
          handleLogout();
          return null; 
        }}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
