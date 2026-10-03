import * as Avatar from "@/components/ui/avatar";

export default function AvatarGroup() {
  return (
    <Avatar.Group>
      <Avatar.Root>
        <Avatar.Fallback>MR</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root>
        <Avatar.Fallback>JK</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root>
        <Avatar.Fallback>SO</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.GroupCount>+4</Avatar.GroupCount>
    </Avatar.Group>
  );
}
