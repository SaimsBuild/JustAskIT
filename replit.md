# JustAskIT - AI Chatbot Application

## Overview

JustAskIT is an AI-powered chatbot application that provides intelligent conversational assistance using the Dolphin Mistral AI model via OpenRouter. The application features a clean, modern chat interface inspired by popular AI assistants like ChatGPT and Claude, with real-time streaming responses and markdown rendering capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**
- React with TypeScript for type-safe UI development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design system following "new-york" style variant
- Responsive layout with mobile-first approach

**Design Philosophy**
The application prioritizes clarity, readability, and conversational flow. Typography uses Inter for general text and JetBrains Mono for code blocks. The spacing system uses consistent Tailwind units (2, 3, 4, 6, 8) for predictable layouts. Message bubbles are styled differently for user and assistant messages to create clear visual distinction.

**State Management**
- Local React state for UI interactions (message input, loading states)
- No persistent storage - conversations exist only in client memory during session
- Query client configured with infinite stale time and disabled refetching for static data patterns

### Backend Architecture

**Server Framework**
- Express.js running on Node.js with ESM module format
- TypeScript for type safety across the entire backend
- Custom request logging middleware that captures method, path, status, duration, and response preview

**API Design**
The backend exposes a simple REST API with a single primary endpoint:
- `POST /api/chat` - Accepts user messages and conversation history, returns streaming AI responses

**Streaming Response Pattern**
The chat endpoint implements server-sent events (SSE) style streaming by proxying responses from OpenRouter's streaming API. This allows the frontend to display AI responses incrementally as they're generated, improving perceived performance and user experience.

**Request Validation**
Zod schemas validate incoming requests to ensure data integrity. The `chatRequestSchema` validates that messages contain required content and that conversation history (if provided) follows the expected format with role and content fields.

### Data Storage Solutions

**Current Implementation**
- In-memory storage only (MemStorage class)
- No database persistence implemented
- Conversation history maintained client-side and passed with each request

**Database Configuration**
The application includes Drizzle ORM configuration for PostgreSQL, suggesting future plans for persistent storage:
- Drizzle Kit configured with PostgreSQL dialect
- Schema definitions located in `shared/schema.ts`
- Migration output directory set to `./migrations`
- Neon Database serverless driver included in dependencies

**Data Models**
Message interface defines the core data structure:
- `id`: Unique identifier
- `role`: Either "user" or "assistant"
- `content`: The message text
- `timestamp`: When the message was created

### External Dependencies

**AI Service Integration**
- **OpenRouter API**: Primary AI service provider
  - Model: `cognitivecomputations/dolphin-mistral-24b-venice-edition:free`
  - Streaming chat completions endpoint
  - Requires `OPENROUTER_API_KEY` environment variable
  - Custom headers include HTTP-Referer and X-Title for attribution

**UI Component Libraries**
- Radix UI: Comprehensive set of unstyled, accessible components (accordion, dialog, dropdown, popover, select, toast, etc.)
- Embla Carousel: Carousel/slider functionality
- Lucide React: Icon library
- cmdk: Command palette component
- class-variance-authority: Utility for managing component variants
- tailwind-merge: Intelligent Tailwind class merging

**Markdown Rendering**
- react-markdown: Renders AI responses with markdown formatting
- remark-gfm: GitHub Flavored Markdown support (tables, task lists, strikethrough)
- rehype-highlight: Syntax highlighting for code blocks
- highlight.js: Code highlighting themes and language support

**Development Tools**
- tsx: TypeScript execution for development server
- esbuild: Production build bundling
- Replit-specific plugins for runtime error overlay, cartographer, and dev banner

**Session Management**
- connect-pg-simple: PostgreSQL session store for Express (configured but not actively used without database)

**Database & ORM**
- @neondatabase/serverless: Serverless PostgreSQL driver for Neon
- drizzle-orm: Type-safe ORM for database operations
- drizzle-zod: Integration between Drizzle and Zod for schema validation

**Form Handling**
- react-hook-form: Form state management
- @hookform/resolvers: Validation resolver integration
- Zod schemas for validation rules

**Date Utilities**
- date-fns: Modern date utility library for formatting and manipulation