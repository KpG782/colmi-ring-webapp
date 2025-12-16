# Contributing to Colmi Ring Dashboard

Thank you for your interest in contributing to the Colmi Ring Dashboard! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `npm install`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** following our code style guidelines
5. **Test your changes**: Ensure the app runs correctly
6. **Commit your changes** following our commit guidelines
7. **Push to your fork** and submit a pull request

## Development Workflow

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Colmi R02 or R09 smart ring for testing
- A browser with Web Bluetooth API support (Chrome, Edge, Opera)

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Building for Production

```bash
npm run build
npm run start
```

## Code Style

We follow standard TypeScript and React best practices:

### TypeScript

- Use TypeScript for all new files
- Define proper types/interfaces for all props and data structures
- Avoid using `any` type unless absolutely necessary
- Use meaningful variable and function names

### React/Next.js

- Use functional components with hooks
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks
- Use proper JSDoc comments for exported functions and components
- Follow the project's folder structure:
  - `src/components/ui/` - Reusable UI components
  - `src/components/dashboard/` - Dashboard-specific components
  - `src/services/` - Business logic and API services
  - `src/hooks/` - Custom React hooks
  - `src/types/` - TypeScript type definitions
  - `src/utils/` - Utility functions
  - `src/config/` - Configuration constants

### File Naming

- Components: `PascalCase.tsx` (e.g., `HeartRateCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useRingConnection.ts`)
- Utils: `kebab-case.ts` (e.g., `bluetooth-utils.ts`)
- Types: `PascalCase.ts` or `types.ts`

### Component Structure

```tsx
"use client"; // Only if needed for client components

import /* imports */ "package";

/**
 * Component description
 * @param props - Component props description
 */
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState();

  // Handlers
  const handleAction = () => {
    // implementation
  };

  // Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);

  // Render
  return <div>{/* JSX */}</div>;
}
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(dashboard): add SpO2 monitoring card
fix(bluetooth): resolve connection timeout issue
docs(readme): update installation instructions
refactor(components): extract common card component
```

## Pull Request Process

1. **Update documentation** if you're adding features or changing behavior
2. **Ensure the app builds** without errors: `npm run build`
3. **Test your changes** thoroughly with an actual Colmi ring
4. **Write clear PR description**:
   - What changes were made
   - Why they were necessary
   - How to test them
5. **Link related issues** using keywords (Fixes #123, Closes #456)
6. **Wait for review** - maintainers will review and may request changes
7. **Address feedback** promptly and push updates to your branch

### PR Title Format

Follow the same format as commit messages:

```
feat: add real-time step tracking
fix: resolve heart rate monitoring freeze
```

## Testing

While we don't have automated tests yet, please manually test your changes:

- Test with an actual Colmi R02/R09 ring
- Verify all dashboard cards update correctly
- Check connection/disconnection scenarios
- Test on different browsers (Chrome, Edge, Opera)
- Ensure mobile responsiveness

## Questions?

Feel free to open an issue for:

- Questions about contributing
- Feature requests
- Bug reports
- General discussion

Thank you for contributing to Colmi Ring Dashboard! 🎉
