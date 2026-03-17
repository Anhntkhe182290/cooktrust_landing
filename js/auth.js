import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
    getAnalytics,
    isSupported as isAnalyticsSupported
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import {
    GoogleAuthProvider,
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDPdZYSPu0hKa0tC7kZunBBJGqRJnI6OvM",
    authDomain: "cooktrust-26b0e.firebaseapp.com",
    projectId: "cooktrust-26b0e",
    storageBucket: "cooktrust-26b0e.firebasestorage.app",
    messagingSenderId: "609770127869",
    appId: "1:609770127869:web:e9ee3517085fc949aad994",
    measurementId: "G-V77G450M59"
};

const SERVICE_FEE_PER_COMBO = 5000;
const SPECIAL_COMBO_QR_DAYS = 7;
const BILL_MESSENGER_URL = "https://web.facebook.com/messages/t/943941925474315";
const VIETQR_BASE_URL = "https://img.vietqr.io/image/tpbank-04797468401-compact.jpg";
const RANDOM_MESSAGE_TEMPLATES = [
    "Mỗi bữa ăn là một bước nhỏ để bạn tiến gần hơn tới phiên bản khỏe mạnh nhất của mình.",
    "Bạn đang làm rất tốt rồi, cố lên nhé.",
    "Ăn ngon, giữ dáng và luôn vui vẻ mỗi ngày.",
    "Cảm ơn bạn vì đã chọn yêu bản thân từ những điều nhỏ nhất.",
    "Hôm nay cũng là một ngày tuyệt vời để bắt đầu lại.",
    "Không cần hoàn hảo, chỉ cần bạn bền bỉ mỗi ngày.",
    "Bạn xứng đáng với một cơ thể khỏe và một tinh thần tích cực.",
    "Mình luôn ở đây đồng hành cùng bạn trên hành trình này."
];

let auth = null;
let provider = null;
let db = null;
let currentUser = null;
let analytics = null;
let checkoutState = { items: [], subtotal: 0, serviceFee: 0, shippingFee: 0, grandTotal: 0 };

const elements = {
    loginBtn: document.getElementById("google-login-btn"),
    userMenu: document.getElementById("user-menu"),
    avatarBtn: document.getElementById("avatar-btn"),
    userDropdown: document.getElementById("user-dropdown"),
    logoutMenuBtn: document.getElementById("logout-menu-btn"),
    userAvatar: document.getElementById("user-avatar"),
    userName: document.getElementById("user-name"),
    userGoogleId: document.getElementById("user-google-id"),
    historyBtn: document.getElementById("view-history-btn"),
    historyModal: document.getElementById("history-modal"),
    historyCloseBtn: document.getElementById("history-close-btn"),
    historyList: document.getElementById("history-list"),
    openSettingsBtn: document.getElementById("open-settings-btn"),
    settingsModal: document.getElementById("settings-modal"),
    settingsCloseBtn: document.getElementById("settings-close-btn"),
    settingsForm: document.getElementById("settings-form"),
    settingsPhone: document.getElementById("settings-phone"),
    settingsHouseNumber: document.getElementById("settings-house-number"),
    settingsCommune: document.getElementById("settings-commune"),
    settingsOtherCommuneWrap: document.getElementById("settings-other-commune-wrap"),
    settingsOtherCommune: document.getElementById("settings-other-commune"),
    comboCards: Array.from(document.querySelectorAll(".combo-card")),
    totalPriceEl: document.getElementById("combo-total-price"),
    openCheckoutBtn: document.getElementById("open-checkout-btn"),
    checkoutModal: document.getElementById("checkout-modal"),
    checkoutCloseBtn: document.getElementById("checkout-close-btn"),
    checkoutSummaryList: document.getElementById("checkout-summary-list"),
    checkoutTotalPrice: document.getElementById("checkout-total-price"),
    checkoutForm: document.getElementById("checkout-form"),
    checkoutSubmitBtn: document.getElementById("checkout-submit-btn"),
    checkoutPhone: document.getElementById("checkout-phone"),
    checkoutHouseNumber: document.getElementById("checkout-house-number"),
    checkoutCommune: document.getElementById("checkout-commune"),
    checkoutOtherCommuneWrap: document.getElementById("checkout-other-commune-wrap"),
    checkoutOtherCommune: document.getElementById("checkout-other-commune"),
    checkoutNote: document.getElementById("checkout-note"),
    checkoutShippingFee: document.getElementById("checkout-shipping-fee"),
    loveboxRecipientFields: document.getElementById("lovebox-recipient-fields"),
    recipientName: document.getElementById("recipient-name"),
    recipientPhone: document.getElementById("recipient-phone"),
    recipientAddress: document.getElementById("recipient-address"),
    paymentQrSection: document.getElementById("payment-qr-section"),
    qrTotalPrice: document.getElementById("qr-total-price"),
    paymentQrImage: document.getElementById("payment-qr-image"),
    sendBillBtn: document.getElementById("send-bill-btn"),
    qrRevealModal: document.getElementById("qr-reveal-modal"),
    qrRevealCloseBtn: document.getElementById("qr-reveal-close-btn"),
    qrRevealTitle: document.getElementById("qr-reveal-title"),
    qrRevealMessage: document.getElementById("qr-reveal-message")
};

function formatCurrency(value) {
    return Number(value).toLocaleString("vi-VN") + " VND";
}

function normalizeString(value) {
    return (value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function isCombo7Day(comboName) {
    const normalized = normalizeString(comboName).replace(/\s+/g, " ");
    return normalized.includes("combo 7 ngay") || normalized.includes("combo7");
}

function isLoveBox(comboName) {
    const normalized = normalizeString(comboName).replace(/\s+/g, " ");
    return normalized.includes("lovebox") || normalized.includes("love box");
}

function isSevenDayQrCombo(comboName) {
    return isCombo7Day(comboName) || isLoveBox(comboName);
}

function getGoogleId(user) {
    if (!user) return "";
    const googleProviderData = user.providerData.find((item) => item.providerId === "google.com");
    return googleProviderData?.uid || user.uid;
}

function buildAddress(houseNumber, commune) {
    return [houseNumber, commune, "Huyện Thạch Thất", "TP Hà Nội", "Việt Nam"].filter(Boolean).join(", ");
}

function getKnownCommuneOptions() {
    return ["Thạch Hòa", "Tân Xã", "Bình Yên"];
}

function resolveCommuneValue(selectValue, otherCommuneValue) {
    if (selectValue === "Khác") return (otherCommuneValue || "").trim();
    return selectValue || "";
}

function calculateShippingFee(commune) {
    const normalized = normalizeString(commune);
    if (!normalized) return 0;
    if (normalized === normalizeString("Thạch Hòa")) return 5000;
    if (normalized === normalizeString("Tân Xã") || normalized === normalizeString("Bình Yên")) return 10000;
    return 15000;
}

function toggleOtherCommuneField(mode) {
    if (mode === "checkout") {
        const isOther = elements.checkoutCommune?.value === "Khác";
        elements.checkoutOtherCommuneWrap?.classList.toggle("hidden", !isOther);
        if (elements.checkoutOtherCommune) elements.checkoutOtherCommune.required = !!isOther;
    }
    if (mode === "settings") {
        const isOther = elements.settingsCommune?.value === "Khác";
        elements.settingsOtherCommuneWrap?.classList.toggle("hidden", !isOther);
        if (elements.settingsOtherCommune) elements.settingsOtherCommune.required = !!isOther;
    }
}

function refreshShippingFee() {
    const communeOption = elements.checkoutCommune?.value || "";
    if (communeOption === "Khác") {
        checkoutState.shippingFee = 15000;
        if (elements.checkoutShippingFee) {
            elements.checkoutShippingFee.textContent = formatCurrency(checkoutState.shippingFee);
        }
        return;
    }

    const commune = resolveCommuneValue(
        communeOption,
        elements.checkoutOtherCommune?.value || ""
    );
    checkoutState.shippingFee = calculateShippingFee(commune);
    if (elements.checkoutShippingFee) {
        elements.checkoutShippingFee.textContent = formatCurrency(checkoutState.shippingFee);
    }
}

function getGlobalOrdersCollection() {
    return collection(db, "orders");
}

function getQrCodesCollection() {
    return collection(db, "qr_codes");
}

function generateQrToken() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function pickRandomMessageText() {
    const index = Math.floor(Math.random() * RANDOM_MESSAGE_TEMPLATES.length);
    return RANDOM_MESSAGE_TEMPLATES[index];
}

function pickUniqueRandomMessages(count) {
    if (count <= 0) return [];
    const pool = [...RANDOM_MESSAGE_TEMPLATES];
    const picked = [];

    while (picked.length < count) {
        if (pool.length === 0) {
            pool.push(...RANDOM_MESSAGE_TEMPLATES);
        }

        const index = Math.floor(Math.random() * pool.length);
        const [message] = pool.splice(index, 1);
        picked.push(message);
    }

    return picked;
}

function buildRevealUrl(token) {
    const revealUrl = new URL(window.location.href);
    revealUrl.searchParams.set("qr", token);
    revealUrl.hash = "reveal";
    return revealUrl.toString();
}

function getOrdersCollection(user) {
    return collection(db, "users", user.uid, "orders");
}

function getUserDocRef(user) {
    return doc(db, "users", user.uid);
}

function closeUserDropdown() {
    elements.userDropdown?.classList.add("hidden");
}

function closeSettingsModal() {
    if (elements.settingsModal) elements.settingsModal.style.display = "none";
}

function closeCheckoutModal() {
    if (elements.checkoutModal) elements.checkoutModal.style.display = "none";
}

function hideQrSection() {
    elements.paymentQrSection?.classList.add("hidden");
}

function closeQrRevealModal() {
    if (elements.qrRevealModal) elements.qrRevealModal.style.display = "none";
}

async function getUserProfile(user) {
    if (!user || !db) return {};
    const snap = await getDoc(getUserDocRef(user));
    if (!snap.exists()) return {};
    return snap.data();
}

async function saveSettings(user, payload) {
    if (!user || !db) throw new Error("Firestore is not initialized.");

    await setDoc(
        getUserDocRef(user),
        {
            displayName: user.displayName || "",
            email: user.email || "",
            googleId: getGoogleId(user),
            phone: payload.phone,
            houseNumber: payload.houseNumber,
            commune: payload.commune,
            address: buildAddress(payload.houseNumber, payload.commune),
            updatedAt: serverTimestamp()
        },
        { merge: true }
    );
}

async function saveOrder(user, order) {
    if (!user || !db) throw new Error("Firestore is not initialized.");
    const globalOrderRef = doc(getGlobalOrdersCollection());
    const orderId = globalOrderRef.id;
    const userOrderRef = doc(db, "users", user.uid, "orders", orderId);

    await setDoc(userOrderRef, order);
    await setDoc(globalOrderRef, {
        ...order,
        userId: user.uid
    });

    const qrEntries = (order.items || []).flatMap((item) => {
        if (Array.isArray(item.qrEntries) && item.qrEntries.length) {
            return item.qrEntries.map((entry) => ({
                ...entry,
                comboName: item.comboName,
                serviceType: item.serviceType,
                customMessageText: item.customMessageText || "",
                customMessageFileName: item.customMessageFileName || ""
            }));
        }

        if (!item.qrToken) return [];
        return [{
            qrToken: item.qrToken,
            qrUrl: item.qrUrl || "",
            resolvedMessageText: item.resolvedMessageText || "",
            comboName: item.comboName,
            serviceType: item.serviceType,
            customMessageText: item.customMessageText || "",
            customMessageFileName: item.customMessageFileName || ""
        }];
    });

    await Promise.all(qrEntries.map((entry) => {
        const qrRef = doc(getQrCodesCollection(), entry.qrToken);
        return setDoc(qrRef, {
            token: entry.qrToken,
            orderId,
            userId: user.uid,
            comboName: entry.comboName,
            serviceType: entry.serviceType,
            messageText: entry.resolvedMessageText || "",
            customMessageText: entry.customMessageText || "",
            customMessageFileName: entry.customMessageFileName || "",
            qrUrl: entry.qrUrl || "",
            dayNumber: entry.dayNumber || null,
            packageIndex: entry.packageIndex || null,
            createdAt: order.createdAt || new Date().toISOString(),
            status: "active"
        });
    }));

    return orderId;
}

async function getOrders(user) {
    if (!user || !db) return [];
    const ordersQuery = query(
        getOrdersCollection(user),
        orderBy("createdAt", "desc"),
        limit(50)
    );
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

async function openRevealByTokenFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const token = (params.get("qr") || "").trim();
    if (!token || !db) return;

    try {
        const qrSnap = await getDoc(doc(db, "qr_codes", token));
        if (!qrSnap.exists()) {
            if (elements.qrRevealTitle) elements.qrRevealTitle.textContent = "Mã QR không hợp lệ";
            if (elements.qrRevealMessage) elements.qrRevealMessage.textContent = "Không tìm thấy lời nhắn cho mã QR này.";
        } else {
            const data = qrSnap.data();
            if (elements.qrRevealTitle) elements.qrRevealTitle.textContent = "Lời nhắn dành cho bạn";
            if (elements.qrRevealMessage) elements.qrRevealMessage.textContent =
                data.messageText || "Bạn có một lời nhắn yêu thương từ CookTrust.";
        }
        if (elements.qrRevealModal) elements.qrRevealModal.style.display = "block";
    } catch (error) {
        console.error(error);
    }
}

function getSelectedCombos() {
    return elements.comboCards
        .map((card) => {
            const checkbox = card.querySelector(".combo-select");
            const qtyInput = card.querySelector(".combo-qty");
            if (!checkbox?.checked) return null;

            const comboName = card.dataset.comboName || "Combo";
            const unitPrice = Number(card.dataset.price || 0);
            const quantity = Math.max(1, Number(qtyInput?.value || 1));

            return {
                comboName,
                unitPrice,
                quantity,
                lineTotal: unitPrice * quantity,
                serviceType: "none",
                customMessageText: "",
                customMessageFileName: "",
                customMessageFileType: ""
            };
        })
        .filter(Boolean);
}

function refreshComboTotal() {
    const selected = getSelectedCombos();
    const total = selected.reduce((sum, item) => sum + item.lineTotal, 0);
    if (elements.totalPriceEl) elements.totalPriceEl.textContent = formatCurrency(total);
}

function resetComboSelection() {
    elements.comboCards.forEach((card) => {
        const checkbox = card.querySelector(".combo-select");
        const qtyInput = card.querySelector(".combo-qty");
        if (checkbox) checkbox.checked = false;
        if (qtyInput) {
            qtyInput.value = "1";
            qtyInput.disabled = true;
        }
    });
    refreshComboTotal();
}

function setupComboEvents() {
    elements.comboCards.forEach((card) => {
        const checkbox = card.querySelector(".combo-select");
        const qtyInput = card.querySelector(".combo-qty");

        checkbox?.addEventListener("change", () => {
            if (qtyInput) qtyInput.disabled = !checkbox.checked;
            refreshComboTotal();
        });

        qtyInput?.addEventListener("input", () => {
            if (!qtyInput.value || Number(qtyInput.value) < 1) qtyInput.value = "1";
            refreshComboTotal();
        });
    });
}

async function loadSettingsForm(user) {
    if (!user || !elements.settingsPhone || !elements.settingsHouseNumber || !elements.settingsCommune) return;
    const profile = await getUserProfile(user);
    elements.settingsPhone.value = profile.phone || "";
    elements.settingsHouseNumber.value = profile.houseNumber || "";
    const commune = profile.commune || "";
    const known = getKnownCommuneOptions();
    if (known.includes(commune)) {
        elements.settingsCommune.value = commune;
        if (elements.settingsOtherCommune) elements.settingsOtherCommune.value = "";
    } else if (commune) {
        elements.settingsCommune.value = "Khác";
        if (elements.settingsOtherCommune) elements.settingsOtherCommune.value = commune;
    } else {
        elements.settingsCommune.value = "";
        if (elements.settingsOtherCommune) elements.settingsOtherCommune.value = "";
    }
    toggleOtherCommuneField("settings");
}

function calculateServiceFee(items) {
    return items.reduce((sum, item) => {
        if (item.serviceType === "none") return sum;
        return sum + item.quantity * SERVICE_FEE_PER_COMBO;
    }, 0);
}

function updateCheckoutTotals() {
    checkoutState.subtotal = checkoutState.items.reduce((sum, item) => sum + item.lineTotal, 0);
    checkoutState.serviceFee = calculateServiceFee(checkoutState.items);
    refreshShippingFee();
    checkoutState.grandTotal = checkoutState.subtotal + checkoutState.serviceFee + checkoutState.shippingFee;

    if (elements.checkoutTotalPrice) {
        elements.checkoutTotalPrice.textContent = formatCurrency(checkoutState.grandTotal);
    }
}

function renderCheckoutSummaryItems() {
    if (!elements.checkoutSummaryList) return;

    elements.checkoutSummaryList.innerHTML = checkoutState.items
        .map((item, index) => {
            const serviceFee = item.serviceType === "none" ? 0 : item.quantity * SERVICE_FEE_PER_COMBO;
            const isSpecialCombo = isSevenDayQrCombo(item.comboName);
            const customVisible = item.serviceType === "custom" ? "" : "hidden";
            const customFieldsHtml = isSpecialCombo
                ? `
                        <p class="service-note">
                            Với ${item.comboName}, vui lòng gửi lời nhắn custom qua Messenger để được hỗ trợ tốt hơn.
                        </p>
                    `
                : `
                        <label>Nội dung lời nhắn custom</label>
                        <textarea class="service-custom-text" data-index="${index}" rows="3" placeholder="Nhập lời nhắn...">${item.customMessageText || ""}</textarea>
                        <label>Tải ảnh / video ngắn (dưới 3 phút)</label>
                        <input type="file" class="service-custom-file" data-index="${index}" accept="image/*,video/*">
                        <small>${item.customMessageFileName ? `Tệp đã chọn: ${item.customMessageFileName}` : "Chưa chọn tệp"}</small>
                    `;
            const randomLabel = isSpecialCombo
                ? `Kèm ${SPECIAL_COMBO_QR_DAYS} QR lời nhắn ngẫu nhiên (${SPECIAL_COMBO_QR_DAYS} ngày)`
                : "Kèm QR lời nhắn ngẫu nhiên";

            return `
                <div class="checkout-item" data-item-index="${index}">
                    <p><strong>${item.comboName}</strong></p>
                    <p>${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.lineTotal)}</p>
                    <div class="service-row">
                        <label>Dịch vụ cho combo này</label>
                        <select class="service-type-select" data-index="${index}">
                            <option value="none" ${item.serviceType === "none" ? "selected" : ""}>Không có</option>
                            <option value="random_qr" ${item.serviceType === "random_qr" ? "selected" : ""}>${randomLabel}</option>
                            <option value="custom" ${item.serviceType === "custom" ? "selected" : ""}>Lời nhắn custom</option>
                        </select>
                        <p>Phí dịch vụ combo này: <strong class="service-fee-value" data-index="${index}">${formatCurrency(serviceFee)}</strong></p>
                    </div>
                    <div class="custom-message-fields ${customVisible}" data-custom-wrap="${index}">
                        ${customFieldsHtml}
                    </div>
                </div>
            `;
        })
        .join("");

    updateCheckoutTotals();
}

function updateServiceFeeDisplay(index) {
    if (!elements.checkoutSummaryList) return;
    if (index < 0 || index >= checkoutState.items.length) return;

    const item = checkoutState.items[index];
    const serviceFee = item.serviceType === "none" ? 0 : item.quantity * SERVICE_FEE_PER_COMBO;
    const feeEl = elements.checkoutSummaryList.querySelector(`.service-fee-value[data-index='${index}']`);
    if (feeEl) feeEl.textContent = formatCurrency(serviceFee);
}

function getQrUrl(amount, orderCode) {
    const addInfo = `CookTrust ${orderCode}`;
    return `${VIETQR_BASE_URL}?amount=${encodeURIComponent(amount)}&addInfo=${encodeURIComponent(addInfo)}`;
}

async function getVideoDurationInSeconds(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
            const duration = video.duration;
            URL.revokeObjectURL(url);
            resolve(duration);
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Không đọc được video."));
        };

        video.src = url;
    });
}

async function openCheckoutFlow() {
    if (!currentUser) {
        alert("Vui lòng đăng nhập Google trước khi thanh toán.");
        return;
    }

    const items = getSelectedCombos();
    if (!items.length) {
        alert("Vui lòng chọn ít nhất một món trước khi thanh toán.");
        return;
    }

    checkoutState = { items, subtotal: 0, serviceFee: 0, shippingFee: 0, grandTotal: 0 };

    const profile = await getUserProfile(currentUser);
    if (elements.checkoutPhone) elements.checkoutPhone.value = profile.phone || "";
    if (elements.checkoutHouseNumber) elements.checkoutHouseNumber.value = profile.houseNumber || "";
    const commune = profile.commune || "";
    const known = getKnownCommuneOptions();
    if (known.includes(commune)) {
        if (elements.checkoutCommune) elements.checkoutCommune.value = commune;
        if (elements.checkoutOtherCommune) elements.checkoutOtherCommune.value = "";
    } else if (commune) {
        if (elements.checkoutCommune) elements.checkoutCommune.value = "Khác";
        if (elements.checkoutOtherCommune) elements.checkoutOtherCommune.value = commune;
    } else {
        if (elements.checkoutCommune) elements.checkoutCommune.value = "";
        if (elements.checkoutOtherCommune) elements.checkoutOtherCommune.value = "";
    }
    toggleOtherCommuneField("checkout");
    if (elements.checkoutNote) elements.checkoutNote.value = "";
    if (elements.recipientName) elements.recipientName.value = "";
    if (elements.recipientPhone) elements.recipientPhone.value = "";
    if (elements.recipientAddress) elements.recipientAddress.value = "";

    const hasLovebox = items.some((item) => isLoveBox(item.comboName));
    if (elements.loveboxRecipientFields) {
        elements.loveboxRecipientFields.classList.toggle("hidden", !hasLovebox);
    }
    if (elements.recipientName) elements.recipientName.required = hasLovebox;
    if (elements.recipientPhone) elements.recipientPhone.required = hasLovebox;
    if (elements.recipientAddress) elements.recipientAddress.required = hasLovebox;

    hideQrSection();
    if (elements.checkoutSubmitBtn) elements.checkoutSubmitBtn.disabled = false;
    renderCheckoutSummaryItems();

    if (elements.checkoutModal) elements.checkoutModal.style.display = "block";
}

async function validateServiceInputs() {
    for (let i = 0; i < checkoutState.items.length; i += 1) {
        const item = checkoutState.items[i];
        if (item.serviceType === "custom") {
            if (isSevenDayQrCombo(item.comboName)) {
                continue;
            }
            const text = (item.customMessageText || "").trim();
            const hasFile = !!item.customMessageFileName;
            if (!text && !hasFile) {
                return { ok: false, message: "Vui lòng nhập nội dung lời nhắn hoặc tệp cho lời nhắn custom." };
            }
        }
    }

    return { ok: true };
}

function updateAuthUI(user) {
    const isLoggedIn = !!user;

    if (elements.loginBtn) elements.loginBtn.classList.toggle("hidden", isLoggedIn);
    if (elements.userMenu) elements.userMenu.classList.toggle("hidden", !isLoggedIn);

    if (!isLoggedIn) {
        closeUserDropdown();
        closeSettingsModal();
        closeCheckoutModal();
        return;
    }

    if (elements.userAvatar) elements.userAvatar.src = user.photoURL || "assets/face.jpg";
    if (elements.userName) elements.userName.textContent = user.displayName || "Google User";
    if (elements.userGoogleId) elements.userGoogleId.textContent = `Google ID: ${getGoogleId(user)}`;
}

async function renderHistory() {
    if (!elements.historyList) return;
    elements.historyList.innerHTML = "<p>Đang tải lịch sử đơn hàng...</p>";

    try {
        const orders = await getOrders(currentUser);
        if (!orders.length) {
            elements.historyList.innerHTML = "<p>Chưa có đơn hàng nào.</p>";
            return;
        }

        elements.historyList.innerHTML = orders
            .map((order) => {
                const items = Array.isArray(order.items)
                    ? order.items.map((item) => `${item.comboName} x${item.quantity} (${item.serviceType || "none"})`).join(", ")
                    : order.combo || "Khong ro";

                return `
                    <div class="history-item">
                        <p><strong>Thoi gian:</strong> ${new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                        <p><strong>Mon da mua:</strong> ${items}</p>
                        <p><strong>Tong tien:</strong> ${formatCurrency(order.totalAmount || 0)}</p>
                        <p><strong>SDT:</strong> ${order.phone || ""}</p>
                        <p><strong>Dia chi:</strong> ${order.address || ""}</p>
                        <p><strong>Ghi chu:</strong> ${order.note || "Khong co"}</p>
                    </div>
                `;
            })
            .join("");
    } catch (error) {
        console.error(error);
        elements.historyList.innerHTML = "<p>Không tải được lịch sử đơn hàng.</p>";
    }
}

function bindEvents() {
    setupComboEvents();
    refreshComboTotal();

    elements.loginBtn?.addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
            alert("Đăng nhập Google thất bại.");
        }
    });

    elements.avatarBtn?.addEventListener("click", () => {
        elements.userDropdown?.classList.toggle("hidden");
    });

    elements.logoutMenuBtn?.addEventListener("click", async () => {
        await signOut(auth);
        closeUserDropdown();
        closeSettingsModal();
        closeCheckoutModal();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    elements.openCheckoutBtn?.addEventListener("click", async () => {
        await openCheckoutFlow();
    });

    elements.checkoutSummaryList?.addEventListener("change", async (event) => {
        const target = event.target;
        const index = Number(target.dataset.index || -1);
        if (index < 0 || index >= checkoutState.items.length) return;

        const item = checkoutState.items[index];

        if (target.classList.contains("service-type-select")) {
            item.serviceType = target.value;
            if (item.serviceType !== "custom") {
                item.customMessageText = "";
                item.customMessageFileName = "";
                item.customMessageFileType = "";
            } else if (isSevenDayQrCombo(item.comboName)) {
                item.customMessageText = "";
                item.customMessageFileName = "";
                item.customMessageFileType = "";
                alert("Với Combo 7 ngày/Love Box, vui lòng gửi lời nhắn custom qua Messenger để được hỗ trợ tốt hơn.");
            }

            const wrap = elements.checkoutSummaryList.querySelector(`[data-custom-wrap='${index}']`);
            if (wrap) wrap.classList.toggle("hidden", item.serviceType !== "custom");

            updateServiceFeeDisplay(index);
            updateCheckoutTotals();
        }

        if (target.classList.contains("service-custom-file")) {
            const file = target.files?.[0];
            if (isSevenDayQrCombo(item.comboName)) {
                target.value = "";
                return;
            }
            if (!file) {
                item.customMessageFileName = "";
                item.customMessageFileType = "";
                return;
            }

            if (file.type.startsWith("video/")) {
                try {
                    const duration = await getVideoDurationInSeconds(file);
                    if (duration > 180) {
                        alert("Vui lòng tải video dưới 3 phút.");
                        target.value = "";
                        item.customMessageFileName = "";
                        item.customMessageFileType = "";
                        return;
                    }
                } catch (error) {
                    console.error(error);
                    alert("Không thể đọc nội dung video.");
                    target.value = "";
                    item.customMessageFileName = "";
                    item.customMessageFileType = "";
                    return;
                }
            }

            item.customMessageFileName = file.name;
            item.customMessageFileType = file.type;
            renderCheckoutSummaryItems();
        }
    });

    elements.checkoutSummaryList?.addEventListener("input", (event) => {
        const target = event.target;
        if (!target.classList.contains("service-custom-text")) return;

        const index = Number(target.dataset.index || -1);
        if (index < 0 || index >= checkoutState.items.length) return;
        checkoutState.items[index].customMessageText = target.value;
    });

    elements.checkoutCloseBtn?.addEventListener("click", () => {
        closeCheckoutModal();
    });

    elements.checkoutForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!currentUser) return;

        const phone = elements.checkoutPhone?.value.trim() || "";
        const houseNumber = elements.checkoutHouseNumber?.value.trim() || "";
        const communeOption = elements.checkoutCommune?.value || "";
        const communeOther = elements.checkoutOtherCommune?.value.trim() || "";
        const commune = resolveCommuneValue(communeOption, communeOther);
        const note = elements.checkoutNote?.value.trim() || "";
        const recipientName = elements.recipientName?.value.trim() || "";
        const recipientPhone = elements.recipientPhone?.value.trim() || "";
        const recipientAddress = elements.recipientAddress?.value.trim() || "";
        const hasLovebox = checkoutState.items.some((item) => isLoveBox(item.comboName));

        if (!phone || !houseNumber || !commune) {
            alert("Vui lòng điền đầy đủ SDT và địa chỉ trước khi thanh toán.");
            return;
        }
        if (hasLovebox && (!recipientName || !recipientPhone || !recipientAddress)) {
            alert("Đơn có Love Box: vui lòng điền đầy đủ họ tên, SĐT và địa chỉ người nhận.");
            return;
        }

        const serviceValidation = await validateServiceInputs();
        if (!serviceValidation.ok) {
            alert(serviceValidation.message);
            return;
        }

        const itemsWithQr = checkoutState.items.map((item) => {
            if (item.serviceType === "none") {
                return {
                    ...item,
                    qrToken: "",
                    qrUrl: "",
                    resolvedMessageText: ""
                };
            }

            const isSpecialCombo = isSevenDayQrCombo(item.comboName);
            if (item.serviceType === "random_qr" && isSpecialCombo) {
                const qrEntries = [];
                for (let packageIndex = 1; packageIndex <= item.quantity; packageIndex += 1) {
                    const dailyMessages = pickUniqueRandomMessages(SPECIAL_COMBO_QR_DAYS);
                    for (let dayNumber = 1; dayNumber <= SPECIAL_COMBO_QR_DAYS; dayNumber += 1) {
                        const token = generateQrToken();
                        qrEntries.push({
                            qrToken: token,
                            qrUrl: buildRevealUrl(token),
                            resolvedMessageText: dailyMessages[dayNumber - 1],
                            dayNumber,
                            packageIndex
                        });
                    }
                }

                return {
                    ...item,
                    qrToken: qrEntries[0]?.qrToken || "",
                    qrUrl: qrEntries[0]?.qrUrl || "",
                    resolvedMessageText: qrEntries[0]?.resolvedMessageText || "",
                    qrEntries
                };
            }

            const qrToken = generateQrToken();
            const customText = (item.customMessageText || "").trim();
            const resolvedMessageText = item.serviceType === "random_qr"
                ? pickRandomMessageText()
                : (
                    isSpecialCombo
                        ? "Lời nhắn custom cho combo này sẽ được CookTrust hỗ trợ qua Messenger."
                        : (customText || "Bạn có một lời nhắn yêu thương từ người gửi.")
                );
            const qrEntry = {
                qrToken,
                qrUrl: buildRevealUrl(qrToken),
                resolvedMessageText
            };

            return {
                ...item,
                qrToken,
                qrUrl: qrEntry.qrUrl,
                resolvedMessageText,
                qrEntries: [qrEntry]
            };
        });
        checkoutState.items = itemsWithQr;

        updateCheckoutTotals();

        try {
            await saveSettings(currentUser, { phone, houseNumber, commune });

            const orderPayload = {
                customerName: currentUser.displayName || "",
                phone,
                address: buildAddress(houseNumber, commune),
                note,
                recipient: hasLovebox
                    ? {
                        name: recipientName,
                        phone: recipientPhone,
                        address: recipientAddress
                    }
                    : null,
                items: checkoutState.items,
                subtotalAmount: checkoutState.subtotal,
                serviceFee: checkoutState.serviceFee,
                shippingFee: checkoutState.shippingFee,
                totalAmount: checkoutState.grandTotal,
                status: "pending_bill",
                createdAt: new Date().toISOString(),
                googleId: getGoogleId(currentUser),
                displayName: currentUser.displayName || ""
            };

            const orderId = await saveOrder(currentUser, orderPayload);
            const amount = checkoutState.grandTotal;

            if (elements.qrTotalPrice) elements.qrTotalPrice.textContent = formatCurrency(amount);
            if (elements.paymentQrImage) elements.paymentQrImage.src = getQrUrl(amount, orderId);
            if (elements.sendBillBtn) elements.sendBillBtn.href = BILL_MESSENGER_URL;

            elements.paymentQrSection?.classList.remove("hidden");
            if (elements.checkoutSubmitBtn) elements.checkoutSubmitBtn.disabled = true;
            alert("Đã tạo QR thành công. Vui lòng thanh toán và gửi bill qua Messenger để xác nhận đơn.");
            resetComboSelection();
        } catch (error) {
            console.error(error);
            alert("Không xử lý được thanh toán. Vui lòng thử lại.");
        }
    });

    elements.historyBtn?.addEventListener("click", async () => {
        if (!currentUser) {
            alert("Vui lòng login để xem lịch sử đơn hàng.");
            return;
        }
        closeUserDropdown();
        await renderHistory();
        if (elements.historyModal) elements.historyModal.style.display = "block";
    });

    elements.historyCloseBtn?.addEventListener("click", () => {
        if (elements.historyModal) elements.historyModal.style.display = "none";
    });

    elements.openSettingsBtn?.addEventListener("click", async () => {
        if (!currentUser) {
            alert("Vui lòng login để mở cài đặt.");
            return;
        }
        closeUserDropdown();
        try {
            await loadSettingsForm(currentUser);
            if (elements.settingsModal) elements.settingsModal.style.display = "block";
        } catch (error) {
            console.error(error);
            alert("Không tải được thông tin cài đặt.");
        }
    });

    elements.settingsCloseBtn?.addEventListener("click", () => {
        closeSettingsModal();
    });

    elements.qrRevealCloseBtn?.addEventListener("click", () => {
        closeQrRevealModal();
    });

    elements.checkoutCommune?.addEventListener("change", () => {
        toggleOtherCommuneField("checkout");
        updateCheckoutTotals();
    });
    elements.checkoutOtherCommune?.addEventListener("input", () => {
        updateCheckoutTotals();
    });
    elements.settingsCommune?.addEventListener("change", () => {
        toggleOtherCommuneField("settings");
    });

    elements.settingsForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!currentUser) return;

        const phone = elements.settingsPhone?.value.trim() || "";
        const houseNumber = elements.settingsHouseNumber?.value.trim() || "";
        const communeOption = elements.settingsCommune?.value || "";
        const communeOther = elements.settingsOtherCommune?.value.trim() || "";
        const commune = resolveCommuneValue(communeOption, communeOther);

        if (!phone || !houseNumber || !commune) {
            alert("Vui lòng nhập đầy đủ SDT và địa chỉ.");
            return;
        }

        try {
            await saveSettings(currentUser, { phone, houseNumber, commune });
            alert("Đã lưu cài đặt thành công.");
            closeSettingsModal();
        } catch (error) {
            console.error(error);
            alert("Không lưu được cài đặt. Vui lòng thử lại.");
        }
    });

    window.addEventListener("click", (event) => {
        const target = event.target;

        if (elements.historyModal && target === elements.historyModal) {
            elements.historyModal.style.display = "none";
        }

        if (elements.settingsModal && target === elements.settingsModal) {
            closeSettingsModal();
        }

        if (elements.checkoutModal && target === elements.checkoutModal) {
            closeCheckoutModal();
        }

        if (elements.qrRevealModal && target === elements.qrRevealModal) {
            closeQrRevealModal();
        }

        if (!elements.userMenu || !elements.userDropdown) return;
        if (elements.userDropdown.classList.contains("hidden")) return;
        if (!elements.userMenu.contains(target)) {
            closeUserDropdown();
        }
    });
}

function initAuth() {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    isAnalyticsSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
            console.log("Firebase Analytics ready", analytics);
        }
    }).catch((error) => {
        console.warn("Analytics not available in this environment.", error);
    });
    provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");

    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateAuthUI(user);
    });

    bindEvents();
    openRevealByTokenFromQuery();
}

initAuth();



