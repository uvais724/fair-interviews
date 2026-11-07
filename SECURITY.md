# Security Policy

## Supported versions

Security fixes are made for the latest version on the default branch. There are currently no separate release branches.

## Reporting a vulnerability

Please do not report security vulnerabilities in public issues or pull requests. Use GitHub's private vulnerability reporting for this repository when available. If private reporting is unavailable, contact the maintainer through the GitHub profile linked from the repository and ask for a private channel.

Include the affected route or component, the impact, and steps to reproduce. Do not include real credentials, candidate data, or other personal information in the report. Please allow maintainers reasonable time to investigate and coordinate a fix before public disclosure.

## Sensitive data

Never commit `.env` files, database credentials, authentication secrets, or real candidate interview records. Use a disposable local database and synthetic data when reproducing issues.
