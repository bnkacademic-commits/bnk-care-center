/* BNK Care Center 1.02.0 — โค้ดที่ใช้ร่วมกันของ 3 หน้า
   · เรียก API (Content-Type text/plain = ไม่มีคำขอ OPTIONS เพิ่ม ประหยัดโควต้า)
   · ธีมสว่าง/มืด (ค่าเริ่มต้นสว่าง) · ติดตั้งเป็นแอป (PWA) · เลขรุ่นท้ายเว็บ (กดได้) · แจ้งเวอร์ชันใหม่จาก version.json (ไม่ผ่าน Worker)
   · ตัวเลือกนักเรียน: กรองห้อง (รวมทุกห้อง) + ค้นชื่อ + รายชื่อที่เลือกไว้ก่อนบันทึก */
var CC = (function () {
  var API = "https://bnk-care-center-api.bnkschool.workers.dev";
  var VERSION = "1.05.2.121126";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var store = {
    get: function (k) { try { return localStorage.getItem("bnkcc_" + k) || ""; } catch (e) { return ""; } },
    set: function (k, v) { try { if (v) localStorage.setItem("bnkcc_" + k, v); else localStorage.removeItem("bnkcc_" + k); } catch (e) { } },
    json: function (k) { try { return JSON.parse(store.get(k) || "null"); } catch (e) { return null; } }
  };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(m) { var t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); } t.textContent = m; t.style.display = "block"; clearTimeout(toast.h); toast.h = setTimeout(function () { t.style.display = "none"; }, 2800); }
  var TH_M = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  function thD(s) { var p = String(s || "").split("-"); return p.length === 3 ? (+p[2]) + " " + TH_M[+p[1] - 1] + " " + (+p[0] + 543) : s; }
  var onErr = null; // หน้าเว็บกำหนดเอง: จัดการรหัสข้อผิดพลาด (auth / staff / nopin)
  // ---------- 1.05.2: แบนเนอร์ (ตั้งที่เว็บส่งงาน › กิจการนักเรียน › ตั้งค่า) — ใช้ที่จำไว้ในเครื่องก่อน แล้วอัปเดตจากคำตอบของเซิร์ฟเวอร์ ----------
  var PAGE = /council\.html$/.test(location.pathname) ? "c" : /student\.html$/.test(location.pathname) ? "s" : "t";
  function banner(p) {
    var im = document.querySelector(".ban"); if (!im) return;
    var src = p ? API.replace(/\/$/, "") + "/" + p : "assets/banner.jpg";
    if (im.getAttribute("src") === src) return;
    im.onerror = function () { im.onerror = null; im.src = "assets/banner.jpg"; };
    im.src = src;
  }
  async function api(action, data) {
    var c = new AbortController(), to = setTimeout(function () { c.abort(); }, 15000), res;
    try { res = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({ action: action }, data || {})), signal: c.signal }); }
    catch (e) { var x = new Error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่"); x.net = true; throw x; }
    finally { clearTimeout(to); }
    var d; try { d = await res.json(); } catch (e) { throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง"); }
    if (d.status !== "success") { var y = new Error(d.message || "เกิดข้อผิดพลาด"); y.code = d.code; if (onErr) onErr(y); throw y; }
    if (typeof d.bn === "string") { store.set("bn_" + PAGE, d.bn); banner(d.bn); } // 1.05.2: แบนเนอร์ที่ตั้งจากเว็บส่งงาน
    return d;
  }
  var IC = {
    moon: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 19h16"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.7 10.7-1.4 1.4L13 11.8V17h-2v-5.2l-2.3 2.3-1.4-1.4L12 8l4.7 4.7z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    reload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
    broom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 3 11 11M8 11h6l2 3-1 7H7l-1-7z"/><path d="M10 17v4M13 17v4"/></svg>',
    group: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 13c-3.3 0-7 1.6-7 4v3h14v-3c0-2.4-3.7-4-7-4zm8 0c-.6 0-1.2.1-1.8.2 1.1.9 1.8 2.1 1.8 3.8v3h5v-3c0-2.4-2.9-4-5-4z"/></svg>',
    stu: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3 1 8l11 5 9-4.1V15h2V8L12 3zM5 12.2V16c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.2-7-3.2z"/></svg>'
  };

  // ---------- ธีม (ค่าเริ่มต้นสว่าง · จำไว้ในเครื่อง) ----------
  function applyTheme(t) { document.documentElement.setAttribute("data-theme", t === "dark" ? "dark" : "light"); var b = $("#btnTheme"); if (b) { b.innerHTML = t === "dark" ? IC.sun : IC.moon; b.title = t === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"; } var m = $('meta[name="theme-color"]'); if (m) m.content = t === "dark" ? "#14171d" : "#c8102e"; }
  function toggleTheme() { var t = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"; store.set("theme", t); applyTheme(t); }

  // ---------- ติดตั้งเป็นแอป (PWA) ----------
  var deferred = null, NOAPP = false;
  function standalone() { try { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; } catch (e) { return false; } }
  function updInstall() { var b = $("#btnInstall"); if (b) b.hidden = standalone(); }
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); if (!NOAPP) deferred = e; updInstall(); });
  window.addEventListener("appinstalled", function () { deferred = null; updInstall(); toast("ติดตั้งแอปเรียบร้อยแล้ว — เปิดได้จากหน้าจอหลัก"); });
  function installHelp() {
    var ua = navigator.userAgent || "", ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1), and = /Android/i.test(ua);
    var steps = ios ? ["เปิดเว็บนี้ด้วย <b>Safari</b>", "กดปุ่ม <b>แชร์</b> (สี่เหลี่ยมมีลูกศรขึ้น)", "เลือก <b>เพิ่มไปยังหน้าจอโฮม</b>", "กด <b>เพิ่ม</b>"]
      : and ? ["กดปุ่มเมนู <b>⋮</b> มุมขวาบนของ Chrome", "เลือก <b>ติดตั้งแอป</b> หรือ <b>เพิ่มลงในหน้าจอหลัก</b>", "กด <b>ติดตั้ง</b>"]
        : ["ใช้ <b>Google Chrome</b> หรือ <b>Microsoft Edge</b>", "กดไอคอนติดตั้งท้ายช่องที่อยู่เว็บ หรือเมนู <b>⋮ / …</b> → <b>ติดตั้ง…</b>", "กด <b>ติดตั้ง</b>"];
    var m = document.createElement("div"); m.className = "mdl";
    m.innerHTML = '<div class="box" role="dialog" aria-modal="true"><div class="hd2"><img src="icons/icon-192.png" alt=""><div><b style="font-size:17px">ติดตั้งเป็นแอป</b><div class="mut">เปิดจากหน้าจอหลักได้เหมือนแอปทั่วไป</div></div></div><ol>' + steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + '</ol><button class="btn blk" type="button">เข้าใจแล้ว</button></div>';
    m.addEventListener("click", function (e) { if (e.target === m || e.target.closest("button")) m.remove(); });
    document.body.appendChild(m);
  }
  async function install() {
    if (deferred) { var ev = deferred; deferred = null; try { ev.prompt(); await ev.userChoice; } catch (e) { } updInstall(); return; }
    installHelp();
  }
  if ("serviceWorker" in navigator && location.protocol !== "file:") window.addEventListener("load", function () { if (!NOAPP) navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(function () { }); });

  // ---------- เลขรุ่น + แจ้งเวอร์ชันใหม่ (อ่าน version.json บน GitHub — ไม่ใช้โควต้า Worker) ----------
  var updLast = 0, updShown = "";
  function verParts(v) { return String(v || "").split(".").slice(0, 3).map(function (x) { return parseInt(x, 10) || 0; }); }
  function newer(r, l) { if (!r || r === l) return false; var a = verParts(r), b = verParts(l); for (var i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i]; return r.split(".")[3] !== l.split(".")[3]; }
  async function checkUpdate(manual) {
    updLast = Date.now(); var remote = "";
    try { var r = await fetch(new URL("version.json", location.href).href + "?t=" + Date.now(), { cache: "no-store" }); if (r.ok) remote = String(((await r.json()) || {}).v || ""); } catch (e) { remote = ""; }
    if (!remote) { if (manual) toast("ตรวจหาอัปเดตไม่ได้ — ลองใหม่อีกครั้ง"); return; }
    if (newer(remote, VERSION)) {
      if (!manual) { var sn = store.json("upd_snooze"); if (sn && sn.v === remote && Date.now() - sn.at < 2 * 3600e3) return; }
      showUpd(remote);
    } else if (manual) toast("ใช้เวอร์ชันล่าสุดแล้ว (v" + VERSION + ")");
  }
  function showUpd(v) {
    if (updShown === v && $("#updCard")) return; updShown = v;
    var o = $("#updCard"); if (o) o.remove();
    var c = document.createElement("div"); c.id = "updCard"; c.className = "upd"; c.setAttribute("role", "status");
    c.innerHTML = '<button type="button" class="cl" data-u="later" aria-label="ปิด">✕</button><b>' + IC.up + ' มีเวอร์ชันใหม่ ' + esc(v) + '</b><p>โหลดหน้าใหม่เพื่อใช้งานเวอร์ชันล่าสุด</p><div class="row"><button type="button" data-u="later">ภายหลัง</button><button type="button" class="go" data-u="go">อัปเดตเลย</button></div>';
    c.addEventListener("click", function (e) { var b = e.target.closest("[data-u]"); if (!b) return; if (b.getAttribute("data-u") === "go") { hardReload(); return; } store.set("upd_snooze", JSON.stringify({ v: v, at: Date.now() })); c.remove(); });
    document.body.appendChild(c);
  }
  async function hardReload() {
    toast("กำลังล้างแคชและโหลดใหม่…");
    try { if (window.caches) { var ks = await caches.keys(); await Promise.all(ks.map(function (k) { return caches.delete(k); })); } } catch (e) { }
    try { if (navigator.serviceWorker) { var rg = await navigator.serviceWorker.getRegistrations(); await Promise.all(rg.map(function (r) { return r.unregister(); })); } } catch (e) { }
    var urls = [location.href.split("#")[0]];
    document.querySelectorAll("script[src], link[rel=stylesheet][href]").forEach(function (el) { var u = el.src || el.href; if (u && u.indexOf(location.origin) === 0) urls.push(u); });
    await Promise.all(urls.map(function (u) { return fetch(u, { cache: "reload" }).catch(function () { }); }));
    location.reload();
  }
  function footer() {
    var f = document.createElement("footer"); f.className = "foot";
    f.innerHTML = '<div>โรงเรียนบุ่งคล้านคร · BNK Care Center</div><span class="vw"><button type="button" class="vb" id="verBtn" aria-haspopup="true" aria-expanded="false" title="ตรวจหาอัปเดต / โหลดหน้าใหม่">v' + VERSION + ' ▴</button><span class="vm" id="verMenu" hidden>' +
      '<button type="button" data-v="check">' + IC.search + ' ตรวจหาอัปเดต</button><button type="button" data-v="reload">' + IC.reload + ' โหลดหน้าใหม่</button><button type="button" data-v="hard">' + IC.broom + ' ล้างแคชแล้วโหลดใหม่</button></span></span>';
    document.body.appendChild(f);
    var b = $("#verBtn"), m = $("#verMenu"), open = function (on) { m.hidden = !on; b.setAttribute("aria-expanded", String(on)); };
    b.addEventListener("click", function (e) { e.stopPropagation(); open(m.hidden); });
    document.addEventListener("click", function (e) { if (!m.hidden && !e.target.closest(".vw")) open(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") open(false); });
    m.addEventListener("click", function (e) { var x = e.target.closest("[data-v]"); if (!x) return; open(false); var k = x.getAttribute("data-v"); if (k === "check") checkUpdate(true); else if (k === "reload") location.reload(); else hardReload(); });
    setTimeout(function () { checkUpdate(false); }, 4000);
    setInterval(function () { if (!document.hidden) checkUpdate(false); }, 30 * 60e3);
    document.addEventListener("visibilitychange", function () { if (!document.hidden && Date.now() - updLast > 10 * 60e3) checkUpdate(false); });
  }
  // แถบบนของทุกหน้า: ชื่อหน้า + สถานะ + ปุ่มติดตั้งแอป + ปุ่มธีม
  function chrome(title, sub, o) {
    o = o || {}; if (o.noApp) NOAPP = true;
    var top = $("#top");
    top.innerHTML = '<div class="ttl"><img src="icons/favicon-32.png" alt=""><div>' + esc(title) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div></div><span class="st off" id="st" hidden></span>' +
      (o.noApp ? '' : '<button type="button" class="ib" id="btnInstall" title="ติดตั้งเป็นแอปบนเครื่องนี้" aria-label="ติดตั้งเป็นแอป">' + IC.dl + '</button>') + '<button type="button" class="ib" id="btnTheme" aria-label="เปลี่ยนธีม"></button>';
    $("#btnTheme").addEventListener("click", toggleTheme); if (!o.noApp) $("#btnInstall").addEventListener("click", install);
    applyTheme(store.get("theme") === "dark" ? "dark" : "light"); updInstall(); banner(store.get("bn_" + PAGE) || "");
    try { matchMedia("(display-mode: standalone)").addEventListener("change", updInstall); } catch (e) { }
    footer();
  }
  function status(ok, msg) { var s = $("#st"); if (!s) return; s.hidden = !msg; s.className = "st" + (ok ? "" : " off"); s.textContent = msg || ""; }

  // ---------- รายชื่อนักเรียน (จำไว้ในเครื่อง · ดาวน์โหลดใหม่เฉพาะเมื่อรายชื่อเปลี่ยน) ----------
  async function roster(extra) {
    var cache = store.json("roster");
    var d = await api("roster", Object.assign({ v: cache && cache.v || "" }, extra || {}));
    if (d.same && cache) return { v: cache.v, rooms: cache.rooms, today: d.today };
    try { store.set("roster", JSON.stringify({ v: d.v, rooms: d.rooms })); } catch (e) { }
    return { v: d.v, rooms: d.rooms, today: d.today };
  }
  // ค้นชื่อแบบไม่สนคำนำหน้า/ช่องว่าง
  var PRE = /^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นางสาว|น\.ส\.|นาย|นาง)\s*/;
  function norm(s) { return String(s || "").replace(PRE, "").replace(/\s+/g, "").toLowerCase(); }
  function hit(name, q) { return !q || norm(name).indexOf(norm(q)) !== -1 || String(name).indexOf(q) !== -1; }
  function mark(name, q) { // ไฮไลต์ส่วนที่ตรง
    if (!q) return esc(name); var i = String(name).indexOf(q); if (i === -1) return esc(name);
    return esc(name.slice(0, i)) + "<u>" + esc(name.slice(i, i + q.length)) + "</u>" + esc(name.slice(i + q.length));
  }

  // ---------- ตัวเลือกนักเรียน (กรองห้อง + ค้นชื่อ) → รายชื่อที่เลือก ----------
  // opt: { rooms, room, block(key) → ข้อความ (เลือกไม่ได้), onChange(sel), title }
  function Picker(el, opt) {
    var P = { room: opt.room || "", q: "", sel: [] }, idx = {};
    opt.rooms.forEach(function (r) { r.students.forEach(function (s) { idx[s[0]] = { key: s[0], no: s[1], name: s[2], roomId: r.id, room: r.name }; }); });
    function list() {
      var out = [], lim = P.room ? 300 : 80;
      opt.rooms.forEach(function (r) { if (P.room && r.id !== P.room) return; r.students.forEach(function (s) { if (out.length < lim + 1 && hit(s[2], P.q)) out.push(idx[s[0]]); }); });
      return out;
    }
    function paintRes() {
      var box = el.querySelector(".res"); if (!box) return;
      if (!P.room && !P.q) { box.innerHTML = '<div class="empty">เลือกห้อง หรือพิมพ์ชื่อเพื่อค้นหาจากทุกห้อง</div>'; return; }
      var L = list(), lim = P.room ? 300 : 80, more = L.length > lim, has = {}; P.sel.forEach(function (s) { has[s.key] = 1; });
      box.innerHTML = L.slice(0, lim).map(function (s) {
        var b = opt.block && opt.block(s.key);
        return '<div class="r"><span class="rm">' + (P.room ? "เลขที่ " + esc(s.no) : esc(s.room)) + '</span><span class="n">' + mark(s.name, P.q) + '</span>' +
          (b ? '<span class="tagx">' + esc(b) + '</span>' : '<button type="button" class="add' + (has[s.key] ? ' in' : '') + '" data-pk="' + esc(s.key) + '">' + (has[s.key] ? '✓ เพิ่มแล้ว' : '+ เพิ่ม') + '</button>') + '</div>';
      }).join("") + (more ? '<div class="empty">แสดง ' + lim + ' คนแรก — พิมพ์ชื่อหรือเลือกห้องให้แคบลง</div>' : '') + (L.length ? '' : '<div class="empty">ไม่พบชื่อ</div>');
    }
    function paintBk() {
      var bk = el.querySelector(".bkl"), n = el.querySelector(".bkn"); if (!bk) return;
      n.textContent = P.sel.length;
      bk.innerHTML = P.sel.length ? P.sel.map(function (s) { return '<span class="tg">' + esc(s.name.replace(PRE, "")) + ' · ' + esc(s.room) + '<button type="button" data-rm="' + esc(s.key) + '" aria-label="เอาออก">✕</button></span>'; }).join("") : '<div class="empty">ยังไม่ได้เลือกนักเรียน — กด "+ เพิ่ม" จากรายชื่อด้านบน</div>';
      if (opt.onChange) opt.onChange(P.sel);
    }
    function render() {
      el.innerHTML = '<div class="card"><div class="flt"><select class="pr" aria-label="ห้อง"><option value="">ทุกห้อง</option>' + opt.rooms.map(function (r) { return '<option value="' + esc(r.id) + '"' + (r.id === P.room ? " selected" : "") + '>' + esc(r.name) + '</option>'; }).join("") + '</select><input class="pq" type="search" placeholder="ค้นชื่อ…" value="' + esc(P.q) + '" autocomplete="off" aria-label="ค้นชื่อ"></div><div class="res"></div></div>' +
        '<div class="bk"><h4><span>' + esc(opt.title || "รายชื่อที่เลือก") + ' (<span class="bkn">0</span> คน)</span><button type="button" class="link" data-clr>ล้าง</button></h4><div class="bkl"></div><div class="bka"></div></div>';
      paintRes(); paintBk();
    }
    el.addEventListener("change", function (e) { if (e.target.classList.contains("pr")) { P.room = e.target.value; paintRes(); } });
    var tq; el.addEventListener("input", function (e) { if (e.target.classList.contains("pq")) { clearTimeout(tq); tq = setTimeout(function () { P.q = e.target.value.trim(); paintRes(); }, 150); } });
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-pk]"); if (b) { var k = b.getAttribute("data-pk"), i = P.sel.findIndex(function (s) { return s.key === k; }); if (i === -1) { if (P.sel.length >= 60) { toast("เลือกได้ครั้งละไม่เกิน 60 คน"); return; } P.sel.push(idx[k]); } else P.sel.splice(i, 1); paintRes(); paintBk(); return; }
      var r = e.target.closest("[data-rm]"); if (r) { var k2 = r.getAttribute("data-rm"); P.sel = P.sel.filter(function (s) { return s.key !== k2; }); paintRes(); paintBk(); return; }
      if (e.target.closest("[data-clr]")) { P.sel = []; paintRes(); paintBk(); }
    });
    render();
    return { sel: function () { return P.sel.slice(); }, clear: function () { P.sel = []; paintRes(); paintBk(); }, refresh: paintRes, actions: function () { return el.querySelector(".bka"); }, info: function (k) { return idx[k]; } };
  }

  // ---------- 1.05.1: ป็อปอัปถามยืนยันของเว็บ (แทน confirm ของเบราว์เซอร์) → Promise<true/false> ----------
  var IC_OUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/></svg>';
  var IC_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';
  IC.out = IC_OUT;
  function ask(title, msg, ok, o) {
    o = o || {};
    return new Promise(function (res) {
      var m = document.createElement("div"); m.className = "mdl ask";
      m.innerHTML = '<div class="box" role="alertdialog" aria-modal="true"><div class="ai">' + (o.icon || IC_WARN) + '</div><b class="at">' + esc(title) + '</b>' + (msg ? '<div class="mut am">' + esc(msg) + '</div>' : '') +
        '<div class="ab"><button type="button" class="btn ghost" data-a="0">' + esc(o.cancel || "ยกเลิก") + '</button><button type="button" class="btn" data-a="1">' + esc(ok || "ยืนยัน") + '</button></div></div>';
      var done = function (v) { if (!m.parentNode) return; m.remove(); res(v); };
      m.__close = function () { done(false); };
      m.addEventListener("click", function (e) { var b = e.target.closest("[data-a]"); if (b) done(b.getAttribute("data-a") === "1"); else if (e.target === m) done(false); });
      document.body.appendChild(m); var f = m.querySelector('[data-a="1"]'); if (f) f.focus();
    });
  }
  // ---------- 1.05.1: รูปสมาชิกสภานักเรียน (เงาขาวบนวงกลมสีธีม + ปลอกแขนม่วง-ขาว) · ชาย/หญิงตามคำนำหน้า ----------
  function councilAv(name) {
    var girl = /^(นางสาว|น\.ส\.|เด็กหญิง|ด\.ญ\.|นาง)/.test(String(name || "").trim());
    var head = girl ? '<path class="s" d="M18.5 26c0-9 6-14.5 13.5-14.5S45.5 17 45.5 26v11c0 1.8-1.2 3-3 3h-21c-1.8 0-3-1.2-3-3z"/><circle class="s" cx="32" cy="25.5" r="11"/><path class="g" d="M21.2 27.2A11 11 0 0 0 25.5 34.4M42.8 27.2A11 11 0 0 1 38.5 34.4M25.5 34.4V40.5M38.5 34.4V40.5"/>'
      : '<circle class="s" cx="32" cy="25" r="11.5"/>';
    return '<svg class="cav" viewBox="0 0 64 64" aria-hidden="true"><circle class="b" cx="32" cy="32" r="32"/><clipPath id="ccavc"><circle cx="32" cy="32" r="32"/></clipPath><g clip-path="url(#ccavc)">' + head +
      '<path class="s" d="M9 64c0-14 10-23 23-23s23 9 23 23z"/><path class="a" d="M41.5 46.2l9.6 4.6-3.6 8.2-9.8-4.4z"/><path class="w" d="M40 51l9.8 4.4"/></g></svg>';
  }
  // ---------- 1.05.1: ปุ่ม Back / ปัดย้อนกลับ = ปิดสิ่งที่เปิดซ้อนอยู่บนสุดก่อน ----------
  // ชั้น: รูปเต็มจอ · ป็อปอัป (.mdl) · หน้ารายละเอียดในหน้า (back.sub) · งานที่ยังไม่บันทึก (back.dirty = ถามก่อนออก) · เปิดเป็นแอป = "กด Back อีกครั้งเพื่อออก"
  var back = (function () {
    var depth = 0, skip = 0, subs = [], dirties = [], leaving = false, armed = false, act = false, qd = false, busy = false;
    function layers() {
      var L = [];
      if (!leaving) {
        if (act && !armed && standalone()) L.push({ z: 1, close: function () { armed = true; toast("กด Back อีกครั้งเพื่อออก"); setTimeout(function () { armed = false; sync(); }, 2200); } });
        dirties.forEach(function (d) { try { var m = d.fn(); if (m) L.push({ z: 5, close: function () { askLeave(typeof m === "string" ? m : d.msg); } }); } catch (e) { } });
      }
      subs.forEach(function (x, i) { try { if (x.open()) L.push({ z: 20 + i, close: x.close }); } catch (e) { } });
      Array.prototype.forEach.call(document.querySelectorAll(".mdl"), function (m, i) { if (!m.hidden) L.push({ z: 100 + i, close: function () { if (m.__close) m.__close(); else m.remove(); } }); });
      Array.prototype.forEach.call(document.querySelectorAll(".zoom"), function (z, i) { L.push({ z: 1000 + i, close: function () { z.remove(); } }); });
      return L.sort(function (a, b) { return a.z - b.z; });
    }
    function sync() {
      qd = false; if (busy || skip) return;
      var n = layers().length;
      while (depth < n) { depth++; try { history.pushState({ bk: depth }, ""); } catch (e) { return; } }
      if (depth > n) { skip = 1; var k = depth - n; depth = n; history.go(-k); }
    }
    function later() { if (!qd) { qd = true; setTimeout(sync, 60); } }
    function askLeave(msg) {
      busy = true;
      ask("ยังไม่ได้บันทึก", msg || "ออกจากหน้านี้เลยไหม?", "ออก ไม่บันทึก").then(function (ok) {
        if (ok) { leaving = true; var k = depth + 1; depth = 0; history.go(-k); } else { busy = false; sync(); }
      });
    }
    window.addEventListener("popstate", function () {
      if (skip) { skip = 0; later(); return; }
      if (busy) { try { history.pushState({ bk: depth }, ""); } catch (e) { } return; }
      if (depth <= 0) return;
      depth--;
      var L = layers(), top = L[L.length - 1];
      if (top && top.close) { try { top.close(); } catch (e) { } }
      later();
    });
    window.addEventListener("beforeunload", function (e) { if (leaving) return; if (dirties.some(function (d) { try { return !!d.fn(); } catch (x) { return false; } })) { e.preventDefault(); e.returnValue = ""; } });
    function onAct() { if (!act) { act = true; later(); } }
    document.addEventListener("pointerdown", onAct, true); document.addEventListener("keydown", onAct, true);
    function boot() {
      try { if (history.state && history.state.bk) history.replaceState(null, ""); } catch (e) { }
      new MutationObserver(later).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "class"] });
      later();
    }
    if (document.body) boot(); else document.addEventListener("DOMContentLoaded", boot);
    return { sub: function (open, close) { subs.push({ open: open, close: close }); later(); }, dirty: function (fn, msg) { dirties.push({ fn: fn, msg: msg }); }, sync: later, leave: function () { leaving = true; } };
  })();

  var ring = function (score, start) { // 1.03.1: เขียว 0–คะแนนเริ่มต้น · น้ำเงินซ้อนเมื่อเกิน (เต็มวง +250) · แดงเมื่อติดลบ (เต็มวง −250)
    score = Number(score) || 0; start = Number(start) || 100; var R = 56, C = 2 * Math.PI * R, CAP = 250;
    var arc = function (f, col) { f = Math.max(0, Math.min(1, f)); return f <= 0 ? '' : '<circle cx="66" cy="66" r="56" fill="none" stroke="' + col + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (f * C).toFixed(1) + ' ' + C.toFixed(1) + '"/>'; };
    var s = '<circle cx="66" cy="66" r="56" fill="none" stroke="var(--ring-track,#e5e7eb)" stroke-width="12"/>';
    if (score < 0) s += arc(-score / CAP, '#dc2626'); else { s += arc(score / start, '#16a34a'); if (score > start) s += arc((score - start) / CAP, '#2563eb'); }
    var cls = score < 0 ? 'neg' : (score > start ? 'over' : ''), sub = score < 0 ? 'ติดลบ' : (score > start ? 'เกิน +' + (score - start) : 'จาก ' + start);
    return '<div class="sring ' + cls + '" title="คะแนน ' + score + '"><svg viewBox="0 0 132 132" aria-hidden="true">' + s + '</svg><div class="in"><b>' + score + '</b><small>' + sub + '</small></div></div>';
  };
  return { ask: ask, back: back, councilAv: councilAv, ring: ring, API: API, VERSION: VERSION, $: $, store: store, esc: esc, toast: toast, thD: thD, api: api, setErr: function (f) { onErr = f; }, IC: IC, chrome: chrome, status: status, roster: roster, Picker: Picker, norm: norm, hit: hit, mark: mark, PRE: PRE };
})();
