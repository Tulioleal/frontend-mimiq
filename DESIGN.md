# Design System Specification: The Tactile Console

## 1. Overview & Creative North Star

**Creative North Star: "The Precision Instrument"**
This design system moves away from the "software-as-a-service" template and toward the "hardware-as-a-service" reality. It is an homage to high-end rack-mounted signal processors and professional mixing consoles. We are not building a webpage; we are building a digital instrument.

The aesthetic is defined by **Intentional Density**. Unlike consumer apps that prioritize white space, this system embraces the complexity of professional audio. It utilizes a panel-based architecture where information is grouped into "modules," using overlapping layers and tonal depth to create a sense of physical machinery. We break the grid through asymmetrical meter placement and technical "readouts" that feel more like a cockpit than a dashboard.

---

## 2. Colors & Surface Philosophy

The palette is rooted in a "midnight-studio" environment. We use a high-contrast relationship between deep charcoal bases and vibrant, glowing status indicators.

### Surface Hierarchy (The No-Line Rule)

**Prohibition:** 1px solid borders for sectioning are strictly forbidden.
Structure must be achieved through **Tonal Layering**. The interface should feel like a series of machined plates stacked upon one another.

- **Base Layer:** `surface` (#131316) for the primary application background.
- **Sectioning:** Use `surface_container_low` (#1b1b1e) to define large functional areas.
- **Interaction Modules:** Use `surface_container_high` (#2a2a2d) for the actual control panels (where sliders and knobs live).
- **Active Elements:** Use `surface_container_highest` (#353437) to "pop" a specific module during use.

### The "Glass & Gradient" Rule

To mimic the glow of vacuum tubes and LED displays:

- **Status Glow:** Use `secondary_container` (#25a475) with a 20px backdrop blur for active recording states.
- **CTA Soul:** Buttons should never be flat. Apply a subtle linear gradient from `primary` (#ffb59c) to `primary_container` (#f2642d) at a 135-degree angle to simulate a backlit physical button.

---

## 3. Typography

The system uses a dual-font strategy to balance human-centric control with technical precision.

- **Humanist Interface (Manrope):** Used for `display`, `headline`, `title`, and `body`. Manrope provides a modern, geometric clarity that feels premium and approachable.
  - _Usage:_ `headline-md` for panel titles; `body-md` for descriptions.
- **Technical Readouts (Space Grotesk):** Used for all `label` tokens.
  - _Usage:_ `label-md` and `label-sm` are strictly reserved for data, timestamps, frequencies, and technical metrics. This monospace-adjacent feel reinforces the "Professional Audio" aesthetic.

---

## 4. Elevation & Depth

We reject the "Material" floating shadow. Depth in this system is about **Milled Surfaces**.

- **The Layering Principle:** A "recessed" effect is created by placing a `surface_container_lowest` (#0e0e11) element inside a `surface_container_high` (#2a2a2d) panel. This simulates a carved-out area for sliders or meters.
- **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `offset-y: 24px`, `blur: 48px`, `color: rgba(0, 0, 0, 0.5)`.
- **The "Ghost Border" Fallback:** If a technical boundary is required for legibility, use the `outline_variant` (#594139) at **15% opacity**. It should feel like a light catch on a metal edge, not a drawn line.
- **Glassmorphism:** Use `surface_bright` (#39393c) at 60% opacity with a `backdrop-filter: blur(12px)` for floating toolbars or context menus to maintain the studio "depth of field."

---

## 5. Components

### Buttons & Controls

- **Primary Action (The "Ignition" Button):** Uses the `primary` to `primary_container` gradient. Border-radius is `sm` (0.125rem) to maintain a sharp, professional edge.
- **Secondary/Transport Controls:** `surface_container_highest` background with `on_surface` text. These should feel like tactile plastic switches.
- **Sliders (The Fader):** Track uses `surface_container_lowest` (recessed). The thumb/handle is a `primary` (#ffb59c) rectangle with a vertical line of `on_primary` to indicate the "center."

### Data Visualization (VU Meters)

- **The Meter Track:** A vertical or horizontal bar using `surface_container_lowest`.
- **The Signal:** A gradient from `secondary` (#68dba9) at the bottom to `primary` (#ffb59c) at the peak (0db).
- **Labels:** Use `label-sm` (Space Grotesk) for decibel markings, aligned with surgical precision.

### Input Fields

- **Technical Inputs:** Forbid standard rounded boxes. Use a "bottom-line-only" approach or a fully recessed `surface_container_lowest` box.
- **Focus State:** Instead of a thick border, use a 2px outer glow (drop-shadow) of `primary` (#ffb59c) at 30% opacity.

### Cards & Lists

- **Forbid Dividers:** Do not use lines to separate audio tracks or files. Use a alternating background shift (`surface_container_low` vs `surface_container_lowest`) or a 12px vertical gap.

---

## 6. Do's and Don'ts

### Do

- **DO** use asymmetry. Place technical data (Space Grotesk) in the corners of panels to frame the content.
- **DO** use `secondary` (emerald green) exclusively for "Safe/Active" states and `primary` (burnt orange) for "Warning/Peak/Record" states.
- **DO** lean into high-density layouts. Professional users want more control at their fingertips, not less.

### Don't

- **DON'T** use `lg` or `xl` roundedness. Large curves feel "toy-like." Stick to `sm` (0.125rem) or `none` for a professional, machined look.
- **DON'T** use pure white (#FFFFFF). All "white" text should be `on_surface` (#e4e1e5) to reduce eye strain in dark studio environments.
- **DON'T** use standard icons. Use "Precise Iconography"—icons with thin strokes (1px or 1.5px) and sharp corners that match the technical nature of the typography.
