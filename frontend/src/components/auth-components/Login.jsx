import React, { useEffect, useState } from "react";
import { Button, Input, GoogleAuth, Logo, Loading } from "../index.components";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch,useSelector } from "react-redux";
import { login } from "../../store/authSlice";
import  toastPresets  from "../../utils/toastify";


function LogIn() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Redirect if user is already logged in
  const { status } = useSelector((state) => state.auth);

  
  useEffect(() => {
    if (status && !loading) {
  
      navigate("/");
    }
  }, [status, navigate,loading]);
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${API_URL}/auth/login`, data);
     
      dispatch(login({ userData: response.data }));

      toastPresets.success("Login successful!");

      navigate("/");
    } catch (error) {
      toastPresets.error(error.response?.data?.message || "Login failed");
    }finally{setLoading(false)}
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-lg sm:w-3/4 md:w-auto bg-white shadow-lg rounded-xl p-10 shadow-[#6855E0]/50 mx-auto">
        <div className="mb-2 flex justify-center">
          {/* Logo */}
          <span className="inline-block w-full max-w-[100px]">
            <Logo />
          </span>
        </div>
        <h2 className="text-center text-xl font-bold leading-tight">
          Sign In to your account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-4 flex-col items-center bg-white p-10 ">
            {/* Google Signup Button */}
            <GoogleAuth className="w-full">Sign In with Google</GoogleAuth>
            {/* Separator */}
            <div className="w-full border-b-2 border-dashed border-gray-400 my-4" />
            {/* Input Fields */}
            <Input
              {...register("email", { required: true })}
              className="border-[#6855E0]"
              label="Email"
              placeholder="Enter Your Email..."
              type="text"
              autoFocus
            />
            <Input
              {...register("password", { required: true })}
              className="border-[#6855E0]"
              label="Password"
              placeholder="Enter Your Password..."
              type="password"
            />
            {/* Signin Button */}
            <Button
              type="submit"
              bgColor="#6855E0"
              textColor="white"
              className="py-2 w-[200px]"
            >
              Sign In
            </Button>
          </div>
        </form>
        <p className="mt-2 text-center text-base text-black/60">
          Don't have an account?&nbsp;
          <Link
            to="/auth/signup"
            className="font-medium text-primary transition-all duration-200 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LogIn;
