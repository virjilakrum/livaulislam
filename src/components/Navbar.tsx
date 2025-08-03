import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, PenTool, Search, Bell, Settings, LogOut, BookOpen, Users, Heart, TrendingUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setShowSignOutConfirm(false);
    
    try {
      const { error } = await signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        alert('Error signing out. Please try again.');
        return;
      }
      
      // Success feedback
      console.log('Successfully signed out');
      
      // Close user menu
      setIsUserMenuOpen(false);
      
      // Small delay for smooth transition
      setTimeout(() => {
        navigate('/');
      }, 100);
      
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true);
  };

  const handleSignOutCancel = () => {
    setShowSignOutConfirm(false);
  };

  const handleSignOutConfirm = async () => {
    await signOut();
    handleSignOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Backdrop for mobile menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-md shadow-2xl border-b border-amber-900/20' 
          : 'bg-gradient-to-r from-black via-neutral-900 to-black border-b border-neutral-800/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <img 
                  src="https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=150&h=50&fit=crop" 
                  alt="livaulislam Logo" 
                  className="h-10 w-auto transition-all duration-300 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/discover"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActivePath('/discover')
                    ? 'bg-amber-100/10 text-amber-100 shadow-lg'
                    : 'text-neutral-300 hover:text-amber-100 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Discover</span>
                </span>
              </Link>
              
              <Link
                to="/community"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActivePath('/community')
                    ? 'bg-amber-100/10 text-amber-100 shadow-lg'
                    : 'text-neutral-300 hover:text-amber-100 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Community</span>
                </span>
              </Link>
              
              <Link
                to="/about"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActivePath('/about')
                    ? 'bg-amber-100/10 text-amber-100 shadow-lg'
                    : 'text-neutral-300 hover:text-amber-100 hover:bg-white/5'
                }`}
              >
                About
              </Link>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Search Button */}
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-300"
                  >
                    <Search className="h-5 w-5" />
                  </button>

                  {/* Notifications */}
                  <button className="relative p-2 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-300">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></span>
                    </span>
                  </button>

                  {/* Write Button */}
                  <Link
                    to="/write"
                    className="hidden sm:flex items-center space-x-2 bg-stone-50 text-black px-4 py-2 rounded-full font-medium border-2 border-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <PenTool className="h-4 w-4" />
                    <span>Write</span>
                  </Link>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-1 rounded-lg hover:bg-white/5 transition-all duration-300 group"
                    >
                      <div className="relative">
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={profile.display_name} 
                            className="h-8 w-8 rounded-full border-2 border-amber-200/50 group-hover:border-amber-200 transition-all duration-300" 
                          />
                        ) : (
                          <div className="h-8 w-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center border-2 border-amber-200/50 group-hover:border-amber-200 transition-all duration-300">
                            <User className="h-4 w-4 text-black" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-black"></div>
                      </div>
                      <span className="hidden sm:block text-neutral-300 group-hover:text-amber-100 font-medium transition-colors duration-300">
                        {profile?.display_name}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <div className={`absolute right-0 mt-2 w-64 bg-neutral-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-neutral-700/50 transition-all duration-300 ${
                      isUserMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}>
                      <div className="p-3 border-b border-neutral-700/50">
                        <div className="flex items-center space-x-3">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.display_name} className="h-10 w-10 rounded-full" />
                          ) : (
                            <div className="h-10 w-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-black" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-amber-100">{profile?.display_name}</p>
                            <p className="text-sm text-neutral-400">@{profile?.username}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <Link 
                          to={`/profile/${profile?.username}`}
                          className="flex items-center space-x-3 px-3 py-2 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Your Profile</span>
                        </Link>
                        
                        <Link 
                          to="/dashboard"
                          className="flex items-center space-x-3 px-3 py-2 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        
                        <Link 
                          to="/liked"
                          className="flex items-center space-x-3 px-3 py-2 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4" />
                          <span>Liked Articles</span>
                        </Link>
                        
                        <Link 
                          to="/settings"
                          className="flex items-center space-x-3 px-3 py-2 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        
                        <hr className="my-2 border-neutral-700/50" />
                        
                        <button 
                          onClick={handleSignOutClick}
                          disabled={isSigningOut}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                          {isSigningOut && (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-red-400"></div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/auth" 
                    className="text-neutral-300 hover:text-amber-100 font-medium transition-colors duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    className="bg-stone-50 text-black px-4 py-2 rounded-full font-medium border-2 border-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-300"
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`} />
                  <span className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                  <span className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? 'max-h-20 pb-4' : 'max-h-0'}`}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, authors, or topics..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-neutral-700/50 rounded-lg text-amber-100 placeholder-neutral-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                autoFocus
              />
            </form>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="px-4 pt-2 pb-4 bg-gradient-to-b from-neutral-900 to-black border-t border-neutral-700/50">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-neutral-700/50 rounded-lg text-amber-100 placeholder-neutral-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </form>

            <div className="space-y-2">
              <Link 
                to="/discover" 
                className="flex items-center space-x-3 px-3 py-3 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <BookOpen className="h-5 w-5" />
                <span>Discover</span>
              </Link>
              
              <Link 
                to="/community" 
                className="flex items-center space-x-3 px-3 py-3 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Community</span>
              </Link>
              
              <Link 
                to="/about" 
                className="flex items-center space-x-3 px-3 py-3 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <span>About</span>
              </Link>

              {user ? (
                <>
                  <hr className="my-3 border-neutral-700/50" />
                  
                  <Link 
                    to="/write"
                    className="flex items-center space-x-3 px-3 py-3 bg-stone-50 text-black rounded-full font-medium border-2 border-black shadow-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <PenTool className="h-5 w-5" />
                    <span>Write Article</span>
                  </Link>
                  
                  <Link 
                    to={`/profile/${profile?.username}`}
                    className="flex items-center space-x-3 px-3 py-3 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Your Profile</span>
                  </Link>
                  
                  <Link 
                    to="/dashboard"
                    className="flex items-center space-x-3 px-3 py-3 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <button 
                    onClick={handleSignOutClick}
                    disabled={isSigningOut}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                    {isSigningOut && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b border-red-400 ml-2"></div>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-3 border-neutral-700/50" />
                  
                  <Link 
                    to="/auth" 
                    className="block px-3 py-3 text-neutral-300 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  
                  <Link 
                    to="/auth?mode=signup" 
                    className="block px-3 py-3 bg-stone-50 text-black rounded-full font-medium border-2 border-black shadow-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-2xl border-2 border-black max-w-md w-full" style={{ backgroundColor: '#FEF7ED' }}>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-full bg-red-100 border border-red-300">
                  <LogOut className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Sign Out</h3>
                  <p className="text-sm text-neutral-600">Are you sure you want to sign out?</p>
                </div>
              </div>
              
              <p className="text-neutral-700 mb-6">
                You will be redirected to the home page and will need to sign in again to access your account.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleSignOutCancel}
                  disabled={isSigningOut}
                  className="px-4 py-2 rounded-lg border-2 border-black font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FEF7ED', color: '#000000' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOutConfirm}
                  disabled={isSigningOut}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium border-2 border-red-600 transition-all duration-300 hover:bg-red-700 hover:border-red-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                      <span>Signing Out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}