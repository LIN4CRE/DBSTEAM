# Contributing to DBSTEAM

Thank you for your interest in contributing to **DBSTEAM**! We welcome bug fixes, documentation improvements, feature additions, and UI enhancements.

## Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/LIN4CRE/DBSTEAM.git
   cd DBSTEAM
   ```

2. **Install Dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Start Development Server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

4. **Verify TypeScript & Linting**
   ```bash
   bun run lint
   # or
   npm run lint
   ```

5. **Build Web & Android Assets**
   ```bash
   bun run build
   bun run cap:sync
   ```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat(...)`: New user-facing feature
- `fix(...)`: Bug fix
- `docs(...)`: Documentation changes
- `chore(...)`: Maintenance, dependency updates, tooling
- `ci(...)`: GitHub Actions and pipeline changes
- `style(...)`: Formatting or aesthetic improvements

## Pull Request Process

- Open PRs against the `main` branch.
- Ensure all CI checks (typecheck, linting, build) pass.
- Provide descriptive PR titles and descriptions referencing any related issues.
