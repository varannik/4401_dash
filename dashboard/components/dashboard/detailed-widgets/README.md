# Detailed Widgets Components

This directory contains the refactored detailed widget components for the monitoring dashboard, organized following TypeScript and React best practices.

## 📁 Project Structure

```
detailed-widgets/
├── shared/                    # Shared components
│   ├── DetailedMetric.tsx     # Reusable metric display component
│   ├── TimeSeriesChart.tsx    # Time-series chart component
│   └── index.ts               # Shared components exports
├── PlantOverviewDetails.tsx   # Plant overview detailed view
├── DACDetails.tsx             # DAC system detailed view
├── CommercialDetails.tsx      # Commercial metrics detailed view
├── EnergyDetails.tsx          # Energy system detailed view
├── BatteryDetails.tsx         # Battery system detailed view
├── MMRVDetails.tsx            # MMRV system detailed view
├── CarbonCertifiedDetails.tsx # Carbon certification detailed view
├── CarbonCreditsDetails.tsx   # Carbon credits detailed view
├── index.ts                   # Main exports
└── README.md                  # This file
```

## 🏗️ Architecture

### TypeScript Types
All types are centralized in `/types/widgets.ts`:
- `DetailedMetricProps` - Props for metric components
- `TimeSeriesChartProps` - Props for chart components
- `SystemAlert` - Alert configuration
- `SystemStatus` - System status information
- `MaintenanceInfo` - Maintenance schedule data
- `TimelineEntry` - Timeline events
- `MarketOpportunity` - Market data
- And more...

### Shared Components
Located in `/shared/` directory:
- **DetailedMetric**: Displays metrics with trend indicators
- **TimeSeriesChart**: Interactive bar chart for time-series data

### Individual Widget Components
Each widget has its own file with:
- Proper TypeScript typing
- Accessibility features (ARIA labels, semantic HTML)
- Error handling and edge cases
- Responsive design
- Clean, maintainable code structure

## 🔧 Usage

### Basic Import
```typescript
import { PlantOverviewDetails, DACDetails } from './detailed-widgets'
```

### Shared Components
```typescript
import { DetailedMetric, TimeSeriesChart } from './detailed-widgets/shared'
```

### Individual Components
```typescript
import { PlantOverviewDetails } from './detailed-widgets/PlantOverviewDetails'
```

## 🎨 Design Patterns

### Component Structure
Each component follows this pattern:
```typescript
// Constants and types
const MOCK_DATA = [...]
const CONFIG: ConfigType = {...}

// Sub-components (if needed)
const SubComponent: React.FC<Props> = ({ ... }) => (...)

// Main component
export const MainComponent: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="space-y-6">
        <h3>Section Title</h3>
        {/* Content */}
      </section>
    </div>
  )
}
```

### TypeScript Best Practices
1. **Strict typing**: All props and data structures are typed
2. **Interface segregation**: Types are specific to their usage
3. **Const assertions**: Used for readonly arrays and objects
4. **Generic components**: Where appropriate for reusability
5. **Proper exports**: Named exports for better tree-shaking

### React Best Practices
1. **Functional components**: Using React.FC for consistency
2. **Component composition**: Breaking down complex components
3. **Props drilling prevention**: Using proper component structure
4. **Performance**: Memoization where beneficial
5. **Accessibility**: Proper ARIA labels and semantic HTML

## 🔍 Features

### Accessibility
- ARIA labels for screen readers
- Semantic HTML structure
- Keyboard navigation support
- Focus management
- Color contrast compliance

### Performance
- Memoized calculations in charts
- Efficient re-renders
- Proper key props for lists
- Lazy loading ready

### Responsiveness
- Mobile-first design
- Flexible grid layouts
- Proper breakpoints
- Touch-friendly interfaces

## 📊 Data Flow

### Mock Data
Currently using mock data for demonstration:
```typescript
const MOCK_DATA = [3.1, 3.3, 3.2, 3.5, ...]
```

### Real Data Integration
To integrate with real APIs:
1. Replace mock data with API calls
2. Add loading states
3. Implement error handling
4. Add data validation

### State Management
Components are designed to work with:
- Props-based data flow
- Context providers
- State management libraries (Redux, Zustand)

## 🧪 Testing

### Test Structure
```typescript
// Component.test.tsx
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  })
  
  it('should handle props correctly', () => {
    // Test implementation
  })
})
```

### Testing Considerations
- Component rendering
- Props handling
- User interactions
- Accessibility features
- Error states

## 🚀 Future Enhancements

### Planned Features
1. **Real-time data**: WebSocket integration
2. **Advanced charts**: D3.js or Chart.js integration
3. **Export functionality**: PDF/CSV export
4. **Customization**: Theme switching
5. **Internationalization**: Multi-language support

### Performance Optimizations
1. **Virtual scrolling**: For large datasets
2. **Data streaming**: Real-time updates
3. **Caching**: API response caching
4. **Code splitting**: Dynamic imports

## 🔧 Development

### Adding New Widgets
1. Create new component in this directory
2. Add TypeScript types to `/types/widgets.ts`
3. Export from `index.ts`
4. Update main `DetailedWidgets.tsx`

### Modifying Existing Widgets
1. Update the specific component file
2. Add/modify types if needed
3. Update tests
4. Update documentation

## 📖 API Reference

### DetailedMetric Props
```typescript
interface DetailedMetricProps {
  label: string
  value: string | number
  unit?: string
  change?: number
  changeType?: 'increase' | 'decrease' | 'stable'
  icon?: ElementType
}
```

### TimeSeriesChart Props
```typescript
interface TimeSeriesChartProps {
  data: number[]
  label: string
  color: string
}
```

## 🤝 Contributing

1. Follow the established patterns
2. Add proper TypeScript types
3. Include accessibility features
4. Write comprehensive tests
5. Update documentation
6. Follow the code style guide

## 📝 License

This code is part of the monitoring dashboard project and follows the project's license terms. 