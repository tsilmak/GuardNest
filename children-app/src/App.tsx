import IsAdminCheck from "./components/is-admin-check";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

function App() {
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({
    dirtyRects: 0,
    moveRects: 0,
    frameNumber: 0,
  });
  const unsubRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
      }
    };
  }, []);

  const start = async () => {
    if (running) return;
    const unlisten = await listen("screen://frame", (e) => {
      const p = e.payload as any;
      setStats({
        dirtyRects: p.dirtyRects ?? 0,
        moveRects: p.moveRects ?? 0,
        frameNumber: p.frameNumber ?? 0,
      });
    });
    unsubRef.current = unlisten;
    await invoke("start_screen_record");
    setRunning(true);
  };

  return (
    <div
      style={{ padding: 16, display: "flex", gap: 16, flexDirection: "column" }}
    >
      <IsAdminCheck />
      <button onClick={start} disabled={running} style={{ width: 240 }}>
        {running ? "Capturing..." : "Start Desktop Duplication"}
      </button>
      <div style={{ fontFamily: "monospace" }}>
        <div>Frames: {stats.frameNumber}</div>
        <div>Dirty rects: {stats.dirtyRects}</div>
        <div>Move rects: {stats.moveRects}</div>
      </div>
    </div>
  );
}

export default App;
