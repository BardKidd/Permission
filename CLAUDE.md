# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CASL-based React permission system that demonstrates role-based access control with a clean, extensible architecture. The system uses context-based state management and Higher-Order Component (HOC) patterns for component protection.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Permission System Design

The permission system follows a hierarchical structure:
- **Actions**: `read` (view-only) and `edit` (full access via CASL's `manage`)
- **Subjects**: Alphanumeric identifiers (A01, B01, C01) that map to pages/features
- **Context**: Global permission state using React Context
- **Protection**: HOCs for page-level access control

### Key Files and Their Purposes

- `src/utility/defineAbilityFor.js` - Core CASL ability definition logic
- `src/contexts/index.js` - Permission context setup and `useAbility` hook
- `src/components/PageAccess.jsx` - HOC factory for page protection
- `src/components/PermissionLink.jsx` - Permission-aware navigation component
- `src/mock/permission.js` - Mock permission data structure
- `src/routes.jsx` - Main routing with permission-based navigation

### Permission Data Structure

Mock permissions follow this structure:
```javascript
{
  page: "PageName",
  subPage: [
    {
      action: "edit|read",
      pageNumber: "A01", 
      subject: "A01",
      path: "route/path",
      order: "1"
    }
  ]
}
```

### Usage Patterns

**Page Protection:**
```javascript
export default withPageAccess('A01')(PageComponent);
```

**Permission-based Navigation:**
```javascript
<PermissionLink to="/main" subject="A01">Main</PermissionLink>
```

**Permission Checking:**
```javascript
const ability = useAbility();
const canEdit = ability?.can('manage', 'A01');
const canRead = ability?.can('read', 'A01');
```

## Technical Specifications

- **Framework**: React 19 with Vite
- **Routing**: React Router DOM v7
- **Permission Library**: CASL (@casl/ability, @casl/react)
- **Build Tool**: Vite with React plugin
- **Linting**: ESLint with React hooks and refresh plugins
- **File Extensions**: Uses `.jsx` for React components, supports `.js` files with JSX

## Development Notes

- The system uses "default deny" approach - permissions must be explicitly granted
- All protected routes redirect to `/unauthorized` when access denied
- The codebase includes comprehensive Chinese documentation in README.md
- Permission subjects use alphanumeric codes for easy mapping and extension
- HOC pattern allows clean separation of permission logic from component logic