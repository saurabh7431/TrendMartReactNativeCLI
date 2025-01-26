import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo'; // Import Entypo from react-native-vector-icons
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({onSkipLogin, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation(); // Use the navigation hook
  
  
    const handleLogin = async () => {
      if (!email || !password) {
        Alert.alert("Please fill all fields");
        return;
      }
  
      const userData = { email, password };
      console.log("Sending user data: ", userData);
  
      try {
        const response = await fetch('http://192.168.29.170:3000/user/userLogin', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
  
        const responseData = await response.json();
        console.log("Backend response: ", responseData);
        if (!response.ok) {
          Alert.alert("Email or Password Incorrect!");
        } else {
          await AsyncStorage.setItem('userToken', responseData.token); // Save token to AsyncStorage
          onLoginSuccess()
          Alert.alert('Login successful');
        }
      } catch (error) {
        console.error("Error during login: ", error);
        Alert.alert('Network error', 'Please try again later');
      }
    };
  
    const handleSignup = async () => {
      if (!name || !email || !password) {
        Alert.alert('Please fill all fields');
        return;
      }
  
      const submitData = { name, email, password };
      console.log("Sending submit data: ", submitData);
  
      try {
        const response = await fetch('http://192.168.29.170:3000/user/userRegister', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
  
        const responseData = await response.json();
        setName("");
        setEmail("");
        setPassword("");
  
        if (response.ok) {
          Alert.alert('Your Account Created Successfully!', `Welcome, ${responseData.user.name}`);
        } else {
          Alert.alert('Signup Failed', responseData.message || 'Something went wrong');
        }
      } catch (error) {
        console.error('Error during signup:', error);
        Alert.alert('Error', 'Network error or server is down');
      }
    };
  
    const handleClose = () => {
      onSkipLogin();
      // navigation.navigate("Home"); // Navigate back to the previous screen
    };
  
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Entypo name="cross" size={30} color="#033452" />
        </TouchableOpacity>
        <View style={styles.formContainer}>
          <View style={styles.formToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.activeButton]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.buttonText, isLogin ? styles.isActive : ""]}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.activeButton]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.buttonText, !isLogin ? styles.isActive : ""]}>Login</Text>
            </TouchableOpacity>
          </View>
  
          {isLogin ? (
            <View style={styles.form}>
              <Text style={styles.heading}>Create Account</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={(item) => setName(item)}
              />
              <TextInput
                style={styles.input}
                placeholder="User Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={(item) => setEmail(item)}
              />
              <TextInput
                style={styles.input}
                placeholder="Create Password"
                secureTextEntry
                placeholderTextColor="#888"
                value={password}
                onChangeText={(item) => setPassword(item)}
              />
              <TouchableOpacity onPress={handleSignup} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.heading}>Login Account</Text>
              <TextInput
                style={styles.input}
                placeholder="User Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={(Email) => setEmail(Email)}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#888"
                value={password}
                onChangeText={(password) => setPassword(password)}
              />
              <TouchableOpacity onPress={handleLogin} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Login</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}>
                Not a Member?{" "}
                <Text style={styles.linkText} onPress={() => setIsLogin(false)}>
                  Login Account
                </Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "white",
      width: "100%",
    },
    closeButton: {
      position: "absolute",
      top: 40,
      right: 20,
      zIndex: 1,
    },
    formContainer: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      width: 300,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      elevation: 5,
      width: "80%",
    },
    formToggle: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    toggleButton: {
      width: "48%",
      paddingVertical: 10,
      backgroundColor: "#f3f3f3",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    activeButton: {
      backgroundColor: "#033452",
    },
    buttonText: {
      fontSize: 16,
      color: "#033452",
    },
    form: {
      flexDirection: "column",
    },
    heading: {
      fontSize: 22,
      marginBottom: 20,
      textAlign: "center",
    },
    input: {
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 5,
    },
    submitButton: {
      padding: 10,
      backgroundColor: "#033452",
      borderRadius: 5,
      alignItems: "center",
    },
    submitButtonText: {
      color: "white",
      fontSize: 16,
    },
    footerText: {
      textAlign: "center",
      marginTop: 10,
    },
    linkText: {
      color: "#007bff",
      textDecorationLine: "underline",
    },
    isActive: {
      color: "white",
    },
  });
  
  export default Login;
  