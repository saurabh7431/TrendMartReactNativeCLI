import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '@react-navigation/elements';
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, ActivityIndicator, Image, Pressable, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // useFocusEffect for navigation focus
import Plus from 'react-native-vector-icons/FontAwesome5';
import Minus from 'react-native-vector-icons/FontAwesome';
import Delete from 'react-native-vector-icons/MaterialCommunityIcons';
import Login from './Login';
import { memo } from 'react';

const Cart = ({ isLoggedIn, onLoginSuccess, onSkipLogin }) => {
  console.log("Cart");
  
  const [cartItem, setCartItem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(isLoggedIn);
  
  
  
  const navigation = useNavigation();

  // Handle the increase of product quantity and update it in the state
  const increaseHandle = async (ItemId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');  // Get the token here
      if (!token) {
        console.log("No token found, user might not be logged in.");
        return; // Handle this case appropriately (e.g., prompt the user to login)
      }

      const url = `http://192.168.29.170:3000/cart/increase/${ItemId}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to increase item quantity');
      }

      const data = await response.json();
      
      // Update only the specific product in the cart state
      setCartItem(prevCartItems => {
        return prevCartItems.map(item => 
          item.product._id === ItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      });
      
    } catch (error) {
      console.error("Error increasing item:", error);
    }
  };

// Handle the decrease of product quantity and update it in the state
const decreaseHandle = async (ItemId) => {
    
    try {
      const token = await AsyncStorage.getItem('userToken');  // Get the token here
      if (!token) {
        console.log("No token found, user might not be logged in.");
        return; // Handle this case appropriately (e.g., prompt the user to login)
      }

      const url = `http://192.168.29.170:3000/cart/decrease/${ItemId}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to increase item quantity');
      }

      const data = await response.json();
      
      // Update only the specific product in the cart state
      setCartItem(prevCartItems => {
        return prevCartItems.map(item => 
          item.product._id === ItemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      });
      
    } catch (error) {
      console.error("Error increasing item:", error);
    }
  };


// Handle the decrease of product quantity and update it in the state
const deleteHandle = async (index) => {  // Pass the index to the function
    
    try {
        const token = await AsyncStorage.getItem('userToken');  // Get the token here
        if (!token) {
            console.log("No token found, user might not be logged in.");
            return; // Handle this case appropriately (e.g., prompt the user to login)
        }

        const url = `http://192.168.29.170:3000/cart/delete/${index}`;  // Send index, not ItemId
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete item from cart');
        }

        const data = await response.json();

        // If deletion is successful, update the cart state
        setCartItem(prevCartItems => {
            // Filter out the deleted item using the index
            return prevCartItems.filter((item, idx) => idx !== index);
        });

    } catch (error) {
        console.error("Error deleting item:", error);
    }
};


const buyProductHandle= useCallback( async (itemId)=>{
  setLoading(true)
    try {
        const token = await AsyncStorage.getItem('userToken');  // Get the token here
        if (!token) {
            console.log("No token found, user might not be logged in.");
            return; // Handle this case appropriately (e.g., prompt the user to login)
        }

        const url = `http://192.168.29.170:3000/user/buyProduct/${itemId}`;  // Send index, not ItemId
        const response = await fetch(url, {
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
        console.log("data", data);
         navigation.navigate("AddressPage", { data })
      setLoading(false); 
        

    } catch (error) {
        console.error("Error Buying item:", error);
    }finally{
      setLoading(false)
    }
    
},[navigation])


  // Fetch cart items when the component mounts or when user is logged in
  useFocusEffect(
    React.useCallback(() => {
      const fetchCartItem = async () => {
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
          setShowLogin(true);
          return;
        }

        try {
          const response = await fetch('http://192.168.29.170:3000/cart/userCart', {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch cart items');
          }

          const data = await response.json();
          setCartItem(data.cart);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchCartItem();
    }, []));

  useEffect(() => {
    setShowLogin(!isLoggedIn);
  }, [isLoggedIn]);

  const handleLoginSuccess = async () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    setShowLogin(false);
    navigation.navigate("Cart")
  };

  const handleSkipLogin = () => {
    setShowLogin(false);
    onSkipLogin();
    navigation.navigate("Home"); // Redirect to Home screen
};

  const renderItem = ({ item, index }) => {
    const totalMRP = item.product.price * item.quantity;
    const TotalAmount = totalMRP + 20;

    return (
      <View style={styles.productText}>
        {item.product.image ? (
          <View style={styles.productContainer}>
            <View style={styles.cartContainer}>
              <View>
                <View style={[styles.productImage1, { backgroundColor: item.product.bgcolor }]}>
                  <Image source={{ uri: `data:image/jpeg;base64,${item.product.image}` }} style={styles.productImage} />
                  <View style={styles.nameContainer}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{item.product.name}</Text>
                  </View>
                </View>
                <View style={styles.increaseContainer}>
                {item.quantity === 1 ? (
                  <TouchableOpacity onPress={() => deleteHandle(index)}>
                  <View style={{ width: 25, height: 25, backgroundColor: 'white', alignItems:"center", justifyContent: 'center', borderRadius: 50 }}>
                  <Delete name="delete" size={22} color="red" />
                  </View>
                  </TouchableOpacity>
                  ) : (
                 <TouchableOpacity onPress={() => decreaseHandle(item.product._id)}>
                 <View style={{ width: 25, height: 25, backgroundColor: 'white', alignItems:"center", justifyContent: 'center', borderRadius: 50 }}>
                 <Minus name="minus" size={25} color="#033452" />
                 </View>
                 </TouchableOpacity>
                            )}
                  <View style={styles.quantityContainer}>
                    <Text style={{ fontSize: 22, fontWeight: "bold" }}> {item.quantity}</Text>
                  </View>
                  <TouchableOpacity onPress={() => increaseHandle(item.product._id)}>
                    <View style={{ width: 25, height: 25, backgroundColor: 'white', alignItems:"center", justifyContent: 'center', borderRadius: 50 }}>
                      <Plus name="plus" size={22} color="#033452" />
                    </View>
                  </TouchableOpacity>
                  
                </View>
                <View style={styles.textPanel}>
                  <View style={{ justifyContent: 'center', flexDirection: 'row', gap: 150, alignItems: 'center' }}>
                    <View style={styles.NetTotalContainer}>
                      <Text style={{ fontSize: 15, fontWeight: "bold" }}>Net Total</Text>
                      <Text style={{ fontSize: 15, fontWeight: "bold" }}> ₹ {item.product.price}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.breakdown}>
                <View>
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}> Price Breakdown</Text>
                </View>
                <View style={styles.priceCalculation}>
                  <View className='flex-row justify-between w-[150]'>
                    <Text style={{ marginTop: 12, fontWeight: "bold" }}>Total MRP</Text>
                    <Text style={{ marginTop: 12, fontWeight: "bold" }}>₹ {totalMRP}</Text>
                  </View>
                  <View className='flex-row justify-between w-[150]'>
                    <Text style={{ fontWeight: "bold" }}>Discount on MRP</Text>
                    <Text style={{ fontWeight: "bold" }}>₹ 0</Text>
                  </View>
                  <View className='flex-row justify-between w-[150]'>
                    <Text style={{ fontWeight: "bold" }}>Platform Fee</Text>
                    <Text style={{ fontWeight: "bold" }}>₹ 20</Text>
                  </View>
                  <View className='flex-row justify-between w-[150] border-b border-black '>
                    <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Shipping Fee</Text>
                    <Text style={{ fontWeight: "bold", marginBottom: 10 }}>FREE</Text>
                  </View>
                  <View className='flex-row justify-between w-[150]'>
                    <Text style={{ fontWeight: "bold" }}> Total Amount </Text>
                    <Text style={{ fontWeight: "bold" }}> {TotalAmount} </Text>
                  </View>
                  <TouchableOpacity className=' bg-yellow-500 justify-center items-center w-[150] h-[30] rounded mt-6' onPress={()=> buyProductHandle(item.product._id)}>
                    <Text style={{fontWeight:"bold", fontSize:20}}>Buy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <Text>No image available</Text>
        )}
      </View>
    );
  };

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
            data={cartItem}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  increaseLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  cartContainer: {
    width: 340,
    height: 270,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor: "#EDF0FC",
    flexDirection: "row",
    gap: 20,
  },
  productImage1: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:5
  },
  productImage: {
    width: 90,
    height: 120,
  },
  nameContainer: {
    flexDirection: "row",
    // gap: 10,
    alignItems: "center",
  },
  increaseContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    width: 150,
    height:30,
    justifyContent: "space-between",
    alignItems:"center",
    borderRadius: 15,
    borderColor: "yellow",
    borderWidth: 3,
    marginTop: 20,
    marginBottom: 8,
    // marginLeft: 8,
  },
  quantityContainer: {
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  textPanel: {
    width: 150,
    height: 30,
    flexDirection: 'row',
    paddingHorizontal: 10,
    backgroundColor: "#a7b0ca",
    marginTop: 10,
    borderRadius: 5,
  },
  NetTotalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  priceCalculation: {
    gap: 12,
  },
  totalMRP: {
    flexDirection: "row",
    
  },
  discount: {
    flexDirection: "row",
    gap: 30,
  },
  platform: {
    flexDirection: "row",
    gap: 30,
  },
  shipping: {
    flexDirection: "row",
    gap: 30,
    borderBottomWidth: 3,
    borderBottomColor: "black",
  },
  totalAmount: {
    flexDirection: "row",
    gap: 50,
  },
  buy: {
    backgroundColor: "yellow",
    height: 30,
    width: 180,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
