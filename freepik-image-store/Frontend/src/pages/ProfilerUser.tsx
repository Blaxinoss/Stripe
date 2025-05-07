import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCoins } from '../context/CoinsContextProvider';

const ProfilerUser = () => {
    const { user } = useAuth();
    const { coins } = useCoins();

    if (!user) return <Navigate to="/login" replace />;
    return (
        <div className=" bg-gradient-to-br from-sky-600-200 to-gray-800 flex items-center justify-center ">
          <div className="relative w-full max-w-2xl p-8 sm:p-12 rounded-3xl border border-white/30 shadow-2xl backdrop-blur-2xl  transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
            
            {/* Soft gradient layer */}
            <div className="absolute inset-0 z-0  opacity-60 rounded-3xl pointer-events-none" />
      
            <div className="relative z-10">
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-amber-700 text-center mb-10">
                Your Profile
              </h2>
      
              <div className="space-y-5">
                {/* Field Row */}
                {[
                  ['Email', user.email],
                  ['Username', user.username],
                  ['Role', user.role.charAt(0).toUpperCase() + user.role.slice(1)],
                  ['Downloads', user.downloadsCount],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex gap-10 items-center justify-between p-4 bg-white/40 border border-gray-200 rounded-xl hover:shadow-md transition"
                  >
                    <span className="text-sm font-medium text-white">{label}</span>
                    <span className="text-base font-semibold text-gray-800 text-right">
                      {value}
                    </span>
                  </div>
                ))}
      
                {/* Coins Field - highlighted */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-100 to-emerald-100 border border-teal-200 rounded-xl hover:shadow-md transition">
                  <span className="text-sm font-medium text-teal-700">Coins</span>
                  <span className="text-base font-bold text-teal-900">{coins}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
};

export default ProfilerUser;