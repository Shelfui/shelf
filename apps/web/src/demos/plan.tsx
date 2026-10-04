import * as Plan from "@/components/ui/plan";

export default function PlanDemo() {
  return (
    <Plan.Root>
      <Plan.Step status="done">Read the failing test</Plan.Step>
      <Plan.Step status="active">Fix the date parsing</Plan.Step>
      <Plan.Step>Run the suite</Plan.Step>
    </Plan.Root>
  );
}
