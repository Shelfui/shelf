import { CodeBlock } from "@/components/ui/code-block";

const SOURCE = `export function Counter() {
  const [count, setCount] = useState(0);
  // Highlighting loads on demand.
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`;

export default function CodeBlockDemo() {
  return <CodeBlock language="tsx" code={SOURCE} />;
}
