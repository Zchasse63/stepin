/**
 * Buddy Search Component
 * Search for buddies by username or email with debounced search
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { searchBuddies, BuddySearchResult } from '@/lib/services/buddySearchService';
import { BuddySearchResult as BuddySearchResultComponent } from './BuddySearchResult';

interface BuddySearchProps {
  onSelectBuddy: (buddy: BuddySearchResult) => void;
}

export function BuddySearch({ onSelectBuddy }: BuddySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<BuddySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Debounced search function
  const performSearch = useCallback(async (term: string) => {
    if (term.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const data = await searchBuddies(term);
    setResults(data);
    setLoading(false);
  }, []);
  
  // Handle search term change with debounce
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Set new timeout for debounced search (300ms)
    const timeout = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);
    
    setDebounceTimeout(timeout);
    
    // Cleanup
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm]);
  
  return (
    <View style={styles.container} testID="buddy-search">
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          testID="search-input"
          style={styles.input}
          placeholder="Search by username or email"
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
        {loading && (
          <ActivityIndicator testID="loading-indicator" size="small" color="#4CAF50" style={styles.loader} />
        )}
      </View>

      {searchTerm.length > 0 && searchTerm.length < 3 && (
        <Text style={styles.hint} testID="search-hint">Type at least 3 characters to search</Text>
      )}
      
      <FlatList
        testID="results-list"
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BuddySearchResultComponent
            buddy={item}
            onPress={() => onSelectBuddy(item)}
          />
        )}
        ListEmptyComponent={
          searchTerm.length >= 3 && !loading ? (
            <View style={styles.emptyContainer} testID="empty-state">
              <Feather name="user-x" size={48} color="#ccc" />
              <Text style={styles.emptyText} testID="empty-message">No users found</Text>
              <Text style={styles.emptySubtext}>
                Try searching by username or email
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  loader: {
    marginLeft: 12,
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 16,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

