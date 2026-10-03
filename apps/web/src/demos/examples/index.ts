import type { ComponentType } from "react";
import AccordionMultiple from "./accordion-multiple";
import AlertDestructive from "./alert-destructive";
import AvatarBadge from "./avatar-badge";
import AvatarGroup from "./avatar-group";
import AvatarSizes from "./avatar-sizes";
import ButtonAsLink from "./button-as-link";
import ButtonGroupSizes from "./button-group-sizes";
import ButtonGroupSplit from "./button-group-split";
import ButtonLoading from "./button-loading";
import ButtonSizes from "./button-sizes";
import ButtonWithIcon from "./button-with-icon";
import CalendarDisabledDays from "./calendar-disabled-days";
import CalendarDropdowns from "./calendar-dropdowns";
import CalendarRange from "./calendar-range";
import DatePickerDisabled from "./date-picker-disabled";
import DatePickerRange from "./date-picker-range";
import DrawerSide from "./drawer-side";
import InputDisabled from "./input-disabled";
import InputInvalid from "./input-invalid";
import InputWithLabel from "./input-with-label";
import ResizableNested from "./resizable-nested";
import ResizableVertical from "./resizable-vertical";
import SelectGroups from "./select-groups";
import SliderDisabled from "./slider-disabled";
import SliderRange from "./slider-range";
import TabsVertical from "./tabs-vertical";
import ToastAction from "./toast-action";
import ToastPromise from "./toast-promise";
import ToastTypes from "./toast-types";
import ToggleGroupMultiple from "./toggle-group-multiple";
import ToggleGroupOutline from "./toggle-group-outline";
import TooltipSides from "./tooltip-sides";

/** Keyed `<component>-<example>`, matching the file name. */
export const examples: Record<string, ComponentType> = {
  "accordion-multiple": AccordionMultiple,
  "alert-destructive": AlertDestructive,
  "avatar-badge": AvatarBadge,
  "avatar-group": AvatarGroup,
  "avatar-sizes": AvatarSizes,
  "button-as-link": ButtonAsLink,
  "button-group-sizes": ButtonGroupSizes,
  "button-group-split": ButtonGroupSplit,
  "button-loading": ButtonLoading,
  "button-sizes": ButtonSizes,
  "button-with-icon": ButtonWithIcon,
  "calendar-disabled-days": CalendarDisabledDays,
  "calendar-dropdowns": CalendarDropdowns,
  "calendar-range": CalendarRange,
  "date-picker-disabled": DatePickerDisabled,
  "date-picker-range": DatePickerRange,
  "drawer-side": DrawerSide,
  "input-disabled": InputDisabled,
  "input-invalid": InputInvalid,
  "input-with-label": InputWithLabel,
  "resizable-nested": ResizableNested,
  "resizable-vertical": ResizableVertical,
  "select-groups": SelectGroups,
  "slider-disabled": SliderDisabled,
  "slider-range": SliderRange,
  "tabs-vertical": TabsVertical,
  "toast-action": ToastAction,
  "toast-promise": ToastPromise,
  "toast-types": ToastTypes,
  "toggle-group-multiple": ToggleGroupMultiple,
  "toggle-group-outline": ToggleGroupOutline,
  "tooltip-sides": TooltipSides,
};
