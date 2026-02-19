'use client';

import React from 'react';
import { HeaderProps } from '@/lib/types';
import SearchBar from '@/components/ui/SearchBar';

const Header: React.FC<HeaderProps & { onSearch: (query: string) => void }> = ({ 
  title = "🔥 핫딜사이트",
  onSearchClick,
  onSearch 
}) => {
  const handleSearchIconClick = () => {
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
    if (onSearchClick) {
      onSearchClick();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={handleSearchIconClick}
            aria-label="검색"
          >
            <svg 
              className="w-6 h-6 text-gray-600" 
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
        </div>
        
        {/* Search Bar */}
        <SearchBar onSearch={onSearch} />
      </div>
    </header>
  );
};

export default Header;