# How to run

```
npm i
npm run dev
```

# What happens

react-refresh leaks FiberRootNodes from secondary renderers.

When R3F's Canvas unmounts, react-refresh's onCommitFiberRoot sees a late commit (didError=true, !wasMounted && !isMounted) and adds the root to `failedRoots` / `helpersByRoot` — never cleaned up.

Click the button, then observe all 16 values stay "alive" in dev mode.

In a production build (no react-refresh) they are properly GC'd.

After pressing "Collect garbage" button in Devtools:

<img width="1450" height="575" alt="Screenshot 2026-04-30 at 12 25 56 PM" src="https://github.com/user-attachments/assets/ccfda8d2-87a0-4ef4-b5a2-7041c469a1cb" />

In production build (note the last value is still retained, [but that is a separate issue in R3F that I have investigated and reported](https://github.com/pmndrs/react-three-fiber/pull/3747)):

<img width="1461" height="436" alt="Screenshot 2026-04-30 at 12 32 24 PM" src="https://github.com/user-attachments/assets/e035655c-3342-4b5d-a13f-ea9a36383359" />

