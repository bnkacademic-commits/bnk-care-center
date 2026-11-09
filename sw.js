// sw.js (BNK Care Center 1.02.0) — ทำให้ติดตั้งเป็นแอป (PWA) ได้ · ไม่เก็บแคชหน้าเว็บ/ข้อมูล (ดึงจากเซิร์ฟเวอร์ทุกครั้ง ไม่ค้างรุ่นเก่า)
// ออฟไลน์ = แสดงหน้าแจ้งว่าไม่มีอินเทอร์เน็ต
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(function () {
    return new Response('<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ไม่มีอินเทอร์เน็ต</title></head>' +
      '<body style="font-family:sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f6f7f9;color:#1d2330;margin:0;text-align:center;padding:24px">' +
      '<div><div style="font-size:48px">📶</div><h2>ไม่มีการเชื่อมต่ออินเทอร์เน็ต</h2><p>BNK Care Center ต้องใช้อินเทอร์เน็ต — เชื่อมต่อแล้วกดลองอีกครั้ง</p>' +
      '<button onclick="location.reload()" style="padding:10px 22px;border:0;border-radius:12px;background:#c8102e;color:#fff;font-size:16px">ลองอีกครั้ง</button></div></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }));
});
