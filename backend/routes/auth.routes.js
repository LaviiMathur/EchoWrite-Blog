import express from "express";
import {
  googleLogin,
  login,
  resendOtp,
  signup,
  verifyOtp,
} from "../controllers/auth.controller.js";

const authRoute = express.Router();

// Signup Route
authRoute.post("/signup", signup);
//Login Route
authRoute.post("/login", login);
//Google Route
authRoute.post("/google", googleLogin);
//verify OTP
authRoute.post("/verify", verifyOtp);
//resendotp
authRoute.post("/resend-otp", resendOtp);

export default authRoute;
