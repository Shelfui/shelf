import {
  ArrowDownIcon as ArrowDown,
  ArrowUpDownIcon as ArrowUpDown,
  ArrowUpIcon as ArrowUp,
  CalendarIcon as Calendar,
  CheckIcon as Check,
  ChevronDownIcon as ChevronDown,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  ChevronUpIcon as ChevronUp,
  ChevronsUpDownIcon as ChevronsUpDown,
  CircleAlertIcon as CircleAlert,
  CircleCheckIcon as CircleCheck,
  EllipsisIcon as Ellipsis,
  FileTextIcon as FileText,
  GripVerticalIcon as GripVertical,
  HouseIcon as House,
  InboxIcon as Inbox,
  LoaderCircleIcon as LoaderCircle,
  MinusIcon as Minus,
  PanelLeftIcon as PanelLeft,
  PlusIcon as Plus,
  SearchIcon as Search,
  SettingsIcon as Settings,
  UsersIcon as Users,
  XIcon as X,
} from "lucide-react";
import type { SVGProps } from "react";

/**
 * The icons Shelf components use, in one file you own.
 *
 * To switch icon libraries, change the imports above. Any component that renders an
 * `<svg>` and forwards SVG props works: Phosphor, Tabler, Heroicons, or your own.
 * Every Shelf component follows.
 *
 * Icons are `1em` square, so they follow the font size of whatever holds them, and
 * decorative (`aria-hidden`) unless you pass an accessible name.
 */
export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref">;

const DEFAULTS = { "aria-hidden": true, height: "1em", width: "1em" } as const;

export const ArrowDownIcon = (props: IconProps) => <ArrowDown {...DEFAULTS} {...props} />;
export const ArrowUpDownIcon = (props: IconProps) => <ArrowUpDown {...DEFAULTS} {...props} />;
export const ArrowUpIcon = (props: IconProps) => <ArrowUp {...DEFAULTS} {...props} />;
export const CalendarIcon = (props: IconProps) => <Calendar {...DEFAULTS} {...props} />;
export const CheckIcon = (props: IconProps) => <Check {...DEFAULTS} {...props} />;
export const ChevronDownIcon = (props: IconProps) => <ChevronDown {...DEFAULTS} {...props} />;
export const ChevronLeftIcon = (props: IconProps) => <ChevronLeft {...DEFAULTS} {...props} />;
export const ChevronRightIcon = (props: IconProps) => <ChevronRight {...DEFAULTS} {...props} />;
export const ChevronUpIcon = (props: IconProps) => <ChevronUp {...DEFAULTS} {...props} />;
export const ChevronsUpDownIcon = (props: IconProps) => <ChevronsUpDown {...DEFAULTS} {...props} />;
export const CircleAlertIcon = (props: IconProps) => <CircleAlert {...DEFAULTS} {...props} />;
export const CircleCheckIcon = (props: IconProps) => <CircleCheck {...DEFAULTS} {...props} />;
export const CloseIcon = (props: IconProps) => <X {...DEFAULTS} {...props} />;
export const FileTextIcon = (props: IconProps) => <FileText {...DEFAULTS} {...props} />;
export const GripIcon = (props: IconProps) => <GripVertical {...DEFAULTS} {...props} />;
export const HouseIcon = (props: IconProps) => <House {...DEFAULTS} {...props} />;
export const InboxIcon = (props: IconProps) => <Inbox {...DEFAULTS} {...props} />;
export const MinusIcon = (props: IconProps) => <Minus {...DEFAULTS} {...props} />;
export const MoreIcon = (props: IconProps) => <Ellipsis {...DEFAULTS} {...props} />;
export const PanelLeftIcon = (props: IconProps) => <PanelLeft {...DEFAULTS} {...props} />;
export const PlusIcon = (props: IconProps) => <Plus {...DEFAULTS} {...props} />;
export const SearchIcon = (props: IconProps) => <Search {...DEFAULTS} {...props} />;
export const SettingsIcon = (props: IconProps) => <Settings {...DEFAULTS} {...props} />;
export const SpinnerIcon = (props: IconProps) => <LoaderCircle {...DEFAULTS} {...props} />;
export const UsersIcon = (props: IconProps) => <Users {...DEFAULTS} {...props} />;
