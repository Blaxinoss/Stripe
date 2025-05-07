import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Props = {}

type User = {
    _id: string;
    username: string;
    coins: number;
};

export default function Administration({ }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [amount, setAmount] = useState(0);
    const { user, token } = useAuth()
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users/users', {
                headers: {
                    Authorization: `${token}`, // Or your token logic
                },
            });
            setUsers(res.data.users);
        } catch (error) {
            setMessage('Failed to fetch users.');
        }
    };

    const handleAddCoins = async () => {
        if (!selectedUserId || amount <= 0) {
            setMessage('Please select a user and enter a valid amount.');
            return;
        } try {
            setLoading(true);
            const res = await axios.post(
                `http://localhost:5000/api/coins/increase_coins/${selectedUserId}`,
                { amount },
                {
                    headers: {
                        Authorization: `${token}`, // Or your token logic
                    },
                }
            );
            setMessage(res.data.message);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Error adding coins.');
        } finally {
            setLoading(false);
        }
        fetchUsers();
    };


    useEffect(() => {
        fetchUsers();
    }, [user]);


    return (
        <div className="max-w-xl mx-auto mt-12 p-16 bg-gradient-to-br from-sky-600-200 to-gray-800 shadow-2xl rounded-3xl shadow-emerald-200 text-white">
            <h1 className="text-4xl font-extrabold mb-8 font-Peach  text-center tracking-tight">
                Administration Panel
            </h1>

            <div className="mb-6">
                <label className="block text-sm font-semibold  mb-2 transition-colors duration-200">
                    Select User:
                </label>
                <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-200  focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 ease-in-out text-gray-800"
                >
                    <option value="">-- Choose a user --</option>
                    {users.map((user) => (
                        <option key={user._id} value={user._id}>
                            {user.username} (Coins: {user.coins})
                        </option>
                    ))}
                </select>

                {selectedUserId && (
                    <p className="text-sm  mt-3 font-medium">
                        Selected User ID: <span className="text-blue-600">{selectedUserId}</span>
                    </p>
                )}
            </div>

            <div className="mb-6">
                <label className="block text-sm font-semibold  mb-2 transition-colors duration-200">
                    Amount to Add:
                </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={1}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 ease-in-out text-gray-800 placeholder-gray-400"
                    placeholder="Enter coin amount"
                />
            </div>

            <button
                onClick={handleAddCoins}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
                Add Coins
            </button>

            {loading && (
                <p className="text-blue-600 mt-6 text-sm font-medium animate-pulse flex items-center justify-center">
                    <svg
                        className="w-5 h-5 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    Processing...
                </p>
            )}
            {message && (
                <p className="mt-6 text-sm text-green-600 font-medium bg-green-50 p-3 rounded-xl text-center">
                    {message}
                </p>
            )}
        </div>
    );
}
