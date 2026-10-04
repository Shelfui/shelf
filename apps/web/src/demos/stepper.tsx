import * as Stepper from "@/components/ui/stepper";

export default function StepperDemo() {
  return (
    <Stepper.Root aria-label="Checkout">
      <Stepper.Step status="complete">
        <Stepper.Title>Cart</Stepper.Title>
      </Stepper.Step>
      <Stepper.Step status="current">
        <Stepper.Title>Payment</Stepper.Title>
        <Stepper.Description>Card or invoice</Stepper.Description>
      </Stepper.Step>
      <Stepper.Step>
        <Stepper.Title>Review</Stepper.Title>
      </Stepper.Step>
    </Stepper.Root>
  );
}
