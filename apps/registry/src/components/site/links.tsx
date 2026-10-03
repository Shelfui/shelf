import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { text } from "@/components/site/styles";

export function ProjectLink({ id }: { id: string }) {
  return (
    <Link to="/projects/$" params={{ _splat: id }} {...stylex.props(text.link)}>
      {id}
    </Link>
  );
}

export function ItemLink({ name }: { name: string }) {
  return (
    <Link to="/items/$name" params={{ name }} {...stylex.props(text.link)}>
      {name}
    </Link>
  );
}
