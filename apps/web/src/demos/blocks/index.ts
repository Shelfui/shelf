import type { ComponentType } from "react";
import AnalyticsDashboardDemo from "./analytics-dashboard";
import ChatDemo from "./chat";
import ChartCardDemo from "./chart-card";
import ConfirmDialogDemo from "./confirm-dialog";
import DashboardOverviewDemo from "./dashboard-overview";
import DashboardShellDemo from "./dashboard-shell";
import InvoicesTableDemo from "./invoices-table";
import ListDetailPageDemo from "./list-detail-page";
import LoginFormDemo from "./login-form";
import LoginSplitDemo from "./login-split";
import OtpVerificationDemo from "./otp-verification";
import SettingsPageDemo from "./settings-page";
import SettingsSectionDemo from "./settings-section";
import SidebarNestedDemo from "./sidebar-nested";
import SignupFormDemo from "./signup-form";

/** Each block's demo, by registry name. The docs read the same files as source. */
export const blockDemos: Record<string, ComponentType> = {
  "analytics-dashboard": AnalyticsDashboardDemo,
  chat: ChatDemo,
  "chart-card": ChartCardDemo,
  "confirm-dialog": ConfirmDialogDemo,
  "dashboard-overview": DashboardOverviewDemo,
  "dashboard-shell": DashboardShellDemo,
  "invoices-table": InvoicesTableDemo,
  "list-detail-page": ListDetailPageDemo,
  "login-form": LoginFormDemo,
  "login-split": LoginSplitDemo,
  "otp-verification": OtpVerificationDemo,
  "settings-page": SettingsPageDemo,
  "settings-section": SettingsSectionDemo,
  "sidebar-nested": SidebarNestedDemo,
  "signup-form": SignupFormDemo,
};
