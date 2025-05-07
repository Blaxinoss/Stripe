import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { useCoins } from "../context/CoinsContextProvider";


type FormData = {
    email: string;
    password: string;
};

const Login = () => {

    const { setCoins } = useCoins();
    const { setAuthData } = useAuth();
    const navigate = useNavigate();
    const [isError, setIsError] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const Schema = z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(8, "Password must be at least 8 characters"),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(Schema),
    });





    const onSubmit = async (data: FormData) => {
        try {
            const response = await axios.post("http://localhost:5000/api/users/login", data);
            const { success, message, token, user, expiresIn } = response.data;
            if (!success) {
                setIsError(message);
                setMessage("");
            } else {

                setMessage(message);
                setIsError("");
                setAuthData(user, token, expiresIn);
                setCoins(response.data.user.coins)
                reset();

                if (user.role === 'admin') {
                    navigate('/administration');
                } else {
                    navigate('/');
                }
            }

        } catch (err: any) {
            setIsError(`An error occurred with the server, ${err.response?.data?.message}`);
            setMessage("");
        }
    };

    return (
        <div className="bg-gray-900 gap-20 [0_4px_4px_rgba(255,255,255,0.2)] w-[24rem] p-14 text-center text-white space-y-4 rounded-lg">

            {errors.email && <p className="text-red-400">{errors.email.message}</p>}
            {errors.password && <p className="text-red-400">{errors.password.message}</p>}

            {message && <div className="text-green-400">{message}</div>}
            {isError && <div className="text-red-400">{isError}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>

                <h1 className="font-Peach mb-3">Log in</h1>

                <div className="flex flex-col gap-2 mb-10">
                    <label className="text-left" htmlFor="email">Email</label>
                    <input
                        {...register("email")}
                        id="email"
                        type="email"
                        className="text-white p-2 rounded bg-[#045782]"
                    />
                </div>

                <div className="flex flex-col gap-2 mb-10">
                    <label className="text-left" htmlFor="password">Password</label>
                    <input
                        {...register("password")}
                        id="password"
                        type="password"
                        className="text-white p-2 rounded bg-[#045782]"
                    />
                </div>

                <div className="space-x-10 flex flex-col gap-2">
                    <div className="m-0">Don't have an account? <Link className="text-amber-200 hover:text-amber-500" to='/signup'>Sign up</Link></div>
                    <div className="flex gap-15 justify-center">
                        <button type="submit">Log in</button>
                        <button type="button" onClick={() => {
                            reset();
                            setMessage('');
                            setIsError('');
                        }}>Clear</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Login;
