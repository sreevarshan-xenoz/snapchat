import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FILTER_THUMBNAILS } from './FilterAssets';

const FilterSelector = ({ selectedFilter, onSelectFilter }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_THUMBNAILS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterItem,
              selectedFilter === filter.id && styles.selectedFilter,
            ]}
            onPress={() => onSelectFilter(filter.id)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={styles.filterName}>{filter.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 100,
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  filterItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 60,
    height: 80,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 5,
  },
  selectedFilter: {
    backgroundColor: 'rgba(255, 252, 0, 0.4)',
    borderWidth: 2,
    borderColor: '#FFFC00',
  },
  filterIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  filterName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default FilterSelector; 