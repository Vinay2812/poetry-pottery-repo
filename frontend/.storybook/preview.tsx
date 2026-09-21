import { MockedProvider } from "@apollo/client/testing/react";
import React from "react";
import type { Preview } from "@storybook/nextjs-vite";

import { fontVariables } from "../src/lib/fonts";
import { VIEWPORT_OPTIONS } from "../src/lib/storybook/viewports";

import "../src/app/globals.css";

const preview: Preview = {
  decorators: [
    // Presentational components may render WhatsAppLink, whose record mutation needs a client.
    (Story) => (
      <MockedProvider>
        <div className={`${fontVariables} font-sans antialiased`}>
          <Story />
        </div>
      </MockedProvider>
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
