import { BrowserRouter, Route, Routes } from "react-router";
import Nav from "./Components/Nav";
import ProtectedRoute from "./Components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import CoinsContextProvider from './context/CoinsContextProvider';
import Administration from "./pages/Administration";
import Browse from './pages/Browse';
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProfilerUser from "./pages/ProfilerUser";
import SignIn from "./pages/SignIn";
import ImageDownloaded from "./Components/ImageDownloaded";
import { SocketProvider } from "./context/SocketContext";


function App() {
    return (
            <BrowserRouter>
                                    <SocketProvider>

                <CoinsContextProvider>
                    <AuthProvider>
                        <Nav />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path='/signup' element={<SignIn />} />
                            <Route path='/login' element={<Login />} />
                            <Route path='/profile' element={<ProfilerUser />} />
                            <Route path='/images' element={<ImageDownloaded />} />

                            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                            <Route path="/browse" element={<ProtectedRoute><Browse /> </ProtectedRoute>} />
                            <Route path="/administration" element={<ProtectedRoute requireHost={true}><Administration /> </ProtectedRoute>} />
                        </Routes>
                    </AuthProvider>
                </CoinsContextProvider>
                        </SocketProvider>

            </BrowserRouter>
    )
}


export default App;
