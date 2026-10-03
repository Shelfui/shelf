import type { ComponentType } from "react";
import DashboardOverviewDemo from "./dashboard-overview";
import DashboardShellDemo from "./dashboard-shell";
import InvoicesTableDemo from "./invoices-table";
import LoginFormDemo from "./login-form";
import LoginSplitDemo from "./login-split";
import OtpVerificationDemo from "./otp-verification";
import SettingsSectionDemo from "./settings-section";
import SidebarNestedDemo from "./sidebar-nested";
import SignupFormDemo from "./signup-form";

/** Each block's demo, by registry name. The docs read the same files as source. */
export const blockDemos: Record<string, ComponentType> = {
  "dashboard-overview": DashboardOverviewDemo,
  "dashboard-shell": DashboardShellDemo,
  "invoices-table": InvoicesTableDemo,
  "login-form": LoginFormDemo,
  "login-split": LoginSplitDemo,
  "otp-verification": OtpVerificationDemo,
  "settings-section": SettingsSectionDemo,
  "sidebar-nested": SidebarNestedDemo,
  "signup-form": SignupFormDemo,
};
