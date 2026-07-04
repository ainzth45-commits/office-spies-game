import { gachaIconAssets, gameAssets, itemCardAssets } from "./assets";
import { defaultPlayers } from "./players";

// โหลดรูปทั้งเกมไว้เบื้องหลังตั้งแต่เปิดแอป — เข้าหน้าไหนรูปก็พร้อมทันที ไม่ต้องรอโหลด
// ไล่ทีละชุด (จำกัดพร้อมกัน 4 รูป) กันแย่งแบนด์วิดท์กับหน้าที่กำลังแสดงอยู่
let started = false;

export function preloadAllGameAssets(): void {
  if (started) return; // กันเรียกซ้ำ (StrictMode/re-render)
  started = true;

  const urls = [
    ...Object.values(gameAssets),
    ...Object.values(gachaIconAssets),
    ...Object.values(itemCardAssets),
    ...defaultPlayers.map((player) => player.imageUrl),
  ];
  const queue = [...new Set(urls)];

  const loadNext = () => {
    const url = queue.shift();
    if (!url) return;
    const img = new Image();
    img.decoding = "async";
    // โหลดต่อไม่ว่าสำเร็จหรือพัง (รูปพังมี onError fallback ในแต่ละหน้าอยู่แล้ว)
    img.onload = loadNext;
    img.onerror = loadNext;
    img.src = url;
  };

  // เริ่มหลังปล่อยให้หน้าแรกวาดเสร็จก่อน แล้วค่อยลากที่เหลือเข้ามาเงียบๆ
  window.setTimeout(() => {
    for (let lane = 0; lane < 4; lane += 1) loadNext();
  }, 800);
}
