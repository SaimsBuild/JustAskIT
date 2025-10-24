# JustAskIT - AI Chatbot Design Guidelines

## Design Approach

**Selected Approach**: Design System with Chat Application References
Drawing inspiration from ChatGPT, Claude, and Linear's messaging interfaces, this chatbot will prioritize clarity, readability, and conversational flow. The design emphasizes efficient information exchange with a clean, distraction-free interface.

## Core Design Elements

### Typography System

**Primary Font**: Inter (Google Fonts)
- Headings: 600 weight, 1.5rem for app title, 1.125rem for section headers
- User Messages: 400 weight, 1rem
- AI Messages: 400 weight, 1rem
- Input Text: 400 weight, 1rem
- Metadata/Timestamps: 400 weight, 0.875rem
- Buttons/CTAs: 500 weight, 0.9375rem

**Secondary Font**: JetBrains Mono (Google Fonts) for code blocks within messages
- Code snippets: 400 weight, 0.875rem

### Layout System

**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, and 8 consistently
- Message bubbles: p-4
- Section spacing: gap-4 between messages
- Container padding: p-6 for main chat area
- Input container: p-4
- Button spacing: px-6 py-3

**Container Structure**:
- Maximum content width: max-w-4xl centered
- Chat area: Full height minus input area (min-h-screen calculation)
- Input area: Fixed at bottom with backdrop blur

## Component Library

### Header Component
- App branding "JustAskIT" with tagline "Powered by Dolphin Mistral AI"
- New chat button (top-right)
- Subtle divider below header
- Sticky positioning (top-0)
- Height: h-16

### Chat Message Components

**User Message Bubble**:
- Right-aligned with ml-auto, max-w-3xl
- Rounded corners: rounded-2xl with rounded-br-sm
- Padding: p-4
- Include small avatar/icon on right side
- Timestamp below message (text-xs)

**AI Message Bubble**:
- Left-aligned with mr-auto, max-w-3xl
- Rounded corners: rounded-2xl with rounded-bl-sm
- Padding: p-4
- "JustAskIT" label with robot icon
- Timestamp below message (text-xs)
- Support for markdown rendering (bold, italic, lists, code blocks)

**Loading State**:
- Animated typing indicator (three dots with pulse animation)
- Positioned in AI message bubble format
- Minimal, elegant animation

### Input Area Component
- Fixed bottom positioning with backdrop-blur effect
- Container: max-w-4xl centered with p-4
- Textarea with:
  - Auto-growing height (min 3 rows, max 8 rows)
  - Rounded corners: rounded-2xl
  - Padding: p-4 with pr-14 (space for send button)
  - Placeholder: "Ask me anything..."
- Send button:
  - Position: absolute right-4 bottom-4
  - Icon: Paper airplane or arrow up
  - Rounded: rounded-xl
  - Size: w-10 h-10
  - Disabled state when empty

### Utility Components

**Empty State** (when no messages):
- Centered vertically and horizontally
- Robot icon (large, 4rem)
- Welcome heading: "Welcome to JustAskIT"
- Subheading: "Ask me anything and I'll help you find answers"
- Sample question chips (3-4 suggestions):
  - Rounded: rounded-full
  - Padding: px-4 py-2
  - Clickable to populate input
  - Examples: "Explain quantum computing", "Write a Python function", "Plan a trip to Tokyo"

**Error State**:
- Toast notification or inline error message
- Error icon with descriptive text
- "Retry" button option
- Position: Fixed top-right for toasts

**Clear Chat Button**:
- Positioned in header area
- Icon: Trash or broom icon
- Confirmation modal before clearing
- Text: "Clear conversation"

### Navigation
- Minimal navigation: Only header with app branding
- Optional sidebar toggle for chat history (future feature placeholder)
- Mobile menu: Hamburger icon revealing slide-out panel

### Scrolling Behavior
- Auto-scroll to newest message on AI response
- Smooth scroll animation (scroll-smooth)
- Show "scroll to bottom" button when user scrolls up (fixed bottom-right, above input)
- Button: Rounded-full with down arrow icon

### Modal Component (for confirmations)
- Centered overlay with backdrop blur
- Card: rounded-3xl, max-w-md
- Padding: p-6
- Two-button layout (Cancel + Confirm)
- Cancel: Ghost/outline style
- Confirm: Solid, prominent

## Animations

**Minimal, Purposeful Animations Only**:
- Message appearance: Subtle fade-in (200ms)
- Typing indicator: Gentle pulse on dots
- Send button: Scale on click (95%)
- Scroll to bottom button: Fade in/out
- No distracting background animations
- No complex scroll-triggered effects

## Responsive Design

**Mobile (< 768px)**:
- Stack elements vertically
- Input area: Full width with p-3
- Message bubbles: max-w-full with slight padding reduction (p-3)
- Header: Compact with smaller logo/text
- Sample chips: Stack vertically with full width

**Tablet (768px - 1024px)**:
- Message bubbles: max-w-2xl
- Maintain spacing proportions
- Input area: Standard layout

**Desktop (> 1024px)**:
- Full layout as designed
- Message bubbles: max-w-3xl
- Generous spacing and padding

## Images

**No hero image required** - This is a utility application focused on chat functionality.

**Icons Only**:
- Use Heroicons (outline style) via CDN
- Robot/bot icon for AI messages (20px)
- User avatar icon or initials (20px)
- Send arrow/paper plane (20px)
- Clear/trash icon (20px)
- Chevron/arrows for navigation

All icons should maintain consistent sizing and be properly aligned with text baselines.