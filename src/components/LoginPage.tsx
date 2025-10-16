import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ThemeToggle } from './ThemeToggle';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation for demo
    if (username && email && password) {
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative z-10">
      <ThemeToggle />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🦕</span>
            <h1 className="text-4xl font-bold text-green-700 dark:text-green-400">Dino Reserve</h1>
            <span className="text-4xl">🦖</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Welcome to your prehistoric dining manager!</p>
        </div>

        <Card className="shadow-lg border-2 border-green-200 dark:border-green-700 bg-white dark:bg-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1728848447975-dc7f2aad30af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2FydG9vbiUyMGRpbm9zYXVyJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc1OTE0MDczMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Cute dino mascot"
                className="w-16 h-16 object-cover rounded-full"
              />
            </div>
            <CardTitle className="text-green-700 dark:text-green-400">Manager Login</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Sign in to manage your dino dining reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="dark:text-gray-200">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g., Rex Manager"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="manager@dinoreserve.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
              >
                🦕 Enter Dino Reserve 🦖
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <span>🥬</span>
            Powered by prehistoric technology
            <span>🥬</span>
          </p>
        </div>
      </div>
    </div>
  );
}