"use client";

import { OtpVerification } from "@/components/blocks/otp-verification";

export default function OtpVerificationDemo() {
  return <OtpVerification email="ada@example.com" onVerify={() => {}} onResend={() => {}} />;
}
