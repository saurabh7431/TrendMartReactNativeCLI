import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, Image, FlatList, Alert, RefreshControl, Dimensions } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Login from './Login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cart from './Cart';
import { useNavigation } from '@react-navigation/native';
import ScrollImage from './ScrollImage';

  const Home = ({ isLoggedIn, onLoginSuccess, onSkipLogin }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(!isLoggedIn);
  const [isFetched, setIsFetched] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Add state for refreshing
  const navigation = useNavigation();

  
  // Fetch products
  const productFetch = async () => {
    try {
      const response = await fetch('http://192.168.29.170:3000/user/userShop', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Call product fetch when the component is mounted or refreshed
  useEffect(() => {
    productFetch();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    productFetch(); // Fetch data again when refreshing
    setRefreshing(false); // Stop the refresh spinner once data is fetched
  };

  const handleAddToCart = async (itemId) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.log("User is not logged in, showing login screen");
      setShowLogin(true); // Trigger the login screen if not logged in
      return;
    }

    try {
      const response = await fetch(`http://192.168.29.170:3000/cart/addtocart/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        if (errorMessage.message === "Product is already in your cart") {
          Alert.alert("Product already added in your cart!");
          return;
        }
        throw new Error('Failed to add item to cart');
      }

      const data = await response.json();
      setIsFetched(true);
      Alert.alert("Product added in your cart!");
    } catch (error) {
      console.error('Error adding item to cart:', error);
      Alert.alert('Error adding item to cart', error.message);
    }
  };

  const handleLoginSuccess = async () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    setShowLogin(false);
    navigation.navigate("Home")
  };

  const handleSkipLogin = () => {
    if (onSkipLogin) {
      onSkipLogin();
    }
    setShowLogin(false);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.productText}>
      {index === 0 && <ScrollImage />}
      {item.image ? (
        <View style={styles.productContainer}>
          <View style={[styles.productImage1, { backgroundColor: item.bgcolor }]}>
            <Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} style={styles.productImage} />
          </View>
          <View style={[styles.textPanel, { backgroundColor: item.panelcolor }]}>
            <View style={{ justifyContent: 'center', flexDirection: 'row', gap: 130, alignItems: 'center' }}>
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.name}</Text>
                <Text style={{ fontSize: 20 }}>{item.price}</Text>
              </View>
              <Pressable onPress={() => handleAddToCart(item._id)}>
                <View style={{ width: 30, height: 30, backgroundColor: 'white', paddingHorizontal: 6, justifyContent: 'center', borderRadius: 50 }}>
                  <FontAwesome5 name="plus" size={20} color="#033452" />
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <Text>No image available</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {showLogin && (
        <View style={styles.loginContainer}>
          <Login onLoginSuccess={handleLoginSuccess} onSkipLogin={handleSkipLogin} />
        </View>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.itemContainer}>
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} 
          />
          {!isLoggedIn ? <Cart isFetched={isFetched} /> : ""}
        </View>
      )}
    </View>
  );
};

export default Home;

  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 0,
    },
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
    itemContainer: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    productText: {
      fontSize: 16,
      marginBottom: 10,
      alignItems: 'center',
    },
    productContainer: {
      flex: 1,
      alignItems: 'center',
      padding: 10,
      marginVertical: 5,
      borderRadius: 8,
    },
    productImage1: {
      width: 250,
      height: 250,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopLeftRadius:5,
      borderTopRightRadius:5
    },
    productImage: {
      width: 150,
      height: 200,
      marginBottom: 10,
    },
    textPanel: {
      width: 250,
      height: 70,
      flexDirection: 'row',
      paddingHorizontal: 20,
      borderBottomLeftRadius:5,
      borderBottomRightRadius:5
    },
    errorText: {
      color: 'red',
      fontSize: 16,
    },
  });
  
