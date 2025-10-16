import React, { useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { DinoPattern } from './components/DinoPattern';
import { LoginPage } from './components/LoginPage';
import { RestaurantSelection } from './components/RestaurantSelection';
import { TableLayout } from './components/TableLayout';

type AppState = 'login' | 'restaurant-selection' | 'table-layout';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('login');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  const handleLogin = (loginUsername: string) => {
    setUsername(loginUsername);
    setCurrentPage('restaurant-selection');
  };

  const handleSelectRestaurant = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
    setCurrentPage('table-layout');
  };

  const handleBackToRestaurants = () => {
    setCurrentPage('restaurant-selection');
    setSelectedRestaurant('');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen relative">
        <DinoPattern />
        
        {currentPage === 'login' && (
          <LoginPage onLogin={handleLogin} />
        )}
        
        {currentPage === 'restaurant-selection' && (
          <RestaurantSelection 
            onSelectRestaurant={handleSelectRestaurant}
            username={username}
          />
        )}
        
        {currentPage === 'table-layout' && selectedRestaurant && (
          <TableLayout 
            restaurantId={selectedRestaurant} 
            onBack={handleBackToRestaurants}
            username={username}
          />
        )}
      </div>
    </ThemeProvider>
  );
}