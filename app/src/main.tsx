import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { gameAssets } from "./data/assets";
import "./styles/global.css";

// ตั้งภาพพื้นหลังเป็น CSS var (path ผ่าน base ของ Vite — รองรับ subpath บน GitHub Pages)
const root = document.documentElement;
root.style.setProperty("--bg-detective-room", `url(${gameAssets.bgDetectiveRoom})`);
root.style.setProperty("--bg-role-cover", `url(${gameAssets.bgRoleCover})`);
root.style.setProperty("--bg-office", `url(${gameAssets.bgOffice})`);
root.style.setProperty("--bg-reveal", `url(${gameAssets.bgReveal})`);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
