import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import admin from "../conf/firebase.js";
import redis from "../conf/redis.js";
import { createMailOptions, otpEmailTemplate } from "../conf/mail.conf.js";
import db from "../conf/database.js";
import slugify from "slugify";

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

// Check if username exists
const checkUsernameExists = async (username, excludeUserId = null) => {
  const query = db("users").where({ username });
  
  // If excludeUserId is provided, exclude that user from the check
  // (useful for updates where user can keep their existing username)
  if (excludeUserId) {
    query.whereNot({ id: excludeUserId });
  }
  
  const user = await query.first();
  return !!user; // Return true if user exists, false otherwise
};

// Signup
export const signup = async (req, res) => {
  const { name, username, password } = req.body;
  let { email } = req.body;
  email = email.toLowerCase();
  
  if (!email || !password || !username || !name)
    return res.status(400).json({ message: "All fields are required" });

  try {
    // Check if email already exists
    const userExists = await db("users").where({ email }).first();
    if (userExists)
      return res.status(409).json({ message: "User already registered" });

    // Check if username already exists
    const usernameExists = await checkUsernameExists(username);
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

// Check Username Availability
export const checkUsername = async (req, res) => {
  const { username } = req.body;
  if (!username)
    return res.status(400).json({ message: "Username is required" });

  try {
    const exists = await checkUsernameExists(username);
    if (exists) {
      return res.status(409).json({ message: "Username already taken" });
    }
    return res.status(200).json({ message: "Username is available" });
  } catch (error) {
    console.error("Username check error:", error);
    res.status(500).json({ message: "Error checking username availability" });
  }
};

// OTP Verification
export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    let { email } = req.body;
    email = email.toLowerCase();
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

    const tempUser = JSON.parse(tempUserJson);

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
        "https://cloud.appwrite.io/v1/storage/buckets/67c5d88a001fafdc813d/files/67c72085000fee052488/view?project=67c5d4a400153ab3eeef&mode=admin"

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
  let { email } = req.body;
  email = email.toLowerCase();
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
  const { password } = req.body;
  let { email } = req.body;
  email = email.toLowerCase();

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
      email: userdata?.email || "",
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

    if (!user) {
      // Generate a unique username for this Google user
      const generateUniqueUsername = async (baseName) => {
        const baseUsername = slugify(baseName, { lower: true, strict: true });
        
        // Check if username exists
        const exists = await checkUsernameExists(baseUsername);
        if (!exists) return baseUsername;
        
        // If username exists, append a random number
        let uniqueUsername;
        let attemptCount = 0;
        
        do {
          const randomSuffix = Math.floor(Math.random() * 10000);
          uniqueUsername = `${baseUsername}${randomSuffix}`;
          attemptCount++;
        } while (await checkUsernameExists(uniqueUsername) && attemptCount < 10);
        
        return uniqueUsername;
      };

      const username = await generateUniqueUsername(name);

      [user] = await db("users")
        .insert({
          name,
          email,
          username,
          avatar: picture,
          verified: true,
          following_count: 0,
          followers_count: 0,
        })
        .returning(["id", "name", "username", "avatar"]);
    }

    const token = generateToken(user);
    res.json({ message: "Login successful", token, user });
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
      const usernameExists = await checkUsernameExists(username, user_id);
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