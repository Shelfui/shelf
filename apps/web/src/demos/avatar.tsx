import * as Avatar from "@/components/ui/avatar";

export default function AvatarDemo() {
  return (
    <Avatar.Root>
      <Avatar.Image src="https://github.com/vercel.png" alt="Vercel" />
      <Avatar.Fallback>VC</Avatar.Fallback>
    </Avatar.Root>
  );
}
