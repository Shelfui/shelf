import { Link } from "@tanstack/react-router";
import * as Empty from "@/components/ui/empty";
import { CircleAlertIcon } from "@/components/ui/icons";

export function NotFound({ title = "Not found", children }: { title?: string; children?: string }) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <CircleAlertIcon />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description>{children ?? "Nothing lives at this address."}</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Link to="/">Back to the catalog</Link>
      </Empty.Content>
    </Empty.Root>
  );
}

/** Rendered outside the router when the registry files can't be read. */
export function LoadError({ error }: { error: unknown }) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <CircleAlertIcon />
        </Empty.Media>
        <Empty.Title>Couldn't load this registry</Empty.Title>
        <Empty.Description>
          {error instanceof Error ? error.message : String(error)}
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  );
}
