import React from "react";
import type { Preview } from "@storybook/nextjs-vite";

import { fontVariables } from "../src/lib/fonts";
import { VIEWPORT_OPTIONS } from "../src/lib/storybook/viewports";

import "../src/app/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={`${fontVariables} font-sans antialiased`}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    viewport: { options: VIEWPORT_OPTIONS },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  initialGlobals: {
    viewport: { value: "laptop", isRotated: false },
  },
};

export default preview;
