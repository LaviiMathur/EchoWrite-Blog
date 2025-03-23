import React, { useEffect, useState, useRef } from "react";
import { Logo, Button, Input, Loading } from "../index.components";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toastPresets from "../../utils/toastify";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";
import { useForm } from "react-hook-form";

function Verify() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  // Redirect if user is already logged in
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status && !loading) {
      toastPresets.error("Signup first");
      navigate("/");
    }
  }, [status, navigate]);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Verify OTP
  const handleVerifyOTP = async (data) => {
    setLoading(true);
    const email = localStorage.getItem("signupEmail");
    if (!email) {
      toastPresets.error("Session expired. Please sign up again.");
      navigate("/auth/signup");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/verify`, {
        email,
        otp: data.otp,
      });

      dispatch(login({ userData: response.data.user }));
      toastPresets.success("Account verified! Logging you in...");

      localStorage.removeItem("signupEmail");
      navigate("/");
    } catch (error) {
      toastPresets.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // OTP Resend
  const handleResendOTP = async () => {
    setLoading(true);
    const email = localStorage.getItem("signupEmail");
    if (!email) {
      toastPresets.error("Session expired. Please sign up again.");
      navigate("/auth/signup");
      return;
    }
    try {
      await axios.post(`${API_URL}/auth/resend-otp`, { email });
      toastPresets.success("New OTP sent to your email!");
    } catch (error) {
      toastPresets.error(
        error.response?.data?.message || "Failed to resend OTP"
      );
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
            <Logo width="100%" />
          </span>
        </div>
        <h2 className="text-center text-xl font-bold leading-tight">
          Verification OTP
        </h2>
        <form onSubmit={handleSubmit(handleVerifyOTP)}>
          <div className="flex gap-4 flex-col items-center bg-white p-10 ">
            {/* Input Field */}
            <Input
              {...register("otp", {
                required: "OTP is required",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "OTP must be a 6-digit number",
                },
              })}
              autoFocus
              className="border-[#6855E0] text-2xl"
              label="Verification"
              placeholder="Enter OTP..."
              type="text"
              maxLength={6}
            />
            {errors.otp && (
              <p className="text-red-500 text-sm">{errors.otp.message}</p>
            )}

            {/* Verify Button */}
            <Button
              type="submit"
              bgColor="#6855E0"
              textColor="white"
              className="py-2 w-[200px]"
            >
              Verify
            </Button>
          </div>

          {/* Resend OTP */}
          <p className="mt-2 text-center text-base text-black/60">
            Didn't receive OTP?&nbsp;
            <button
              type="button"
              onClick={handleResendOTP}
              className="font-medium text-primary transition-all duration-200 hover:underline cursor-pointer"
            >
              Resend
            </button>
          </p>
        </form>

        <p className="mt-2 text-center text-base text-black/60">
          Wrong Mail?&nbsp;
          <Link
            to="/auth/signup"
            className="font-medium text-primary transition-all duration-200 hover:underline"
          >
            Change Email
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Verify;
