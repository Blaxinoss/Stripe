// Note: This component expects Link from react-router-dom and isLoggedIn from utils to be available
// For demo purposes, I'll simulate these with placeholders

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Home = () => {
    // Placeholder for isLoggedIn function - replace with your actual import
  const { user } = useAuth();
    // Placeholder Link component - replace with your actual react-router-dom Link


    return (
        <div className="flex flex-col w-full min-h-screen bg-black relative overflow-hidden">
          {/* Animated Background */}
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-cyan-900"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          </div>

          {/* Hero Section */}
          <section className="relative py-12 md:py-40 z-10">
            <div className="container mx-auto px-6 text-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-lg blur-2xl opacity-30 animate-pulse"></div>
                <h1 className="relative text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-none">
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-pulse">
                    PREMIUM
                  </span>
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
                    ASSETS
                  </span>
                  <span className="block text-2xl md:text-3xl font-light text-gray-300 mt-4">
                    WITHIN YOUR REACH
                  </span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl mb-16 max-w-3xl mx-auto text-gray-300 font-light leading-relaxed">
                Unlock thousands of <span className="text-pink-400 font-semibold">high-quality images</span> with our revolutionary coin system, 
                <span className="text-cyan-400 font-semibold"> Fuel your creativity</span> like never before.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a
                  href="#get-started"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-bold px-12 py-5 rounded-full text-xl hover:scale-110 transition-all duration-500 ease-out shadow-2xl hover:shadow-pink-500/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10">GET STARTED</span>
                  <svg className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                
              
              </div>
            </div>
          </section>


{/* Formats Section */}
<section className="relative py-16 z-10">
  <div className="container mx-auto px-6 text-center">
    <h2 className="text-3xl md:text-5xl font-black mb-8">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
        AVAILABLE NOW
      </span>
    </h2>
   <div className="flex flex-wrap justify-center gap-6 text-lg md:text-xl font-medium text-gray-300">
  {/* AI Images */}
  <span className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 hover:border-pink-500/50 transition">
    AI Images  
    <img className="w-5 h-5" src="/verified.png" alt="verified"/>
  </span>

  {/* Vectors */}
  <span className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 hover:border-cyan-500/50 transition">
    Vectors
        <img className="w-5 h-5" src="/verified.png" alt="verified"/>

  </span>

  {/* Illustrations */}
  <span className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition">
    Illustrations
        <img className="w-5 h-5" src="/verified.png" alt="verified"/>

  </span>

  {/* Photos */}
  <span className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition">
    Photos
        <img className="w-5 h-5" src="/verified.png" alt="verified"/>

  </span>

  {/* PSD */}
  <span className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 hover:border-yellow-500/50 transition">
    PSD
        <img className="w-5 h-5" src="/verified.png" alt="verified"/>

  </span>

  {/* Templates */}
  <span className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 hover:border-green-500/50 transition">
    Templates
        <img className="w-5 h-5" src="/verified.png" alt="verified"/>

  </span>
</div>


   <p className="mt-12 text-xl text-gray-400 flex items-center justify-center gap-3">
  <span className="text-orange-400 font-bold flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 hover:border-red-500/50 transition">
    Fonts & Videos <span className="text-gray-300 italic"><img className="w-12 bg-black" src="/soon.png"/></span>
  </span>
 
</p>

  </div>
</section>

          {/* Features Section */}
          <section id="features" className="relative py-24 z-10">
            <div className="container mx-auto px-6">
              <div className="text-center mb-20">
                <h2 className="text-5xl md:text-6xl font-black mb-6">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">
                    REVOLUTIONARY
                  </span>
                  <br />
                  <span className="text-white">FEATURES</span>
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {/* Feature Card 1 */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  <div className="relative bg-gray-900 p-10 rounded-3xl border border-gray-800 hover:border-pink-500/50 transition-all duration-500">
                    <div className="flex items-center justify-center w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                        <circle cx="12" cy="13" r="3"></circle>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-pink-400 transition-colors duration-300">
                      CURATED COLLECTION
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      Hand-selected professional photos crafted for your most ambitious creative projects and design endeavors.
                    </p>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  <div className="relative bg-gray-900 p-10 rounded-3xl border border-gray-800 hover:border-cyan-500/50 transition-all duration-500">
                    <div className="flex items-center justify-center w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white group-hover:scale-110 transition-transform duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="8"></circle>
                        <path d="M12 2v4"></path>
                        <path d="M12 18v4"></path>
                        <path d="m4.93 4.93 2.83 2.83"></path>
                        <path d="m16.24 16.24 2.83 2.83"></path>
                        <path d="M2 12h4"></path>
                        <path d="M18 12h4"></path>
                        <path d="m4.93 19.07 2.83-2.83"></path>
                        <path d="m16.24 7.76 2.83-2.83"></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors duration-300">
                      SMART COIN SYSTEM
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      Subscribe once and earn coins regularly to unlock your favorite images with our innovative reward system.
                    </p>
                  </div>
                </div>

                {/* Feature Card 3 */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  <div className="relative bg-gray-900 p-10 rounded-3xl border border-gray-800 hover:border-orange-500/50 transition-all duration-500">
                    <div className="flex items-center justify-center w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-600 text-white group-hover:scale-110 transition-transform duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 8L10 8"></path>
                        <path d="M5 12L14 12"></path>
                        <path d="M5 16L12 16"></path>
                        <path d="M14 16L19 21"></path>
                        <path d="M19 16L14 21"></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-orange-400 transition-colors duration-300">
                      INSTANT ACCESS
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      Download ultra high-resolution images in seconds with our lightning-fast, next-generation platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section id="get-started" className="relative py-32 z-10">
            <div className="container mx-auto px-6 text-center">
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute -inset-8 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
                <div className="relative bg-black/50 backdrop-blur-xl p-16 rounded-3xl border border-white/10">
                  <h2 className="text-4xl md:text-6xl font-black mb-8">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400">
                      READY TO ELEVATE
                    </span>
                    <br />
                    <span className="text-white">YOUR PROJECTS?</span>
                  </h2>
                  <p className="text-2xl mb-12 text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    Join our exclusive community of 
                    <span className="text-pink-400 font-bold"> 50K+ creators</span> downloading 
                    <span className="text-cyan-400 font-bold"> premium photos</span> daily.
                  </p>
                  
                  {user ? (
                    <Link 
                      to="/browse" 
                      className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-black px-16 py-6 rounded-full text-2xl hover:scale-110 transition-all duration-500 ease-out shadow-2xl hover:shadow-pink-500/50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10">BROWSE IMAGES</span>
                      <svg className="relative z-10 w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  ) : (
                    <Link 
                      to="/login" 
                      className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-black px-16 py-6 rounded-full text-2xl hover:scale-110 transition-all duration-500 ease-out shadow-2xl hover:shadow-pink-500/50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10"  >LOGIN TO START</span>
                      <svg className="relative z-10 w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative bg-black border-t border-gray-800 py-16 z-10">
            <div className="container mx-auto px-6">
                <div className="mb-8 md:mb-0 text-center ">
                  <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400 mb-2">
                    FREE PIK PHOTOS
                  </h3>
                  <p className="text-gray-500">© 2025 All rights reserved. Revolutionizing creativity.</p>
                </div>
                
              </div>
          </footer>
        </div>
    );
};

export default Home