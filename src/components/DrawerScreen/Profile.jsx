import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Image, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pencil from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import Login from '../UI/Login';

const Profile = ({ isLoggedIn, onLogout, onLoginSuccess, onSkipLogin }) => {
    const [showLogin, setShowLogin] = useState(isLoggedIn);
    const [userProfile, setUserProfile] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading]=useState(true)
    const navigation = useNavigation();


    
    

    // Fetching profile on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true)
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.log("User is not logged in, showing login screen");
                // setShowLogin(true); // Trigger the login screen if not logged in
                return;
            }
            try {
                console.log("In useEffect");
                
                const apiUrl = "http://192.168.29.170:3000/user/profile";
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`  // Include the token in the headers
                    },
                });

                const data = await response.json();
                setUserProfile(data.user);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }finally{
                setLoading(false)
            }
        };

        fetchProfile();
    }, []);


    const handleLoginSuccess = () => {
        // setShowLogin(false);
        onLoginSuccess();
    };

        // Function to pick an image from the gallery
        const pickImage = () => {

            ImagePicker.openPicker({
                mediaType: 'photo', // Allow only images
                cropping: true,      // Enables cropping right after picking
                cropperCircleOverlay: true, // Optional: crop in a circular shape
                cropperToolbarTitle: 'Adjust Profile Picture', // Custom title
                width: 300, // Define the width of the cropped image
                height: 300, // Define the height of the cropped image
            }).then(image => {
                
                
                const imageUri = image.path; // Get the URI of the cropped image
                setSelectedImage(imageUri); // Update the state with the cropped image URI
                uploadImage(imageUri); // Automatically upload the image
            }).catch(error => {
                console.error("Image Picker Error: ", error);
            });
        };


    // Function to upload the image to the backend API
    const uploadImage = async (imageUri) => {
        const token = await AsyncStorage.getItem('userToken');;
        
        const formData = new FormData();
        
        const fileExtension = imageUri.split('.').pop();
        const fileName = imageUri.split('/').pop();
        
        
    
        // Append the image to formData with the correct field name 'image'
        formData.append('image', {
            uri: imageUri,
            type: `image/${fileExtension}`, // Correct MIME type
            name: fileName,  // File name
        });
        try {
            const apiUrl = `http://192.168.29.170:3000/user/updateprofile/${userProfile._id}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Authorization header
                    // No need to set Content-Type, it will be set automatically as multipart/form-data
                },
                body: formData, // Send formData with image
            });
    
            // Check if the response is successful
            if (!response.ok) {
                const errorText = await response.text(); // Get the response as text
                console.error("Error response:", errorText);
                throw new Error(`Server responded with status ${response.status}`);
            }
    
            // Parse the JSON response
            const data = await response.json();
            console.log("Response Data", data);
            
            if (data.success) {
                setUserProfile((prevProfile) => ({
                    ...prevProfile,
                    profile: data.updatedProfileImage, // Assuming response contains updated profile image URL
                }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View className='flex-3 mt-12 justify-center items-center'>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>  
            ) : (
                <View style={styles.profileContainer}>
                    <View style={styles.userProfile}>
                        {userProfile.profile && !selectedImage ? (
                            <Image source={{ uri: `data:image/jpeg;base64,${userProfile.profile}` }} style={styles.profileImage} />
                        ) : (
                            selectedImage && (
                                <Image source={{uri: selectedImage}} style={styles.profileImage} />
                            )
                        )}
                        <Pressable style={styles.updateProfile} onPress={pickImage}>
                            <Pencil name="pencil" size={25} color="#033452" />
                        </Pressable>
                    </View>
                    <Text style={styles.text}> {userProfile.name}</Text>
                </View>
             )} 
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        // flex: 1,
    },
    profileContainer: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
    userProfile: {
        position: 'relative',
        marginBottom: 10,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderWidth: 2,
        borderColor: '#D31339',
        borderRadius: 75,
    },
    updateProfile: {
        position: 'absolute',
        bottom: -10,
        right: 59,
    },
    text: {
        fontSize: 24,
        marginBottom: 20,
    },
});

export default Profile;
