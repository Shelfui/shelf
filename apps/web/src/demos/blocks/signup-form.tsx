"use client";

import { SignupForm } from "@/components/blocks/signup-form";

export default function SignupFormDemo() {
  return (
    <SignupForm
      onSubmit={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }}
    />
  );
}
