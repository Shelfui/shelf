import * as stylex from "@stylexjs/stylex";
import * as Card from "@/components/ui/card";
import * as Carousel from "@/components/ui/carousel";
import { colors, typography } from "@/styles/shelf/tokens.stylex";

const PLANS = [
  { name: "Starter", price: "$0", detail: "For side projects and trying things out." },
  { name: "Team", price: "$24", detail: "Shared workspaces and unlimited projects." },
  { name: "Business", price: "$60", detail: "Audit logs, SSO, and priority support." },
  { name: "Enterprise", price: "Custom", detail: "Dedicated infrastructure and a named contact." },
];

export default function CarouselDemo() {
  return (
    <Carousel.Root aria-label="Plans" style={styles.root}>
      <Carousel.Content>
        {PLANS.map((plan, index) => (
          <Carousel.Item key={plan.name} aria-label={`${index + 1} of ${PLANS.length}`}>
            <Card.Root>
              <Card.Header>
                <Card.Title>{plan.name}</Card.Title>
                <Card.Description>{plan.detail}</Card.Description>
              </Card.Header>
              <Card.Content>
                <span {...stylex.props(styles.price)}>{plan.price}</span>
                {plan.price.startsWith("$") && (
                  <span {...stylex.props(styles.period)}> / month</span>
                )}
              </Card.Content>
            </Card.Root>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
    </Carousel.Root>
  );
}

const styles = stylex.create({
  root: { marginInline: "3rem", maxWidth: "18rem", width: "100%" },
  price: { fontSize: "1.875rem", fontWeight: typography.fontWeightSemibold },
  period: { color: colors.mutedForeground, fontSize: typography.fontSizeSm },
});
