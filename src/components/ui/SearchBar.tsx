'use client';

import React, { useState, useCallback } from 'react';
import { SearchBarProps } from '@/lib/types';

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "원하는 상품을 검색해보세요",
  initialValue = ""
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // 실시간 검색 기능
    onSearch(value);
  }, [onSearch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  }, [onSearch, searchQuery]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchQuery);
    }
  }, [onSearch, searchQuery]);

  return (
    <div className="mt-3">
      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text" 
          value={searchQuery}
          onChange={handleInputChange}
          onKeyUp={handleKeyUp}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:shadow-md transition-all border-none"
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-200 rounded-full p-1 transition-colors"
        >
          <svg 
            className="w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;