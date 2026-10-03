export interface ComponentDoc {
  name: string;
  title: string;
  description: string;
  useWhen: string;
  avoidWhen: string;
  /** Components in a group appear under that group in the docs sidebar. */
  group?: "charts";
  /** More demos, each in `src/demos/examples/<component>-<name>.tsx`. */
  examples?: ComponentExample[];
}

export interface ComponentExample {
  name: string;
  title: string;
  description?: string;
}

export const components: ComponentDoc[] = [
  {
    name: "accordion",
    title: "Accordion",
    examples: [
      {
        name: "multiple",
        title: "Multiple",
        description: "Several sections can stay open at once.",
      },
    ],
    useWhen:
      "Several related sections where people usually need one or two at a time, such as FAQs or settings groups.",
    avoidWhen:
      "The content is short enough to show at once, or people need to compare sections side by side.",
    description: "Stacked sections that expand one at a time, or several at once.",
  },
  {
    name: "alert",
    title: "Alert",
    examples: [
      {
        name: "destructive",
        title: "Destructive",
        description: "For errors and anything that needs attention now.",
      },
    ],
    useWhen:
      "A message about the page or task that should stay visible, such as a warning or a status.",
    avoidWhen: "The message is a response to an action and can go away on its own; use Toast.",
    description: "A message that stays on the page, with an optional icon.",
  },
  {
    name: "alert-dialog",
    title: "Alert Dialog",
    useWhen: "An action needs an explicit confirm or cancel, such as deleting something.",
    avoidWhen: "The action is easy to undo; do it, and offer undo instead of asking.",
    description:
      "A modal that asks the user to confirm or cancel; clicking outside does not dismiss it.",
  },
  {
    name: "aspect-ratio",
    title: "Aspect Ratio",
    useWhen: "Images, video, maps, or embeds that must keep their shape as the layout resizes.",
    avoidWhen: "The content has its own intrinsic size, such as an img with width and height set.",
    description: "A box that keeps a width-to-height ratio, filled by its content.",
  },
  {
    name: "autocomplete",
    title: "Autocomplete",
    useWhen: "People type free text and suggestions help, such as a search box or a tag input.",
    avoidWhen: "The value must be one of a fixed list; use Combobox or Select.",
    description: "A text input with suggestions; the value is whatever the user types.",
  },
  {
    name: "avatar",
    title: "Avatar",
    examples: [
      { name: "sizes", title: "Sizes" },
      {
        name: "badge",
        title: "Badge",
        description: "A status dot in the corner, such as online presence.",
      },
      {
        name: "group",
        title: "Group",
        description: "Overlapping avatars, with a count for the rest.",
      },
    ],
    useWhen: "Showing who a person or account is, in lists, comments, or headers.",
    avoidWhen: "Representing things that aren't people or accounts; use an icon.",
    description:
      "A person's picture, with initials while it loads or if it fails. Includes a status badge and overlapping groups.",
  },
  {
    name: "badge",
    title: "Badge",
    description: "A short status or count label.",
    useWhen: "A short status, count, or category next to other content.",
    avoidWhen: "The text is an action; use Button. Or it needs a sentence; use Alert.",
  },
  {
    name: "breadcrumb",
    title: "Breadcrumb",
    useWhen: "Pages sit in a hierarchy more than two levels deep and people move up it.",
    avoidWhen: "The site is flat, or the trail would only repeat the page title.",
    description: "Where the current page sits in the site's hierarchy.",
  },
  {
    name: "button",
    title: "Button",
    examples: [
      { name: "sizes", title: "Sizes" },
      {
        name: "with-icon",
        title: "With icon",
        description:
          "Icons sit before or after the label. Icon-only buttons need an accessible label.",
      },
      {
        name: "loading",
        title: "Loading",
        description: "Disable the button and show a Spinner while the action runs.",
      },
      {
        name: "as-link",
        title: "As a link",
        description: "A link that looks like a Button but still navigates like a link.",
      },
    ],
    useWhen: "Triggering an action: submitting, saving, opening, or confirming.",
    avoidWhen: "Navigating to another page; use a link, which can look like a Button.",
    description:
      "An action trigger with default, outline, secondary, ghost, destructive, and link variants.",
  },
  {
    name: "button-group",
    title: "Button Group",
    examples: [
      {
        name: "split",
        title: "Split button",
        description: "A main action with a menu of related ones.",
      },
      { name: "sizes", title: "Sizes", description: "Buttons in a group should share one size." },
    ],
    useWhen:
      "A few related actions that belong together, such as a split button or segmented actions.",
    avoidWhen: "The buttons select a value; use Toggle Group.",
    description: "Joins related Buttons into one row that shares borders.",
  },
  {
    name: "calendar",
    title: "Calendar",
    examples: [
      {
        name: "range",
        title: "Range",
        description: "Pick a start and an end date across two months.",
      },
      {
        name: "disabled-days",
        title: "Disabled days",
        description: "Weekends and past dates can't be picked.",
      },
      {
        name: "dropdowns",
        title: "Month and year dropdowns",
        description: "Jump straight to a month and year, for dates far away such as a birthday.",
      },
    ],
    useWhen:
      "A date needs to be picked from a visible month, such as a booking page or a range filter.",
    avoidWhen: "People know the exact date and would rather type it; use Input with a date type.",
    description:
      "A month grid for picking a single date, a range, or several dates, built on react-day-picker.",
  },
  {
    name: "card",
    title: "Card",
    description: "A surface that groups related content.",
    useWhen:
      "Grouping content about one thing, such as a summary, a setting, or an item in a grid.",
    avoidWhen: "Every section of a page would be a card; use spacing and headings instead.",
  },
  {
    name: "carousel",
    title: "Carousel",
    useWhen:
      "A small set of related slides that people browse one at a time, such as product images.",
    avoidWhen: "The content matters to everyone; put it on the page instead of behind a swipe.",
    description:
      "A slideshow built on Embla, composed from Root, Content, Item, Previous, and Next.",
  },
  {
    name: "chart",
    title: "Chart",
    group: "charts",
    useWhen: "Building any chart, or changing how every chart looks and reads.",
    avoidWhen: "You only need one chart type; start from that chart's page.",
    description:
      "The shared parts of every chart: frame, grid, axes, tooltip, and a legend that hides series.",
  },
  {
    name: "chart-area",
    title: "Area Chart",
    group: "charts",
    useWhen: "Trends over a continuous range, such as revenue by month, where volume matters.",
    avoidWhen:
      "Exact values matter more than shape; use a table, or a Line Chart for several close series.",
    description: "An area chart for trends over a range, with a soft fill under each line.",
  },
  {
    name: "chart-bar",
    title: "Bar Chart",
    group: "charts",
    useWhen: "Comparing values across categories, grouped, stacked, or horizontal.",
    avoidWhen:
      "There are many categories with long names on a narrow screen, or parts of a whole; use a horizontal bar or Pie Chart.",
    description:
      "A bar chart for comparing values across categories, grouped, stacked, or horizontal.",
  },
  {
    name: "chart-funnel",
    title: "Funnel Chart",
    group: "charts",
    useWhen: "Drop-off through ordered steps, such as visit, signup, purchase.",
    avoidWhen: "The steps are not ordered or do not narrow; use a Bar Chart.",
    description: "A funnel chart for drop-off through ordered steps.",
  },
  {
    name: "chart-heatmap",
    title: "Heatmap",
    group: "charts",
    useWhen: "Intensity across two categories, such as orders by weekday and hour.",
    avoidWhen: "There are only a few values; use a table or Bar Chart.",
    description:
      "A heatmap for intensity across two categories, as an accessible table of tinted cells.",
  },
  {
    name: "chart-line",
    title: "Line Chart",
    group: "charts",
    useWhen:
      "Change over a range where the line matters more than the area, or several series that overlap.",
    avoidWhen: "Parts of a whole over time; use stacked Area Chart.",
    description: "A line chart for change over a range, with one or more series.",
  },
  {
    name: "chart-pie",
    title: "Pie Chart",
    group: "charts",
    useWhen: "The parts of a whole, for up to six slices, with a total in the middle of a donut.",
    avoidWhen: "More than six slices, or slices that are close in size; use a Bar Chart.",
    description:
      "A pie or donut chart for the parts of a whole, with an optional total in the middle.",
  },
  {
    name: "chart-radar",
    title: "Radar Chart",
    group: "charts",
    useWhen: "Comparing a few series across five to eight shared axes.",
    avoidWhen: "Fewer than five axes, or axes that are not comparable; use a Bar Chart.",
    description: "A radar chart for comparing a few series across the same axes.",
  },
  {
    name: "chart-radial",
    title: "Radial Chart",
    group: "charts",
    useWhen: "Progress toward a goal, or a few values on concentric rings.",
    avoidWhen: "A single value in a range; Meter or Progress is simpler.",
    description: "A radial chart for progress toward a goal, or a few values on concentric rings.",
  },
  {
    name: "chart-sankey",
    title: "Sankey Chart",
    group: "charts",
    useWhen: "Flow between stages, such as visitors to signups to paid.",
    avoidWhen: "There is no flow between stages; use a Bar Chart or Funnel Chart.",
    description: "A sankey chart for flow between stages.",
  },
  {
    name: "chart-scatter",
    title: "Scatter Chart",
    group: "charts",
    useWhen: "How two measures relate, one dot per item, with dot size for a third.",
    avoidWhen: "Categories on one axis; use a Bar Chart.",
    description: "A scatter chart for how two measures relate, with optional dot size for a third.",
  },
  {
    name: "chart-treemap",
    title: "Treemap",
    group: "charts",
    useWhen: "Sizes within a whole, as nested rectangles, such as storage by folder.",
    avoidWhen: "Precise comparison; areas are harder to compare than bars.",
    description: "A treemap for sizes within a whole, as nested rectangles.",
  },
  {
    name: "checkbox",
    title: "Checkbox",
    useWhen: "A single on/off choice in a form that takes effect on submit.",
    avoidWhen: "The setting takes effect immediately; use Switch.",
    description: "A checkbox with checked, unchecked, and indeterminate states.",
  },
  {
    name: "checkbox-group",
    title: "Checkbox Group",
    useWhen: "Choosing any number of options from a short list.",
    avoidWhen: "Only one option may be chosen; use Radio Group.",
    description: "Shares one array value between a set of Checkboxes, with optional select-all.",
  },
  {
    name: "collapsible",
    title: "Collapsible",
    useWhen: "One section of secondary detail that people can reveal.",
    avoidWhen: "There are several sections that behave as a set; use Accordion.",
    description: "A section that shows and hides its panel.",
  },
  {
    name: "combobox",
    title: "Combobox",
    useWhen: "Choosing from a long list where typing to filter is faster than scrolling.",
    avoidWhen: "The list has only a few options; use Select or Radio Group.",
    description: "Picks a value from a list you can filter by typing.",
  },
  {
    name: "command",
    title: "Command",
    useWhen: "A searchable list of actions or destinations, such as a command palette on ⌘K.",
    avoidWhen: "There are only a few options; use Dropdown Menu or Select.",
    description:
      "A searchable command list with groups, shortcuts, and an empty state, inline or in a dialog.",
  },
  {
    name: "context-menu",
    title: "Context Menu",
    useWhen:
      "Offering shortcuts for an item on right-click or long-press, such as rows or canvas objects.",
    avoidWhen:
      "It is the only way to reach an action; right-click isn't discoverable, so offer a visible menu too.",
    description: "A menu opened by right-clicking or long-pressing an area.",
  },
  {
    name: "data-table",
    title: "Data Table",
    useWhen: "Rows people need to sort, select, and page through, such as invoices or users.",
    avoidWhen: "The data is short and read-only; use Table.",
    description:
      "A table with sortable columns, row selection, and pagination, built on Table in plain React state.",
  },
  {
    name: "date-picker",
    title: "Date Picker",
    examples: [
      {
        name: "range",
        title: "Range",
        description: "Pick a start and an end date.",
      },
      { name: "disabled", title: "Disabled" },
    ],
    useWhen: "A form field for a date or a date range that should stay compact until opened.",
    avoidWhen: "The calendar should always be visible; use Calendar.",
    description: "A button that opens a Calendar in a Popover to pick a date or a date range.",
  },
  {
    name: "dialog",
    title: "Dialog",
    useWhen:
      "A focused task that needs the rest of the page out of the way, such as a form or a detail view.",
    avoidWhen: "The content could live on the page, or the dialog would open another dialog.",
    description:
      "A modal window composed from Root, Trigger, Content, Header, Footer, Title, Description, and Close.",
  },
  {
    name: "drawer",
    title: "Drawer",
    examples: [
      {
        name: "side",
        title: "Side",
        description: "Opens as a panel from the edge, for forms and details.",
      },
    ],
    useWhen:
      "A bottom sheet on mobile, or a side panel for filters, details, or an edit form next to the page.",
    avoidWhen: "The task needs full attention and a clear decision; use Dialog or Alert Dialog.",
    description:
      "A modal panel that slides in from any edge and can be swiped away. Set swipeDirection to right or left for a side sheet.",
  },
  {
    name: "dropdown-menu",
    title: "Dropdown Menu",
    useWhen: "A list of actions behind one trigger, such as an overflow menu.",
    avoidWhen: "People pick a value from options; use Select.",
    description: "A menu of actions opened from a button, with checkbox, radio, and submenu items.",
  },
  {
    name: "empty",
    title: "Empty",
    useWhen:
      "A list, table, or page has nothing to show yet, and people need to know what to do next.",
    avoidWhen: "The content is still loading; use Skeleton or Spinner.",
    description: "An empty state with media, a title, a description, and actions.",
  },
  {
    name: "field",
    title: "Field",
    useWhen: "Any form control that needs a label, a description, and an error message.",
    avoidWhen: "The control has no label or validation, such as a search input in a toolbar.",
    description:
      "Groups a control with its label, description, and error, and wires up accessibility and validation.",
  },
  {
    name: "fieldset",
    title: "Fieldset",
    useWhen: "Grouping related fields under one legend, such as an address.",
    avoidWhen: "There is only one field; use Field.",
    description: "Groups related fields under a legend; disabling it disables every field inside.",
  },
  {
    name: "form",
    title: "Form",
    useWhen: "Collecting input with validation and one submit action.",
    avoidWhen: "Each control saves on its own; use the controls directly.",
    description:
      "A form that validates its Fields together and focuses the first invalid one on submit.",
  },
  {
    name: "hover-card",
    title: "Hover Card",
    useWhen: "A preview of a linked thing on hover, such as a profile behind a name.",
    avoidWhen:
      "The content is needed to complete a task; hover isn't available on touch, so use Popover.",
    description: "A preview of a link's destination, shown while a pointer rests on the link.",
  },
  {
    name: "icons",
    title: "Icons",
    useWhen: "Supporting a label with a familiar symbol, or marking state.",
    avoidWhen: "The icon would be the only label for an unfamiliar action; add text or a Tooltip.",
    description:
      "The icons Shelf components use, in one file you own. lucide-react by default; swap the imports to change libraries.",
  },
  {
    name: "input",
    title: "Input",
    examples: [
      {
        name: "with-label",
        title: "With label",
        description: "Wrap in Field for a label and a description that are wired up for you.",
      },
      { name: "disabled", title: "Disabled" },
      {
        name: "invalid",
        title: "Invalid",
        description: "Field shows the error and marks the input invalid.",
      },
    ],
    useWhen: "Short single-line text such as a name, an email, or a search.",
    avoidWhen:
      "The text can span lines; use Textarea. Or it is a number with steps; use Number Field.",
    description: "A text input that takes part in a Field's label, description, and validation.",
  },
  {
    name: "input-group",
    title: "Input Group",
    useWhen: "An input with attached content, such as a prefix, an icon, or an inline button.",
    avoidWhen: "The attached content is a separate action; place a Button next to the input.",
    description: "An input with text, icons, or buttons attached inside its border.",
  },
  {
    name: "input-otp",
    title: "Input OTP",
    useWhen: "Entering a one-time code of fixed length.",
    avoidWhen: "The code length varies, or people will paste long tokens; use Input.",
    description: "A one-time code input with one slot per character and paste support.",
  },
  {
    name: "item",
    title: "Item",
    useWhen: "Rows of media, text, and actions in a list, such as members, files, or settings.",
    avoidWhen: "The rows need columns people compare across; use Table.",
    description:
      "A list row of media, a title, a description, and actions, that can render as a link.",
  },
  {
    name: "kbd",
    title: "Kbd",
    description: "A keyboard key.",
    useWhen: "Showing a keyboard shortcut or key in text or menus.",
    avoidWhen: "The text is code; use a code element.",
  },
  {
    name: "label",
    title: "Label",
    description: "A text label for a form control.",
    useWhen: "Naming a form control, when you aren't using Field.",
    avoidWhen: "You are using Field, which renders its own label.",
  },
  {
    name: "menubar",
    title: "Menubar",
    useWhen: "Application-style menus across the top of a tool, such as File, Edit, and View.",
    avoidWhen: "A website's main navigation; use Navigation Menu.",
    description: "A row of menus, as in a desktop app, with arrow-key movement between them.",
  },
  {
    name: "meter",
    title: "Meter",
    useWhen: "A value within a known range, such as storage used or a score.",
    avoidWhen: "Progress toward finishing a task; use Progress.",
    description: "A measurement within a known range, such as storage used.",
  },
  {
    name: "native-select",
    title: "Native Select",
    useWhen:
      "A simple choice on mobile, or where the browser's own picker is the better experience.",
    avoidWhen: "Options need icons, descriptions, or search; use Select or Combobox.",
    description: "The browser's own select, styled to match Input and Select, with option groups.",
  },
  {
    name: "navigation-menu",
    title: "Navigation Menu",
    useWhen: "Top-level site navigation, with optional panels of links.",
    avoidWhen: "Menus of actions inside an app; use Dropdown Menu or Menubar.",
    description: "Site navigation where items open panels of links in one shared surface.",
  },
  {
    name: "number-field",
    title: "Number Field",
    useWhen: "A number people adjust in steps, such as a quantity.",
    avoidWhen:
      "The value is an identifier that happens to be digits, such as a phone number; use Input.",
    description:
      "A number input with step buttons, keyboard stepping, and locale-aware formatting.",
  },
  {
    name: "pagination",
    title: "Pagination",
    useWhen: "Moving through pages of results when position matters, such as tables.",
    avoidWhen: "People scan a feed; load more as they scroll instead.",
    description: "Links between the pages of a long list.",
  },
  {
    name: "popover",
    title: "Popover",
    useWhen: "Interactive content anchored to a trigger, such as a small form or filters.",
    avoidWhen:
      "The content is a short label; use Tooltip. Or a list of actions; use Dropdown Menu.",
    description: "Rich, interactive content in a floating panel opened from a button.",
  },
  {
    name: "progress",
    title: "Progress",
    useWhen: "Showing how far a task has gone, such as an upload.",
    avoidWhen: "The duration is unknown and short; use Spinner.",
    description: "How far along a task is, or that it is in progress.",
  },
  {
    name: "radio-group",
    title: "Radio Group",
    useWhen: "Choosing exactly one option from a short list where all options should be visible.",
    avoidWhen: "There are many options; use Select or Combobox.",
    description: "A set of options where exactly one can be chosen, with arrow-key navigation.",
  },
  {
    name: "resizable",
    title: "Resizable",
    examples: [
      { name: "vertical", title: "Vertical" },
      {
        name: "nested",
        title: "Nested",
        description: "Groups nest to build an editor-style layout.",
      },
    ],
    useWhen: "Side-by-side panes whose size people adjust, such as an editor and a preview.",
    avoidWhen: "The layout works at fixed sizes; resizing adds a control nobody asked for.",
    description:
      "Panels resized by dragging or the keyboard, composed from Group, Panel, and Handle.",
  },
  {
    name: "scroll-area",
    title: "Scroll Area",
    useWhen: "A region with its own scroll that should look consistent across platforms.",
    avoidWhen: "The whole page scrolls; let the browser handle it.",
    description: "A native scrolling region with thin, themed scrollbars.",
  },
  {
    name: "select",
    title: "Select",
    examples: [
      {
        name: "groups",
        title: "Groups",
        description: "Group long lists with labels and separators.",
      },
    ],
    description: "Picks one value from a list of options.",
    useWhen: "Choosing one value from a list of about five to fifteen options.",
    avoidWhen: "There are only two or three options; use Radio Group. Or many; use Combobox.",
  },
  {
    name: "separator",
    title: "Separator",
    description: "A horizontal or vertical dividing line.",
    useWhen: "Dividing groups of content or menu items.",
    avoidWhen: "Spacing alone would separate the groups.",
  },
  {
    name: "sidebar",
    title: "Sidebar",
    useWhen: "The main navigation of an app, collapsible on desktop and a sheet on mobile.",
    avoidWhen: "A site with a few top-level pages; use Navigation Menu.",
    description:
      "An app-shell sidebar that collapses offcanvas or to icons and becomes a sheet on small screens.",
  },
  {
    name: "skeleton",
    title: "Skeleton",
    description: "A placeholder shape while content loads.",
    useWhen: "Holding the shape of content while it loads, so the layout doesn't jump.",
    avoidWhen: "Loading takes a moment and has no layout to hold; use Spinner.",
  },
  {
    name: "slider",
    title: "Slider",
    examples: [
      { name: "range", title: "Range", description: "Pass an array for two thumbs." },
      { name: "disabled", title: "Disabled" },
    ],
    useWhen: "Choosing an approximate value in a range, such as volume.",
    avoidWhen: "The exact value matters; use Number Field.",
    description: "A draggable input for a single value or a range.",
  },
  {
    name: "sparkline",
    title: "Sparkline",
    group: "charts",
    useWhen: "A tiny trend beside a number, in a stat or a table row.",
    avoidWhen: "The values themselves matter; use an Area Chart or Line Chart with axes.",
    description: "A tiny line with no axes, for a table cell or a stat.",
  },
  {
    name: "spinner",
    title: "Spinner",
    description: "A spinning loading indicator.",
    useWhen: "A short wait with no known duration.",
    avoidWhen: "The wait has a known progress; use Progress. Or content has a shape; use Skeleton.",
  },
  {
    name: "switch",
    title: "Switch",
    useWhen: "A setting that takes effect immediately.",
    avoidWhen: "The choice is saved on submit; use Checkbox.",
    description: "An on/off control that takes effect immediately.",
  },
  {
    name: "table",
    title: "Table",
    description: "A semantic HTML table with Shelf styles.",
    useWhen: "Data people compare across rows and columns.",
    avoidWhen: "Content is a list of items with one or two attributes; use a list.",
  },
  {
    name: "tabs",
    title: "Tabs",
    examples: [
      {
        name: "vertical",
        title: "Vertical",
        description: "Tabs stacked down the side, for settings-style navigation.",
      },
    ],
    description: "Switches between panels of related content.",
    useWhen: "Switching between views of the same context, one at a time.",
    avoidWhen: "People need to compare views, or the tabs navigate between pages.",
  },
  {
    name: "textarea",
    title: "Textarea",
    useWhen: "Multi-line text such as comments or descriptions.",
    avoidWhen: "The text is a single line; use Input.",
    description: "A multi-line text input that grows with its content and takes part in a Field.",
  },
  {
    name: "toast",
    title: "Toast",
    examples: [
      {
        name: "types",
        title: "Success and error",
        description: "An icon that matches the outcome of an action.",
      },
      { name: "action", title: "Action", description: "An action button, such as undo." },
      {
        name: "promise",
        title: "Promise",
        description: "Follows an async task from loading to done.",
      },
    ],
    useWhen: "Brief feedback after an action, such as saved or copied.",
    avoidWhen: "The message needs action or must stay; use Alert or Dialog.",
    description:
      "Brief notifications queued from anywhere in the app: stacked, swipeable, with success, error, and loading states.",
  },
  {
    name: "toggle",
    title: "Toggle",
    useWhen: "A single on/off button in a toolbar, such as bold.",
    avoidWhen: "The setting is part of a form; use Switch or Checkbox.",
    description: "A two-state button with default and outline variants.",
  },
  {
    name: "toggle-group",
    title: "Toggle Group",
    examples: [
      {
        name: "multiple",
        title: "Multiple",
        description: "Several options can be on together, such as text formatting.",
      },
      {
        name: "outline",
        title: "Outline",
        description: "Outline Toggles with text labels, as a segmented control.",
      },
    ],
    useWhen: "Choosing one or several options shown as buttons, such as text alignment.",
    avoidWhen: "The options need labels longer than a word; use Radio Group.",
    description: "A set of Toggles sharing one value, with arrow-key navigation.",
  },
  {
    name: "toolbar",
    title: "Toolbar",
    useWhen: "A set of controls that act on the same thing, such as an editor.",
    avoidWhen: "The controls are unrelated; keep them separate.",
    description: "A row of controls that is one Tab stop, with arrow-key movement.",
  },
  {
    name: "tooltip",
    title: "Tooltip",
    examples: [
      {
        name: "sides",
        title: "Sides",
        description: "The tooltip can open on any side, and flips when there isn't room.",
      },
    ],
    useWhen: "A short label for an icon-only control or a truncated value.",
    avoidWhen:
      "The content is essential or interactive; tooltips don't appear on touch, so use Popover or visible text.",
    description: "A short label shown on hover and keyboard focus.",
  },
  {
    name: "typography",
    title: "Typography",
    useWhen:
      "Long-form text such as docs, articles, or changelogs that needs consistent prose styles.",
    avoidWhen: "Interface labels and short text; use the components' own text styles.",
    description:
      "Prose styles for headings, paragraphs, lead text, quotes, lists, and inline code.",
  },
];

export function findComponent(name: string): ComponentDoc | undefined {
  return components.find((component) => component.name === name);
}
