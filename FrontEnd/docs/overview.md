# WasteXperts Application Overview

This document provides a comprehensive overview of the WasteXperts application, a sustainable construction waste management platform built with Svelte 5 using Runes mode, TailwindCSS 4.x, and DaisyUI 5.x.

## Application Purpose

WasteXperts is a specialized construction waste management and reporting application designed to help construction companies track, manage, and optimize their waste handling processes while meeting sustainability goals. The application facilitates:

- Site-specific waste tracking and material management
- Team coordination and role assignments
- Comprehensive reporting and sustainability analytics
- Document management and organization
- Environmental impact tracking and carbon footprint calculation
- Real-time data visualization and reporting
- Compliance tracking for waste diversion regulations

## Application Structure

The application follows a SvelteKit-based architecture with the following main sections:

### Navigation System

1. **Primary Navigation (Sidebar)**:
   - Home/Dashboard
   - Sites
   - Team
   - Company
   - Settings

2. **Contextual Navigation**:
   - Site-specific: Overview, Materials, Waste, Reports, Documents
   - Material-specific: Details, Usage, Environmental Impact
   - Report-specific: Summary, Detailed, Export

### Routes Structure

```
/                       # Home/Dashboard
/sites                  # Sites overview
/sites/[siteId]/        # Dynamic routes for specific sites with sub-routes:
  - details
  - materials
  - waste
  - logistics
  - embedded-carbon
  - add-document
/team                   # Team management
/company                # Company information
/settings              # User settings
/api/documents/upload  # Document processing
```

## Code Organization

The codebase is organized according to SvelteKit conventions:

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Shared UI elements (buttons, cards, etc.)
│   │   ├── dashboard/  # Dashboard-specific components
│   │   ├── sites/      # Site management components
│   │   └── layout/     # Layout components (header, sidebar)
│   ├── server/         # Server-only code
│   │   ├── db.ts       # Database connection and utilities
│   │   └── auth.ts     # Authentication utilities
│   ├── utils/          # Utility functions
│   │   ├── formatting.ts # Data formatting utilities
│   │   ├── validation.ts # Input validation
│   │   └── calculations.ts # Business logic calculations
│   ├── stores/         # Svelte stores for state management
│   │   ├── auth.ts     # Authentication state
│   │   ├── theme.ts    # Theme preferences
│   │   └── filters.ts  # Filter state for lists
│   └── types/          # TypeScript interfaces
│       ├── site.ts     # Site-related types
│       ├── material.ts # Material-related types
│       └── user.ts     # User and authentication types
├── routes/
│   ├── +layout.svelte  # Root layout with sidebar
│   ├── +page.svelte    # Dashboard page
│   ├── sites/          # Site-related pages
│   │   ├── +page.svelte
│   │   ├── +page.server.ts
│   │   └── [id]/       # Site-specific routes
│   ├── materials/      # Material management pages
│   ├── reports/        # Reporting pages
│   ├── team/           # Team management pages
│   ├── settings/       # Settings pages
│   └── api/            # API endpoints
└── app.css             # Global styles
```

## Data Models

The application uses TypeScript interfaces to define its data structures. Key data models include:

### Site Management
- **Site**: Core site information including location, status, and project details
- **SiteLocation**: Geographic information about site location
- **SiteStatus**: Current status of the site (active, completed, on hold)

### Materials and Waste
- **Material**: Material information including type, properties, and environmental impact
- **WasteCategory**: Classification of waste types (recyclable, landfill, hazardous)
- **RecyclingRate**: Tracking of recycling percentages by material and site
- **MaterialUsage**: Record of material usage on specific sites

### Team and Users
- **User**: User account information and authentication details
- **Role**: User role definitions (admin, manager, staff, viewer)
- **Permission**: Specific permissions assigned to roles
- **TeamMember**: Assignment of users to specific sites with roles

### Environmental Data
- **CarbonMetric**: Carbon footprint calculations by material and activity
- **WaterUsage**: Water consumption tracking
- **EnergyConsumption**: Energy usage monitoring

## Key Features

### Dashboard
- Site overview and key metrics
- Project status tracking
- Recent activity monitoring
- Environmental impact summary

### Sites Management
- Site creation and management
- Construction stage tracking
- Material ordering and tracking
- Waste management and logistics
- Document handling and processing
- Embedded carbon calculations

### Team Management
- Contractor company management
- Staff assignment and roles
- Site resource management
- Activity logging

### Company Information
- Company-wide metrics
- Project portfolio overview
- Sustainability reporting
- Compliance tracking

### Settings
- User profile management
- System preferences
- Access control settings

## Technical Implementation

The application is built using:

- **Frontend Framework**: SvelteKit 2.16.x with Svelte 5.x Runes mode
- **Styling**: TailwindCSS 4.0.8 with DaisyUI 5.0.0-beta.8 components
- **Routing**: SvelteKit file-based routing
- **State Management**: 
  - Svelte stores for global state
  - Runes ($state, $derived, $effect) for component-level reactivity
  - Props with the $props() syntax
- **Data Visualization**: Chart.js 4.4.x for graphs and metrics
- **API Integration**: Built-in API routes with SvelteKit
- **Database**: PostgreSQL with postgres.js 3.4.x client
- **Build Tools**: Vite 6.x, ESLint 9.18.x, Prettier 3.4.x
- **Runtime**: Node.js 20+

## Database Structure

The application uses PostgreSQL with the following core tables:

- `material_densities`: Reference data for material density calculations
- `projects`: Core project information
- `project_stages`: Different construction stages
- `ordered_items`: Materials ordered for projects
- `waste_providers`: External waste management providers
- `contractor_companies`: Construction companies involved in projects
- `contractor_staff`: Individual staff members
- `material_carbon_factors`: Carbon factors for different materials

Views for simplified data access:
- `sites`: Combined project information
- `site_ordered_items`: Materials linked to specific sites
- `site_material_diversion_targets`: Diversion targets by site
- `contractors`: Simplified contractor information

## Data Access Patterns

The application uses a standardized approach for database access:

### SQL Query Pattern

```typescript
// Example of a database query with type safety
const sites = await sql<Site[]>`
  SELECT * FROM sites 
  WHERE status = ${status}
  ORDER BY created_at DESC
`;
```

### Error Handling

```typescript
try {
  const result = await sql`INSERT INTO sites (name, location) VALUES (${name}, ${location})`;
  return { success: true, data: result };
} catch (error) {
  console.error('Database error:', error);
  throw error(500, 'Failed to create site');
}
```

## Component Design Patterns

### Composition Pattern

```svelte
<!-- Parent component -->
<Card>
  <svelte:fragment slot="header">
    <h2>Site Details</h2>
  </svelte:fragment>
  
  <div>Content goes here</div>
  
  <svelte:fragment slot="footer">
    <Button variant="primary">Save</Button>
  </svelte:fragment>
</Card>
```

### Props Pattern

```svelte
<script>
  // Using Svelte 5 $props() syntax
  let { title, onAction } = $props();
</script>
```

### State Management

```svelte
<script>
  // Local state
  let count = $state(0);
  
  // Derived state
  let doubled = $derived(count * 2);
  
  // Effects
  $effect(() => {
    console.log(`Count changed to ${count}`);
  });
</script>
```

## Development Practices

When working on this application:

1. Use TypeScript for all new code with proper interfaces and types
2. Follow the Svelte 5 Runes syntax for reactive state management
3. Style components using Tailwind utility classes
4. Create reusable components in the appropriate `/lib/components` subdirectory
5. Maintain proper typing for all functions and components
6. Avoid self-closing tags in Svelte components (e.g., use `<div></div>` instead of `<div />`)
7. Implement server-side data loading with +page.server.ts files
8. Document complex functions and components
9. Use onclick instead of on:click for event handling
10. Follow the established database schema patterns when adding new features
11. Write tests for critical functionality

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables (.env file)
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

### Database Setup

```bash
# Create database
createdb wastexperts

# Apply schema
psql -d wastexperts -f docs/schema.sql

# (Optional) Load sample data
psql -d wastexperts -f docs/sample_data.sql
```

## Authentication and Authorization

The application implements a role-based access control system:

- **Authentication**: JWT-based authentication with secure HTTP-only cookies
- **Authorization**: Role-based permissions system
- **User Roles**: Admin, Manager, Staff, and Viewer roles with different access levels

## Deployment

The application is designed to be deployable to various hosting environments that support Node.js applications. The specific deployment configuration can be customized based on the target environment.

For more details about the technology stack, refer to the [Stack Documentation](./stack.md).
