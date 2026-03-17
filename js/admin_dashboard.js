import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { collection, getDocs, getFirestore, limit, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDPdZYSPu0hKa0tC7kZunBBJGqRJnI6OvM",
    authDomain: "cooktrust-26b0e.firebaseapp.com",
    projectId: "cooktrust-26b0e",
    storageBucket: "cooktrust-26b0e.firebasestorage.app",
    messagingSenderId: "609770127869",
    appId: "1:609770127869:web:e9ee3517085fc949aad994",
    measurementId: "G-V77G450M59"
};

const ADMIN_EMAILS = [
    "anhntkhe182290@fpt.edu.vn",
    "cooktrusteatcleanfood@gmail.com"
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const el = {
    loginBtn: document.getElementById("login-btn"),
    logoutBtn: document.getElementById("logout-btn"),
    refreshBtn: document.getElementById("refresh-btn"),
    authNote: document.getElementById("auth-note"),
    ordersRoot: document.getElementById("orders-root")
};

function formatCurrency(value) {
    return Number(value || 0).toLocaleString("vi-VN") + " VND";
}

function isAdmin(user) {
    return !!user && ADMIN_EMAILS.includes((user.email || "").toLowerCase());
}

function qrImageUrl(text) {
    return "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(text);
}

function printQr(comboName, qrUrl) {
    const w = window.open("", "_blank", "width=420,height=520");
    if (!w) return;
    w.document.write(`
      <html><head><title>Print QR</title></head>
      <body style="font-family:Arial;padding:20px;text-align:center;">
        <h3>${comboName}</h3>
        <img src="${qrImageUrl(qrUrl)}" alt="QR" style="width:260px;height:260px;"/>
        <p style="word-break:break-all;font-size:12px;">${qrUrl}</p>
        <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    w.document.close();
}

function renderOrders(orders) {
    if (!orders.length) {
        el.ordersRoot.innerHTML = `<div class="card">Chưa có đơn hàng nào.</div>`;
        return;
    }

    el.ordersRoot.innerHTML = orders.map((order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        const itemHtml = items.map((item) => {
            const hasQr = !!item.qrUrl;
            return `
                <div class="item">
                    <div><strong>${item.comboName || "Combo"}</strong> - ${item.quantity || 1} suất</div>
                    <div class="muted">Dịch vụ: ${item.serviceType || "none"} | Phí: ${formatCurrency(item.serviceType === "none" ? 0 : (item.quantity || 1) * 5000)}</div>
                    ${hasQr ? `
                        <div class="qr-grid">
                            <div class="qr-box">
                                <div><strong>Mã QR để in</strong></div>
                                <img src="${qrImageUrl(item.qrUrl)}" alt="qr">
                                <div class="muted" style="word-break:break-all;">${item.qrUrl}</div>
                                <button class="btn outline print-qr-btn" data-combo="${item.comboName || "Combo"}" data-url="${item.qrUrl}">In QR</button>
                            </div>
                            <div class="qr-box">
                                <div><strong>Nội dung sẽ hiện sau khi quét</strong></div>
                                <p>${item.resolvedMessageText || "(Không có nội dung)"}</p>
                            </div>
                        </div>
                    ` : `<div class="muted">Không có dịch vụ lời nhắn cho item này.</div>`}
                </div>
            `;
        }).join("");

        return `
            <div class="card">
                <div class="row" style="justify-content:space-between;">
                    <strong>Đơn #${order.id || ""}</strong>
                    <span class="muted">${order.createdAt || ""}</span>
                </div>
                <div class="muted">Khách: ${order.customerName || ""} | SĐT: ${order.phone || ""}</div>
                <div class="muted">Địa chỉ: ${order.address || ""}</div>
                <div class="muted">Tổng tiền: <strong>${formatCurrency(order.totalAmount)}</strong></div>
                ${itemHtml}
            </div>
        `;
    }).join("");

    el.ordersRoot.querySelectorAll(".print-qr-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            printQr(btn.dataset.combo || "Combo", btn.dataset.url || "");
        });
    });
}

async function loadOrders() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(q);
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderOrders(orders);
}

function setViewByUser(user) {
    const admin = isAdmin(user);
    el.loginBtn.classList.toggle("hidden", !!user);
    el.logoutBtn.classList.toggle("hidden", !user);
    el.refreshBtn.classList.toggle("hidden", !admin);
    el.ordersRoot.classList.toggle("hidden", !admin);

    if (!user) {
        el.authNote.classList.remove("hidden");
        el.authNote.textContent = "Vui lòng đăng nhập tài khoản admin để xem dữ liệu.";
        return;
    }

    if (!admin) {
        el.authNote.classList.remove("hidden");
        el.authNote.textContent = "Tài khoản này không có quyền admin.";
        return;
    }

    el.authNote.classList.add("hidden");
    loadOrders().catch((error) => {
        console.error(error);
        el.authNote.classList.remove("hidden");
        el.authNote.textContent = "Không tải được đơn hàng từ Firestore.";
    });
}

el.loginBtn?.addEventListener("click", async () => {
    await signInWithPopup(auth, provider);
});

el.logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
});

el.refreshBtn?.addEventListener("click", async () => {
    await loadOrders();
});

onAuthStateChanged(auth, (user) => {
    setViewByUser(user);
});
