"use client";

import { useState } from "react";
import { Approval } from "@/components/ui/approval";

export default function ApprovalDemo() {
  const [answer, setAnswer] = useState<boolean>();
  if (answer !== undefined) return <p>{answer ? "Approved." : "Denied."}</p>;
  return <Approval onRespond={setAnswer}>Allow deleteFile to remove report.pdf?</Approval>;
}
