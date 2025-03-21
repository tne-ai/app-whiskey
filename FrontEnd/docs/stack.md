# WasteXperts - Tech Stack Overview

This document provides a comprehensive overview of the technology stack used in the WasteXperts application, a sustainable construction waste management platform.

## Core Technologies

### Frontend Framework

- **SvelteKit 2.16.x**: A modern meta-framework for building web applications with built-in file-based routing
- **Svelte 5.x**: Using the latest Svelte version with Runes syntax for reactive state management
- **TypeScript 5.x**: For type-safe JavaScript development with comprehensive interfaces

### Styling and UI

- **Tailwind CSS 4.0.8**: Utility-first CSS framework for styling with the new Oxide engine
- **DaisyUI 5.0.0-beta.8**: Component library built on top of Tailwind CSS providing pre-designed themed components
- **Chart.js 4.4.x**: Library for data visualization and charts (pie charts, bar graphs, etc.)

### Backend and Data Storage

- **SvelteKit API Routes**: Server-side endpoints for handling data operations
- **PostgreSQL**: Relational database management system for data persistence
- **postgres.js 3.4.x**: Modern PostgreSQL client for Node.js with full TypeScript support

### Build Tools and Development

- **Vite 6.x**: Modern frontend build tool and development server
- **ESLint 9.18.x**: Code linting tool for identifying problematic patterns
- **Prettier 3.4.x**: Code formatting tool with Svelte and Tailwind plugins
- **Node.js 20+**: JavaScript runtime for server-side execution

## Project Structure

### Directory Organization

The codebase follows SvelteKit's recommended structure:

```
/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── common/     # Shared UI elements
│   │   │   ├── dashboard/  # Dashboard-specific components
│   │   │   ├── sites/      # Site management components
│   │   │   └── layout/     # Layout components (header, sidebar)
│   │   ├── server/         # Server-only code
│   │   │   ├── db.ts       # Database connection and utilities
│   │   │   └── auth.ts     # Authentication utilities
│   │   ├── utils/          # Utility functions
│   │   ├── stores/         # Svelte stores for state management
│   │   └── types/          # TypeScript interfaces
│   │       ├── site.ts     # Site-related types
│   │       ├── material.ts # Material-related types
│   │       └── user.ts     # User and authentication types
│   ├── routes/
│   │   ├── +layout.svelte  # Root layout with sidebar
│   │   ├── +page.svelte    # Home/dashboard
│   │   ├── sites/          # Site-related pages and API
│   │   ├── team/           # Team management
│   │   ├── company/        # Company information
│   │   ├── settings/       # User settings
│   │   └── api/            # API endpoints
│   └── app.css             # Global styles with Tailwind imports
├── static/                 # Static assets (images, favicon, etc.)
├── tests/                  # Test files
└── docs/                   # Documentation files
```

### Data Models

The application implements a comprehensive set of data models using TypeScript interfaces:

- **Site Management**: Site, SiteStage, SiteResourceManager
- **Materials and Waste**: SiteOrderedItem, MaterialDensity, WasteProvider
- **Team and Company**: ContractorCompany, ContractorStaff, ProjectRole
- **Environmental Data**: MaterialCarbonFactor, SiteLogisticsEmission, SiteWaterUsage

### Routing Structure

The application follows SvelteKit's file-based routing convention:

- `/`: Home/Dashboard page
- `/sites`: Site management overview
- `/sites/[siteId]/`: Dynamic routes for specific sites with sub-routes:
  - `details`, `materials`, `waste`, `logistics`, `embedded-carbon`, `add-document`
- `/team`: Team management
- `/company`: Company information
- `/settings`: User settings
- `/api/documents/upload`: API endpoint for document processing

## Configuration Files

- `svelte.config.js`: SvelteKit configuration with Node adapter and mdsvex for Markdown processing
- `vite.config.ts`: Vite bundler configuration with SvelteKit and Tailwind plugins
- `tsconfig.json`: TypeScript configuration for type checking
- `.prettierrc`: Prettier configuration with Svelte and Tailwind plugins
- `package.json`: Dependencies and npm scripts
- `.env`: Environment variables for database connections and API keys (not committed to version control)

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

Additionally, the schema implements several views for simplified data access:

- `sites`: Combined project information
- `site_ordered_items`: Materials linked to specific sites
- `site_material_diversion_targets`: Diversion targets by site
- `contractors`: Simplified contractor information

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

### Code Quality Tools

The project uses several tools to maintain code quality:

- TypeScript for static type checking
- ESLint for code linting
- Prettier for code formatting
- Svelte-Check for Svelte-specific validations
- Vitest for unit testing

## Svelte Development Details

### Reactive State Management

The application uses Svelte 5's new Runes syntax for reactive state management:

```svelte
<script>
  // Component state
  let count = $state(0);
  
  // Derived values
  let doubled = $derived(count * 2);
  
  // Effects for side effects
  $effect(() => {
    console.log(`Count changed to ${count}`);
  });
  
  // Props definition
  let { title, onAction } = $props();
</script>
```

### Components and Props

Components use the new Svelte 5 props syntax and avoid self-closing tags:

```svelte
<!-- Parent component -->
<ChildComponent title="Hello" onAction={handleAction}></ChildComponent>

<!-- Child component -->
<script>
  let { title, onAction } = $props();
</script>
```

## Styling Approach

The application uses a combination of:

- Tailwind utility classes for most styling needs
- DaisyUI components for common UI elements
- Custom CSS where necessary (minimal usage)
- Responsive design principles throughout

## Development Conventions

When working on this codebase, adhere to these conventions:

1. Use TypeScript for all new code with proper interfaces and types
2. Follow the Svelte 5 Runes syntax for reactive state management
3. Style components using Tailwind utility classes
4. Create reusable components in the `/lib/components` directory
5. Maintain proper typing for all functions and components
6. Avoid self-closing tags in Svelte components (e.g., use `<div></div>` instead of `<div />`)
7. Implement server-side data loading with +page.server.ts files
8. Document complex functions and components
9. Use onclick instead of on:click for event handling
10. Follow the established database schema patterns when adding new features
11. Write tests for critical functionality

## Authentication and Authorization

The application implements a role-based access control system:

- **Authentication**: JWT-based authentication with secure HTTP-only cookies
- **Authorization**: Role-based permissions system
- **User Roles**: Admin, Manager, Staff, and Viewer roles with different access levels

## Deployment

The application is deployed using:

- **Hosting**: Vercel for the frontend and API routes
- **Database**: Managed PostgreSQL instance on Digital Ocean
- **CI/CD**: GitHub Actions for continuous integration and deployment
- **Monitoring**: Sentry for error tracking and performance monitoring 