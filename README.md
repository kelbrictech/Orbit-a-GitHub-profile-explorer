# Orbit — GitHub Profile Explorer

A lightweight, client-side explorer for public GitHub profiles. It visualizes repositories around a profile avatar, with repository nodes sized by star count and colored by primary language.

## Project status

This repository contains a browser-only implementation using vanilla HTML, CSS, and JavaScript. It does not require an application backend, database, account login, or API key for its read-only public GitHub API requests.

A hosted demo is not currently linked from this README. Do not treat a deployment as available until the GitHub Pages URL has been checked independently.

## Features

- Search for a public GitHub username and retrieve public profile and repository data
- Orbit visualization of up to eight non-fork repositories
- Repository node sizing based on star count and color coding by primary language
- Repository details including description, stars, language, and last-updated date
- Language breakdown and sortable repository list
- User-facing handling for unknown users, rate limits, and network errors
- Responsive layout and keyboard-operable repository controls
- No third-party runtime dependencies

## Data source and limits

The application uses the public [GitHub REST API](https://docs.github.com/en/rest), including the user and user-repository endpoints.

Unauthenticated GitHub API requests are subject to GitHub's rate limits. The application does not require a personal access token for its documented public, read-only use case. It requests up to 100 repositories, so profiles with more than 100 public repositories may not be represented completely.

No application backend or application database is included in this project.

## Run locally

Requirements: a modern browser and Python 3 (only if you need a local static server).

Clone this repository:

```bash
git clone https://github.com/kelbrictech/Orbit-a-GitHub-profile-explorer.git
cd Orbit-a-GitHub-profile-explorer
```

You can open `index.html` directly. If browser restrictions prevent API requests from a `file://` page, start a local static server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy with GitHub Pages

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch** if that is the intended publishing method.
3. Select the `main` branch and the repository root (`/`) if the application files are in the root.
4. Save the configuration and wait for the Pages deployment to complete.
5. Verify the published URL in the repository's Pages settings before sharing it.

For a project repository under this account, the expected URL pattern is:

`https://kelbrictech.github.io/Orbit-a-GitHub-profile-explorer/`

This is a URL pattern, not confirmation that Pages is currently enabled or deployed.

## Project structure

```text
Orbit-a-GitHub-profile-explorer/
├── index.html
├── style.css
├── script.js
├── screenshot.png
└── README.md
```

## License

No `LICENSE` file is currently present in this repository, so no open-source license is declared here. Do not assume the project is MIT-licensed or redistribute it under that license unless the repository owner adds and approves the appropriate license file.

---

## About KELBRIC Technologies

KELBRIC Technologies develops practical digital products and operational tools through iterative product development.

© 2026 KELBRIC Technologies.
