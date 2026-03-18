import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Leaf, Eye, EyeOff, Landmark, Building2, GraduationCap, School } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DEMO_ACCOUNTS = [
  { 
    role: 'State Officer', 
    email: 'state.officer@maharashtra.gov.in',
    icon: Landmark,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    hoverColor: 'hover:bg-purple-100'
  },
  { 
    role: 'DEO (District)', 
    email: 'deo.pune@maharashtra.gov.in',
    icon: Building2,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    hoverColor: 'hover:bg-blue-100'
  },
  { 
    role: 'BEO (Block)', 
    email: 'beo.shirur@maharashtra.gov.in',
    icon: GraduationCap,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    hoverColor: 'hover:bg-green-100'
  },
  { 
    role: 'Principal', 
    email: 'principal.zpps@maharashtra.gov.in',
    icon: School,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    hoverColor: 'hover:bg-amber-100'
  }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123'); // Any password works
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            EcoTrack
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
            महाराष्ट्र पर्यावरण शिक्षण ट्रॅकर
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Demo Mode Alert */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <span className="font-semibold">डेमो मोड:</span> कोणताही पासवर्ड वापरा. खालील डेमो खात्यांवर क्लिक करा.
              <br />
              <span className="font-semibold">Demo Mode:</span> Use any password. Click on any demo account below.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                Email / ईमेल
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                Password / पासवर्ड
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in... / साइन इन करीत आहे...' : 'Sign In / साइन इन'}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-4 text-gray-500 font-semibold">
                Demo Accounts / डेमो खाती
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemoAccount(account.email)}
                  disabled={isLoading}
                  className={`w-full text-left p-4 rounded-xl border-2 ${account.borderColor} ${account.bgColor} ${account.hoverColor} transition-all duration-200 transform hover:scale-102 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${account.bgColor} ${account.textColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${account.textColor}`}>
                        {account.role}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {account.email}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            नवीन खाते तयार करायचे?{' '}
            <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
              साइन अप करा
            </Link>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            विकासाचा मागोवा घ्या | Track Your Progress
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;