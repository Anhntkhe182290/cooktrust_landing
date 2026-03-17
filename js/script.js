/* SCROLL TO SECTION */
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

/* COPY HOTLINE */
function copyHotline() {
  const phone = "0965722552";
  navigator.clipboard.writeText(phone);

  const toast = document.getElementById("copy-toast");
  if (!toast) return;

  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

/* FOOD SLIDER ANIMATION */
let sliderIndex = 0;
const items = document.querySelectorAll(".food-item");
if (items.length > 0) {
  setInterval(() => {
    items.forEach((item) => item.classList.remove("active"));
    items[sliderIndex].classList.add("active");
    sliderIndex = (sliderIndex + 1) % items.length;
  }, 2500);
}

const MENU_DETAILS = {
  menu1: {
    title: "Món 1: Ức gà áp chảo - Gạo lứt - Bông cải",
    html: `
      <p>Món ăn truyền thống của dân tập thể thao, cung cấp nguồn đạm chất lượng từ ức gà và tinh bột hấp thu chậm từ gạo lứt.</p>
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Nguyên liệu</th><th>Trọng lượng ước tính</th><th>Số kcal</th></tr></thead>
          <tbody>
            <tr><td>Ức gà áp chảo</td><td>120g</td><td>198 kcal</td></tr>
            <tr><td>Gạo lứt</td><td>1/2 chén (đã nấu)</td><td>110 kcal</td></tr>
            <tr><td>Bông cải xanh luộc</td><td>100g</td><td>34 kcal</td></tr>
            <tr><td><strong>Tổng</strong></td><td></td><td><strong>342 kcal</strong></td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  menu2: {
    title: "Món 2: Bò xào nấm - Khoai lang - Rau xanh",
    html: `
      <p>Sự kết hợp giữa thịt bò giàu sắt, khoai lang giàu chất xơ và nấm, rau xanh mang lại cảm giác no lâu, tốt cho hệ tiêu hóa.</p>
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Nguyên liệu</th><th>Trọng lượng ước tính</th><th>Số kcal</th></tr></thead>
          <tbody>
            <tr><td>Thịt bò thăn</td><td>100g</td><td>210 kcal</td></tr>
            <tr><td>Khoai lang vàng luộc</td><td>100g</td><td>86 kcal</td></tr>
            <tr><td>Nấm</td><td>50g</td><td>12 kcal</td></tr>
            <tr><td>Rau xanh (súp lơ, đậu cô ve)</td><td>100g</td><td>25 kcal</td></tr>
            <tr><td>Dầu ăn (áp chảo)</td><td>1 muỗng cà phê</td><td>45 kcal</td></tr>
            <tr><td><strong>Tổng</strong></td><td></td><td><strong>378 kcal</strong></td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  menu3: {
    title: "Món 3: Tôm hấp - Bún gạo lứt - Rau luộc",
    html: `
      <p>Bún gạo lứt là sự thay thế tuyệt vời cho bún gạo trắng, kết hợp với tôm hấp và rau xanh tạo nên món ăn thanh đạm nhưng vẫn đầy đủ dinh dưỡng.</p>
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Nguyên liệu</th><th>Trọng lượng ước tính</th><th>Số kcal</th></tr></thead>
          <tbody>
            <tr><td>Tôm hấp</td><td>150g</td><td>148 kcal</td></tr>
            <tr><td>Bún gạo lứt (khô)</td><td>50g</td><td>170 kcal</td></tr>
            <tr><td>Rau luộc (su su, cà rốt,...)</td><td>100g</td><td>40 kcal</td></tr>
            <tr><td><strong>Tổng</strong></td><td></td><td><strong>358 kcal</strong></td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  menu4: {
    title: "Món 4: Trứng lòng đào - Đậu hũ non - Ức gà xé",
    html: `
      <p>Món ăn đơn giản, dễ chuẩn bị nhưng cung cấp lượng protein dồi dào, phù hợp cho những ngày bận rộn.</p>
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Nguyên liệu</th><th>Trọng lượng ước tính</th><th>Số kcal</th></tr></thead>
          <tbody>
            <tr><td>Trứng lòng đào</td><td>2 quả</td><td>156 kcal</td></tr>
            <tr><td>Đậu hũ non</td><td>100g</td><td>76 kcal</td></tr>
            <tr><td>Ức gà xé</td><td>100g</td><td>165 kcal</td></tr>
            <tr><td><strong>Tổng</strong></td><td></td><td><strong>397 kcal</strong></td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  menu5: {
    title: "Món 5: Ức gà xé trộn mè rang - Khoai lang - Salad",
    html: `
      <p>Mè rang mang lại hương vị thơm ngon đặc trưng, làm món ức gà xé không còn đơn điệu; kết hợp với khoai lang và salad tạo nên bữa ăn cân bằng.</p>
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Nguyên liệu</th><th>Trọng lượng ước tính</th><th>Số kcal</th></tr></thead>
          <tbody>
            <tr><td>Ức gà xé</td><td>100g</td><td>165 kcal</td></tr>
            <tr><td>Khoai lang tím luộc</td><td>100g</td><td>86 kcal</td></tr>
            <tr><td>Xà lách, rau thơm</td><td>100g</td><td>15 kcal</td></tr>
            <tr><td>Sốt mè rang</td><td>1 muỗng canh</td><td>60 kcal</td></tr>
            <tr><td><strong>Tổng</strong></td><td></td><td><strong>326 kcal</strong></td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  menu6: {
    title: "Món 6: Salad tôm - Trứng - Sốt mù tạt",
    html: `
      <p>Một món salad tươi mát, giàu protein từ tôm và trứng, cùng vị cay nồng đặc trưng của sốt mù tạt giúp kích thích vị giác.</p>
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Nguyên liệu</th><th>Trọng lượng ước tính</th><th>Số kcal</th></tr></thead>
          <tbody>
            <tr><td>Tôm hấp</td><td>100g</td><td>99 kcal</td></tr>
            <tr><td>Trứng gà luộc</td><td>1 quả</td><td>78 kcal</td></tr>
            <tr><td>Xà lách, rau mầm</td><td>150g</td><td>23 kcal</td></tr>
            <tr><td>Ngô ngọt</td><td>30g</td><td>26 kcal</td></tr>
            <tr><td>Sốt mù tạt</td><td>1 muỗng canh</td><td>90 kcal</td></tr>
            <tr><td><strong>Tổng</strong></td><td></td><td><strong>316 kcal</strong></td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  menu7: {
    title: "Món 7: Gỏi cuốn ức gà",
    html: `
      <p>Món ăn mang đậm nét ẩm thực Việt Nam, là lựa chọn tuyệt vời để đổi vị mà vẫn đảm bảo mục tiêu giảm cân.</p>
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>Nguyên liệu</th><th>Trọng lượng ước tính</th><th>Số kcal</th></tr></thead>
          <tbody>
            <tr><td>Ức gà luộc</td><td>120g</td><td>198 kcal</td></tr>
            <tr><td>Bánh tráng</td><td>3 cái</td><td>60 kcal</td></tr>
            <tr><td>Bún tươi</td><td>50g</td><td>55 kcal</td></tr>
            <tr><td>Xà lách, rau thơm</td><td>-</td><td>20 kcal</td></tr>
            <tr><td>Nước chấm (tương đen hoặc mắm nêm)</td><td>1 muỗng canh</td><td>50 kcal</td></tr>
            <tr><td><strong>Tổng</strong></td><td></td><td><strong>383 kcal</strong></td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  combo7: {
    title: "Combo 7 ngày",
    html: `
      <p>Combo 7 ngày sẽ có thực đơn luân phiên:</p>
      <p>Ngày 1: Ức gà áp chảo - Gạo lứt - Bông cải<br>
      Ngày 2: Bò xào nấm - Khoai lang - Rau xanh<br>
      Ngày 3: Tôm hấp - Bún gạo lứt - Rau luộc<br>
      Ngày 4: Trứng lòng đào - Đậu hũ non - Ức gà xé<br>
      Ngày 5: Ức gà xé trộn mè rang - Khoai lang - Salad<br>
      Ngày 6: Salad tôm - Trứng - Sốt mù tạt<br>
      Ngày 7: Gỏi cuốn ức gà</p>
    `
  },
  lovebox: {
    title: "Love Box - Bí mật đằng sau mỗi bữa ăn",
    html: `
      <p>Không chỉ là một hộp đồ ăn Eat Clean, Love Box là lời hứa cùng nhau khỏe mạnh. Một món quà tinh tế để bạn gửi tặng người thương, người thân hay bạn bè, giúp hành trình giảm cân không còn đơn độc.</p>
      <p><strong>Sự tò mò ngọt ngào:</strong> Chiếc túi giấy thắt nơ sang trọng, ẩn chứa những món ngon bí mật đầy màu sắc.</p>
      <p><strong>Menu 7 ngày chuẩn dáng:</strong> Mỗi bữa ăn chỉ từ 300-400 kcal (Ức gà áp chảo, Bò xào nấm, Tôm hấp...) giúp kiểm soát cân nặng tuyệt vời.</p>
      <p><strong>Chạm đến trái tim:</strong> Tặng kèm QR cá nhân hóa - nơi bạn gửi gắm lời nhắn, hình ảnh hoặc âm thanh động viên riêng cho người ấy.</p>
      <p><strong>Cùng nhau Eat Clean - Cùng nhau hạnh phúc</strong><br>"Ăn ngon, dáng thon và luôn có mình đồng hành nhé!"</p>
      <p><strong>Inbox CookTrust để trao gửi Love Box - để yêu thương bắt đầu từ những bữa ăn lành mạnh.</strong></p>
    `
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      navToggle.textContent = nav.classList.contains("active") ? "✕" : "☰";
    });

    document.querySelectorAll(".nav a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        navToggle.textContent = "☰";
      });
    });
  }

  const detailModal = document.getElementById("menu-detail-modal");
  const detailTitle = document.getElementById("menu-detail-title");
  const detailBody = document.getElementById("menu-detail-body");
  const detailCloseBtn = document.getElementById("menu-detail-close-btn");

  document.querySelectorAll(".menu-detail-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".combo-card");
      const menuKey = card?.dataset.comboName;
      const detail = MENU_DETAILS[menuKey];
      if (!detailModal || !detailTitle || !detailBody || !detail) return;

      detailTitle.textContent = detail.title;
      detailBody.innerHTML = detail.html;
      detailModal.style.display = "block";
    });
  });

  detailCloseBtn?.addEventListener("click", () => {
    if (detailModal) detailModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === detailModal) {
      detailModal.style.display = "none";
    }
  });
});

