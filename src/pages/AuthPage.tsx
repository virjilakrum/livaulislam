import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PenTool, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    usernameOrEmail: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        // Validate input
        if (!formData.usernameOrEmail || !formData.password) {
          throw new Error('Email/Username and password are required');
        }

        const { error } = await signIn(formData.usernameOrEmail, formData.password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        if (!formData.username || !formData.displayName) {
          throw new Error('Username and display name are required');
        }
        
        // Validate username format
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }
        
        if (formData.username.length < 3) {
          throw new Error('Username must be at least 3 characters long');
        }
        
        const { error } = await signUp(formData.email, formData.password, formData.username, formData.displayName);
        if (error) throw error;
        
        // Show success message and redirect to sign in
        setMode('signin');
        setError('');
        alert('Account created successfully! Please sign in with your email or username.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-amber-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-5"></div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-stone-50 rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-neutral-900 px-8 py-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <PenTool className="h-8 w-8 text-amber-100" />
              <span className="text-2xl font-bold text-amber-50">livaulislam</span>
            </div>
            <h2 className="text-xl font-semibold text-amber-100">
              {mode === 'signin' ? 'Welcome Back' : 'Join Our Community'}
            </h2>
            <p className="text-neutral-300 mt-2">
              {mode === 'signin' 
                ? 'Sign in to continue your writing journey' 
                : 'Start sharing your stories with the world'}
            </p>
          </div>

          <div className="px-8 py-8">
            {/* Toggle Buttons */}
            <div className="flex bg-stone-200 rounded-lg p-1 mb-8">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === 'signin'
                    ? 'bg-black text-amber-100 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-black text-amber-100 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <>
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 mb-2">
                      Display Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                      <input
                        id="displayName"
                        name="displayName"
                        type="text"
                        required
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                        placeholder="Your display name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">@</span>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={formData.username}
                        onChange={handleInputChange}
                        onBlur={(e) => {
                          // Auto-format username
                          const formatted = e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
                          setFormData(prev => ({ ...prev, username: formatted }));
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                        placeholder="username"
                        minLength={3}
                        maxLength={30}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Only letters, numbers, and underscores allowed. Min 3 characters.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label htmlFor={mode === 'signin' ? 'usernameOrEmail' : 'email'} className="block text-sm font-medium text-neutral-700 mb-2">
                  {mode === 'signin' ? 'Email or Username' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  <input
                    id={mode === 'signin' ? 'usernameOrEmail' : 'email'}
                    name={mode === 'signin' ? 'usernameOrEmail' : 'email'}
                    type={mode === 'signin' ? 'text' : 'email'}
                    required
                    value={mode === 'signin' ? formData.usernameOrEmail : formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    placeholder={mode === 'signin' ? 'Email or username' : 'your@email.com'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-modern btn-primary-modern font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-100"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  mode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}