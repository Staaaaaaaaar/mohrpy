# mohrpy interactive site

Static React, TypeScript and Vite interface for interactive 2D and 3D Mohr
circle analysis:

<https://staaaaaaaaar.github.io/mohrpy/>

## Commands

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

The frontend calculation core lives in `src/math/` and must remain numerically
consistent with the Python implementation. GitHub Pages supplies the production
base path through `VITE_BASE_PATH`; local development defaults to `/`.
