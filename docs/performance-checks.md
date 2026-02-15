# Performance Checks (Manual)

## Targets

- Desktop and mobile blog list
- Desktop and mobile blog post page
- Interactive demo block in post body

## Checks

- Largest Contentful Paint stays acceptable on blog pages.
- No major layout shift while post content and cover image load.
- Interactive demo controls remain responsive during playback.
- Scroll and section transitions remain smooth on mobile.

## Suggested run

```bash
npm run dev
```

Then run browser-based checks:

- Chrome DevTools Performance panel (desktop + mobile emulation)
- Lighthouse (Performance + Best Practices + SEO)

## Pass criteria

- No severe jank during section transitions or demo playback.
- No obvious frame drops while interacting with controls.
- No broken layout on small screens.
