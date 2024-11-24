"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resendOTP,
  verifyEmailOTP,
  verifyForgotPasswordOTP,
} from "@/services/auth.services";
import { toast } from "react-toastify";

export default function OtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [timer, setTimer] = useState(120); // 120 seconds = 2 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
  }, [timer, isTimerRunning]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== "") {
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      console.log("OTP submitted:", otpValue);
      setLoading(true);
      const searchParams = new URLSearchParams(window.location.search);
      const email = searchParams.get("email") || "";
      const passwordReset = searchParams.get("reset") || "false";
      if (email === "") {
        toast.error("Email not found");
        setLoading(false);
        return;
      }
      const response =
        passwordReset === "false"
          ? await verifyEmailOTP(email, otpValue)
          : await verifyForgotPasswordOTP(email, otpValue);
      if (!response.success) {
        toast.error(response.message);
        setLoading(false);
        return;
      }
      toast.success("OTP has been verified successfully");
      setLoading(false);
      if (passwordReset === "true") {
        router.push(`/auth/reset-password?email=${email}&otp=${otpValue}`);
        return;
      }
      router.push("/auth/login");
    } else {
      toast.error("Please enter a valid 6-digit OTP");
    }
  };

  const _resendOTP = async () => {
    setOtpSending(true);
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get("email") || "";
    if (email === "") {
      toast.error("Email not found");
      setOtpSending(false);
      return;
    }
    setOtpSending(true);
    const response = await resendOTP(email);
    if (!response.success) {
      toast.error(response.message);
      setOtpSending(false);
      return;
    }
    toast.success("New OTP has been emailed to you again");
    setOtpSending(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Enter OTP</h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ve sent a 6-digit code to your email. Please enter it below.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="otp-input" className="sr-only">
              OTP
            </Label>
            <div className="flex justify-between space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="h-12 w-12 text-center text-xl"
                  value={digit}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Verify OTP"}
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <Button
            variant="link"
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={_resendOTP}
            disabled={otpSending || timer > 0}
          >
            {otpSending
              ? "Loading..."
              : timer > 0
              ? `Resend OTP in ${Math.floor(timer / 60)}:${(timer % 60)
                  .toString()
                  .padStart(2, "0")}`
              : "Resend OTP"}
          </Button>
        </div>
      </div>
    </div>
  );
}
