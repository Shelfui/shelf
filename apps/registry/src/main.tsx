import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initialTheme, setTheme } from "@/components/site/layout";
import * as Tooltip from "@/components/ui/tooltip";
import { RegistryContext, loadRegistry } from "@/data";
import { router } from "@/router";
import { LoadError } from "@/views/not-found";
import "./index.css";
import "./styles/shelf/fonts.css";

const element = document.getElementById("root");
if (!element) throw new Error("Missing #root element");
const root = createRoot(element);

setTheme(initialTheme());

loadRegistry().then(
  (registry) =>
    root.render(
      <StrictMode>
        <RegistryContext.Provider value={registry}>
          <Tooltip.Provider>
            <RouterProvider router={router} />
          </Tooltip.Provider>
        </RegistryContext.Provider>
      </StrictMode>,
    ),
  (error: unknown) => root.render(<LoadError error={error} />),
);
