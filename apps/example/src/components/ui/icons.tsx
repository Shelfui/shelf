import {
  AlignCenterIcon as AlignCenter,
  AlignLeftIcon as AlignLeft,
  AlignRightIcon as AlignRight,
  ArrowDownIcon as ArrowDown,
  ArrowUpDownIcon as ArrowUpDown,
  ArrowUpIcon as ArrowUp,
  ArrowUpRightIcon as ArrowUpRight,
  BanIcon as Ban,
  BoldIcon as Bold,
  BrainIcon as Brain,
  CalendarIcon as Calendar,
  CheckIcon as Check,
  ChevronDownIcon as ChevronDown,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  ChevronsUpDownIcon as ChevronsUpDown,
  ChevronUpIcon as ChevronUp,
  CircleAlertIcon as CircleAlert,
  CircleCheckIcon as CircleCheck,
  CodeIcon as Code,
  CopyIcon as Copy,
  CreditCardIcon as CreditCard,
  EllipsisIcon as Ellipsis,
  ExternalLinkIcon as ExternalLink,
  FileIcon as File,
  FileTextIcon as FileText,
  GlobeIcon as Globe,
  GripVerticalIcon as GripVertical,
  Heading1Icon as Heading1,
  Heading2Icon as Heading2,
  Heading3Icon as Heading3,
  HighlighterIcon as Highlighter,
  HouseIcon as House,
  ImageIcon as Image,
  InboxIcon as Inbox,
  InfoIcon as Info,
  ItalicIcon as Italic,
  LayoutDashboardIcon as LayoutDashboard,
  LinkIcon as Link,
  ListChecksIcon as ListChecks,
  ListIcon as List,
  ListOrderedIcon as ListOrdered,
  ListTodoIcon as ListTodo,
  LoaderCircleIcon as LoaderCircle,
  MinusIcon as Minus,
  MoonIcon as Moon,
  PanelLeftIcon as PanelLeft,
  PaperclipIcon as Paperclip,
  PencilIcon as Pencil,
  PlusIcon as Plus,
  QuoteIcon as Quote,
  RotateCcwIcon as RotateCcw,
  SearchIcon as Search,
  SendIcon as Send,
  SettingsIcon as Settings,
  SparklesIcon as Sparkles,
  SquareCodeIcon as SquareCode,
  SquareIcon as Square,
  StarIcon as Star,
  StrikethroughIcon as Strikethrough,
  SunIcon as Sun,
  TerminalIcon as Terminal,
  ThumbsDownIcon as ThumbsDown,
  ThumbsUpIcon as ThumbsUp,
  Trash2Icon as Trash2,
  TypeIcon as Type,
  UnderlineIcon as Underline,
  UnlinkIcon as Unlink,
  UsersIcon as Users,
  WrenchIcon as Wrench,
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

export const AlignCenterIcon = (props: IconProps) => <AlignCenter {...DEFAULTS} {...props} />;
export const AlignLeftIcon = (props: IconProps) => <AlignLeft {...DEFAULTS} {...props} />;
export const AlignRightIcon = (props: IconProps) => <AlignRight {...DEFAULTS} {...props} />;
export const ArrowDownIcon = (props: IconProps) => <ArrowDown {...DEFAULTS} {...props} />;
export const ArrowUpDownIcon = (props: IconProps) => <ArrowUpDown {...DEFAULTS} {...props} />;
export const ArrowUpIcon = (props: IconProps) => <ArrowUp {...DEFAULTS} {...props} />;
export const ArrowUpRightIcon = (props: IconProps) => <ArrowUpRight {...DEFAULTS} {...props} />;
export const BoldIcon = (props: IconProps) => <Bold {...DEFAULTS} {...props} />;
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
export const CopyIcon = (props: IconProps) => <Copy {...DEFAULTS} {...props} />;
export const CreditCardIcon = (props: IconProps) => <CreditCard {...DEFAULTS} {...props} />;
export const DarkModeIcon = (props: IconProps) => <Moon {...DEFAULTS} {...props} />;
export const ExternalLinkIcon = (props: IconProps) => <ExternalLink {...DEFAULTS} {...props} />;
export const FileTextIcon = (props: IconProps) => <FileText {...DEFAULTS} {...props} />;
export const GripIcon = (props: IconProps) => <GripVertical {...DEFAULTS} {...props} />;
export const HouseIcon = (props: IconProps) => <House {...DEFAULTS} {...props} />;
export const InboxIcon = (props: IconProps) => <Inbox {...DEFAULTS} {...props} />;
export const InfoIcon = (props: IconProps) => <Info {...DEFAULTS} {...props} />;
export const ItalicIcon = (props: IconProps) => <Italic {...DEFAULTS} {...props} />;
export const LightModeIcon = (props: IconProps) => <Sun {...DEFAULTS} {...props} />;
export const LayoutDashboardIcon = (props: IconProps) => (
  <LayoutDashboard {...DEFAULTS} {...props} />
);
export const MinusIcon = (props: IconProps) => <Minus {...DEFAULTS} {...props} />;
export const MoreIcon = (props: IconProps) => <Ellipsis {...DEFAULTS} {...props} />;
export const PanelLeftIcon = (props: IconProps) => <PanelLeft {...DEFAULTS} {...props} />;
export const PlusIcon = (props: IconProps) => <Plus {...DEFAULTS} {...props} />;
export const SearchIcon = (props: IconProps) => <Search {...DEFAULTS} {...props} />;
export const SendIcon = (props: IconProps) => <Send {...DEFAULTS} {...props} />;
export const SettingsIcon = (props: IconProps) => <Settings {...DEFAULTS} {...props} />;
export const SpinnerIcon = (props: IconProps) => <LoaderCircle {...DEFAULTS} {...props} />;
export const UnderlineIcon = (props: IconProps) => <Underline {...DEFAULTS} {...props} />;
export const UsersIcon = (props: IconProps) => <Users {...DEFAULTS} {...props} />;
export const CodeIcon = (props: IconProps) => <Code {...DEFAULTS} {...props} />;
export const CodeBlockIcon = (props: IconProps) => <SquareCode {...DEFAULTS} {...props} />;
export const Heading1Icon = (props: IconProps) => <Heading1 {...DEFAULTS} {...props} />;
export const Heading2Icon = (props: IconProps) => <Heading2 {...DEFAULTS} {...props} />;
export const Heading3Icon = (props: IconProps) => <Heading3 {...DEFAULTS} {...props} />;
export const HighlightIcon = (props: IconProps) => <Highlighter {...DEFAULTS} {...props} />;
export const LinkIcon = (props: IconProps) => <Link {...DEFAULTS} {...props} />;
export const BulletListIcon = (props: IconProps) => <List {...DEFAULTS} {...props} />;
export const NumberedListIcon = (props: IconProps) => <ListOrdered {...DEFAULTS} {...props} />;
export const TaskListIcon = (props: IconProps) => <ListTodo {...DEFAULTS} {...props} />;
export const QuoteIcon = (props: IconProps) => <Quote {...DEFAULTS} {...props} />;
export const StrikethroughIcon = (props: IconProps) => <Strikethrough {...DEFAULTS} {...props} />;
export const DeleteIcon = (props: IconProps) => <Trash2 {...DEFAULTS} {...props} />;
export const TextIcon = (props: IconProps) => <Type {...DEFAULTS} {...props} />;
export const UnlinkIcon = (props: IconProps) => <Unlink {...DEFAULTS} {...props} />;
export const StopIcon = (props: IconProps) => <Square {...DEFAULTS} {...props} />;
export const AttachIcon = (props: IconProps) => <Paperclip {...DEFAULTS} {...props} />;
export const EditIcon = (props: IconProps) => <Pencil {...DEFAULTS} {...props} />;
export const RetryIcon = (props: IconProps) => <RotateCcw {...DEFAULTS} {...props} />;
export const ReasoningIcon = (props: IconProps) => <Brain {...DEFAULTS} {...props} />;
export const ToolIcon = (props: IconProps) => <Wrench {...DEFAULTS} {...props} />;
export const SourceIcon = (props: IconProps) => <Globe {...DEFAULTS} {...props} />;
export const FileIcon = (props: IconProps) => <File {...DEFAULTS} {...props} />;
export const ImageIcon = (props: IconProps) => <Image {...DEFAULTS} {...props} />;
export const PlanIcon = (props: IconProps) => <ListChecks {...DEFAULTS} {...props} />;
export const ThumbsUpIcon = (props: IconProps) => <ThumbsUp {...DEFAULTS} {...props} />;
export const ThumbsDownIcon = (props: IconProps) => <ThumbsDown {...DEFAULTS} {...props} />;
export const TerminalIcon = (props: IconProps) => <Terminal {...DEFAULTS} {...props} />;
export const DeniedIcon = (props: IconProps) => <Ban {...DEFAULTS} {...props} />;
export const SparklesIcon = (props: IconProps) => <Sparkles {...DEFAULTS} {...props} />;
export const StarIcon = (props: IconProps) => <Star {...DEFAULTS} {...props} />;
