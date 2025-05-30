import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';

// Backend URL for fetching products
const API_URL = 'http://192.168.29.170:3000/user/Search';

const Search = ({ isLoggedIn, onLoginSuccess, onSkipLogin }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(isLoggedIn);


  const navigation=useNavigation();
  const handleSearch = async () => {
    if (!query) return;

    setLoading(true);
    setError(null);
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${API_URL}?query=${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if needed
           'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

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

  const bufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return `data:image/jpeg;base64,${btoa(binary)}`;
  };

  return (
    <ScrollView className="flex-1 p-4">
      
      {/* Search Bar */}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search for products..."
        className="bg-white p-3 rounded-lg shadow-md mb-4"
        style={{ elevation: 3 }}
      />
      
      <View className='justify-center items-center'>
      <TouchableOpacity onPress={handleSearch} className="bg-[#033452] w-[100] p-3 rounded-lg mb-6">
        <Text className="text-white text-center font-bold">Search</Text>
      </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View className="bg-red-100 p-3 rounded-lg mb-4">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      )}

      {/* No products found */}
      {products.length === 0 && !loading && !error && (
        <Text className="text-lg text-center text-gray-500">No products found</Text>
      )}

      {/* Product List */}
      {products.length > 0 && !loading && (
        products.map((product) => (
          <View key={product._id} className='justify-center items-center'>
            <View  className="bg-white p-4 rounded-lg w-[200] shadow-lg mb-4">
            <View className="flex-row   items-center">
              <Image

                source={{ uri: bufferToBase64(product.image.data) }}
                className="w-[100] h-[150] rounded-lg"
                style={{ resizeMode: 'cover' }}
              />
              <View className="ml-4 flex-1">
                <Text className="text-xl font-semibold text-gray-800">{product.name}</Text>
                <Text className="text-sm text-gray-600">Price: ₹{product.price}</Text>
              </View>
            </View>
          </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default Search;
