import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";

type Props = {}

type FormData = {
    email: string;
    password: string;
    username: string;
};

const SignIn = (props: Props) => {

    const [isError, setIsError] = useState('')
    const [message, setMessage] = useState('')


    const Schema = z.object({
        username: z.string().min(5, "Username must be at least 5 chars"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(8, "Password must be at least 8 characters"),
    })


    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(Schema)
    });

    const onSubmit = async (data: FormData) => {
        try {
            const response = await axios.post("http://localhost:5000/api/users/create_user", data);
            const { success, message } = response.data;

            if (!success) {
                setIsError(message);
                setMessage("");
            } else {

                setMessage(message);
                setIsError("");
                reset();
            }

        } catch (err) {

            setIsError(`An error occurred with the server, ${err.response.data.error}`);
            setMessage("");

        }
    };

    return (
        <div className="bg-gray-900 gap-20 [0_4px_4px_rgba(255,255,255,0.2)] w-[24rem] p-10 text-white space-y-4 rounded-lg">

            {errors.email && <p className="text-red-400">{errors.email.message}</p>}
            {errors.username && <p className="text-red-400">{errors.username.message}</p>}

            {errors.password && <p className="text-red-400">{errors.password.message}</p>}

            {message && <div className="text-green-400">{message}</div>}
            {isError && <div className="text-red-400">{isError}</div>}


            <form onSubmit={handleSubmit(onSubmit)}>

                <h1 className="font-Peach mb-3">Sign up</h1>

                <div className="flex flex-col gap-2 mb-10 ">
                    <label className="text-left" htmlFor="email">Email</label>
                    <input
                        {...register("email")}
                        id="email"
                        type="email"
                        className="text-white p-2 rounded bg-[#045782]"
                    />

                </div>



                <div className="flex flex-col gap-2 mb-10">
                    <label className="text-left" htmlFor="username">Username</label>
                    <input
                        {...register("username")}
                        id="username"
                        type="text"
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
                    <div className="m-0">Already have an account ? <Link className="text-amber-200 hover:text-amber-500" to='/login'>Log in</Link> </div>
                    <div className="flex gap-15 justify-center">
                        <button type="submit">Sign up</button>
                        <button type="button" onClick={() => {
                            reset()
                            setMessage('')
                            setIsError('')
                        }}>Clear</button>
                    </div>

                </div>
            </form>
        </div>


    )
}

export default SignIn
