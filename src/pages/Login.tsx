// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Mail, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts for quick testing
  const demoAccounts = [
    { name: 'State Officer', email: 'state@ecotrack.gov.in', role: 'State' },
    { name: 'Pune DEO', email: 'deo.pune@ecotrack.gov.in', role: 'DEO' },
    { name: 'Shirur BEO', email: 'beo.shirur@ecotrack.gov.in', role: 'BEO' },
    { name: 'Principal ZPPS', email: 'principal@zpps.edu.in', role: 'Principal' },
  ];

  const fillDemoEmail = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password'); // Any password works for demo
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">EcoTrack Maharashtra</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Login to access your dashboard</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                (Any password works for demo - just use the email)
              </p>
            </div>
            
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          {/* Demo Accounts Section */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground mb-3">Demo Accounts (click to login)</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => fillDemoEmail(account.email)}
                  className="text-left px-3 py-2 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <p className="font-medium">{account.name}</p>
                  <p className="text-muted-foreground truncate">{account.email}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;