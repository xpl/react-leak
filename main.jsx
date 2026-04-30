/**
 * react-refresh leaks FiberRootNodes from secondary renderers.
 *
 * When R3F's Canvas unmounts, react-refresh's onCommitFiberRoot sees a late
 * commit (didError=true, !wasMounted && !isMounted) and adds the root to
 * `failedRoots` / `helpersByRoot` — never cleaned up.
 *
 * Click the button, then observe all 16 values stay "alive" in dev mode.
 * In a production build (no react-refresh) they are properly GC'd.
 */

import { createContext, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

const Ctx = createContext(null);

function App() {
  const [value, setValue] = useState(null);
  const tracked = useRef([]);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);

  // Poll WeakRefs to update GC status
  useEffect(() => {
    const id = setInterval(() => {
      if (tracked.current.length)
        setResults(tracked.current.map((w) => (w.deref() ? "alive" : "collected")));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const run = async () => {
    setRunning(true);
    tracked.current = [];
    setResults([]);

    for (let i = 0; i < 16; i++) {
      const obj = { id: i, payload: new Uint8Array(100_000) }; // 100 KB
      tracked.current.push(new WeakRef(obj));
      setValue(obj);
      await new Promise((r) => setTimeout(r, 200));
      setValue(null);
      await new Promise((r) => setTimeout(r, 300));
    }
    setRunning(false);
  };

  const alive = results.filter((s) => s === "alive").length;

  return (
    <div style={{ fontFamily: "monospace", padding: 20, background: "#1a1a1a", color: "#ccc", minHeight: "100vh" }}>
      <h2 style={{ color: "#fff" }}>react-refresh + R3F FiberRoot leak</h2>

      <button onClick={run} disabled={running} style={{ fontWeight: "bold", padding: "8px 16px", fontSize: 14 }}>
        {running ? "Running..." : "Mount/Unmount x16"}
      </button>

      <div style={{ margin: "20px 0", border: "1px solid #333", padding: 16, minHeight: 100, background: "#111" }}>
        {value ? (
          <Ctx.Provider value={value}>
            <Canvas style={{ width: 200, height: 150 }}>
              <PerspectiveCamera makeDefault />
              <OrbitControls />
            </Canvas>
          </Ctx.Provider>
        ) : (
          <em style={{ color: "#555" }}>unmounted</em>
        )}
      </div>

      {results.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 4, margin: "20px 0" }}>
            {results.map((s, i) => (
              <div key={i} style={{ padding: "4px 8px", background: s === "collected" ? "#1b5e20" : "#e65100", borderRadius: 4, fontSize: 12 }}>
                #{i}: {s}
              </div>
            ))}
          </div>
          <div style={{ color: alive > 0 ? "#ff5722" : "#4caf50", fontWeight: "bold" }}>
            {alive > 0
              ? `⚠️  LEAK: ${alive}/${results.length} values NOT collected`
              : `✅ All ${results.length} values properly collected`}
          </div>
        </>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

