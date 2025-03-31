import React, { useEffect, useState } from "react";
import { Button, Input, Logo, Loading, GoogleAuth } from "../index.components";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toastPresets from "../../utils/toastify";

import { useSelector } from "react-redux";

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  // Redirect if user is already logged in
  const { status } = useSelector((state) => state.auth);
  useEffect(() => {
    if (status && !loading && !initialCheck) {
      navigate("/");
    }
  }, [status, navigate]);

  // Handle Submit
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL;

      // Send the signup data to the backend
      console.log(`${API_URL}/auth/signup`);
      const response = await axios.post(`${API_URL}/auth/signup`, data);

      // If signup is successful, store the email for OTP verification
      localStorage.setItem("signupEmail", data.email);
      toastPresets.info("OTP sent to your email!");
      if (response.status == 201) {
        navigate("/auth/verify");
      }
      toastPresets.error(response?.message);
    } catch (error) {
      console.error("Signup Error: ", error);
      toastPresets.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-lg sm:w-3/4 md:w-auto bg-white shadow-lg rounded-xl p-10 shadow-[#6855E0]/50 mx-auto">
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <Logo />
          </span>
        </div>
        <h2 className="text-center text-xl font-bold leading-tight">
          Sign Up to create an account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-4 flex-col items-center bg-white pt-10">
            {/* Google Signup Button */}
            <GoogleAuth className={"w-full"}>Sign Up with Google</GoogleAuth>
            {/* Separator */}
            <div className="w-full border-b-2 border-dashed border-gray-400 my-4" />
            {/* Input Fields */}
            <Input
              {...register("name", { required: true })}
              label="Name"
              placeholder="Please Enter Your Name..."
              type="text"
              autoFocus
            />
            <Input
              {...register("username", {
                required: "Username is required",
                pattern: {
                  value: /^[a-zA-Z0-9_.]+$/,
                  message:
                    "Username can only contain letters, numbers, underscores (_), and dots (.)",
                },
              })}
              label="Username"
              placeholder="Please Enter Unique Name..."
              type="text"
              autoFocus
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}

            <Input
              {...register("email", {
                required: true,
                pattern: {
                  value:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: "Please enter a valid email",
                },
              })}
              label="Email"
              placeholder="Email..."
              type="text"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
            <Input
              {...register("password", {
                required: true,
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              label="Password"
              placeholder="Password..."
              type="password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
            {/* Signup Button */}
            <Button
              bgColor="#6855E0"
              type="submit"
              textColor="white"
              className="py-2"
            >
              Sign Up
            </Button>
          </div>
        </form>
        <p className="mt-2 text-center text-base text-black/60">
          Already have an account?&nbsp;
          <Link
            to="/auth/login"
            className="font-medium text-primary transition-all duration-200 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
