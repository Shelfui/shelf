"use client";

import { LoginSplit } from "@/components/blocks/login-split";

export default function LoginSplitDemo() {
  return (
    <LoginSplit
      image="https://images.unsplash.com/photo-1763902595572-67b405bce4ec?w=1600&q=80&auto=format&fit=crop"
      onSubmit={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }}
    />
  );
}
