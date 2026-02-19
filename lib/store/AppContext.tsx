'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Deal, DealCategory } from '../types';
import { ToastProvider } from './ToastContext';

// 상태 타입 정의
export interface AppState {
  // 검색 관련
  searchQuery: string;
  searchResults: Deal[];
  searchHistory: string[];
  isSearching: boolean;
  
  // 필터 관련
  activeCategory: DealCategory | 'all';
  priceRange: [number, number];
  discountFilter: number; // 최소 할인율
  platformFilter: string[];
  
  // 고급 기능
  favorites: number[]; // Deal ID 배열
  recentlyViewed: number[];
  sortBy: 'latest' | 'price_low' | 'price_high' | 'discount';
  
  // UI 상태
  isFilterModalOpen: boolean;
  viewMode: 'grid' | 'list';
}

// 액션 타입 정의
export type AppAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: Deal[] }
  | { type: 'ADD_TO_SEARCH_HISTORY'; payload: string }
  | { type: 'CLEAR_SEARCH_HISTORY' }
  | { type: 'SET_SEARCHING'; payload: boolean }
  | { type: 'SET_ACTIVE_CATEGORY'; payload: DealCategory | 'all' }
  | { type: 'SET_PRICE_RANGE'; payload: [number, number] }
  | { type: 'SET_DISCOUNT_FILTER'; payload: number }
  | { type: 'SET_PLATFORM_FILTER'; payload: string[] }
  | { type: 'TOGGLE_FAVORITE'; payload: number }
  | { type: 'ADD_TO_RECENTLY_VIEWED'; payload: number }
  | { type: 'SET_SORT_BY'; payload: AppState['sortBy'] }
  | { type: 'TOGGLE_FILTER_MODAL' }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'LOAD_PERSISTED_STATE'; payload: Partial<AppState> };

// 초기 상태
const initialState: AppState = {
  searchQuery: '',
  searchResults: [],
  searchHistory: [],
  isSearching: false,
  activeCategory: 'all',
  priceRange: [0, 1000000],
  discountFilter: 0,
  platformFilter: [],
  favorites: [],
  recentlyViewed: [],
  sortBy: 'latest',
  isFilterModalOpen: false,
  viewMode: 'grid',
};

// 리듀서 함수
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
      
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
      
    case 'ADD_TO_SEARCH_HISTORY':
      const newHistory = [
        action.payload,
        ...state.searchHistory.filter(item => item !== action.payload)
      ].slice(0, 10); // 최대 10개만 저장
      return { ...state, searchHistory: newHistory };
      
    case 'CLEAR_SEARCH_HISTORY':
      return { ...state, searchHistory: [] };
      
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload };
      
    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategory: action.payload };
      
    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.payload };
      
    case 'SET_DISCOUNT_FILTER':
      return { ...state, discountFilter: action.payload };
      
    case 'SET_PLATFORM_FILTER':
      return { ...state, platformFilter: action.payload };
      
    case 'TOGGLE_FAVORITE':
      const favoriteId = action.payload;
      const isFavorite = state.favorites.includes(favoriteId);
      const newFavorites = isFavorite
        ? state.favorites.filter(id => id !== favoriteId)
        : [...state.favorites, favoriteId];
      return { ...state, favorites: newFavorites };
      
    case 'ADD_TO_RECENTLY_VIEWED':
      const viewedId = action.payload;
      const newRecentlyViewed = [
        viewedId,
        ...state.recentlyViewed.filter(id => id !== viewedId)
      ].slice(0, 20); // 최대 20개만 저장
      return { ...state, recentlyViewed: newRecentlyViewed };
      
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
      
    case 'TOGGLE_FILTER_MODAL':
      return { ...state, isFilterModalOpen: !state.isFilterModalOpen };
      
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
      
    case 'LOAD_PERSISTED_STATE':
      return { ...state, ...action.payload };
      
    default:
      return state;
  }
}

// Context 생성
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Context Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // LocalStorage에서 상태 로드 및 저장
  useEffect(() => {
    // 로드
    try {
      const persistedState = localStorage.getItem('hotdeal-app-state');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        dispatch({ type: 'LOAD_PERSISTED_STATE', payload: parsed });
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }, []);

  // 상태 변경 시 저장
  useEffect(() => {
    try {
      const stateToSave = {
        searchHistory: state.searchHistory,
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
      };
      localStorage.setItem('hotdeal-app-state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, [state.searchHistory, state.favorites, state.recentlyViewed, state.viewMode, state.sortBy]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AppContext.Provider>
  );
}

// Hook for consuming the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}