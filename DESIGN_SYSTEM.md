# SparkLive V2 Design System

## Overview
SparkLive V2 is a premium creator platform with an Apple VisionOS-inspired glassmorphism design language. The system combines spatial depth, floating layers, and gradient accents to create a futuristic yet elegant experience.

## Design Tokens

### Colors
```
--background: #07070d (Deep space)
--foreground: #f5f5f7 (White)
--glass-bg: rgba(255, 255, 255, 0.03)
--glass-border: rgba(255, 255, 255, 0.06)
--spark-pink: #ff007f
--spark-purple: #7c3aed
--spark-cyan: #06f7ff
--spark-blue: #3b82f6
```

### Gradients
- **Primary**: `linear-gradient(135deg, #ff007f, #7c3aed, #3b82f6)`
- **Warm**: `linear-gradient(135deg, #ff007f, #f43f5e, #f59e0b)`
- **Cool**: `linear-gradient(135deg, #7c3aed, #3b82f6, #06f7ff)`

### Typography
- Font: Inter (system-ui fallback)
- Weights: 400, 500, 600, 700, 800, 900
- Scale: 10px (badges) → 32px (headings)

### Spacing
- 4px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

### Border Radius
- xs: 6px, sm: 8px, md: 12px, lg: 16px, xl: 20px, 2xl: 24px, 3xl: 28px, 4xl: 32px

### Shadows
- **Floating**: `0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)`
- **Glow Pink**: `0 0 20px rgba(255,0,127,0.15), 0 0 40px rgba(255,0,127,0.05)`

### Transitions
- Spring: `cubic-bezier(0.16, 1, 0.3, 1)`
- Spring Bouncy: `cubic-bezier(0.34, 1.56, 0.64, 1)`

## Component Library

### Glass Surfaces
| Class | Usage |
|-------|-------|
| `.glass` | Default glass surface |
| `.glass-strong` | Stronger glass surface |
| `.glass-card` | Card with hover effect |
| `.glass-card-premium` | Premium card with gradient background |
| `.glass-input` | Input field |

### Buttons
| Class | Usage |
|-------|-------|
| `.btn-primary` | Primary gradient button |
| `.btn-secondary` | Glass button |
| `.btn-ghost` | Ghost button |
| `.btn-icon` | Icon button |
| `.btn-gradient-border` | Button with gradient border |

### Cards
| Class | Usage |
|-------|-------|
| `.card` | Standard card |
| `.card-hover` | Card with hover lift |
| `.card-premium` | Premium gradient card |
| `.card-floating` | Floating card with depth |

### Badges
| Class | Usage |
|-------|-------|
| `.badge-pink` | Pink badge |
| `.badge-green` | Green badge |
| `.badge-purple` | Purple badge |
| `.badge-cyan` | Cyan badge |
| `.badge-amber` | Amber badge |
| `.badge-red` | Red badge |
| `.badge-live` | Live indicator badge |

### Navigation
| Class | Usage |
|-------|-------|
| `.nav-item` | Navigation item |
| `.nav-item-active` | Active navigation item |
| `.nav-icon` | Navigation icon |
| `.nav-icon-active` | Active navigation icon |

### Tabs
| Class | Usage |
|-------|-------|
| `.tab-bar` | Tab bar container |
| `.tab-item` | Tab item |
| `.tab-item-active` | Active tab item |

### Forms
| Class | Usage |
|-------|-------|
| `.form-label` | Form label |
| `.form-input` | Text input |
| `.form-textarea` | Textarea |
| `.form-select` | Select dropdown |
| `.form-error` | Error message |
| `.form-success` | Success message |
| `.form-checkbox` | Checkbox |

### Status Indicators
| Class | Usage |
|-------|-------|
| `.status-dot-online` | Online status |
| `.status-dot-idle` | Idle status |
| `.status-dot-offline` | Offline status |
| `.status-dot-live` | Live status |

### Special Components
| Class | Usage |
|-------|-------|
| `.story-ring` | Story gradient ring |
| `.story-ring-viewed` | Viewed story ring |
| `.create-fab` | Create FAB button |
| `.chat-bubble-self` | Own chat bubble |
| `.chat-bubble-other` | Other chat bubble |
| `.live-indicator` | Live indicator |
| `.level-badge` | Creator level badge |
| `.verified-badge` | Verification badge |
| `.coin-display` | Spark Coin display |
| `.notification-dot` | Notification dot |
| `.notification-badge` | Notification count badge |

## Animations

### Float Animations
- `.animate-float` — 8s ease-in-out
- `.animate-float-delayed` — 10s ease-in-out
- `.animate-float-soft` — 6s ease-in-out

### Fade Animations
- `.animate-fade-in` — 0.5s
- `.animate-fade-in-up` — 0.6s
- `.animate-fade-in-down` — 0.6s
- `.animate-fade-in-left` — 0.5s
- `.animate-fade-in-right` — 0.5s
- `.animate-fade-in-scale` — 0.5s

### Scale & Slide
- `.animate-scale-in` — 0.4s
- `.animate-slide-up` — 0.8s
- `.animate-slide-down` — 0.8s
- `.animate-slide-in-left` — 0.5s
- `.animate-slide-in-right` — 0.5s

### Special Effects
- `.animate-pulse-glow` — Glow pulse
- `.animate-aurora` — Aurora movement
- `.animate-morph` — Organic shape shift
- `.animate-heartbeat` — Heartbeat
- `.animate-gradient-shift` — Gradient animation
- `.animate-text-reveal` — Text reveal
- `.animate-notification-in` — Notification slide in
- `.animate-notification-out` — Notification slide out

### Delay Classes
- `.delay-100` through `.delay-800` — Staggered animation delays

## Page Architecture

### Information Architecture
```
Home → Discover → Reels → Live → Create → Messages → Notifications → Profile → Wallet
```

### Layout Structure
- **Desktop**: 280px sidebar + main content area
- **Mobile**: Full-width + bottom navigation bar
- **Tablet**: Full-width + bottom navigation bar

### Page Templates
- `page-container` — max-w-7xl centered
- `page-container-narrow` — max-w-5xl centered
- `page-container-wide` — max-w-[1400px] centered

## Responsive Breakpoints
- Mobile: < 1024px (lg breakpoint)
- Desktop: ≥ 1024px

## Accessibility
- Focus-visible ring with glow effect
- ARIA labels on navigation items
- Semantic HTML structure
- Keyboard navigation support (Reels: Arrow Up/Down, Space, M)
- High contrast text (white on dark backgrounds)
- Proper heading hierarchy