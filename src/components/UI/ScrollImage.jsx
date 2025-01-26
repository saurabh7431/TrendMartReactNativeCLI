import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, Image } from 'react-native';

const ScrollImage = () => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = 5; // Total number of items in the ScrollView
  const itemWidth = 200; // Width of each item (cart)
  const gap = 20; // Gap between items
  const screenWidth = Dimensions.get('window').width; // Get screen width

  const centerOffset = (screenWidth - itemWidth) / 2;

  // Auto scroll every 4 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
    }, 4000); // every 4 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: (currentIndex * (itemWidth + gap)) - centerOffset, // Ensure item is centered
        animated: true,
      });
    }
  }, [currentIndex]);

  return (
    <View className='w-full items-center'>
      <View className='items-center mt-2 w-[330]'>
        {/* ScrollView */}
        <ScrollView
          horizontal
          ref={scrollViewRef}
          contentContainerStyle={{
            flexDirection: 'row',
            gap: gap,
            justifyContent: 'flex-start', // Keep it aligned to start
            alignItems: 'center',
          }}
          showsHorizontalScrollIndicator={false}
        >
          {/* Cart Item 1 with Image */}
          <View style={{ width: itemWidth, height: 100, backgroundColor: 'slategray', borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={{ uri: "https://picsum.photos/id/870/200/100?grayscale&blur=2" }} // Image URL for this cart item
              style={{ width: 200, height: 100, borderRadius: 2 }}
            />
          </View>

          {/* Cart Item 2 */}
          <View style={{ width: itemWidth, height: 100, backgroundColor: 'green', borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={{ uri: "https://picsum.photos/id/237/200/100" }} // Another image URL (if you want different images)
              style={{ width: 200, height: 100, borderRadius: 2 }}
            />
          </View>

          {/* Cart Item 3 */}
          <View style={{ width: itemWidth, height: 100, backgroundColor: 'yellow', borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={{ uri: "https://picsum.photos/seed/picsum/200/100" }}
              style={{ width: 200, height: 100, borderRadius: 2 }}
            />
          </View>

          {/* Cart Item 4 */}
          <View style={{ width: itemWidth, height: 100, backgroundColor: 'pink', borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={{ uri: "https://picsum.photos/200/100?grayscale" }}
              style={{ width: 200, height: 100, borderRadius: 2 }}
            />
          </View>

          {/* Cart Item 5 */}
          <View style={{ width: itemWidth, height: 100, backgroundColor: 'slategray', borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={{ uri: "https://picsum.photos/200/100/?blur" }}
              style={{ width: 200, height: 100, borderRadius: 2 }}
            />
          </View>
        </ScrollView>

        {/* Line indicator */}
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          {[...Array(totalItems)].map((_, index) => (
            <View
              key={index}
              style={{
                width: 20,
                height: 5,
                borderRadius: 5,
                backgroundColor: index === currentIndex ? 'blue' : 'gray',
                margin: 5,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default ScrollImage;
