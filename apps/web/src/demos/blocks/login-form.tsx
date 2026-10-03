"use client";

import { LoginForm } from "@/components/blocks/login-form";

export default function LoginFormDemo() {
  return (
    <LoginForm
      onSubmit={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }}
    />
  );
}
