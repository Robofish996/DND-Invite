# D&D Invitation

A magical animated invitation for your Dungeons & Dragons campaign.

## Development

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deploy to GitHub Pages

### Automatic Deployment

This project is configured to automatically deploy to GitHub Pages when you push to the `main` branch using GitHub Actions.

1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Push to the `main` branch - it will automatically build and deploy!

### Manual Deployment

1. Build the project: `npm run build`
2. Go to repository Settings → Pages
3. Under "Source", select the `dist` folder from the `main` branch
4. Save

**Note**: If your repository name is different from "DND-Invite", update the `base` path in `vite.config.js` to match your repository name.

