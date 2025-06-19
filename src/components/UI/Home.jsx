import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, Image, FlatList, Alert, RefreshControl, Dimensions } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Login from './Login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cart from './Cart';
import { useNavigation } from '@react-navigation/native';
import ScrollImage from './ScrollImage';
import Config from 'react-native-config';

  const Home = ({ isLoggedIn, onLoginSuccess, onSkipLogin }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(!isLoggedIn);
  const [isFetched, setIsFetched] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Add state for refreshing
  const navigation = useNavigation();
  const hostApiKey="https://trendmart-3.onrender.com";
  const userShopApiKey=`${hostApiKey}/user/userShop`
  
  // Fetch products
  const productFetch = async () => {
    try {
      const response = await fetch(`${userShopApiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      console.log("🚀 ~ productFetch ~ data:", data)
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
    const addToCart=`${hostApiKey}/cart/addtocart/${itemId}`
    if (!token) {
      console.log("User is not logged in, showing login screen");
      setShowLogin(true); // Trigger the login screen if not logged in
      return;
    }

    try {
      const response = await fetch(addToCart, {
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

  const handleBuyNow = async (itemId)=>{
   console.log("🚀 ~ handleBuyNow ~ itemId:", itemId)
   const token = await AsyncStorage.getItem('userToken');
   const buyProductKey=`${hostApiKey}/user/buyProduct/${itemId}`
    if (!token) {
      console.log("User is not logged in, showing login screen");
      setShowLogin(true); // Trigger the login screen if not logged in
      return;
    }
    try {
        const token = await AsyncStorage.getItem('userToken');  // Get the token here
        if (!token) {
            console.log("No token found, user might not be logged in.");
            return; // Handle this case appropriately (e.g., prompt the user to login)
        }

        const response = await fetch(buyProductKey, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to buy item from cart');
        }

        const data = await response.json();
        setLoading(false);
        console.log("Buy response =>", {
  success: data.success,
  productName: data.product?.name,
  quantity: data.quantity
});

         navigation.navigate("AddressPage", { data })
      setLoading(false); 
        

    } catch (error) {
        console.error("Error Buying item:", error);
    }finally{
      setLoading(false)
    }
}

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

const renderItem = ({ item }) => (
  <View className="w-1/2 p-2">
<View style={styles.productCard}>
      {/* Product Image Container - height bada kiya */}
      <View
        className="h-36 flex items-center justify-center"
        style={{ backgroundColor: item.bgcolor || '#f0f4f8' }}
      >
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.image}` }}
          className="w-24 h-24 rounded-lg"
          resizeMode="contain"
        />
      </View>

      {/* Info Panel (aur chhota, kam padding) */}
      <View
        className="px-2 py-1 space-y-0.5"
        style={{ backgroundColor: item.panelcolor || '#ffffff' }}
      >
        <Text numberOfLines={1} style={{ color: item.textcolor }} className="text-xs font-semibold ">
          {item.name}
        </Text>
        <Text style={{ color: item.textcolor }} className="text-sm font-extrabold ">₹ {item.price}</Text>

        {/* Buttons */}
        <View className="flex-row justify-between items-center mt-1.5">
          <Pressable
            onPress={() => handleAddToCart(item._id)}
            className="w-8 h-8 bg-[#bfdbfe] rounded-full items-center justify-center "
          >
            <FontAwesome5 name="plus" size={14} color="#1e40af" />
          </Pressable>

          <Pressable
            onPress={() => handleBuyNow(item._id)}
            className="bg-[#1E40AF] px-3 py-1 rounded-xl "
          >
            <Text className="text-white text-xs font-semibold tracking-wide">Buy Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
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
            ListHeaderComponent={<ScrollImage />} // ye upar ek baar hi dikhega
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            key={'numColumns-2'} // important to avoid the numColumns warning
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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
      // alignItems: 'center',
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

      productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  }

  });
  
