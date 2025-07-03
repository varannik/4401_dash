# Dashboard Layout Component

This document explains the persistent dashboard shell layout implementation.

## Overview

The `DashboardLayout` component provides a consistent navigation structure across all dashboard pages, featuring:

- **Persistent Sidebar Navigation**: Collapsible sidebar with navigation items
- **Responsive Design**: Mobile-friendly with overlay sidebar
- **Header with Search**: Top header with search functionality and user actions
- **Zustand Integration**: Uses UI store for sidebar state management
- **User Information**: Displays authenticated user info in sidebar

## Features

### Sidebar Navigation

The sidebar includes:
- **Logo and Branding**: Dashboard logo with collapse/expand functionality
- **Navigation Items**: Dashboard, Analytics, Projects, Team, Settings, Store Demo
- **Active State Indication**: Visual highlighting of current page
- **Badge Support**: Notification badges on navigation items
- **User Profile**: User avatar and info at bottom of sidebar
- **Collapsible**: Can be collapsed to icon-only view

### Responsive Behavior

- **Desktop**: Sidebar is always visible and can be collapsed
- **Mobile**: Sidebar slides in as overlay with backdrop
- **Smooth Transitions**: CSS transitions for all state changes

### Integration with Zustand

The layout integrates with the UI store for:
- `sidebarOpen`: Controls sidebar visibility on mobile
- `sidebarCollapsed`: Controls sidebar collapsed state
- `toggleSidebar()`: Toggle sidebar visibility
- `toggleSidebarCollapse()`: Toggle sidebar collapse state

## Usage

### Basic Implementation

```tsx
import { DashboardLayout } from "@/components/layout"
import ProtectedRoute from "@/components/auth/protected-route"

export default function MyPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Your page content */}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
```

### Navigation Configuration

Navigation items are configured in the `DashboardLayout` component:

```tsx
const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    name: 'Projects',
    href: '/dashboard/projects',
    icon: <ProjectsIcon />,
    badge: '3', // Optional badge
  },
  // ... more items
]
```

## File Structure

```
components/
├── layout/
│   ├── dashboard-layout.tsx    # Main layout component
│   └── index.ts               # Export file
```

## Components Included

### Header Features

- **Mobile Menu Button**: Toggles sidebar on mobile devices
- **Page Title**: Dynamically shows current page name
- **Search Bar**: Global search functionality (desktop only)
- **Notifications**: Notification bell icon
- **Auth Button**: Sign in/out functionality

### Sidebar Features

- **Logo Section**: Branding with collapse button
- **Navigation Menu**: List of navigation items with icons
- **Active State**: Visual indication of current page
- **User Profile**: User avatar, name, and email at bottom
- **Responsive**: Hides/shows based on screen size

## Styling

The layout uses Tailwind CSS with:
- **Consistent Spacing**: Standardized padding and margins
- **Color Scheme**: Blue primary colors with gray neutrals
- **Shadows**: Subtle shadows for depth
- **Transitions**: Smooth animations for state changes
- **Focus States**: Accessibility-friendly focus indicators

## Integration Points

### Authentication

- Uses `useAuthStore` for user information
- Displays user avatar and details in sidebar
- Integrates with `AuthButton` component

### Notifications

- Uses `useNotifications` for user feedback
- Shows navigation notifications when appropriate

### State Management

- Sidebar state persisted in Zustand UI store
- Responsive behavior handled automatically
- State synced across all dashboard pages

## Example Pages

The following pages demonstrate the layout usage:

1. **Dashboard** (`/dashboard`): Main dashboard with user info
2. **Analytics** (`/dashboard/analytics`): Analytics overview with charts
3. **Projects** (`/dashboard/projects`): Project management interface
4. **Team** (`/dashboard/team`): Team member management
5. **Settings** (`/dashboard/settings`): User preferences and settings
6. **Store Demo** (`/store-demo`): Zustand store demonstration

## Customization

### Adding New Navigation Items

1. Add to the `navigation` array in `DashboardLayout`
2. Include appropriate icon and href
3. Optionally add badge for notifications

### Modifying Sidebar Behavior

The sidebar behavior can be customized through the UI store:

```tsx
const { sidebarOpen, sidebarCollapsed, toggleSidebar } = useUIStore()
```

### Styling Customization

Modify the Tailwind classes in `DashboardLayout` component:
- Colors: Change `bg-blue-600` to your brand colors
- Spacing: Adjust padding and margins
- Shadows: Modify shadow classes for different depth

## Accessibility

The layout includes:
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper heading hierarchy and landmarks

## Performance

- **Lazy Loading**: Navigation icons are inline SVGs for performance
- **Minimal Re-renders**: Zustand prevents unnecessary re-renders
- **Efficient Transitions**: CSS transitions instead of JavaScript animations
- **Responsive Images**: User avatars with proper sizing

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Responsive**: Works on all screen sizes from mobile to desktop