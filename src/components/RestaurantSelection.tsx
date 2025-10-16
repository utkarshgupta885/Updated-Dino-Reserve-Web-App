import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';

interface Restaurant {
  id: string;
  name: string;
  dinoType: string;
  emoji: string;
  description: string;
  totalTables: number;
  availableTables: number;
  theme: string;
  themeDark: string;
}

interface RestaurantSelectionProps {
  onSelectRestaurant: (restaurantId: string) => void;
  username: string;
}

const restaurants: Restaurant[] = [
  {
    id: 'trex-bistro',
    name: 'T-Rex Bistro',
    dinoType: 'T-Rex',
    emoji: '🦖',
    description: 'Big portions for big appetites! Our carnivore classics will make you roar with delight.',
    totalTables: 25,
    availableTables: 18,
    theme: 'bg-red-50 border-red-200',
    themeDark: 'dark:bg-red-950/30 dark:border-red-900/50'
  },
  {
    id: 'herbivore-haven',
    name: 'Herbivore Haven',
    dinoType: 'Brachiosaurus',
    emoji: '🦕',
    description: 'Fresh greens and garden delights. Tall tables for our long-necked friends!',
    totalTables: 25,
    availableTables: 12,
    theme: 'bg-green-50 border-green-200',
    themeDark: 'dark:bg-green-950/30 dark:border-green-900/50'
  },
  {
    id: 'stego-steakhouse',
    name: 'Stego Steakhouse',
    dinoType: 'Stegosaurus',
    emoji: '🦕',
    description: 'Premium cuts with our signature spiky seasoning. A true prehistoric experience.',
    totalTables: 25,
    availableTables: 8,
    theme: 'bg-orange-50 border-orange-200',
    themeDark: 'dark:bg-orange-950/30 dark:border-orange-900/50'
  },
  {
    id: 'raptor-cafe',
    name: 'Raptor Café',
    dinoType: 'Velociraptor',
    emoji: '🦖',
    description: 'Quick bites for fast diners. Smart service that\'ll make you feel clever!',
    totalTables: 25,
    availableTables: 20,
    theme: 'bg-yellow-50 border-yellow-200',
    themeDark: 'dark:bg-yellow-950/30 dark:border-yellow-900/50'
  },
  {
    id: 'tricera-tavern',
    name: 'Tricera Tavern',
    dinoType: 'Triceratops',
    emoji: '🦕',
    description: 'Three-course meals with triple the flavor. Family-friendly prehistoric dining.',
    totalTables: 25,
    availableTables: 15,
    theme: 'bg-purple-50 border-purple-200',
    themeDark: 'dark:bg-purple-950/30 dark:border-purple-900/50'
  }
];

export function RestaurantSelection({ onSelectRestaurant, username }: RestaurantSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 relative z-10">
      <ThemeToggle />
      
      <div className="max-w-6xl mx-auto">
        {/* Welcome Message */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-green-300 dark:border-green-700">
            <span className="text-2xl">👋</span>
            <h2 className="text-2xl font-semibold text-green-700 dark:text-green-400">
              Welcome, {username}!
            </h2>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🦕</span>
            <h1 className="text-4xl font-bold text-green-700 dark:text-green-400">Dino Reserve</h1>
            <span className="text-4xl">🦖</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Select a restaurant to manage reservations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card 
              key={restaurant.id} 
              className={`${restaurant.theme} ${restaurant.themeDark} hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform`}
            >
              <CardHeader className="text-center">
                <div className="text-6xl mb-2">{restaurant.emoji}</div>
                <CardTitle className="text-xl text-gray-800 dark:text-gray-100">
                  {restaurant.name}
                </CardTitle>
                <CardDescription className="text-sm dark:text-gray-400">
                  {restaurant.dinoType} themed dining
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  {restaurant.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available Tables</p>
                    <Badge 
                      variant={restaurant.availableTables > 15 ? "default" : restaurant.availableTables > 8 ? "secondary" : "destructive"}
                      className="text-lg px-3 py-1"
                    >
                      {restaurant.availableTables}/{restaurant.totalTables}
                    </Badge>
                  </div>
                  <div className="text-2xl">
                    {restaurant.availableTables > 15 ? '😋' : restaurant.availableTables > 8 ? '😐' : '😴'}
                  </div>
                </div>

                <Button 
                  onClick={() => onSelectRestaurant(restaurant.id)}
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                >
                  🍽️ Manage Tables
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">🦕 Dino Cave synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}