import * as stylex from "@stylexjs/stylex";
import { Link, useParams } from "@tanstack/react-router";
import { Command } from "@/components/site/command";
import { StateBadge, fixArgs } from "@/components/site/item-state";
import { ItemLink, ProjectLink } from "@/components/site/links";
import { PageHeader } from "@/components/site/page-header";
import { layout, text } from "@/components/site/styles";
import * as Table from "@/components/ui/table";
import * as T from "@/components/ui/typography";
import { itemState, useRegistry } from "@/data";
import { NotFound } from "@/views/not-found";

export function Project() {
  const { _splat: id = "" } = useParams({ from: "/projects/$" });
  const { usage } = useRegistry();
  const project = usage?.projects.find((entry) => entry.id === id);
  if (!project) return <NotFound title={`No project "${id}"`}>It isn't in usage.json.</NotFound>;

  const items = Object.entries(project.items).toSorted(([a], [b]) => a.localeCompare(b));
  const source = project.source.repo
    ? `${project.source.repo} · ${project.source.path}`
    : project.source.path;

  return (
    <div {...stylex.props(layout.stack)}>
      <PageHeader
        eyebrow={
          <>
            <Link to="/usage" {...stylex.props(text.link)}>
              Usage
            </Link>
            <span aria-hidden>/</span>
            <span>{project.namespace}</span>
          </>
        }
        title={project.name}
        lead={
          <>
            <code {...stylex.props(text.mono)}>{source}</code>
            {project.source.commit && (
              <>
                {" at "}
                <code {...stylex.props(text.mono)}>{project.source.commit.slice(0, 7)}</code>
              </>
            )}
            {project.registryError && <> · {project.registryError}</>}
          </>
        }
      />

      {items.length > 0 && (
        <section {...stylex.props(layout.section)}>
          <T.H3>Installed</T.H3>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Item</Table.Head>
                <Table.Head>State</Table.Head>
                <Table.Head>Imported by</Table.Head>
                <Table.Head>Fix</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map(([name, item]) => {
                const args = fixArgs(name, item);
                const users = [...new Set(item.usedBy.map((ref) => ref.project ?? ref.file))];
                return (
                  <Table.Row key={name}>
                    <Table.Cell>
                      <ItemLink name={name} />
                    </Table.Cell>
                    <Table.Cell>
                      <StateBadge state={itemState(item)} />
                    </Table.Cell>
                    <Table.Cell>
                      <span {...stylex.props(text.muted)}>
                        {users.length > 0
                          ? users.slice(0, 3).join(", ") +
                            (users.length > 3 ? ` and ${users.length - 3} more` : "")
                          : item.via.length > 0
                            ? `via ${item.via.join(", ")}`
                            : "Nothing"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {args && <Command args={args} label={`fix for ${name}`} />}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
          <T.Muted>
            Run fixes in <code {...stylex.props(text.mono)}>{project.source.path}</code>.
          </T.Muted>
        </section>
      )}

      {project.consumes.length > 0 && (
        <section {...stylex.props(layout.section)}>
          <T.H3>Uses from other projects</T.H3>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Item</Table.Head>
                <Table.Head>Provided by</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {project.consumes.map((consumed) => (
                <Table.Row key={`${consumed.provider}:${consumed.item}`}>
                  <Table.Cell>
                    <ItemLink name={consumed.item} />
                  </Table.Cell>
                  <Table.Cell>
                    <ProjectLink id={consumed.provider} />
                    {consumed.package && (
                      <span {...stylex.props(text.muted)}> ({consumed.package})</span>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </section>
      )}

      {project.missing.length > 0 && (
        <section {...stylex.props(layout.section)}>
          <T.H3>Missing</T.H3>
          <T.Muted>Installed items need these, but they aren't installed.</T.Muted>
          <div {...stylex.props(layout.row)}>
            {project.missing.map((name) => (
              <Command key={name} args={`add ${name}`} label={`add ${name}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
