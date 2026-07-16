// รูปผู้เล่น: จากลิงก์ (เก็บ URL ตรงๆ) หรือจากกล้อง/ไฟล์ (ย่อในเครื่อง เก็บเป็น data URL — รูปไม่ออกนอกเครื่อง)
const MAX_EDGE = 500; // การ์ดผู้เล่นใช้กว้างสุด ~500px — เก็บใหญ่กว่านี้เปลืองที่เปล่า

export function validateImageLink(raw: string): string {
  const url = raw.trim();
  if (!/^https?:\/\//i.test(url)) throw new Error("ลิงก์รูปต้องขึ้นต้นด้วย http:// หรือ https://");
  return url;
}

export async function processPlayerImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("ไฟล์นี้ไม่ใช่รูปภาพ");
  const bitmap = await readImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("อุปกรณ์นี้ย่อรูปไม่ได้ — ลองใช้วิธีวางลิงก์แทน");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  // Safari บางรุ่น encode webp ไม่ได้ (toDataURL คืน png มาแทน) → fallback เป็น jpeg ที่รองรับแน่นอน
  const webp = canvas.toDataURL("image/webp", 0.8);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.82);
}

function readImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") return createImageBitmap(file);
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("อ่านไฟล์รูปไม่สำเร็จ — ลองรูปอื่นดูนะ"));
    };
    image.src = url;
  });
}
