/** @type {import('tailwindcss').Config} */
//
// Notes:
// - Colors are CSS variables, so opacity modifiers such as `bg-status-info/10` do NOT
//   work in Tailwind v3 (it cannot add alpha to `var(--x)`). For tinted surfaces use
//   `color-mix(in srgb, var(--status-info) 10%, transparent)` in CSS instead.
// - The second theme is switched with `data-theme="dark"` on <html> (see tokens.css).
module.exports = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./*.html"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: {
          DEFAULT: "var(--bg-surface)",
          elevated: "var(--bg-surface-elevated)",
          muted: "var(--bg-surface-muted)",
          hover: "var(--bg-surface-hover)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
          focus: "var(--border-focus)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-primary-hover)",
          fg: "var(--accent-primary-fg)",
          secondary: "var(--accent-secondary)",
          "secondary-fg": "var(--accent-secondary-fg)",
        },
        status: {
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          danger: "var(--status-danger)",
          info: "var(--status-info)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },
      fontFamily: {
        sans: ["var(--font-family-sans)"],
        mono: ["var(--font-family-mono)"],
        display: ["var(--font-family-display)"],
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "9999px",
      },
      boxShadow: {
        sm: "var(--elevation-sm)",
        card: "var(--elevation-card)",
        elevated: "var(--elevation-elevated)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

