# Publishing Guide

## Before Publishing

Make sure these commands all pass:

```bash
npm ci
npm run check
npm test
npm run build
```

## Recommended Repository Settings

- Repository name: `session-coord-mcp`
- Visibility: choose `public` if you want to open source it now
- Default branch: `main`
- Enable Issues
- Enable Discussions later if the project gains users

## Suggested GitHub Topics

- `mcp`
- `model-context-protocol`
- `claude-code`
- `codex`
- `sqlite`
- `developer-tools`
- `multi-agent`
- `local-first`

## First Release Checklist

1. Push the initial repository
2. Add a short repository description
3. Add topics
4. Confirm the README renders correctly on GitHub
5. Confirm CI passes on GitHub Actions
6. Create the first tag, such as `v0.1.0`
7. Publish release notes

## If GitHub CLI Is Not Installed

You can still publish with plain Git:

```bash
git init
git branch -M main
git add .
git commit -m "Initial release"
git remote add origin <your-repository-url>
git push -u origin main
```

## If GitHub CLI Is Installed

You can create the remote directly:

```bash
gh repo create session-coord-mcp --public --source . --remote origin --push
```
