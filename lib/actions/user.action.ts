"use server";

import { connectToDatabase } from "../database/mongoose";
import User from "../database/models/user.model";

interface CreateAccountParams {
  fullName: string;
  email: string;
}

interface SignInUserParams {
  email: string;
}

interface VerifySecretParams {
  accountId: string;
  password: string;
}

interface SendEmailOTPParams {
  email: string;
}

// CREATE ACCOUNT
export async function createAccount(user: CreateAccountParams) {
  try {
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create new user
    const newUser = await User.create({
      fullName: user.fullName,
      email: user.email,
      otp: generateOTP(),
    });

    // Send OTP to the user's email (simulate or integrate email service)
    await sendEmailOTP({ email: user.email });

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    // console.error("Error creating user:", error.message);
    throw new Error("Failed to create user");
  }
}

// SIGN IN USER
export async function signInUser({ email }: SignInUserParams) {
  try {
    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Send OTP to the user's email
    await sendEmailOTP({ email });

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    // console.error("Error signing in user:", error.message);
    throw new Error("Failed to sign in");
  }
}

// VERIFY SECRET (OTP)
export async function verifySecret({ accountId, password }: VerifySecretParams) {
  try {
    await connectToDatabase();

    // Find user by accountId
    const user = await User.findById(accountId);
    if (!user) {
      throw new Error("Account not found");
    }

    // Validate OTP
    if (user.otp !== password) {
      throw new Error("Invalid OTP");
    }

    // Clear OTP after successful verification
    user.otp = null;
    await user.save();

    return { sessionId: generateSessionId() }; // Simulated session ID generation
  } catch (error) {
    // console.error("Error verifying OTP:", error.message);
    throw new Error("Failed to verify OTP");
  }
}

// SEND EMAIL OTP
export async function sendEmailOTP({ email }: SendEmailOTPParams) {
  try {
    await connectToDatabase();

    // Generate a new OTP
    const otp = generateOTP();

    // Find user and update their OTP
    const user = await User.findOneAndUpdate(
        { email },
        { otp },
        { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    // Simulate email sending or integrate an email service
    console.log(`Sending OTP ${otp} to email ${email}`);
    return true;
  } catch (error) {
    // console.error("Error sending OTP:", error.message);
    throw new Error("Failed to send OTP");
  }
}

// Helper functions
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 9);
}
