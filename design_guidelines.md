# Design Guidelines: GlobalCareer AI Platform

## Design Approach

**Selected Framework**: Professional SaaS hybrid drawing from **Linear's clarity** + **Notion's approachability** + **Apple HIG's polish**

**Rationale**: This is a productivity-focused career tool requiring trust, efficiency, and visual sophistication. Users need confidence that their career data is handled professionally while experiencing the innovation of AI assistance.

## Typography System

**Primary Font**: Inter (Google Fonts) - Clean, professional, excellent readability
**Accent Font**: Space Grotesk (Google Fonts) - For headings and AI-generated content highlights

**Hierarchy**:
- Hero/Page Titles: Space Grotesk, 48px (3xl), font-bold
- Section Headings: Space Grotesk, 32px (2xl), font-semibold  
- Card Titles: Inter, 20px (xl), font-semibold
- Body Text: Inter, 16px (base), font-normal
- Labels/Meta: Inter, 14px (sm), font-medium
- AI Output: Inter, 16px (base), font-normal with subtle italic for emphasis

## Layout System

**Spacing Units**: Tailwind units of **4, 6, 8, 12, 16** (e.g., p-4, gap-6, mt-8, py-12, mb-16)

**Container Strategy**:
- Dashboard/App pages: max-w-7xl with px-6 
- Forms: max-w-3xl centered
- Kanban board: Full-width with horizontal scroll
- Landing page: Varied widths per section (max-w-6xl for text, full-width for features)

**Grid System**: 
- Feature cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- Dashboard metrics: grid-cols-2 lg:grid-cols-4, gap-4
- CV preview: Single column, max-w-2xl

## Component Library

### Navigation
- **Top Navigation Bar**: Sticky, backdrop-blur effect, height h-16, horizontal layout with logo left, navigation center, user profile/CTA right
- **Dashboard Sidebar**: Fixed left sidebar (w-64), collapsible on mobile, navigation items with icons (Heroicons)

### Core UI Elements

**Buttons**:
- Primary CTA: Rounded-lg, px-6, py-3, font-semibold, shadow-sm with subtle shadow on hover
- Secondary: Same size, outlined style with 2px border
- Icon buttons: Square p-2, rounded-md
- AI Action buttons: Include sparkle icon (✨) prefix, slightly elevated with shadow-md

**Cards**:
- Standard: rounded-xl, p-6, border with 1px width, subtle shadow
- Job opportunity cards: rounded-lg, p-5, hover lift effect (translate-y-1), includes company logo, match percentage badge
- Dashboard stat cards: p-6, includes large metric number (text-4xl), label (text-sm), trend indicator

**Forms**:
- Input fields: h-11, rounded-lg, px-4, border with 1.5px width, focus ring effect
- Multi-step stepper: Horizontal progress indicator at top, numbered circles connected by lines, active state highlighted
- Labels: text-sm, font-medium, mb-2
- Helper text: text-xs below inputs for validation/guidance
- AI optimize button: Positioned inline with textarea, includes loading shimmer state

**Notifications**:
- Toast popups: Slide in from top-right, rounded-lg, p-4, includes icon, message, dismiss button
- Match alerts: Include percentage badge, company logo thumbnail, action buttons

### Special Components

**CV Builder Interface**:
- Left panel: Form steps (2/3 width)
- Right panel: Live preview (1/3 width, sticky scroll)
- Section dividers: Dotted lines with section icons
- Achievement optimizer: Textarea with "Optimize with AI" button, shows before/after comparison

**Kanban Board**:
- 4 columns: Equal width, rounded-lg headers with stage names and counts
- Cards: Compact design with company name, position, date applied, drag handle
- Add button: Dashed border card at top of each column

**Dashboard**:
- Hero stats row: 4 metric cards (Profile completion %, Matched jobs, Applications sent, Success rate)
- Quick actions: Large icon buttons for "Build CV", "Find Jobs", "Track Applications"
- Recent activity feed: Timeline layout with icons and timestamps
- Recommended jobs: Horizontal scrolling card carousel

## Landing Page Structure

**Hero Section** (80vh):
- Split layout: Left side has headline, subheadline, dual CTAs ("Start Building" primary, "See Demo" secondary)
- Right side: Large hero image showing the CV builder interface in action with AI optimization overlay
- Background: Subtle gradient mesh (NO solid colors, just subtle tone variation)

**Social Proof** (py-16):
- Centered trust indicators: "Used by 10,000+ students" with university logos below
- Single row, horizontal scroll on mobile

**Features Section** (py-20):
- 3-column grid showing: AI CV Optimizer, Smart Job Matching, Application Tracker
- Each card: Icon (large, 48px), title, 2-line description, "Learn more →" link

**How It Works** (py-20):
- Numbered steps (1-2-3-4) in horizontal layout
- Each step: Large number, title, description, connecting arrow
- Screenshot illustrations showing actual interface for each step

**AI Showcase** (py-24):
- Side-by-side comparison: "Your draft" vs "AI-optimized version"
- Real example transformation with highlighted improvements
- "Try it free" CTA button

**Application Tracker Preview** (py-20):
- Full-width Kanban board mockup image showing populated cards
- Overlay text: "Never lose track of an opportunity"

**CTA Section** (py-24):
- Centered, max-w-3xl
- Headline, supporting text, email input + submit button inline
- Trust badges below (ATS-optimized, Global standards, Secure)

**Footer** (py-12):
- 3-column layout: Product links, Resources, Company
- Newsletter signup form
- Social links (LinkedIn, Twitter icons)

## Images

**Hero Image**: Modern interface screenshot showing CV builder with AI panel open, displaying the "optimize achievement" feature in action - should feel professional and tech-forward

**Feature Section Icons**: Use Heroicons - DocumentTextIcon, SparklesIcon, ChartBarIcon, BellIcon

**How It Works Screenshots**: 4 actual interface captures showing:
1. Signup/onboarding screen
2. CV form with stepper
3. Job matching results
4. Kanban tracker

**AI Showcase**: Split-screen comparison image showing text transformation (before/after)

**Kanban Preview**: Populated board screenshot with realistic job applications

## Interaction Patterns

**Loading States**:
- Skeleton screens for dashboard loading
- Shimmer effect during AI processing (gradient animation)
- Progress indicator for CV PDF generation

**AI Interactions**:
- Click "Optimize" → Loading shimmer (2s) → Smooth fade-in of improved text
- Typing indicator when AI is generating cover letters
- Success checkmark animation when optimization complete

**Micro-interactions**:
- Hover lift on cards (translate-y-1 + shadow increase)
- Smooth transitions: transition-all duration-200
- Checkbox animations in application tracker
- Progress bar fill animation in dashboard

**Responsive Behavior**:
- Mobile: Sidebar converts to bottom navigation, single column layouts
- Tablet: 2-column grids where desktop shows 3
- Desktop: Full multi-column layouts with sidebar

## Key Design Principles

1. **Trust First**: Professional aesthetic, clear hierarchy, no playful elements
2. **AI Visibility**: Make AI processing obvious (shimmers, sparkle icons, "AI-powered" badges)
3. **Progress Clarity**: Always show where users are in multi-step processes
4. **Action-Oriented**: Every screen has clear next steps with prominent CTAs
5. **Data Density**: Maximize information without clutter using cards and clear spacing
6. **Speed Perception**: Loading states prevent dead time, instant feedback on interactions