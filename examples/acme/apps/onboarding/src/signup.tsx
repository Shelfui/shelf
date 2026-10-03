import { Button } from "./components/ui/button";
import * as Field from "./components/ui/field";
import { Input } from "./components/ui/input";
import { Progress } from "./components/ui/progress";

export function Signup() {
  return (
    <form>
      <Progress value={40} />
      <Field.Root>
        <Field.Label>Work email</Field.Label>
        <Input type="email" />
      </Field.Root>
      <Button type="submit">Continue</Button>
    </form>
  );
}
