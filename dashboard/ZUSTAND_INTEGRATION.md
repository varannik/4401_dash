# Zustand State Management Integration

This document explains the Zustand state management setup in the Next.js application.

## Overview

Zustand is a lightweight state management library that provides a simple and powerful way to manage application state. Our implementation includes:

- **Auth Store**: Manages authentication state and user data
- **UI Store**: Handles UI state like theme, notifications, modals, and sidebar
- **Data Store**: Manages application data with CRUD operations and filtering

## Store Architecture

### Auth Store (`stores/auth-store.ts`)

Manages authentication state and syncs with NextAuth:

```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken?: string
  idToken?: string
  
  // Actions
  setUser: (user: User | null) => void
  setTokens: (accessToken?: string, idToken?: string) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  reset: () => void
}
```

**Features:**
- Persists user data and authentication status
- Syncs with NextAuth session
- Stores access and ID tokens
- DevTools integration

### UI Store (`stores/ui-store.ts`)

Manages UI state and user preferences:

```typescript
interface UIState {
  theme: 'light' | 'dark' | 'system'
  globalLoading: boolean
  loadingStates: Record<string, boolean>
  notifications: Notification[]
  modals: Modal[]
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Actions for managing UI state
}
```

**Features:**
- Theme management with persistence
- Global and scoped loading states
- Notification system with auto-dismiss
- Modal management
- Sidebar state control

### Data Store (`stores/data-store.ts`)

Manages application data with full CRUD operations:

```typescript
interface DataState {
  items: DataItem[]
  selectedItem: DataItem | null
  searchQuery: string
  filters: FilterOptions
  currentPage: number
  itemsPerPage: number
  totalItems: number
  
  // CRUD actions and filtering
}
```

**Features:**
- CRUD operations for data items
- Search and filtering capabilities
- Pagination support
- Loading states for different operations

## Custom Hooks

### useNotifications (`hooks/use-notifications.ts`)

Provides easy access to the notification system:

```typescript
const { showSuccess, showError, showWarning, showInfo } = useNotifications()

// Usage
showSuccess('Success!', 'Operation completed successfully')
showError('Error!', 'Something went wrong')
```

### useLoading (`hooks/use-loading.ts`)

Manages loading states with automatic cleanup:

```typescript
const { isLoading, withLoading } = useLoading('my-operation')

// Usage
await withLoading(async () => {
  // Your async operation
  await api.call()
})
```

## Components

### ZustandProvider (`components/providers/zustand-provider.tsx`)

Initializes stores and syncs with NextAuth:

- Automatically syncs NextAuth session with auth store
- Manages global loading states
- Provides initialization logic

### Notifications (`components/ui/notifications.tsx`)

Displays notifications from the UI store:

- Auto-positioning in top-right corner
- Different styles for different notification types
- Auto-dismiss functionality
- Manual dismiss option

## Usage Examples

### Basic Store Usage

```typescript
import { useAuthStore, useUIStore, useDataStore } from '@/stores'

function MyComponent() {
  const { user, isAuthenticated } = useAuthStore()
  const { theme, setTheme } = useUIStore()
  const { items, addItem } = useDataStore()
  
  // Use store data and actions
}
```

### Using Custom Hooks

```typescript
import { useNotifications } from '@/hooks/use-notifications'
import { useLoading } from '@/hooks/use-loading'

function MyComponent() {
  const { showSuccess, showError } = useNotifications()
  const { isLoading, withLoading } = useLoading('save-data')
  
  const handleSave = async () => {
    try {
      await withLoading(async () => {
        await saveData()
        showSuccess('Saved!', 'Data saved successfully')
      })
    } catch (error) {
      showError('Error!', 'Failed to save data')
    }
  }
}
```

### Protected Routes with Store Data

```typescript
import ProtectedRoute from '@/components/auth/protected-route'
import { useAuthStore } from '@/stores'

function ProtectedPage() {
  const { user } = useAuthStore()
  
  return (
    <ProtectedRoute>
      <div>Welcome, {user?.name}!</div>
    </ProtectedRoute>
  )
}
```

## Integration with NextAuth

The Zustand stores are automatically synced with NextAuth:

1. **ZustandProvider** listens to NextAuth session changes
2. Updates auth store when session changes
3. Clears auth store when user signs out
4. Persists user data across browser sessions

## Persistence

Certain store data is persisted to localStorage:

- **Auth Store**: User data and authentication status
- **UI Store**: Theme preference and sidebar state
- **Data Store**: No persistence (session-only)

## DevTools Integration

All stores include Redux DevTools integration for debugging:

- View store state in real-time
- Track action dispatches
- Time-travel debugging
- Action replay

## Best Practices

### 1. Use Custom Hooks

Prefer custom hooks over direct store access:

```typescript
// ✅ Good
const { showSuccess } = useNotifications()

// ❌ Avoid
const { addNotification } = useUIStore()
```

### 2. Scoped Loading States

Use scoped loading states for specific operations:

```typescript
// ✅ Good - scoped loading
const { isLoading } = useLoading('save-user')

// ❌ Avoid - global loading for specific operations
const { globalLoading } = useUIStore()
```

### 3. Error Handling

Always handle errors and show appropriate notifications:

```typescript
try {
  await withLoading(async () => {
    await riskyOperation()
    showSuccess('Success!')
  })
} catch (error) {
  showError('Error!', error.message)
}
```

### 4. Store Separation

Keep stores focused on their specific domains:

- **Auth Store**: Only authentication-related state
- **UI Store**: Only UI and user preference state
- **Data Store**: Only application data

## Testing

Stores can be easily tested by importing them directly:

```typescript
import { useAuthStore } from '@/stores'

test('auth store login', () => {
  const { setUser } = useAuthStore.getState()
  
  setUser({ id: '1', name: 'Test User' })
  
  expect(useAuthStore.getState().isAuthenticated).toBe(true)
})
```

## Performance Considerations

- Stores use shallow comparison by default
- Use selectors to prevent unnecessary re-renders
- Persist only essential data to localStorage
- Loading states prevent UI blocking

## Demo Page

Visit `/store-demo` to see all stores in action:

- Auth store integration with NextAuth
- UI store theme and notification management
- Data store CRUD operations
- Custom hooks usage examples 