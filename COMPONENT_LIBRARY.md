# GlenKeos Component Library

**Fortune-500 Grade Design System**  
Enterprise-ready, accessible, internationally compliant component library for the GlenKeos ecosystem.

---

## Overview

The GlenKeos Component Library is a comprehensive, enterprise-grade design system that powers:

- **Customer Application** - Chic on Chain restaurant ordering
- **Corporate Site** - GlenKeos Holdings public presence  
- **Internal Portal** - COC Command + Rusty Link Ops
- **Driver Application** - Delivery operations
- **Future Systems** - Scalable foundation for all GlenKeos products

---

## Design Tokens

All components use a unified token system defined in `/src/styles/theme.css`:

### Spacing (8px Grid System)
```css
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
```

### Typography
```css
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-md: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;
--font-size-4xl: 36px;

--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Semantic Colors
```css
--color-success: #2E7D32;
--color-warning: #ED6C02;
--color-error: #D32F2F;
--color-info: #0288D1;
```

### B1/B2/B3 Brand System

**B1 - Corporate Luxury (Baseline)**
- `--b1-black-marble`, `--b1-obsidian`, `--b1-obsidian-panel`
- `--b1-gold-trim`, `--b1-gold-minimal`
- `--b1-white-space`, `--b1-neutral-gray`

**B2 - Greek Royal (Visual Accent)**
- `--b2-laurel-gold`, `--b2-gold-fire`
- `--b2-marble-white`, `--b2-royal-bronze`

**B3 - Ultra-Modern Royal (Premium)**
- `--b3-pure-black`, `--b3-pure-white`
- `--b3-gold-micro`, `--b3-glass-white`

---

## Core Components

### Button
Enterprise-grade button with variants and loading states.

```tsx
import { Button } from "@/app/components";

<Button variant="primary" size="md">
  Order Now
</Button>

<Button variant="secondary" leftIcon={<Icon />} isLoading>
  Processing
</Button>
```

**Variants:** `primary`, `secondary`, `tertiary`, `destructive`, `icon`  
**Sizes:** `sm`, `md`, `lg`  
**States:** Default, hover, active, focus, disabled, loading

---

### Input
Fully accessible input with label, helper text, and error states.

```tsx
import { Input } from "@/app/components";

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  helperText="We'll never share your email"
  errorText="Invalid email format"
  leftIcon={<MailIcon />}
/>
```

**Variants:** Text, password, email, number, search  
**States:** Default, focus, error, disabled, read-only

---

### Card
Flexible container for content grouping.

```tsx
import { Card } from "@/app/components";

<Card
  variant="elevated"
  header={<h3>Order Summary</h3>}
  footer={<Button>Checkout</Button>}
>
  Card content here
</Card>
```

**Variants:** `basic`, `elevated`, `interactive`, `selectable`

---

### Modal
Accessible modal with focus trap and ESC support.

```tsx
import { Modal } from "@/app/components";

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  size="md"
  footer={<Button>Confirm</Button>}
>
  Modal content
</Modal>
```

**Sizes:** `sm`, `md`, `lg`, `xl`

---

### Alert
Semantic alerts for system feedback.

```tsx
import { Alert } from "@/app/components";

<Alert variant="success" title="Success" isDismissible>
  Your order has been placed successfully.
</Alert>
```

**Variants:** `success`, `warning`, `error`, `info`

---

### Badge
Status indicators and labels.

```tsx
import { Badge } from "@/app/components";

<Badge variant="solid" color="success">
  ACTIVE
</Badge>
```

**Variants:** `solid`, `subtle`, `outline`  
**Colors:** `success`, `warning`, `error`, `info`, `neutral`, `primary`

---

### Tag
Removable labels and filters.

```tsx
import { Tag } from "@/app/components";

<Tag variant="removable" icon={<Icon />} onRemove={handleRemove}>
  Filter Name
</Tag>
```

---

### Avatar
User profile images with fallbacks.

```tsx
import { Avatar } from "@/app/components";

<Avatar variant="circle" size="md" src="/avatar.jpg" alt="User" />
<Avatar variant="square" initials="JD" />
```

**Variants:** `circle`, `square`  
**Sizes:** `sm`, `md`, `lg`, `xl`

---

### Surface
Foundation container with elevation variants.

```tsx
import { Surface } from "@/app/components";

<Surface variant="elevated" padding="lg">
  Content
</Surface>
```

**Variants:** `flat`, `elevated`, `inset`  
**Padding:** `none`, `sm`, `md`, `lg`

---

## Feedback Components

### Toast
Ephemeral notifications.

```tsx
import { Toast, ToastContainer } from "@/app/components";

<ToastContainer toasts={toasts} />
```

**Variants:** `success`, `warning`, `error`, `info`  
Auto-dismissible, swipe-away support

---

### Loader
Activity indicators for loading states.

```tsx
import { Loader } from "@/app/components";

<Loader variant="spinner" size="md" label="Loading..." />
<Loader variant="bar" progress={75} />
<Loader variant="dots" />
```

**Variants:** `spinner`, `bar`, `dots`, `inline`

---

### Skeleton
Placeholder UI for loading content.

```tsx
import { Skeleton } from "@/app/components";

<Skeleton variant="line" count={3} />
<Skeleton variant="card" />
<Skeleton variant="table" count={5} />
```

**Variants:** `line`, `block`, `avatar`, `card`, `table`

---

### EmptyState
Empty data placeholders with actions.

```tsx
import { EmptyState } from "@/app/components";

<EmptyState
  title="No orders yet"
  description="Start by creating your first order"
  actionLabel="Create Order"
  onAction={handleCreate}
/>
```

---

### ErrorState
Error messages with retry actions.

```tsx
import { ErrorState } from "@/app/components";

<ErrorState
  title="Failed to load"
  message="Unable to fetch data"
  onRetry={handleRetry}
  supportLink="/support"
/>
```

---

## Data Components

### Table
Enterprise-grade data tables with sorting.

```tsx
import { Table } from "@/app/components";

<Table
  columns={[
    { key: 'id', header: 'Order ID', sortable: true },
    { key: 'status', header: 'Status', render: (item) => <Badge>{item.status}</Badge> }
  ]}
  data={orders}
  variant="striped"
  onRowClick={handleRowClick}
/>
```

**Variants:** `standard`, `compact`, `striped`, `bordered`

---

### List
Structured lists with leading/trailing content.

```tsx
import { List, ListItem } from "@/app/components";

<List variant="interactive">
  <ListItem
    leadingIcon={<Icon />}
    title="Item Title"
    subtitle="Additional info"
    trailingAction={<Button>Action</Button>}
    onClick={handleClick}
  />
</List>
```

---

### MetricBlock
KPI display blocks.

```tsx
import { MetricBlock } from "@/app/components";

<MetricBlock
  label="Total Revenue"
  value="$47,892"
  trend={{ value: "+8.7%", direction: "up" }}
  icon={<DollarSign />}
  size="md"
/>
```

---

### KPITile
Comprehensive KPI tiles with sparklines.

```tsx
import { KPITile } from "@/app/components";

<KPITile
  title="Orders"
  value="1,247"
  trend={{ value: "+12.3%", direction: "up" }}
  sparkline={[45, 52, 48, 61, 55, 67, 72]}
  status={{ label: "HEALTHY", color: "success" }}
/>
```

---

### StatusIndicator
Visual status indicators.

```tsx
import { StatusIndicator } from "@/app/components";

<StatusIndicator variant="dot-label" color="success" label="Online" />
<StatusIndicator variant="icon" icon={<Icon />} label="Active" />
```

---

## Navigation Components

### Tabs
Multi-variant tab navigation.

```tsx
import { Tabs } from "@/app/components";

<Tabs
  tabs={[
    { id: 'orders', label: 'Orders', icon: <Icon />, content: <Orders /> },
    { id: 'settings', label: 'Settings', content: <Settings /> }
  ]}
  variant="underline"
  onChange={handleTabChange}
/>
```

**Variants:** `underline`, `filled`, `segmented`

---

### Breadcrumbs
Hierarchical navigation.

```tsx
import { Breadcrumbs } from "@/app/components";

<Breadcrumbs
  items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Orders', href: '/orders' },
    { label: 'Order #12345' }
  ]}
  showHome
/>
```

---

## Operational Components

### OrderCard
Order management cards for internal ops.

```tsx
import { OrderCard } from "@/app/components";

<OrderCard
  orderId="ORD-12847"
  customerName="Sarah M."
  itemsCount={3}
  status="in-progress"
  priority="normal"
  prepTime="8 min"
  store="Downtown Center"
  complianceFlags={0}
  variant="detailed"
  onClick={handleClick}
/>
```

**Status:** `pending`, `in-progress`, `ready`, `complete`, `delayed`  
**Priority:** `normal`, `rush`, `critical`

---

### KDSTile
Kitchen Display System tiles.

```tsx
import { KDSTile } from "@/app/components";

<KDSTile
  itemName="Classic Fried Chicken"
  quantity={2}
  orderId="ORD-12847"
  station="Fry Station"
  timer="3:24"
  status="in-progress"
  modifiers={["Extra Crispy", "No Salt"]}
/>
```

---

### InventoryBlock
Inventory tracking with reorder alerts.

```tsx
import { InventoryBlock } from "@/app/components";

<InventoryBlock
  itemName="Chicken Breast"
  sku="CHK-001"
  currentStock={45}
  unit="lbs"
  threshold={50}
  status="low"
  location="Downtown Center"
  onReorder={handleReorder}
  variant="detailed"
/>
```

**Status:** `good`, `low`, `critical`, `out-of-stock`

---

### ComplianceBlock
COC Command compliance monitoring.

```tsx
import { ComplianceBlock } from "@/app/components";

<ComplianceBlock
  flagType="Food Safety"
  severity="high"
  description="Temperature threshold exceeded"
  linkedOrderId="ORD-12847"
  linkedPolicy="POL-FS-001"
  status="in-review"
  variant="detailed"
  onResolve={handleResolve}
  onEscalate={handleEscalate}
/>
```

**Severity:** `low`, `medium`, `high`, `critical`  
**Status:** `pending`, `in-review`, `resolved`, `escalated`

---

## Accessibility

All components meet **WCAG 2.1 Level AA** requirements:

- ✅ Keyboard navigation support
- ✅ Screen reader compatibility (ARIA labels)
- ✅ Focus states with visible rings
- ✅ High contrast mode support
- ✅ Reduced motion variants
- ✅ Semantic HTML structure

---

## Internationalization

All components support:

- ✅ LTR and RTL layouts
- ✅ Dynamic text length handling
- ✅ Locale-aware number formatting
- ✅ Multi-language labels
- ✅ Unicode character support

---

## Component Governance

All components are:

- ✅ Versioned and immutable
- ✅ Approved by COC Command
- ✅ Documented with usage examples
- ✅ Tested for accessibility
- ✅ Brand-aligned (B1/B2/B3)
- ✅ Zero mythology in operational copy
- ✅ Enterprise-ready

---

## Usage

Import components from the centralized index:

```tsx
import {
  Button,
  Input,
  Card,
  Modal,
  Alert,
  Badge,
  Table,
  Toast,
  OrderCard,
  KDSTile
} from "@/app/components";
```

Or import specific categories:

```tsx
import { Button, Input, Card } from "@/app/components/core";
import { Toast, Loader } from "@/app/components/feedback";
import { Table, List } from "@/app/components/data";
```

---

## Architecture

```
src/app/components/
├── core/              # Atomic components (Button, Input, Card, Modal, Alert, Badge, Tag, Avatar, Surface)
├── feedback/          # System feedback (Toast, Loader, Skeleton, EmptyState, ErrorState)
├── data/              # Data display (Table, List, MetricBlock, KPITile, StatusIndicator)
├── navigation/        # Navigation (Tabs, Breadcrumbs)
├── operational/       # Domain-specific (OrderCard, KDSTile, InventoryBlock, ComplianceBlock)
└── index.ts           # Central export
```

---

## Design Principles

1. **Atomic** - Components are self-contained and reusable
2. **Accessible** - WCAG 2.1 AA compliance mandatory
3. **Scalable** - Built for enterprise-scale applications
4. **Brand-aligned** - Strict B1/B2/B3 token adherence
5. **Internationally compliant** - RTL, i18n, locale support
6. **Zero drift** - Design token governance prevents inconsistency
7. **Zero mythology** - Operational copy is B1 neutral

---

**Version:** 1.0.0  
**Maintained by:** GlenKeos COC Command  
**Compliance Status:** ✅ WCAG 2.1 AA, ISO 31000, NIST CSF
