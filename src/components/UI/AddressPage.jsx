import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Pressable, Alert, TouchableOpacity, ActivityIndicator,} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import HomeIcon from 'react-native-vector-icons/Entypo';
import WorkIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Security from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';



 
const AddressPage = ({ route }) => {
console.log("Loaded");

  const {data}=route.params;
  const navigation=useNavigation()
  const[loading,setLoading]=useState(true);
  // useState hooks to manage form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [landmark, setLandmark] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [addressType, setAddressType] = useState('Home');
   const [activeType, setActiveType] = useState('Home');
   const [isEditing, setIsEditing] = useState(false);
      

  // useState hooks to productData
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    if (data) {
      setProductData(data);
      setLoading(false); // Stop loading when data is set
    }
  }, []);


  
    // Dummy static data for product details
    let totalMRP = productData?.product?.price *productData?.quantity; // Dummy product price
    const quantity = 1; // Dummy quantity
    const platformFee = 20; // Dummy platform fee
  
    const totalPayable = totalMRP + platformFee;
  
    
    const existingAddress = productData?.user?.address;
    // const existingAddress = productData?.user?.address;
  
    const handleSubmit = async (productId) => {
      setLoading(true)
      let formData = {};
    
      // If the user is editing an existing address, submit the existing address
      if (productData?.user?.address && !isEditing) {
        formData = { ...productData.user.address, addressType: activeType };
      } else {
        // If a new address is being provided, make sure all fields are filled
        if (!name || !phone || !pincode || !locality || !address || !city || !state) {
          Alert.alert('Validation Error', 'Please fill all required fields!');
          return;
        }
    
        formData = {
          name,
          phone,
          pincode,
          locality,
          address,
          city,
          state,
          landmark,
          alternatePhone,
          addressType: activeType,
        };
      }
    
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Authentication Error', 'Please log in to continue.');
          return;
        }
    
        const url = `http://192.168.29.170:3000/user/userAddress/${productId}`;
    
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
    
        const responseBody = await response.text();
    
        if (!response.ok) {
          try {
            const errorData = JSON.parse(responseBody);
            Alert.alert('Error', errorData.message || 'Failed to submit address!');
          } catch (jsonError) {
            Alert.alert('Error', 'Response is not valid JSON. Please try again later.');
          }
          return;
        }
    
        const data = JSON.parse(responseBody);
        navigation.navigate("ConformationPage", { data }); // Navigate with the form data
      } catch (error) {
        Alert.alert('Error', 'Something went wrong! Please try again later.');
      }finally{
        setLoading(false)
      }
    };
    
    
    
    
    // console.log(productData.user.address);
    
      const handleAddressTypeChange = (type) => {
        setAddressType(type);
        setActiveType(type);
      };


      if (loading) {
        return (
          <View className=' flex-1 justify-center items-center h-full'>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        );
      }
      
    return (
      <ScrollView style={styles.container}>
        { loading ? (
           <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
           {/* Delivery Address Form */}
        <View style={styles.addressForm}>
        <Text style={styles.header}>DELIVERY ADDRESS</Text>  
        {productData?.user?.address && !isEditing ? (
        <View style={styles.existingAddressContainer}>
        
        <View className='w-full'>
        <TouchableOpacity 
          onPress={() => setIsEditing(true)}
        >
          <Text className='text-blue-700 text-right'>CHANGE ADDRESS</Text>
        </TouchableOpacity >
      <View style={{justifyContent:"center", alignItems:"center", marginTop:10}}>
      <Text style={{fontSize:15, fontWeight:'bold'}}>{productData.user.address.name}, {productData.user.address.phone}</Text>
      <Text>{productData.user.address.pincode}, {productData.user.address.locality}</Text>
      <Text>{productData.user.address.address}, {productData.user.address.city}</Text>
      <Text>{productData.user.address.state} {productData.user.address.landmark} {productData.user.address.alternatePhone}</Text>
      </View>
      <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioItem,
                  activeType === 'Home' && styles.activeRadioItem,
                ]}
                onPress={() => handleAddressTypeChange('Home')}
              >
                <HomeIcon name="home" size={20} color={activeType === 'Home' ? '#fff' : '#033452'} />
                <Text style={{ color: activeType === 'Home' ? '#fff' : '#033452' }}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioItem,
                  activeType === 'Work' && styles.activeRadioItem,
                ]}
                onPress={() => handleAddressTypeChange('Work')}
              >
                <WorkIcon name="table-network" size={20} color={activeType === 'Work' ? '#fff' : '#033452'} />
                <Text style={{ color: activeType === 'Work' ? '#fff' : '#033452' }}>Work</Text>
              </TouchableOpacity>
            </View>
    </View>
    <Pressable
      style={[styles.saveBTN ,{marginTop:16}]}
      onPress={()=>handleSubmit(productData?.product?._id)}
    >
      <Text style={styles.buttonText}>CONTINUE WITH THIS ADDRESS</Text>
    </Pressable>
  </View>
) : (
  <View>
       {/* Name and Phone */}
       <Pressable
          style={styles.closeButton}
          onPress={() => setIsEditing(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
              <View >
                <TextInput placeholder="Name" style={styles.nameInput} value={name}  onChangeText={setName} />
                <TextInput placeholder="10-digit mobile number" style={styles.nameInput} keyboardType="phone-pad" value={phone} onChangeText={setPhone}/>
              </View>
      
              {/* Pincode and Locality */}
              <View style={styles.pinInputRow}>
                <TextInput placeholder="Pincode" style={styles.pinInput} keyboardType="numeric" value={pincode} onChangeText={setPincode}/>
                <TextInput placeholder="Locality" style={styles.pinInput} value={locality} onChangeText={setLocality} />
              </View>
                <View style={styles.inputRow}>
                  <Pressable style={styles.locationBTN} onPress={() => {}}>
                    <Text style={{color:"white", fontWeight:500}}> Use my current location </Text>
                  </Pressable>
                {/* <Button title="Use my current location" onPress={() => {}} color="#007BFF" /> */}
                <TextInput placeholder="City/District/Town" style={styles.input} value={city} onChangeText={setCity}/>
              </View>
      
              {/* Address */}
              <TextInput placeholder="Address (Area and Street)" style={styles.textarea} multiline value={address} onChangeText={setAddress}/>
      
              {/* City and State */}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={state}
                  style={styles.pickerInput}
                  onValueChange={(itemValue) => setState(itemValue)}
                >
                  <Picker.Item label="--Select State--" value="" />
                  <Picker.Item label="State 1" value="state1" />
                  <Picker.Item label="State 2" value="state2" />
                </Picker>
              </View>
      
              {/* Landmark and Alternate Phone */}
              <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                <TextInput placeholder="Landmark (Optional)" style={styles.input} value={landmark} onChangeText={setLandmark}/>
                <TextInput placeholder="Alternate Phone (Optional)" style={styles.input} keyboardType="phone-pad" value={alternatePhone} onChangeText={setAlternatePhone}/>
              </View>
      
              {/* Address Type */}
              <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioItem,
                  activeType === 'Home' && styles.activeRadioItem,
                ]}
                onPress={() => handleAddressTypeChange('Home')}
              >
                <HomeIcon name="home" size={20} color={activeType === 'Home' ? '#fff' : '#033452'} />
                <Text style={{ color: activeType === 'Home' ? '#fff' : '#033452' }}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioItem,
                  activeType === 'Work' && styles.activeRadioItem,
                ]}
                onPress={() => handleAddressTypeChange('Work')}
              >
                <WorkIcon name="table-network" size={20} color={activeType === 'Work' ? '#fff' : '#033452'} />
                <Text style={{ color: activeType === 'Work' ? '#fff' : '#033452' }}>Work</Text>
              </TouchableOpacity>
            </View>
      
              {/* Save and Deliver button */}
              <View style={{justifyContent:"center", alignItems:"center"}}>
              <TouchableOpacity style={styles.saveBTN} onPress={()=>handleSubmit(productData?.product?._id)}>
                <Text style={{color:"white"}}>SAVE AND DELIVER HERE</Text>
              </TouchableOpacity>
              </View>
  </View>
)}    
  </View>
  {/* 033452 */}
        {/* Price Details */}
        <View style={styles.priceDetails}>
          <Text style={styles.header}>PRICE DETAILS</Text>
          <View style={styles.priceItem}>
            <Text>Price ({productData?.quantity} item)</Text>
            <Text>₹{totalMRP}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text>Delivery Charges</Text>
            <Text>FREE</Text>
          </View>
          <View style={styles.priceItem}>
            <Text>Platform Fee</Text>
            <Text>₹{platformFee}</Text>
          </View>
          <View style={styles.separator}></View>
          <View style={styles.priceItem}>
            <Text style={styles.boldText}>Total Payable</Text>
            <Text style={styles.boldText}>₹{totalPayable}</Text>
          </View>
          <Text style={styles.savings}>Your Total Savings on this order ₹1,017</Text>
          <View style={styles.securePayment}>
            <Text> <Security name="security" size={20} color='#288552' />Safe and Secure Payments. Easy returns. 100% Authentic products.</Text>
          </View>
        </View>
        </View>
        )}
       
      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f0f0f0',
      padding: 16,
    },
    existingAddressContainer: { 
      alignItems: 'center', 
      justifyContent:"center"
    },
    header: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#033452',
      marginBottom: 12,
    },
    addressForm: {
      backgroundColor: '#ffffff',
      padding: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      marginBottom: 16,
    },
    priceDetails: {
      backgroundColor: '#f9f9f9',
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    priceItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 8,
    },
    separator: {
      height: 1,
      backgroundColor: '#ddd',
      marginVertical: 16,
    },
    boldText: {
      fontWeight: 'bold',
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 8,
      marginVertical: 4,
      width:150,
    },
    pickerContainer: {
      borderWidth: 1, 
      borderColor: '#ccc', 
      borderRadius: 4, 
      overflow: 'hidden', 
    },
    pickerInput:{
      height: 50, 
      width: '100%',
      paddingLeft: 8, 
    },
    textarea: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 8,
      marginVertical: 4,
      height: 50,
      textAlignVertical: 'top',
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems:"center"
    },
    nameInput:{
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 8,
      marginVertical: 4,
    },
    pinInputRow:{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems:"center"
    },
    pinInput: {
      height: 40,
      width:150,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 8,
      marginVertical: 4,
    },
    locationBTN:{
        backgroundColor:"#007BFF",
        justifyContent:"center",
        alignItems:"center",
        height:30,
        borderRadius:5
    },
    saveBTN:{
      backgroundColor:"#033452",
      justifyContent:"center",
      alignItems:"center",
      height:40,
      width:300,
      borderRadius:5
    },
    buttonText:{
      color:"white"
    },
    changeButtonText:{
      color:"black",
      fontSize:13,
      paddingHorizontal:3,
      fontWeight:"bold"
    },
    changeButton: { 
      backgroundColor: '#ffc107', 
      paddingVertical:3 , 
      borderRadius: 4,
      height:30,
      width:130,
      justifyContent:'center',
      alignItems:"center"
    },
    closeButtonText:{
      color:"red",
      fontSize:15,
      paddingHorizontal:3,
      fontWeight:"bold"
    },
    closeButton: { 
      alignItems:"flex-end",
      marginBottom:10
    },
    radioGroup: {
      marginVertical: 12,
      flexDirection:"row",
      justifyContent:"space-between"
    },
    radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#033452',
    backgroundColor: '#fff',
    },
    radioButton: {
      width: 80,
      height: 40,
      backgroundColor: '#ddd',
      borderRadius: 50,
      marginRight: 8,
    },
    activeRadioItem: {
      backgroundColor: '#033452',
    },
    savings: {
      marginTop: 12,
      color: 'green',
      fontWeight: 'bold',
    },
    securePayment: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
  
  export default AddressPage;
  
