"use client";

import { Button } from "@/components/ui/button";
import * as Drawer from "@/components/ui/drawer";
import * as Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function DrawerSide() {
  return (
    <Drawer.Root swipeDirection="right">
      <Drawer.Trigger render={<Button variant="outline" />}>Edit profile</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit profile</Drawer.Title>
          <Drawer.Description>Changes are visible to your whole workspace.</Drawer.Description>
        </Drawer.Header>
        <Field.Root>
          <Field.Label>Name</Field.Label>
          <Input defaultValue="Ada Lovelace" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Username</Field.Label>
          <Input defaultValue="@ada" />
        </Field.Root>
        <Drawer.Footer>
          <Drawer.Close render={<Button />}>Save changes</Drawer.Close>
          <Drawer.Close render={<Button variant="outline" />}>Cancel</Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
}
