import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert, TouchableOpacity } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';


const ConformationPage = ({route}) => {
  const {data}=route.params;
  const [details, setDetails]=useState(null)
  const [loading, setLoading]=useState(true);
  const navigation=useNavigation()


 useEffect(() => {
     if (data) {
      setDetails(data);
       setLoading(false); // Stop loading when data is set
     }
   }, [data]); 

    const bufferToBase64 = (buffer) => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return `data:image/jpeg;base64,${btoa(binary)}`;
    };
    
   

  const paymentHandle = async (userId, productId, quantity, totalPayable) => {
  try {
    setLoading(true)
    // Step 1: Call backend to create the payment order
    const response = await fetch('http://192.168.29.170:3000/user/userPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        productId,
        quantity,
        totalMRP: totalPayable,
      }),
    });

    // Check if the response is in JSON format
    const contentType = response.headers.get('Content-Type');
    const isJsonResponse = contentType && contentType.includes('application/json');

    if (isJsonResponse) {
      const paymentData = await response.json();

      if (paymentData.error) {
        console.error('Error creating payment order:', paymentData.error);
        return;
      }


      // Check if RazorpayCheckout is properly initialized
      if (typeof RazorpayCheckout.open !== 'function') {
        console.error('RazorpayCheckout.open is not a function.');
        return;
      }

      // Step 2: Proceed with Razorpay payment initiation
      const options = {
        key: paymentData.keyId, // Your Razorpay key ID
        amount: paymentData.amount, // Amount in paisa
        currency: 'INR',
        order_id: paymentData.orderId, // Razorpay order ID from backend
        name: 'TrendMart',
        description: 'Payment for product',
        image: 'https://your-logo-url.com/logo.png', // Company logo
        prefill: {
          email: 'customer@example.com',
          contact: '1234567890',
          name: 'Customer Name',
        },
        theme: {
          color: '#033452'
          // '#F37254', // Customize theme color
        },
      };

      // Call Razorpay checkout
      RazorpayCheckout.open(options)
        .then((data) => {
          console.log('Payment successful:', data);
          verifyPayment(paymentData.orderId, data.razorpay_payment_id, data.razorpay_signature);
        })
        .catch((error) => {
          console.error('Payment failed:', error);
          Alert.alert('Payment Failed', error.description || error.error.description);
        });

    } else {
      const errorText = await response.text();
      console.error('Received non-JSON response:', errorText);
      Alert.alert('Error', 'Failed to initiate payment. Please try again.');
    }
  } catch (error) {
    console.error('Error in payment handle:', error);
    Alert.alert('Error', 'Something went wrong while processing payment.');
  }finally{
    setLoading(false)
  }
};

// Verify payment after success
const verifyPayment = async (orderId, paymentId, signature) => {
  try {
    const response = await fetch('http://192.168.29.170:3000/user/userPayment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    });

    const verifyData = await response.json();

    if (verifyData.success) {
      navigation.navigate("OrderDetails", {verifyData})
    } else {
      Alert.alert('Verification Failed', 'Payment verification failed.');
    }
  } catch (error) {
    console.error('Error during payment verification:', error);
    Alert.alert('Error', 'Failed to verify payment.');
  }
};



if (loading) {
        return (
          <View className=' flex-1 justify-center items-center h-full'>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        );
      }
       
  // Calculating total MRP
  const totalMRP = details?.product?.price * details?.quantity;
  const totalPayable = totalMRP + 20; // Adding platform fee

  return (
    <ScrollView style={styles.container}>
      {loading ? ( 
        <View>
           <ActivityIndicator size="large" color="#0000ff" />
      </View>
      ):(
        <View>
              {/* Login Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>
          1 LOGIN <Text style={styles.successIcon}>✔</Text>
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>{details?.user?.name}</Text>: {details?.user?.email}
        </Text>
        <Text style={{color:"blue", fontSize:15, fontWeight:"bold", marginVertical:10}}>Change</Text>
      </View>

      {/* Delivery Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>
          2 DELIVERY ADDRESS <Text style={styles.successIcon}>✔</Text>
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>{details?.user?.address?.name}</Text> 
          {details?.user?.address?.phone}, {details?.user?.address?.pincode}, 
          {details?.user?.address?.locality}, {details?.user?.address?.address}, 
          {details?.user?.address?.city}, {details?.user?.address?.state}, 
          {details?.user?.address?.landmark}, {details?.user?.address?.alternatePhone}
        </Text>
        <Text style={{color:"blue", fontSize:15, fontWeight:"bold", marginVertical:10}}>Change</Text>
      </View>

      {/* Order Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>3 ORDER SUMMARY</Text>
        <View style={styles.orderSummary}>
          <View className='w-[100px] h-[100px] rounded justify-center items-center' style={{backgroundColor:details?.product?.bgcolor}}>
            <Image alt='Image not loaded' source={{ uri: bufferToBase64(details?.product?.image.data) }} className='w-[60px] h-[80px]' />
          </View>

         
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{details?.product?.name}</Text>
            <Text style={styles.sellerText}>Seller: TrenMart</Text>
            <Text style={styles.productPrice}>
              ₹{details?.product?.price} <Text style={styles.discountText}>{details?.product?.discount}%</Text> 1 coupon applied
            </Text>
            <Text style={{color:"red", fontSize:15, fontWeight:"bold", marginVertical:10}}>Change</Text>
          </View>
        </View>
      </View>

      {/* Price Details Section */}
      <View style={styles.priceDetails}>
        <Text style={styles.priceDetailsHeader}>PRICE DETAILS</Text>
        <View style={styles.priceRow}>
          <Text>Price ({details?.quantity} item)</Text>
          <Text>₹{totalMRP}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text>Delivery Charges</Text>
          <Text style={styles.freeText}>FREE</Text>
        </View>
        <View style={styles.priceRow}>
          <Text>Platform Fee</Text>
          <Text>₹20</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.bold}>Total Payable</Text>
          <Text style={styles.bold}>₹{totalPayable}</Text>
        </View>
        <Text style={styles.savingsText}>Your Total Savings on this order ₹456</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Order confirmation email will be sent to {details?.user?.email}
        </Text>
        <TouchableOpacity style={styles.payBTN} onPress={() => paymentHandle(details.user._id, details.product._id, details.quantity, totalPayable)}>
            <Text style={{color:"white"}}> {`Pay ₹${totalPayable}`} </Text>
        </TouchableOpacity>
      </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  section: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  successIcon: {
    color: 'green',
    fontWeight: 'bold',
  },
  sectionText: {
    fontSize: 14,
    color: '#707070',
    marginTop: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  orderSummary: {
    flexDirection: 'row',
    marginTop: 16,
    gap:20
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor:"yellow"
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  sellerText: {
    fontSize: 12,
    color: '#808080',
  },
  productPrice: {
    fontSize: 14,
    color: '#333333',
    marginTop: 8,
  },
  discountText: {
    color: 'green',
  },
  priceDetails: {
    backgroundColor: '#F7F7F7',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  priceDetailsHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  freeText: {
    color: 'green',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 16,
    paddingTop: 8,
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  savingsText: {
    fontSize: 14,
    color: 'green',
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 14,
    color: '#707070',
    marginBottom: 16,
  },
  payBTN:{
    backgroundColor:"#033452",
    padding:10,
    borderRadius:5,
    marginBottom:50
  }
});

export default ConformationPage;
