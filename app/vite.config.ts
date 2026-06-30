import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages เสิร์ฟที่ /office-spies-game/ — ตั้ง base ตอน build, dev คงที่ root
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/office-spies-game/" : "/",
}));
