# Contributing

Thanks for considering a contribution to Fair Interviews. Issues, bug reports, documentation improvements, and code contributions are welcome.

## Before you start

- Search existing issues and pull requests to avoid duplicating work.
- For a substantial feature or behavior change, open an issue first to discuss the approach.
- Keep pull requests focused and describe the user problem they solve.
- Never include real credentials, candidate information, or production data in an issue, commit, or screenshot.

## Development setup

Follow the local setup steps in the [README](README.md). Configure a disposable PostgreSQL database before installing dependencies. The seed command deletes application records, so do not use it against valuable data.

## Making changes

- Follow the existing TypeScript, React, and Tailwind patterns in the project.
- Keep server-side data access scoped to the authenticated user.
- Add or update Prisma migrations when changing the database schema.
- Update documentation when changing setup, environment variables, or user-visible behavior.
- Do not add analytics events that include candidate names, interview notes, credentials, or other user-entered content.

## Checks

Before opening a pull request, run:

~~~sh
npm run lint
npx tsc --noEmit
~~~

If the change affects a workflow, include the steps you used to verify it in the pull request description.

## Pull requests

1. Create a branch for your change.
2. Make focused commits with clear messages.
3. Explain the issue and the solution in the pull request.
4. Include screenshots for visual changes when useful.
5. Confirm that no secrets or private interview data are included.

By submitting a contribution, you agree that it may be distributed under the project license once the maintainers select and publish one. Until a license is added, please discuss licensing with the maintainers before contributing code you expect others to reuse.
