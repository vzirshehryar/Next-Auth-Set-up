import Express, { Request, Response } from "express";
import crypto from "crypto";

import { isSignUpFormValid } from "../utils/formValidation";
import { CustomError, TypeOfResponse } from "../lib/types";
import { SERVER_ERROR_RESPONSE } from "../lib/constants";
import { doesPasswordMatch, generateTokenForUser } from "../utils/auth.utils";
import UserModel from "../Models/user.model";
import { sendEmail } from "../utils/sendEmail";
import { parsedEnv } from "../env";

const router = Express.Router();

let Client_Error_Response: TypeOfResponse<null> = {
  success: false,
  data: null,
  message: "",
};

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // checking if all the fields are filled
    if (!isSignUpFormValid([name, email, password])) {
      throw new CustomError("name, email and password are required", 400);
    }

    //checking if the user already exists
    let user = await UserModel.findOne({ email });
    if (user) {
      throw new CustomError("user already exists", 400);
    }

    // creating token to verify user through email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    //add expiration time of 20 minutes
    const otpExpiration = new Date(Date.now() + 20 * 60 * 100);

    const newUser = new UserModel({
      name,
      email,
      password,
      otp,
    });
    await newUser.save();

    // Sending email to user for verification
    const subject = "Email Confirmation";
    const text = `Your 6 Digit OTP is: ${otp} \nThis OTP will expire in 20 minutes`;
    await sendEmail(email, subject, text);
    const returningResponse: TypeOfResponse<null> = {
      success: true,
      data: null,
      message: "6 Digit OTP emailed to you",
    };
    res.status(200).json(returningResponse);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // checking if all the fields are filled
    if (!isSignUpFormValid([email, password])) {
      throw new CustomError("email and password is required", 400);
    }

    // checking for email existence
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new CustomError("Invalid email or password", 400);
    }

    // checking for if the user has verified their email
    if (user.emailVerified === false) {
      throw { message: "Please verify your email before logging in", status: 400 };
    }

    // checking for if the password is correct
    if (!(await doesPasswordMatch(password, user.password))) {
      throw { message: "Invalid email or password", status: 400 };
    }

    // generating JWT token using the user ID and sending to client
    const token = generateTokenForUser(user._id.toString());

    const posRes: TypeOfResponse<any> = {
      success: true,
      data: { token, user: { id: user._id, name: user.name, email: user.email } },
      message: "Login successful",
    };
    res.status(200).json(posRes);
  } catch (error) {
    next(error);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      throw new CustomError("name and email is required", 400);
    }

    // Find or create user in the database
    let user = await UserModel.findOne({ email: email });

    // make random password of 10 letters
    const password = crypto.randomBytes(5).toString("hex");

    if (!user) {
      user = await UserModel.create({
        name: name,
        email: email,
        password: password,
        emailVerified: true, // Google users are already verified
      });
    }

    // Generate tokens
    const token = generateTokenForUser(user._id.toString());

    const posRes: TypeOfResponse<any> = {
      success: true,
      data: { token, user: { id: user._id, name: user.name, email: user.email } },
      message: "Login successful",
    };
    res.status(200).json(posRes);
  } catch (error) {
    next(error);
  }
});

// route to verify the email by the otp and email
router.post("/verify-email-otp", async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // checking if all the fields are filled
    if (!isSignUpFormValid([email, otp])) {
      throw new CustomError("email and otp is required", 400);
    }

    // checking for email existence
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new CustomError("email does not exists", 400);
    }

    // checking if the otp is correct
    if (user.otp !== otp) {
      throw new CustomError("otp is incorrect", 400);
    }

    // updating the emailVerified field to true
    user.emailVerified = true;
    user.otp = "";
    await user.save();

    const _response: TypeOfResponse<null> = {
      success: true,
      data: null,
      message: "OTP has been verified",
    };
    res.status(200).json(_response);
  } catch (error) {
    next(error);
  }
});

// route to resend the otp to the user
router.post("/resend-otp", async (req, res, next) => {
  try {
    const { email } = req.body;

    // checking if all the fields are filled
    if (!isSignUpFormValid([email])) {
      throw new CustomError("email is required", 400);
    }

    // checking for email existence
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new CustomError("email does not exists", 400);
    }

    // creating token to verify user through email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    //add expiration time of 20 minutes
    const otpExpiration = new Date(Date.now() + 20 * 60 * 100);

    // Sending email to user for verification
    const subject = "Password Reset";
    const text = `Your 6 Digit OTP is: ${otp}\nThis OTP will expire in 20 minutes`;
    await sendEmail(email, subject, text);

    // updating the otp field
    user.otp = otp;
    user.otp_expiration = otpExpiration;
    await user.save();

    const _response: TypeOfResponse<null> = {
      success: true,
      data: null,
      message: "6 Digit OTP emailed to you",
    };
    res.status(200).json(_response);
  } catch (error) {
    next(error);
  }
});

router.post("/verify-password-reset-otp", async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // checking if all the fields are filled
    if (!isSignUpFormValid([email, otp])) {
      throw new CustomError("email and otp is required", 400);
    }

    // checking for email existence
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new CustomError("email does not exists", 400);
    }

    // checking if the otp is correct
    if (user.otp !== otp) {
      throw new CustomError("OTP is incorrect", 400);
    }

    // check if the otp is expired or not
    const currentTime = new Date().getTime();
    const otpTime = new Date(user.otp_expiration).getTime();
    if (otpTime < currentTime) {
      throw new CustomError("OTP has expired", 400);
    }

    await user.save();

    const _response: TypeOfResponse<null> = {
      success: true,
      data: null,
      message: "OTP has been verified",
    };
    res.status(200).json(_response);
  } catch (error) {
    next(error);
  }
});

// route to reset the password
router.put("/reset-password", async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    // checking if all the fields are filled
    if (!isSignUpFormValid([email, otp, password])) {
      throw new CustomError("email, otp and password is required", 400);
    }

    // checking for email existence
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new CustomError("email does not exists", 400);
    }

    // checking if the otp is correct
    if (user.otp !== otp) {
      throw new CustomError("OTP is incorrect", 400);
    }

    // updating the password
    user.password = password;
    user.otp = "";
    await user.save();

    const _response: TypeOfResponse<null> = {
      success: true,
      data: null,
      message: "Password has been reset successfully",
    };
    res.status(200).json(_response);
  } catch (error) {
    next(error);
  }
});

export default router;
