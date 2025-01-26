import React from 'react';
import { View, Text, Button } from 'react-native';

const Logout = ({ navigation, onLogout }) => {
  const handleLogout = () => {
    onLogout(); // Call the passed onLogout function to handle logout logic
    navigation.navigate('Home'); // Navigate to Home after logout
  };

  return (
    <View>
      <Text>Are you sure you want to logout?</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default Logout;
