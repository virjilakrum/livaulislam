import React from 'react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: '#FEF7ED' }}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight" style={{ color: '#000000' }}>
            Where Words
            <span className="block font-anton" style={{ color: '#000000', fontFamily: 'Anton, sans-serif' }}>
              Create Worlds
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: '#2D2D2D' }}>
            Join a community of passionate writers and thoughtful readers. Share your stories, 
            discover amazing content, and connect with fellow wordsmiths from around the globe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/auth?mode=signup"
              className="btn-modern text-lg font-bold px-8 py-4 rounded-full border-2 border-black transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ backgroundColor: '#FEF7ED', color: '#000000' }}
            >
              Start Writing Today
            </Link>
            <Link
              to="/discover"
              className="btn-modern text-lg font-bold px-8 py-4 rounded-full border-2 border-black transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ backgroundColor: '#FEF7ED', color: '#000000' }}
            >
              Explore Stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}