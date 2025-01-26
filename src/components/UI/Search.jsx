import React, { useState } from 'react'
import { View, Text, TextInput, FlatList } from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

const Search = () => {
  const [query, setQuery] = useState('') // User input
  const [filteredData, setFilteredData] = useState([]) // Filtered data

  // Dummy user data
  const users = [
    { id: '1', name: 'John Doe', email: 'john.doe@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com' },
    { id: '3', name: 'Samuel Green', email: 'samuel.green@example.com' },
    { id: '4', name: 'Emma Brown', email: 'emma.brown@example.com' },
    { id: '5', name: 'Michael Black', email: 'michael.black@example.com' },
    { id: '6', name: 'Linda White', email: 'linda.white@example.com' },
    { id: '7', name: 'Paul Johnson', email: 'paul.johnson@example.com' },
    { id: '8', name: 'Olivia Martin', email: 'olivia.martin@example.com' },
  ]

  // Handle search logic
  const handleSearch = (text) => {
    setQuery(text)
    if (text === '') {
      setFilteredData([]) // Show nothing if the input is empty
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(text.toLowerCase()) || 
        user.email.toLowerCase().includes(text.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  return (
    <View className="flex-1 bg-white p-4">
      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 p-2 rounded-lg mb-4">
        <Feather name="search" size={20} color="#888" className="mr-2" />
        <TextInput
          value={query}
          onChangeText={handleSearch}
          placeholder="Search by name or email..."
          className="flex-1 text-lg text-black"
        />
      </View>

      {/* Search Results */}
      {filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          renderItem={({ item }) => (
            <View className="py-2 border-b border-gray-200">
              <Text className="text-lg text-black">{item.name}</Text>
              <Text className="text-sm text-gray-500">{item.email}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text className="text-center text-gray-500 mt-4">No results found</Text>
      )}
    </View>
  )
}

export default Search
