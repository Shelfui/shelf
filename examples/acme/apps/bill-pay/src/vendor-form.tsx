import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import * as Select from "@/components/ui/select";

export function VendorForm() {
  return (
    <form>
      <Input name="vendor" placeholder="Vendor" />
      <Select.Root>
        <Select.Trigger />
      </Select.Root>
      <Button type="submit">Save</Button>
    </form>
  );
}
