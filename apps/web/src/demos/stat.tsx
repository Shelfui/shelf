import * as Stat from "@/components/ui/stat";

export default function StatDemo() {
  return (
    <Stat.Root>
      <Stat.Label>Revenue</Stat.Label>
      <Stat.Value>$48,200</Stat.Value>
      <Stat.Delta trend="up">12% from last month</Stat.Delta>
    </Stat.Root>
  );
}
