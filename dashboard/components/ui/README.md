# ExpandableWidget Component

A reusable base component that provides smooth full-screen expansion functionality for any widget content.

## Features

✨ **Smooth Animation**: 0.8s cubic-bezier transition for natural expansion  
🖥️ **Full-Screen Coverage**: Expands to cover entire screen below header menu  
🎯 **Proper Z-Index**: Stays below header menu (z-25) while above other content  
🌅 **Backdrop Overlay**: Semi-transparent backdrop with click-to-close  
♿ **Accessibility**: Full ARIA support, keyboard navigation, screen reader friendly  
📱 **Responsive**: Works perfectly on all screen sizes  
🎨 **Customizable**: Configurable background opacity, styling, and behavior  

## Installation

```tsx
import { ExpandableWidget } from '@/components/ui/ExpandableWidget'
```

## Basic Usage

```tsx
import { useState } from 'react'
import { ExpandableWidget } from '@/components/ui/ExpandableWidget'
import { ChartIcon } from 'lucide-react'

function MyDashboard() {
  const [expanded, setExpanded] = useState(false)

  return (
    <ExpandableWidget
      title="Sales Analytics"
      icon={ChartIcon}
      isExpanded={expanded}
      onClick={() => setExpanded(true)}
      onZoomOut={() => setExpanded(false)}
      expandedContent={<DetailedAnalytics />}
    >
      <SummaryView />
    </ExpandableWidget>
  )
}
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Widget title displayed in header |
| `icon` | `React.ElementType` | `undefined` | Optional icon component (from lucide-react, etc.) |
| `children` | `React.ReactNode` | **required** | Summary content shown in collapsed state |
| `expandedContent` | `React.ReactNode` | `undefined` | Detailed content shown in expanded state |
| `className` | `string` | `""` | Additional CSS classes for styling |
| `onClick` | `() => void` | `undefined` | Handler for widget click (expansion trigger) |
| `isExpanded` | `boolean` | `false` | Whether widget is currently expanded |
| `onZoomOut` | `() => void` | `undefined` | Handler for zoom out/collapse |
| `clickable` | `boolean` | `true` | Whether widget responds to clicks |
| `backgroundOpacity` | `number` | `30` | Backdrop opacity (0-100) |

## Advanced Usage

### Multiple Widgets with State Management

```tsx
function Dashboard() {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null)

  const expandWidget = (id: string) => setExpandedWidget(id)
  const closeWidget = () => setExpandedWidget(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ExpandableWidget
        title="Revenue"
        icon={DollarSign}
        isExpanded={expandedWidget === 'revenue'}
        onClick={() => expandWidget('revenue')}
        onZoomOut={closeWidget}
        expandedContent={<RevenueDetails />}
      >
        <RevenueSummary />
      </ExpandableWidget>

      <ExpandableWidget
        title="Users"
        icon={Users}
        isExpanded={expandedWidget === 'users'}
        onClick={() => expandWidget('users')}
        onZoomOut={closeWidget}
        expandedContent={<UserDetails />}
      >
        <UserSummary />
      </ExpandableWidget>
    </div>
  )
}
```

### Custom Styling

```tsx
<ExpandableWidget
  title="Custom Widget"
  className="bg-gradient-to-r from-blue-500 to-purple-600"
  backgroundOpacity={40}
  clickable={true}
  expandedContent={<CustomContent />}
>
  <CustomSummary />
</ExpandableWidget>
```

### Read-Only Widget (Non-Clickable)

```tsx
<ExpandableWidget
  title="Status Display"
  icon={Info}
  clickable={false}
>
  <StatusInfo />
</ExpandableWidget>
```

## Accessibility Features

- **ARIA Support**: `aria-expanded`, `aria-label` attributes
- **Keyboard Navigation**: Tab focus, Enter/Space activation  
- **Screen Reader**: Proper role attributes and descriptions
- **Focus Management**: Proper focus handling during expansion

## Animation Details

- **Duration**: 0.8 seconds
- **Easing**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for natural motion
- **Transform Origin**: Center center for balanced scaling
- **Z-Index Hierarchy**: 
  - Header: `z-40`
  - Expanded Widget: `z-25` 
  - Backdrop: `z-20`

## Layout Integration

The component is designed to work within CSS Grid or Flexbox layouts:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <ExpandableWidget className="lg:col-span-1" {...props} />
  <ExpandableWidget className="lg:col-span-2" {...props} />
  <ExpandableWidget className="xl:col-span-1" {...props} />
</div>
```

## Best Practices

1. **Content Organization**: Keep summary content concise, detailed content comprehensive
2. **State Management**: Use a single expanded state to prevent multiple widgets open simultaneously
3. **Performance**: Use React.memo for expensive expanded content
4. **Loading States**: Include loading indicators in expanded content for async data

## Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## TypeScript

Full TypeScript support with comprehensive type definitions:

```tsx
import { ExpandableWidgetProps } from '@/components/ui/ExpandableWidget'

const MyWidget: React.FC<ExpandableWidgetProps> = (props) => {
  // Fully typed props
}
``` 