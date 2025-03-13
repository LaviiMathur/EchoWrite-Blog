import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import admin from "../conf/firebase.js";
import redis from "../conf/redis.js";
import { createMailOptions, otpEmailTemplate } from "../conf/mail.conf.js";
import db from "../conf/database.js";

dotenv.config();

// Generate JWT Token
const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

// Send OTP Email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const emailHtml = otpEmailTemplate(otp);
  const mailOptions = createMailOptions(email, emailHtml);

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

// Signup
export const signup = async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!email || !password || !username || !name)
    return res.status(400).json({ message: "All fields are required" });

  try {
    // Check if email already exists
    const userExists = await db("users").where({ email }).first();
    if (userExists)
      return res.status(409).json({ message: "User already registered" });

    // Check if username already exists
    const usernameExists = await db("users").where({ username }).first();
    if (usernameExists)
      return res.status(409).json({
        message: "Username already taken. Please choose another username.",
      });

    // Generate OTP only after username is confirmed unique
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await redis.setex(`otp:${email}`, 300, otp);
    await sendOtpEmail(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);
    await redis.setex(
      `tempUser:${email}`,
      300,
      JSON.stringify({ email, username, name, hashedPassword })
    );
    await redis.setex(`cooldown:${email}`, 30, "1");

    res.status(201).json({ message: "Check your email for OTP verification." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

// OTP Verification
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "OTP and email are required" });

    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp || String(storedOtp) !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const tempUserJson = await redis.get(`tempUser:${email}`);

    if (!tempUserJson)
      return res
        .status(400)
        .json({ message: "Session expired. Please signup again." });

    const tempUser = tempUserJson;

    // Double-check username is still unique before final registration
    const usernameExists = await checkUsernameExists(tempUser.username);
    if (usernameExists) {
      // Someone else registered this username during the verification process
      await redis.del(`otp:${email}`);
      return res.status(409).json({
        message:
          "Username has been taken during verification. Please try again with a different username.",
      });
    }

    await redis.del(`otp:${email}`);
    await redis.del(`tempUser:${email}`);
    const insertedUsers = await db("users")
      .insert({
        username: tempUser.username,
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.hashedPassword,
        verified: true,
        following_count: 0,
        followers_count: 0,
        avatar:
          "https://res.cloudinary.com/dpfmmqggy/image/upload/v1740409752/Profile.png",
      })
      .returning(["id", "name", "username", "avatar"]);

    const newUser = insertedUsers[0];

    const token = generateToken(newUser);
    res.status(200).json({
      message: "User registered successfully!",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

// OTP Resend
export const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const cooldownExists = await redis.get(`cooldown:${email}`);
    if (cooldownExists) {
      return res.status(429).json({
        message: "OTP already sent. Please wait before requesting again.",
      });
    }

    // Ensure the temp user still exists
    const tempUserJson = await redis.get(`tempUser:${email}`);
    if (!tempUserJson) {
      return res.status(400).json({
        message: "Session expired. Please signup again.",
      });
    }

    let otp = await redis.get(`otp:${email}`);

    if (!otp) {
      otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      await redis.setex(`otp:${email}`, 300, otp);
    }
    await redis.setex(`cooldown:${email}`, 30, "1");
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const userdata = await db("users").where({ email }).select("*").first();
    if (!userdata)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!userdata.verified)
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });

    const isMatch = await bcrypt.compare(password, userdata.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });
    const user = {
      name: userdata?.name || "",
      username: userdata?.username || "",
      avatar: userdata?.avatar || "",
      id: userdata?.id || "",
    };
    const token = generateToken(user);
    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Google Login

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken)
    return res.status(400).json({ message: "No ID token provided" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    let user = await db("users").where({ email }).first();

    if (user) {
      // User exists, just log them in
      const token = generateToken(user);
      return res.json({ message: "Login successful", token, user });
    }

    // Create new user if no existing account is found
    let username = email.split("@")[0].replace(/[^a-zA-Z0-9_\.]/g, "");

    // If username is too short, modify it
    if (username.length < 3) {
      username = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    }

    // Add random suffix to reduce collision
    const randomSuffix = Math.floor(Math.random() * 1000);
    username = `${username}_${randomSuffix}`;

    const insertedUsers = await db("users")
      .insert({
        name,
        email,
        username,
        avatar:
          picture ||
          "https://res.cloudinary.com/dpfmmqggy/image/upload/v1740409752/Profile.png",
        verified: true,
        following_count: 0,
        followers_count: 0,
      })
      .returning(["id", "name", "username", "avatar"]);

    user = insertedUsers[0];

    const token = generateToken(user);
    res.json({ message: "Signup & login successful", token, user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Update Profile
export const updateUser = async (req, res) => {
  try {
    const { currentPassword, newPassword, name, username, avatar, bio } =
      req.body;
    const { user_id } = req.query;

    // Fetch user by user_id
    const user = await db("users").where({ id: user_id }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle username update - reject if not unique
    if (username && username !== user.username) {
      const usernameExists = await db("users")
        .where({ username })
        .whereNot({ id: user_id })
        .first();

      if (usernameExists) {
        return res.status(409).json({
          message: "Username already taken. Please choose another username.",
        });
      }
    }

    // Handle password update
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }

      if (!user.password) {
        return res
          .status(400)
          .json({ message: "Password not set for this user" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid old password" });
      }

      // Hash and update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db("users")
        .where({ id: user_id })
        .update({ password: hashedPassword });

      return res.status(200).json({ message: "Password updated successfully" });
    }

    // Handle profile update
    if (name || username || avatar || bio !== undefined) {
      const updatedUser = await db("users")
        .where({ id: user_id })
        .update({
          ...(name && { name }),
          ...(username && { username }),
          ...(avatar && { avatar }),
          ...(bio !== undefined && { bio }),
        })
        .returning(["id", "name", "username", "avatar", "bio"]);

      return res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser[0],
      });
    }

    return res.status(400).json({ message: "No valid data provided" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
