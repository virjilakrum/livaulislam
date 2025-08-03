import React from 'react';
import { PenTool, Users, Heart, Award, BookOpen, Globe } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEF7ED' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-amber-900">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 rounded-2xl" style={{ backgroundColor: '#FEF7ED' }}>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <PenTool className="h-12 w-12 text-black" />
              <h1 className="text-5xl md:text-6xl font-bold text-black">livaulislam</h1>
            </div>
            <p className="text-xl md:text-2xl text-black max-w-3xl mx-auto leading-relaxed">
              A platform where words create worlds, stories find their audience, and writers build their legacy.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-neutral-900 mb-6">Our Mission</h2>
              <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                At livaulislam, we believe that every story deserves to be told and every voice deserves to be heard. 
                We've created a space where writers can share their thoughts, experiences, and creativity with a 
                global community of readers who appreciate the art of storytelling.
              </p>
              <p className="text-lg text-neutral-700 leading-relaxed">
                Our platform bridges the gap between writers and readers, fostering meaningful connections through 
                the power of words. Whether you're a seasoned author or just starting your writing journey, 
                livaulislam provides the tools and community support you need to thrive.
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-8 border-2 border-amber-200">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-amber-700" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">10K+</p>
                  <p className="text-sm text-neutral-600">Active Writers</p>
                </div>
                <div className="text-center">
                  <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-amber-700" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">50K+</p>
                  <p className="text-sm text-neutral-600">Stories Published</p>
                </div>
                <div className="text-center">
                  <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-amber-700" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">150+</p>
                  <p className="text-sm text-neutral-600">Countries</p>
                </div>
                <div className="text-center">
                  <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-amber-700" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">1M+</p>
                  <p className="text-sm text-neutral-600">Monthly Readers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Our Values</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              These core principles guide everything we do and shape the community we're building together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <PenTool className="h-8 w-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Creative Freedom</h3>
              <p className="text-neutral-600">
                We believe in giving writers the freedom to express themselves authentically, 
                without constraints on topics, styles, or perspectives.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Community First</h3>
              <p className="text-neutral-600">
                Our community is built on mutual respect, constructive feedback, 
                and the shared love of storytelling and literature.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Award className="h-8 w-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Excellence</h3>
              <p className="text-neutral-600">
                We strive for excellence in everything we do, from the quality of our platform 
                to the support we provide our writers and readers.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Knowledge Sharing</h3>
              <p className="text-neutral-600">
                We promote the free exchange of ideas, knowledge, and experiences 
                through the power of written word.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Globe className="h-8 w-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Global Reach</h3>
              <p className="text-neutral-600">
                We connect writers and readers from around the world, 
                breaking down barriers and building bridges through stories.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Heart className="h-8 w-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Passion Driven</h3>
              <p className="text-neutral-600">
                Everything we do is driven by our passion for literature, storytelling, 
                and the belief that words can change the world.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-black to-neutral-900 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-amber-100 mb-6">Our Story</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-neutral-300 mb-6 leading-relaxed">
                livaulislam was born from a simple observation: the world is full of incredible stories 
                waiting to be told, and amazing writers who need a platform to share their voice. 
                We saw the need for a space that truly celebrates the art of writing while fostering 
                genuine connections between writers and their audience.
              </p>
              <p className="text-lg text-neutral-300 mb-6 leading-relaxed">
                Starting as a small project in 2024, we've grown into a thriving community where 
                creativity flourishes, stories find their perfect readers, and writers build their careers. 
                Our platform has become home to everything from personal essays and fiction to 
                journalism and poetry.
              </p>
              <p className="text-lg text-amber-200 font-semibold">
                Today, we're proud to be the platform where words truly create worlds.
              </p>
            </div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-12 border-2 border-amber-200">
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">Join Our Community</h2>
            <p className="text-lg text-neutral-700 mb-8 max-w-2xl mx-auto">
              Whether you're here to write, read, or simply be inspired, livaulislam welcomes you. 
              Join thousands of writers and readers who are already part of our growing community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth?mode=signup"
                className="btn-modern btn-primary-modern text-lg font-bold"
              >
                Start Writing
              </a>
              <a
                href="/discover"
                className="btn-modern btn-secondary-modern text-lg font-bold"
              >
                Explore Stories
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}