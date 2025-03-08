import React, { useState } from "react";
import { Button, Loading } from "../index.components";
import { FcGoogle as GoogleBtn } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../config/firebase";
import axios from "axios";
import  toastPresets from "../../utils/toastify";
import { login } from "../../store/authSlice";

function GoogleAuth({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
 
  const handleLogin = async () => {
    setLoading(true);
    try {
      const googleResponse = await signInWithPopup(auth, provider);
      const user = googleResponse.user;

      // Extract user data
      const userData = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        idToken: await user.getIdToken(),
      };

      // Send data to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/google`,
        userData
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        dispatch(login({ userData: response.data }));

        navigate("/");
        toastPresets.success("Logged in successfully!");
      } else {
        toastPresets.error("Google login failed. Please try again.");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);

      toastPresets.error(error.message || "Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="w-full">
      <Button
        className="px-4 py-2 border border-[#6855E0] flex items-center justify-center gap-4 shadow-md hover:shadow-[#6855E0]/70"
        bgColor="white"
        width="full"
        onClick={handleLogin}
      >
        <GoogleBtn className="text-2xl" />
        <span className="text-black font-thin md:text-lg">{children}</span>
      </Button>
    </div>
  );
}

export default GoogleAuth;
