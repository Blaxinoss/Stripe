import { Link } from "react-router-dom"

type Props = {}

const Home = (props: Props) => {
    return (
        <div className="flex flex-col w-full h-full">

            <section className="py-24 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in">
                        Stunning Photos, Just a Few Clicks Away
                    </h2>
                    <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto">
                        Unlock high-quality images with coins. pure creativity!
                    </p>
                    <a
                        href="#get-started"
                        className="inline-block bg-yellow-400 text-blue-900 font-semibold px-8 py-4 rounded-full text-lg hover:bg-yellow-300 transform hover:scale-105 transition duration-300 ease-in-out"
                    >
                        Start Downloading Now
                    </a>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-blue-100">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">What Makes Us Special</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                            <div className="text-5xl mb-6 text-blue-500">📸</div>
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Premium Images</h3>
                            <p className="text-gray-600">Explore a vast library of professional photos for any creative project.</p>
                        </div>
                        <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                            <div className="text-5xl mb-6 text-blue-500">💰</div>
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Earn Coins Seamlessly</h3>
                            <p className="text-gray-600">Subscribe to get Coins</p>
                        </div>
                        <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                            <div className="text-5xl mb-6 text-blue-500">⚡</div>
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Instant Access</h3>
                            <p className="text-gray-600">Download your favorite images in seconds with a single click.</p>
                        </div>
                    </div>
                </div>
            </section>


            {/* Call to Action */}
            <section id="get-started" className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Unleash Your Creativity?</h2>
                    <p className="text-xl mb-10 max-w-2xl mx-auto">
                        Join a vibrant community downloading free photos daily!
                    </p>
                    <Link
                        to="/signup"
                        className="inline-block bg-yellow-400 text-blue-900 font-semibold px-8 py-4 rounded-full text-lg hover:bg-yellow-300 transform hover:scale-105 transition duration-300 ease-in-out"
                    >
                        Sign Up Today
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-10">
                <div className="container mx-auto px-6 text-center">
                    <p className="mb-6">© 2025 Free Pik Photos. All rights reserved.</p>

                </div>
            </footer>
        </div>
    )
}

export default Home