import { parsedEnv } from "@/env";
import { ServerErrorResponse } from "@/lib/constants";
import { BackendResponseType } from "@/lib/types";
import axios from "axios";

export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${parsedEnv.NEXT_PUBLIC_BASE_URL}/auth/register`, {
      name,
      email,
      password,
    });
    return response.data as BackendResponseType<any>;
  } catch (err: any) {
    return err?.response?.data
      ? (err.response.data as BackendResponseType<any>)
      : ServerErrorResponse;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${parsedEnv.NEXT_PUBLIC_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data as BackendResponseType<any>;
  } catch (err: any) {
    return err?.response?.data
      ? (err.response.data as BackendResponseType<any>)
      : ServerErrorResponse;
  }
};

export const verifyEmailOTP = async (email: string, otp: string) => {
  try {
    const response = await axios.post(
      `${parsedEnv.NEXT_PUBLIC_BASE_URL}/auth/verify-email-otp`,
      {
        email,
        otp,
      }
    );
    return response.data as BackendResponseType<any>;
  } catch (err: any) {
    return err?.response?.data
      ? (err.response.data as BackendResponseType<any>)
      : ServerErrorResponse;
  }
};

export const resendOTP = async (email: string) => {
  try {
    const response = await axios.post(
      `${parsedEnv.NEXT_PUBLIC_BASE_URL}/auth/resend-otp`,
      {
        email,
      }
    );
    return response.data as BackendResponseType<any>;
  } catch (err: any) {
    return err?.response?.data
      ? (err.response.data as BackendResponseType<any>)
      : ServerErrorResponse;
  }
};

export const verifyForgotPasswordOTP = async (email: string, otp: string) => {
  try {
    const response = await axios.post(
      `${parsedEnv.NEXT_PUBLIC_BASE_URL}/auth/verify-password-reset-otp`,
      {
        email,
        otp,
      }
    );
    return response.data as BackendResponseType<any>;
  } catch (err: any) {
    return err?.response?.data
      ? (err.response.data as BackendResponseType<any>)
      : ServerErrorResponse;
  }
};

export const resetPassword = async (email: string, otp: string, password: string) => {
  try {
    const response = await axios.put(
      `${parsedEnv.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
      {
        email,
        otp,
        password,
      }
    );
    return response.data as BackendResponseType<any>;
  } catch (err: any) {
    return err?.response?.data
      ? (err.response.data as BackendResponseType<any>)
      : ServerErrorResponse;
  }
};
