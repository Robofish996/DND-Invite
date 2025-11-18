import { defineConfig } from 'vite';

// For GitHub Pages project sites, the base path is your repository name
// For user/organization sites (username.github.io), change base to '/'
// You can also set this via the GITHUB_REPOSITORY env variable in the deploy workflow
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'DND-Invite';
const BASE_PATH = process.env.GITHUB_PAGES === 'true' ? `/${REPO_NAME}/` : '/';

export default defineConfig({
  base: BASE_PATH,
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});

