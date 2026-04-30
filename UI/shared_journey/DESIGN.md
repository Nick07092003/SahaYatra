---
name: Shared Journey
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#005ac2'
  on-tertiary: '#ffffff'
  tertiary-container: '#71a1ff'
  on-tertiary-container: '#00367a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 16px
  margin: 24px
---

## Brand & Style
The design system is anchored in the concept of "Confident Commuting." It bridges the gap between environmental consciousness and unwavering reliability. The brand personality is that of a helpful, high-tech concierge—efficient and professional, yet deeply rooted in community values.

The chosen style is **Corporate Modern with Minimalist influences**. It prioritizes clarity and functional beauty, ensuring that the interface feels like a high-utility tool rather than a social distraction. By using generous white space and a structured hierarchy, the design system evokes a sense of safety and calm, which is essential for a peer-to-peer platform where trust is the primary currency.

## Colors
The palette is a strategic blend of "Eco-Growth" and "Structural Trust." 

- **Primary (Emerald Green):** Represents sustainability, vitality, and the "go" signal. It is used for primary actions, success states, and key brand moments.
- **Secondary (Deep Slate):** A grounding, near-black blue used for high-contrast typography and structural elements. It provides the "professional" weight the platform requires.
- **Tertiary (Reliable Blue):** Used specifically for safety features, verification badges, and informational prompts to reinforce the feeling of security.
- **Neutral (Soft Slate):** A range of cool-toned greys used for backgrounds and borders to keep the UI feeling airy and modern without the harshness of pure white/black.

## Typography
This design system utilizes **Manrope** across all levels. Manrope’s geometric yet friendly letterforms provide the perfect balance of technical precision and human warmth. 

Headlines utilize a tighter letter spacing and heavier weights to command attention and project authority. Body text is optimized for long-form legibility with a generous line height (1.6), ensuring that trip details and driver bios are easily digestible. Labels use semi-bold weights and slight tracking to differentiate themselves from interactive components.

## Layout & Spacing
The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The rhythm is based on a **4px baseline grid**, ensuring that every element—from icon size to padding—is a multiple of four.

The layout philosophy emphasizes "Safe Margins." By using a standard 24px outer margin on mobile, the content feels contained and intentional. High-density information (like trip lists) should use the `md` (16px) spacing for internal padding, while section-level separation should use `xl` (48px) to allow the interface to breathe.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. Instead of heavy dropshadows, this design system uses soft, diffused shadows with a slight tint of the secondary color (#0F172A) at very low opacity (4-8%).

- **Level 0 (Surface):** The base neutral background (#F8FAFC).
- **Level 1 (Card):** White surfaces with a subtle 1px border (#E2E8F0) and no shadow, used for secondary information.
- **Level 2 (Interactive):** White surfaces with an ambient shadow, used for clickable trip cards or profile summaries.
- **Level 3 (Overlay):** Modals and bottom sheets, featuring a backdrop blur (12px) on the layers beneath to focus the user's attention.

## Shapes
The shape language is **Rounded**, reflecting a community-focused and approachable brand. 

A standard corner radius of 8px (`0.5rem`) is applied to buttons, input fields, and small cards. Larger containers, such as trip detail cards or promotional banners, utilize the `rounded-lg` (16px) or `rounded-xl` (24px) settings to create a softer, more modern aesthetic. Buttons always feature fully rounded (pill-shaped) ends when they are standalone "Call to Action" elements to maximize their affordance.

## Components

- **Buttons:** Primary buttons use a solid Emerald Green fill with white text. Secondary buttons use a ghost style with a Slate border. Action buttons (like "Book Now") should be pill-shaped.
- **Chips:** Used for vehicle types (Car/Bike) and amenities (AC/Music). Use a light green tint background with dark green text for active states.
- **Input Fields:** Use a 1px border in a soft grey. On focus, the border transitions to Primary Green with a subtle 4px outer glow.
- **Trip Cards:** The centerpiece of the UI. They should feature a clear "Origin to Destination" visual timeline, driver rating in the Tertiary Blue, and a prominent price point.
- **Trust Indicators:** A specific component for "Verified Profile" badges, utilizing the Tertiary Blue and a shield icon to provide immediate psychological safety.
- **Map Pins:** Custom markers using the Primary Green for the user and Secondary Slate for carpools, ensuring high contrast against standard map tiles.