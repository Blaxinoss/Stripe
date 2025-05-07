import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
    selectedImage: string;
}


interface billingDataInterface {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    country: string;
    city: string | "N/A";
    street: string | "N/A";
    building: string | "N/A";
    floor: string | "N/A";
    apartment: string | "N/A";
    state: string | "N/A";
    postal_code: string | "N/A";
}


function PaymentForm({ selectedImage }: Props) {

    const [loading, setLoading] = useState(false);

    const billingSchema = z.object({
        email: z.string().email("Email is not valid"),
        first_name: z.string().min(5, { message: "you need to enter a valid first name +5 length" }),
        last_name: z.string().min(5, { message: "you need to enter a valid last name +5 length" }),
        phone_number: z.string().regex(/^\+?201[0-2,5]\d{8}$/, { message: "The phone you Entered is Invalid" }),
        country: z.string().default('EG'),
        city: z.string().default("Cairo"),
        street: z.string().default("N/A"),
        building: z.string().default("N/A"),
        floor: z.string().default("N/A"),
        apartment: z.string().default("N/A"),
        state: z.string().default("N/A"),
        postal_code: z.string().default("N/A"),
    })


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(billingSchema), // دمج Zod مع الفورم
    });


    const onSubmit = async (billingData: billingDataInterface) => {
        setLoading(true);

        try {

            const response = await axios.post("http://localhost:5000/api/create-payment", { billingData, imageUrl: selectedImage });
            window.open(response.data.url, "_blank");


        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("حدث خطأ", error.response?.data || error.message);
            } else {
                console.error("حدث خطأ غير متوقع", error);
            }
        }
        finally {
            setLoading(false)
        }
    };


    return (
        <form onSubmit={handleSubmit(onSubmit)}>

            <div>
                <label>First Name</label>
                <input {...register("first_name")} />
                {errors.first_name && <p>{errors.first_name.message}</p>}
            </div>

            <div>
                <label>Last Name</label>
                <input {...register("last_name")} />
                {errors.last_name && <p>{errors.last_name.message}</p>}
            </div>


            <div>
                <label>Email</label>
                <input type="email" {...register("email")} />
                {errors.email && <p className="error">{errors.email.message}</p>}
            </div>

            <div>
                <label>Number</label>
                <input  {...register("phone_number")} />
                {errors.phone_number && <p className="error">{errors.phone_number.message}</p>}
            </div>

            <div>
                <label>City</label>
                <select defaultValue="Cairo" {...register("city")}>
                    <option value="Cairo">Cairo</option>
                    <option value="Alexandria">Alexandria</option>
                </select>
                {errors.city && <p className="error">{errors.city.message}</p>}
            </div>
            <button type="submit" disabled={loading}>Submit</button>
        </form>
    )
}

export default PaymentForm