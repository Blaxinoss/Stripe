import { Link } from "react-router-dom"
import { isLoggedIn } from "../utils";


const Home = () => {
    return (
        <div className="flex flex-col w-full min-h-screen bg-slate-50">
          {/* Hero Section */}
          <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-violet-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d')] bg-cover bg-center opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-violet-900/90"></div>
            <div className="relative container mx-auto px-6 text-center z-10">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white animate-fade-in">
                Premium Images <br className="hidden md:block" /> Within Your Reach
              </h1>
              <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-blue-100/90">
                Unlock thousands of high-quality images with a simple coin system. Fuel your creativity!
              </p>
              <a
                href="#get-started"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-medium px-8 py-4 rounded-full text-lg hover:from-cyan-500 hover:to-blue-600 transform hover:-translate-y-1 transition-all duration-300 ease-out shadow-lg hover:shadow-cyan-500/25"
              >
                Get Started
                              </a>
            </div>
            
            {/* Abstract shapes */}
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          </section>
    
          {/* Features Section */}
          <section id="features" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50"></div>
            <div className="container relative mx-auto px-6 z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
                Our <span className="text-blue-600">Premium</span> Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {/* Feature Card 1 */}
                <div className="backdrop-blur-sm bg-white/80 p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Curated Collection</h3>
                  <p className="text-gray-600">Hand-selected professional photos for any design project or creative endeavor.</p>
                </div>
                
                {/* Feature Card 2 */}
                <div className="backdrop-blur-sm bg-white/80 p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><circle cx="12" cy="12" r="8"></circle><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="m4.93 4.93 2.83 2.83"></path><path d="m16.24 16.24 2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="m4.93 19.07 2.83-2.83"></path><path d="m16.24 7.76 2.83-2.83"></path></svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Smart Coin System</h3>
                  <p className="text-gray-600">Subscribe once and earn coins regularly to download your favorite images.</p>
                </div>
                
                {/* Feature Card 3 */}
                <div className="backdrop-blur-sm bg-white/80 p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M5 8L10 8"></path><path d="M5 12L14 12"></path><path d="M5 16L12 16"></path><path d="M14 16L19 21"></path><path d="M19 16L14 21"></path></svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">One-Click Access</h3>
                  <p className="text-gray-600">Download high-resolution images in seconds with our lightning-fast platform.</p>
                </div>
              </div>
            </div>
          </section>
    
          {/* Call to Action Section */}
          <section id="get-started" className="relative py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-700"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
            
            <div className="container relative mx-auto px-6 text-center z-10">
              <div className="max-w-3xl mx-auto backdrop-blur-sm bg-white/10 p-10 rounded-3xl border border-white/20">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Elevate Your Projects?</h2>
                <p className="text-xl mb-10 text-blue-100">
                  Join our community of creators downloading premium photos daily.
                </p>
                {isLoggedIn() ? (
                  <Link to="/browse" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-medium px-8 py-4 rounded-full text-lg hover:from-cyan-500 hover:to-blue-600 transform hover:-translate-y-1 transition-all duration-300 ease-out shadow-lg hover:shadow-cyan-500/25">
                    Browse Images
                  </Link>
                ) : (
                  <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-medium px-8 py-4 rounded-full text-lg hover:from-cyan-500 hover:to-blue-600 transform hover:-translate-y-1 transition-all duration-300 ease-out shadow-lg hover:shadow-cyan-500/25">
                    Login to Start
                  </Link>
                )}
              </div>
            </div>
            
            {/* Abstract shapes */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          </section>
    
          {/* Footer */}
          <footer className="bg-gray-900 text-gray-400 py-12">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                  <p className="font-medium text-white">Free Pik Photos</p>
                  <p className="text-sm">© 2025 All rights reserved.</p>
                </div>
                <div className="flex space-x-6">
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Help</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      );
    };

export default Home