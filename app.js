const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
const naira = (n) => "₦" + Number(n).toLocaleString("en-NG");
const uid = () => Math.random().toString(36).slice(2, 9);
const KEY = "farmgate_v1";
const P = (name, cat, price, unit, qty, place, shape, color) => ({
  id: uid(),
  farmer: "u2",
  name,
  cat,
  price,
  unit,
  qty,
  place,
  shape,
  color,
});
const seed = () => ({
  users: [
    {
      id: "u1",
      name: "Demo Admin",
      email: "admin@farmgate.com",
      pass: "admin123",
      role: "admin",
    },
    {
      id: "u2",
      name: "Ada Okafor",
      email: "farmer@farmgate.com",
      pass: "farmer123",
      role: "farmer",
      farm: "Okafor Greens",
      place: "Ibadan",
      status: "approved",
    },
  ],
  products: [
    P(
      "Vine tomatoes",
      "Vegetables",
      1800,
      "kg",
      120,
      "Ibadan",
      "round",
      "#d9432f"
    ),
    P(
      "Sweet oranges",
      "Fruit",
      1200,
      "basket",
      40,
      "Ibadan",
      "round",
      "#f29a2e"
    ),
    P("Fresh carrots", "Vegetables", 1500, "kg", 80, "Jos", "long", "#ee7b22"),
    P(
      "Ugu leaves",
      "Leafy greens",
      500,
      "bunch",
      60,
      "Ibadan",
      "leaf",
      "#2f8f52"
    ),
    P(
      "White yam",
      "Tubers",
      3500,
      "tuber",
      50,
      "Ogbomosho",
      "tuber",
      "#b98a5a"
    ),
    P(
      "Ripe plantain",
      "Fruit",
      2500,
      "bunch",
      35,
      "Ibadan",
      "bunch",
      "#e9c53c"
    ),
    P("Cassava", "Tubers", 1000, "kg", 90, "Abeokuta", "long", "#c9a574"),
    P("Spinach", "Leafy greens", 400, "bunch", 70, "Jos", "leaf", "#1f6b3a"),
  ],
  orders: [],
  cart: [],
  session: null,
});
let db;
try {
  db = JSON.parse(localStorage.getItem(KEY));
} catch {}
db = db || seed();
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {}
};
const me = () => db.users.find((u) => u.id === db.session);
const farmer = (id) => db.users.find((u) => u.id === id);
const go = (h) => (location.hash === h ? route() : (location.hash = h));

/* illustrations (no photos needed) */
function art(p, size = 120) {
  const c = p.color,
    g = "#2f8f52";
  const S = {
    round: `<circle cx="60" cy="68" r="34" fill="${c}"/><ellipse cx="48" cy="56" rx="9" ry="5" fill="#fff" opacity=".3"/><path d="M60 34c-6-8-16-8-20-4 8 0 12 2 20 4zm0 0c6-8 16-8 20-4-8 0-12 2-20 4z" fill="${g}"/>`,
    long: `<path d="M44 40q16-6 32 0l-12 62q-4 8-8 0z" fill="${c}"/><path d="M50 30l6 12m4-16v16m10-12l-6 12" stroke="${g}" stroke-width="6" stroke-linecap="round"/>`,
    leaf: `<g fill="${c}"><ellipse cx="60" cy="62" rx="14" ry="34"/><ellipse cx="40" cy="70" rx="12" ry="28" transform="rotate(-28 40 70)"/><ellipse cx="80" cy="70" rx="12" ry="28" transform="rotate(28 80 70)"/></g><path d="M60 40v56" stroke="#fff6" stroke-width="3"/>`,
    tuber: `<ellipse cx="60" cy="68" rx="40" ry="24" transform="rotate(-18 60 68)" fill="${c}"/><g fill="#0002"><circle cx="44" cy="70" r="3"/><circle cx="62" cy="62" r="3"/><circle cx="78" cy="56" r="3"/><circle cx="68" cy="76" r="3"/></g>`,
    bunch: `<g fill="${c}"><path d="M30 80q10-40 50-40-30 8-34 46z"/><path d="M42 88q12-34 52-30-30 6-38 40z"/><path d="M56 94q14-26 50-18-26 4-42 34z"/></g>`,
  };
  return `<svg class="art" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true"><ellipse cx="60" cy="108" rx="34" ry="6" fill="#0001"/>${
    S[p.shape] || S.round
  }</svg>`;
}

/* small helpers: toast, reveal-on-scroll, count-up, fly-to-basket */
function toast(t) {
  const e = document.createElement("div");
  e.className = "toast";
  e.textContent = t;
  $("#toasts").append(e);
  setTimeout(() => e.remove(), 3200);
}
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
        setTimeout(() => (e.target.style.transitionDelay = ""), 900);
      }
    }),
  { threshold: 0.12 }
);
function reveal() {
  $$(".reveal:not(.in)").forEach((e, i) => {
    e.style.transitionDelay = (i % 6) * 70 + "ms";
    io.observe(e);
  });
}
function countUp() {
  $$("[data-to]").forEach((e) => {
    const to = +e.dataset.to,
      t0 = performance.now();
    (function f(t) {
      const k = Math.min(1, (t - t0) / 1200);
      e.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  });
}
function fly(from) {
  const a = from.getBoundingClientRect(),
    b = $("#cartBtn").getBoundingClientRect();
  const d = document.createElement("i");
  d.className = "fly";
  document.body.append(d);
  d.animate(
    [
      {
        transform: `translate(${a.left + a.width / 2}px,${a.top}px) scale(1)`,
        opacity: 1,
      },
      {
        transform: `translate(${b.left + b.width / 2}px,${
          b.top + 8
        }px) scale(.3)`,
        opacity: 0.4,
      },
    ],
    { duration: 700, easing: "cubic-bezier(.5,-.3,.7,.4)" }
  ).onfinish = () => d.remove();
}

/* nav */
const cartCount = () => db.cart.reduce((a, c) => a + c.qty, 0);
const updCount = () => ($("#count").textContent = cartCount());
function nav() {
  const u = me(),
    l = [["#/market", "Market"]];
  if (u?.role === "farmer") l.push(["#/sell", "My farm"]);
  if (u?.role === "buyer") l.push(["#/orders", "My orders"]);
  if (u?.role === "admin") l.push(["#/admin", "Admin"]);
  $("#nav").innerHTML =
    l
      .map(
        ([h, t]) =>
          `<a href="${h}" class="${location.hash === h ? "on" : ""}">${t}</a>`
      )
      .join("") +
    (u
      ? `<button class="ghost" id="out">Log out</button>`
      : `<a class="pill" href="#/login">Log in</a>`);
}

/* home */
function home(v) {
  const f = (c, s, k) =>
    `<div class="float ${k}">${art({ shape: s, color: c }, 90)}</div>`;
  v.innerHTML = `<section class="hero"><div class="sun"></div>
    <svg class="sprout" viewBox="0 0 100 120" aria-hidden="true"><path pathLength="1" d="M50 118V54"/><path pathLength="1" d="M50 80C28 80 18 66 18 48c20 0 32 10 32 32"/><path pathLength="1" d="M50 62c0-20 10-34 32-38 2 22-10 38-32 38z"/></svg>
    <h1>Fresh from the farm, straight to your door</h1>
    <p>Buy vegetables, fruit and tubers from farmers near you. Farmers set their own prices and you track every order.</p>
    <a class="big" href="#/market">Browse fresh produce</a>
    <a class="link" href="#/signup">I grow produce and want to sell</a>
    ${f("#d9432f", "round", "f1")}${f("#ee7b22", "long", "f2")}${f(
    "#2f8f52",
    "leaf",
    "f3"
  )}${f("#e9c53c", "bunch", "f4")}</section>
    <div class="stats"><div><b data-to="${
      db.users.filter((x) => x.role === "farmer" && x.status === "approved")
        .length
    }">0</b>farmers selling</div><div><b data-to="${
    db.products.length
  }">0</b>items listed</div><div><b data-to="${
    db.orders.length
  }">0</b>orders placed</div></div>
    <h2 class="pt">How it works</h2>
    <div class="steps"><div class="reveal"><h3>Farmers list their harvest</h3><p>Add a price, a quantity and a look for each item.</p></div><div class="reveal"><h3>You fill your basket</h3><p>Search, filter and add what you need.</p></div><div class="reveal"><h3>The farmer packs it</h3><p>Follow your order from Placed to Delivered.</p></div></div>
    <h2 class="pt">Fresh today</h2><div class="grid">${db.products
      .slice(0, 4)
      .map(card)
      .join("")}</div>`;
  countUp();
}
const card = (p) => {
  const f = farmer(p.farmer);
  return `<article class="card reveal"><div class="pic" style="--c:${esc(
    p.color
  )}">${art(p)}</div><div class="cb"><h3>${esc(
    p.name
  )}</h3><p class="mut">${esc(f?.farm || "Farm")}, ${esc(
    p.place
  )}</p><p class="price">${naira(p.price)}<small> per ${esc(
    p.unit
  )}</small></p><p class="mut">${p.qty} ${esc(
    p.unit
  )} left</p><div class="row"><input type="number" min="1" max="${
    p.qty
  }" value="1" aria-label="Quantity"><button class="add" data-id="${p.id}" ${
    p.qty < 1 ? "disabled" : ""
  }>${p.qty < 1 ? "Sold out" : "Add to basket"}</button></div></div></article>`;
};

/* market */
function market(v) {
  let q = "",
    cat = "All",
    so = "new";
  const cats = ["All", ...new Set(db.products.map((p) => p.cat))];
  v.innerHTML = `<h2 class="pt">Market</h2><div class="tools"><input id="q" type="search" placeholder="Search produce" aria-label="Search produce"><select id="so" aria-label="Sort"><option value="new">Newest</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option></select></div><div class="chips">${cats
    .map(
      (c) =>
        `<button class="chip${c === "All" ? " on" : ""}">${esc(c)}</button>`
    )
    .join("")}</div><div id="grid" class="grid"></div>`;
  const draw = () => {
    const L = db.products.filter(
      (p) =>
        (cat === "All" || p.cat === cat) && p.name.toLowerCase().includes(q)
    );
    if (so === "lo") L.sort((a, b) => a.price - b.price);
    if (so === "hi") L.sort((a, b) => b.price - a.price);
    $("#grid").innerHTML =
      L.map(card).join("") ||
      '<p class="empty">Nothing matches. Clear the search or pick another category.</p>';
    reveal();
  };
  $("#q").oninput = (e) => {
    q = e.target.value.toLowerCase().trim();
    draw();
  };
  $("#so").onchange = (e) => {
    so = e.target.value;
    draw();
  };
  $$(".chip").forEach(
    (b) =>
      (b.onclick = () => {
        $$(".chip").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        cat = b.textContent;
        draw();
      })
  );
  draw();
}

/* basket */
function addCart(id, qty, btn) {
  const p = db.products.find((x) => x.id === id);
  if (!p) return;
  const c = db.cart.find((x) => x.id === id),
    n = Math.min(p.qty, (c ? c.qty : 0) + Math.max(1, qty | 0));
  if (c) c.qty = n;
  else db.cart.push({ id, qty: n });
  save();
  fly(btn);
  setTimeout(() => {
    updCount();
    const b = $("#cartBtn");
    b.classList.remove("bump");
    void b.offsetWidth;
    b.classList.add("bump");
  }, 650);
  toast(`${p.name} added to your basket`);
}
function drawCart() {
  const items = db.cart
    .map((c) => ({ c, p: db.products.find((p) => p.id === c.id) }))
    .filter((x) => x.p);
  const total = items.reduce((a, { c, p }) => a + c.qty * p.price, 0);
  $("#cartBody").innerHTML = items.length
    ? items
        .map(
          ({ c, p }) =>
            `<div class="line"><div>${art(p, 52)}</div><div><b>${esc(
              p.name
            )}</b><br><span class="mut">${naira(p.price)} per ${esc(
              p.unit
            )}</span></div><div class="qty"><button data-q="-1" data-id="${
              p.id
            }" aria-label="Fewer">−</button><span>${
              c.qty
            }</span><button data-q="1" data-id="${
              p.id
            }" aria-label="More">+</button></div></div>`
        )
        .join("") +
      `<p class="total">Total <b>${naira(
        total
      )}</b></p><input id="addr" placeholder="Delivery address" aria-label="Delivery address"><input id="ph" placeholder="Phone number" inputmode="tel" aria-label="Phone number"><button class="big sm" id="place">Place order</button>`
    : `<p class="empty">Your basket is empty. Add something fresh from the market.</p>`;
}
function checkout() {
  const u = me();
  if (!u) {
    $("#drawer").classList.remove("open");
    toast("Log in or sign up as a buyer to order");
    return go("#/login");
  }
  if (u.role !== "buyer") {
    toast("Only buyer accounts can place orders");
    return;
  }
  const a = $("#addr").value.trim(),
    ph = $("#ph").value.trim();
  if (!a || !ph) {
    toast("Add your delivery address and phone number");
    return;
  }
  const items = db.cart
    .map((c) => {
      const p = db.products.find((x) => x.id === c.id);
      return (
        p && {
          pid: p.id,
          name: p.name,
          unit: p.unit,
          price: p.price,
          qty: Math.min(c.qty, p.qty),
          farmer: p.farmer,
        }
      );
    })
    .filter((i) => i && i.qty > 0);
  if (!items.length) {
    toast("Those items are sold out");
    return;
  }
  items.forEach((i) => (db.products.find((p) => p.id === i.pid).qty -= i.qty));
  db.orders.unshift({
    id: uid().toUpperCase(),
    buyer: u.id,
    items,
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
    address: a,
    phone: ph,
    status: "Placed",
    date: new Date().toLocaleDateString("en-NG"),
  });
  db.cart = [];
  save();
  updCount();
  $("#drawer").classList.remove("open");
  const d = document.createElement("div");
  d.className = "done";
  d.innerHTML =
    '<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg><p>Order placed</p>';
  document.body.append(d);
  setTimeout(() => d.remove(), 1800);
  go("#/orders");
}

/* auth */
const signin = (u) => {
  db.session = u.id;
  save();
  toast(`Welcome, ${u.name.split(" ")[0]}`);
  go(
    u.role === "farmer" ? "#/sell" : u.role === "admin" ? "#/admin" : "#/market"
  );
};
function auth(v, mode) {
  const s = mode === "signup";
  v.innerHTML =
    `<section class="auth"><h2>${
      s ? "Create your account" : "Welcome back"
    }</h2><form id="f" novalidate>` +
    (s
      ? `<label>Full name<input name="name" autocomplete="name"></label>`
      : "") +
    `<label>Email<input name="email" type="email" autocomplete="email"></label><label>Password<input name="pass" type="password" autocomplete="${
      s ? "new" : "current"
    }-password"></label>` +
    (s
      ? `<fieldset><legend>I want to</legend><label class="opt"><input type="radio" name="role" value="buyer" checked> Buy produce</label><label class="opt"><input type="radio" name="role" value="farmer"> Sell produce</label></fieldset><div id="fx" hidden><label>Farm name<input name="farm"></label><label>Farm location<input name="place"></label><label>Farm registration or ID number<input name="proof"></label><p class="mut">An admin checks these details before your listings go live.</p></div>`
      : "") +
    `<p id="err" class="err" role="alert"></p><button class="big sm">${
      s ? "Create account" : "Log in"
    }</button></form><p class="mut">${
      s
        ? 'Already have an account? <a href="#/login">Log in</a>'
        : 'New here? <a href="#/signup">Sign up</a>'
    }</p>${
      s
        ? ""
        : '<p class="mut demo">Demo admin: admin@farmgate.com / admin123<br>Demo farmer: farmer@farmgate.com / farmer123</p>'
    }</section>`;
  const f = $("#f"),
    err = (m) => {
      $("#err").textContent = m;
      f.classList.remove("shake");
      void f.offsetWidth;
      f.classList.add("shake");
    };
  if (s)
    $$("[name=role]", f).forEach(
      (r) =>
        (r.onchange = () =>
          ($("#fx").hidden = new FormData(f).get("role") !== "farmer"))
    );
  f.onsubmit = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    d.email = (d.email || "").trim().toLowerCase();
    if (!d.email || !d.pass) return err("Enter your email and password.");
    if (!s) {
      const u = db.users.find((x) => x.email === d.email && x.pass === d.pass);
      return u
        ? signin(u)
        : err("That email and password do not match an account.");
    }
    if (!d.name?.trim()) return err("Enter your full name.");
    if (d.pass.length < 6)
      return err("Use a password of at least 6 characters.");
    if (db.users.some((x) => x.email === d.email))
      return err("An account with this email already exists. Log in instead.");
    const u = {
      id: uid(),
      name: d.name.trim(),
      email: d.email,
      pass: d.pass,
      role: d.role,
    };
    if (d.role === "farmer") {
      if (!d.farm?.trim() || !d.place?.trim() || !d.proof?.trim())
        return err(
          "Fill in your farm name, location and registration or ID number."
        );
      Object.assign(u, {
        farm: d.farm.trim(),
        place: d.place.trim(),
        proof: d.proof.trim(),
        status: "pending",
      });
    }
    db.users.push(u);
    signin(u);
  };
}

/* farmer dashboard */
function sell(v) {
  const u = me();
  if (!u || u.role !== "farmer") return go("#/login");
  if (u.status !== "approved") {
    v.innerHTML = `<section class="auth"><h2>Waiting for approval</h2><p>An admin is checking your farm details. You can list produce as soon as you are approved.</p></section>`;
    return;
  }
  const mine = db.products.filter((p) => p.farmer === u.id),
    inc = db.orders.filter((o) => o.items.some((i) => i.farmer === u.id));
  const opt = (a) => a.map((x) => `<option>${x}</option>`).join("");
  v.innerHTML = `<h2 class="pt">${esc(
    u.farm
  )}</h2><div class="two"><form id="lf" class="panel"><h3>List new produce</h3><div id="pv" class="pic prev"></div>
    <label>Name<input name="name" placeholder="Fresh peppers"></label>
    <label>Category<select name="cat">${opt([
      "Vegetables",
      "Fruit",
      "Leafy greens",
      "Tubers",
      "Grains",
    ])}</select></label>
    <div class="row"><label style="flex:1">Price in ₦<input name="price" type="number" min="1"></label><label style="flex:1">Sold per<select name="unit">${opt(
      ["kg", "basket", "bunch", "tuber", "bag"]
    )}</select></label></div>
    <label>Quantity available<input name="qty" type="number" min="1"></label>
    <div class="row"><label style="flex:1">Illustration<select name="shape"><option value="round">Round</option><option value="long">Long</option><option value="leaf">Leafy</option><option value="tuber">Tuber</option><option value="bunch">Bunch</option></select></label><label style="flex:1">Colour<input name="color" type="color" value="#d9432f"></label></div>
    <button class="big sm">List produce</button></form>
    <div><div class="panel"><h3>My listings</h3>${
      mine
        .map(
          (p) =>
            `<div class="row sp"><span>${esc(p.name)} <span class="mut">${
              p.qty
            } ${esc(p.unit)} at ${naira(
              p.price
            )}</span></span><button class="ghost" data-del="${
              p.id
            }">Remove</button></div>`
        )
        .join("") ||
      '<p class="empty">Nothing listed yet. Use the form to add your first item.</p>'
    }</div>
    <div class="panel"><h3>Incoming orders</h3>${
      inc
        .map(
          (o) =>
            `<div class="panel"><b>Order ${o.id}</b><span>${o.items
              .filter((i) => i.farmer === u.id)
              .map((i) => `${i.qty} ${esc(i.unit)} ${esc(i.name)}`)
              .join(", ")}</span><span class="mut">${esc(o.address)}, ${esc(
              o.phone
            )}</span><select data-status="${o.id}" aria-label="Order status">${[
              "Placed",
              "Packed",
              "On the way",
              "Delivered",
            ]
              .map(
                (s) =>
                  `<option${s === o.status ? " selected" : ""}>${s}</option>`
              )
              .join("")}</select></div>`
        )
        .join("") || '<p class="empty">No orders yet.</p>'
    }</div></div></div>`;
  const pv = () => {
    const d = Object.fromEntries(new FormData($("#lf")));
    $("#pv").style.setProperty("--c", d.color);
    $("#pv").innerHTML = art({ shape: d.shape, color: d.color }, 110);
  };
  $("#lf").oninput = pv;
  pv();
  $("#lf").onsubmit = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (!d.name.trim() || +d.price < 1 || +d.qty < 1)
      return toast("Add a name, a price and a quantity");
    db.products.unshift({
      id: uid(),
      farmer: u.id,
      name: d.name.trim(),
      cat: d.cat,
      price: +d.price,
      unit: d.unit,
      qty: +d.qty,
      place: u.place,
      shape: d.shape,
      color: d.color,
    });
    save();
    toast("Produce listed");
    route();
  };
}

/* buyer orders */
function orders(v) {
  const u = me();
  if (!u || u.role !== "buyer") return go("#/login");
  const S = ["Placed", "Packed", "On the way", "Delivered"],
    L = db.orders.filter((o) => o.buyer === u.id);
  v.innerHTML =
    `<h2 class="pt">My orders</h2>` +
    (L.map((o) => {
      const k = S.indexOf(o.status);
      return `<article class="panel reveal"><div class="row sp"><b>Order ${
        o.id
      }</b><span class="mut">${o.date}</span></div><p>${o.items
        .map((i) => `${i.qty} ${esc(i.unit)} ${esc(i.name)}`)
        .join(", ")}</p><div class="track" style="--p:${
        (k + 1) / 4
      }"><i></i>${S.map(
        (s, j) => `<span class="${j <= k ? "on" : ""}">${s}</span>`
      ).join("")}</div><p class="total">Total <b>${naira(
        o.total
      )}</b></p></article>`;
    }).join("") ||
      `<p class="empty">No orders yet. <a href="#/market">Browse the market</a> to place your first.</p>`);
}

/* admin */
function admin(v) {
  const u = me();
  if (!u || u.role !== "admin") return go("#/login");
  const fs = db.users.filter((x) => x.role === "farmer"),
    pend = fs.filter((x) => x.status === "pending");
  v.innerHTML = `<h2 class="pt">Admin</h2><div class="stats"><div><b data-to="${
    fs.length
  }">0</b>farmers</div><div><b data-to="${
    db.products.length
  }">0</b>listings</div><div><b data-to="${
    db.orders.length
  }">0</b>orders</div></div>
  <div class="panel"><h3>Farmers waiting for approval</h3>${
    pend
      .map(
        (f) =>
          `<div class="row sp"><span><b>${esc(f.farm)}</b>, ${esc(
            f.place
          )}<br><span class="mut">${esc(f.name)}, ID ${esc(
            f.proof
          )}</span></span><button class="pill" data-ok="${
            f.id
          }">Approve</button></div>`
      )
      .join("") || '<p class="empty">No farmers waiting.</p>'
  }</div>
  <div class="panel"><h3>All listings</h3>${
    db.products
      .map(
        (p) =>
          `<div class="row sp"><span>${esc(p.name)} <span class="mut">${esc(
            farmer(p.farmer)?.farm || ""
          )}</span></span><button class="ghost" data-del="${
            p.id
          }">Remove</button></div>`
      )
      .join("") || '<p class="empty">No listings.</p>'
  }</div>`;
  countUp();
}

/* events */
document.addEventListener("click", (e) => {
  const t = e.target.closest("button,a,[data-close]");
  if (!t) return;
  if (t.id === "cartBtn") {
    drawCart();
    $("#drawer").classList.add("open");
  } else if (t.dataset.close !== undefined)
    $("#drawer").classList.remove("open");
  else if (t.classList.contains("add"))
    addCart(t.dataset.id, +t.parentElement.querySelector("input").value, t);
  else if (t.dataset.q) {
    const c = db.cart.find((x) => x.id === t.dataset.id),
      p = db.products.find((x) => x.id === t.dataset.id);
    c.qty += +t.dataset.q;
    if (c.qty < 1) db.cart = db.cart.filter((x) => x !== c);
    else c.qty = Math.min(c.qty, p.qty);
    save();
    updCount();
    drawCart();
  } else if (t.id === "place") checkout();
  else if (t.id === "out") {
    db.session = null;
    save();
    toast("Logged out");
    go("#/");
  } else if (t.dataset.del) {
    db.products = db.products.filter((p) => p.id !== t.dataset.del);
    db.cart = db.cart.filter((c) => c.id !== t.dataset.del);
    save();
    toast("Listing removed");
    route();
  } else if (t.dataset.ok) {
    farmer(t.dataset.ok).status = "approved";
    save();
    toast("Farmer approved");
    route();
  }
});
document.addEventListener("change", (e) => {
  const id = e.target.dataset.status;
  if (!id) return;
  const o = db.orders.find((x) => x.id === id);
  o.status = e.target.value;
  save();
  toast(`Order ${id} marked ${o.status}`);
});

/* router */
const R = {
  "": home,
  market,
  login: (v) => auth(v, "login"),
  signup: (v) => auth(v, "signup"),
  sell,
  orders,
  admin,
};
function route() {
  const k = location.hash.replace(/^#\/?/, ""),
    v = $("#view");
  $("#drawer").classList.remove("open");
  v.classList.remove("enter");
  void v.offsetWidth;
  v.classList.add("enter");
  (R[k] || home)(v);
  nav();
  updCount();
  scrollTo(0, 0);
  reveal();
}
addEventListener("hashchange", route);
route();
