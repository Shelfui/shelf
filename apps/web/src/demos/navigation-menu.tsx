import * as stylex from "@stylexjs/stylex";
import * as NavigationMenu from "@/components/ui/navigation-menu";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";

const PRODUCTS = [
  { href: "#invoicing", title: "Invoicing", description: "Send invoices and get paid on time." },
  { href: "#payments", title: "Payments", description: "Accept cards and bank transfers." },
  { href: "#reports", title: "Reports", description: "See revenue across every customer." },
];

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <ul {...stylex.props(styles.grid)}>
              {PRODUCTS.map((product) => (
                <li key={product.href}>
                  <NavigationMenu.Link href={product.href} style={styles.link}>
                    <span {...stylex.props(styles.title)}>{product.title}</span>
                    <span {...stylex.props(styles.description)}>{product.description}</span>
                  </NavigationMenu.Link>
                </li>
              ))}
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#docs">Docs</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

const styles = stylex.create({
  grid: {
    gap: spacing["1"],
    display: "grid",
    listStyle: "none",
    margin: 0,
    padding: 0,
    width: "18rem",
  },
  link: { gap: spacing["1"], alignItems: "flex-start", display: "grid" },
  title: { fontSize: typography.fontSizeSm, fontWeight: typography.fontWeightMedium },
  description: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
  },
});
