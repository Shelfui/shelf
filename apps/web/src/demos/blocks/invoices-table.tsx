"use client";

import { type Invoice, InvoicesTable } from "@/components/blocks/invoices-table";

const INVOICES: Invoice[] = [
  { id: "INV-1042", customer: "Soylent", amount: 1200, status: "paid", dueDate: "2026-08-14" },
  { id: "INV-1043", customer: "Globex", amount: 860, status: "pending", dueDate: "2026-09-30" },
  { id: "INV-1044", customer: "Initech", amount: 2450, status: "overdue", dueDate: "2026-09-01" },
  { id: "INV-1045", customer: "Umbrella", amount: 640, status: "paid", dueDate: "2026-08-28" },
  { id: "INV-1046", customer: "Hooli", amount: 3100, status: "pending", dueDate: "2026-10-12" },
  {
    id: "INV-1047",
    customer: "Stark Industries",
    amount: 5400,
    status: "paid",
    dueDate: "2026-09-18",
  },
  {
    id: "INV-1048",
    customer: "Wayne Enterprises",
    amount: 980,
    status: "overdue",
    dueDate: "2026-08-30",
  },
  { id: "INV-1049", customer: "Globex", amount: 1750, status: "draft", dueDate: "2026-10-20" },
];

export default function InvoicesTableDemo() {
  return <InvoicesTable invoices={INVOICES} />;
}
