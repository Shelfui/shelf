import { components, findComponent } from "@/docs/components";
import { contentType, render, size } from "@/lib/og";

export { contentType, size };

export function generateStaticParams() {
  return components.map((component) => ({ name: component.name }));
}

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const component = findComponent((await params).name);
  return render(component?.title ?? "Components", component?.description ?? "");
}
