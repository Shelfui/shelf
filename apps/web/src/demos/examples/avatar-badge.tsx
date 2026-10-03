import * as Avatar from "@/components/ui/avatar";

export default function AvatarBadge() {
  return (
    <Avatar.Root size="lg">
      <Avatar.Fallback>AL</Avatar.Fallback>
      <Avatar.Badge />
    </Avatar.Root>
  );
}
