import * as stylex from "@stylexjs/stylex";
import { Label } from "@/components/ui/label";
import * as NativeSelect from "@/components/ui/native-select";
import { spacing } from "@/styles/shelf/tokens.stylex";

export default function NativeSelectDemo() {
  return (
    <div {...stylex.props(styles.root)}>
      <Label htmlFor="native-select-currency">Currency</Label>
      <NativeSelect.Root id="native-select-currency" defaultValue="eur" style={styles.select}>
        <NativeSelect.OptGroup label="Americas">
          <NativeSelect.Option value="usd">US dollar (USD)</NativeSelect.Option>
          <NativeSelect.Option value="cad">Canadian dollar (CAD)</NativeSelect.Option>
          <NativeSelect.Option value="brl">Brazilian real (BRL)</NativeSelect.Option>
        </NativeSelect.OptGroup>
        <NativeSelect.OptGroup label="Europe">
          <NativeSelect.Option value="eur">Euro (EUR)</NativeSelect.Option>
          <NativeSelect.Option value="gbp">British pound (GBP)</NativeSelect.Option>
          <NativeSelect.Option value="sek">Swedish krona (SEK)</NativeSelect.Option>
        </NativeSelect.OptGroup>
      </NativeSelect.Root>
    </div>
  );
}

const styles = stylex.create({
  root: { gap: spacing["2"], display: "grid", width: "16rem" },
  select: { width: "100%" },
});
