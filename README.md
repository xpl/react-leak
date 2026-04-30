# What

react-refresh leaks FiberRootNodes from secondary renderers.

When R3F's Canvas unmounts, react-refresh's onCommitFiberRoot sees a late commit (didError=true, !wasMounted && !isMounted) and adds the root to `failedRoots` / `helpersByRoot` — never cleaned up.

Click the button, then observe all 16 values stay "alive" in dev mode.

In a production build (no react-refresh) they are properly GC'd.

# How to run

```
npm i
npm run dev
```