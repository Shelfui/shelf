import type { ComponentType } from "react";
import ChartDemo from "./chart";
import ChartAreaDemo from "./chart-area";
import ChartBarDemo from "./chart-bar";
import ChartFunnelDemo from "./chart-funnel";
import ChartHeatmapDemo from "./chart-heatmap";
import ChartLineDemo from "./chart-line";
import ChartPieDemo from "./chart-pie";
import ChartRadarDemo from "./chart-radar";
import ChartRadialDemo from "./chart-radial";
import ChartSankeyDemo from "./chart-sankey";
import ChartScatterDemo from "./chart-scatter";
import ChartTreemapDemo from "./chart-treemap";
import SparklineDemo from "./sparkline";
import AccordionDemo from "./accordion";
import AlertDemo from "./alert";
import AlertDialogDemo from "./alert-dialog";
import AspectRatioDemo from "./aspect-ratio";
import AutocompleteDemo from "./autocomplete";
import AvatarDemo from "./avatar";
import CodeBlockDemo from "./code-block";
import ComposerDemo from "./composer";
import DropzoneDemo from "./dropzone";
import MarkdownDemo from "./markdown";
import MessageDemo from "./message";
import ShimmerDemo from "./shimmer";
import ThreadDemo from "./thread";
import BadgeDemo from "./badge";
import BreadcrumbDemo from "./breadcrumb";
import ButtonDemo from "./button";
import ButtonGroupDemo from "./button-group";
import CalendarDemo from "./calendar";
import CardDemo from "./card";
import CarouselDemo from "./carousel";
import CheckboxDemo from "./checkbox";
import CheckboxGroupDemo from "./checkbox-group";
import CollapsibleDemo from "./collapsible";
import ComboboxDemo from "./combobox";
import CommandDemo from "./command";
import ContextMenuDemo from "./context-menu";
import DataTableDemo from "./data-table";
import DatePickerDemo from "./date-picker";
import DialogDemo from "./dialog";
import DrawerDemo from "./drawer";
import DropdownMenuDemo from "./dropdown-menu";
import EmptyDemo from "./empty";
import FieldDemo from "./field";
import FieldsetDemo from "./fieldset";
import FormDemo from "./form";
import HoverCardDemo from "./hover-card";
import IconsDemo from "./icons";
import InputDemo from "./input";
import InputGroupDemo from "./input-group";
import InputOtpDemo from "./input-otp";
import ItemDemo from "./item";
import KbdDemo from "./kbd";
import LabelDemo from "./label";
import MenubarDemo from "./menubar";
import MeterDemo from "./meter";
import NativeSelectDemo from "./native-select";
import NavigationMenuDemo from "./navigation-menu";
import NumberFieldDemo from "./number-field";
import PaginationDemo from "./pagination";
import PopoverDemo from "./popover";
import ProgressDemo from "./progress";
import RadioGroupDemo from "./radio-group";
import ResizableDemo from "./resizable";
import ScrollAreaDemo from "./scroll-area";
import SelectDemo from "./select";
import SeparatorDemo from "./separator";
import SidebarDemo from "./sidebar";
import SkeletonDemo from "./skeleton";
import SliderDemo from "./slider";
import SpinnerDemo from "./spinner";
import SwitchDemo from "./switch";
import TableDemo from "./table";
import TabsDemo from "./tabs";
import TextareaDemo from "./textarea";
import ToastDemo from "./toast";
import ToggleDemo from "./toggle";
import ToggleGroupDemo from "./toggle-group";
import ToolbarDemo from "./toolbar";
import TooltipDemo from "./tooltip";
import TypographyDemo from "./typography";

/** Each component's demo, by registry name. The docs read the same files as source. */
export const demos: Record<string, ComponentType> = {
  chart: ChartDemo,
  "chart-area": ChartAreaDemo,
  "chart-bar": ChartBarDemo,
  "chart-funnel": ChartFunnelDemo,
  "chart-heatmap": ChartHeatmapDemo,
  "chart-line": ChartLineDemo,
  "chart-pie": ChartPieDemo,
  "chart-radar": ChartRadarDemo,
  "chart-radial": ChartRadialDemo,
  "chart-sankey": ChartSankeyDemo,
  "chart-scatter": ChartScatterDemo,
  "chart-treemap": ChartTreemapDemo,
  sparkline: SparklineDemo,
  accordion: AccordionDemo,
  alert: AlertDemo,
  "alert-dialog": AlertDialogDemo,
  "aspect-ratio": AspectRatioDemo,
  autocomplete: AutocompleteDemo,
  avatar: AvatarDemo,
  "code-block": CodeBlockDemo,
  composer: ComposerDemo,
  dropzone: DropzoneDemo,
  markdown: MarkdownDemo,
  message: MessageDemo,
  shimmer: ShimmerDemo,
  thread: ThreadDemo,
  badge: BadgeDemo,
  breadcrumb: BreadcrumbDemo,
  button: ButtonDemo,
  "button-group": ButtonGroupDemo,
  calendar: CalendarDemo,
  card: CardDemo,
  carousel: CarouselDemo,
  checkbox: CheckboxDemo,
  "checkbox-group": CheckboxGroupDemo,
  collapsible: CollapsibleDemo,
  combobox: ComboboxDemo,
  command: CommandDemo,
  "context-menu": ContextMenuDemo,
  "data-table": DataTableDemo,
  "date-picker": DatePickerDemo,
  dialog: DialogDemo,
  drawer: DrawerDemo,
  "dropdown-menu": DropdownMenuDemo,
  empty: EmptyDemo,
  field: FieldDemo,
  fieldset: FieldsetDemo,
  form: FormDemo,
  "hover-card": HoverCardDemo,
  icons: IconsDemo,
  input: InputDemo,
  "input-group": InputGroupDemo,
  "input-otp": InputOtpDemo,
  item: ItemDemo,
  kbd: KbdDemo,
  label: LabelDemo,
  menubar: MenubarDemo,
  meter: MeterDemo,
  "native-select": NativeSelectDemo,
  "navigation-menu": NavigationMenuDemo,
  "number-field": NumberFieldDemo,
  pagination: PaginationDemo,
  popover: PopoverDemo,
  progress: ProgressDemo,
  "radio-group": RadioGroupDemo,
  resizable: ResizableDemo,
  "scroll-area": ScrollAreaDemo,
  select: SelectDemo,
  separator: SeparatorDemo,
  sidebar: SidebarDemo,
  skeleton: SkeletonDemo,
  slider: SliderDemo,
  spinner: SpinnerDemo,
  switch: SwitchDemo,
  table: TableDemo,
  tabs: TabsDemo,
  textarea: TextareaDemo,
  toast: ToastDemo,
  toggle: ToggleDemo,
  "toggle-group": ToggleGroupDemo,
  toolbar: ToolbarDemo,
  tooltip: TooltipDemo,
  typography: TypographyDemo,
};
