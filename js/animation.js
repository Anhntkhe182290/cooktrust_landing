const images = document.querySelectorAll('.intro-images .intro-item');
let currentIndex = 0;

function rotateImages() {
  images.forEach((img) => img.classList.remove('active'));
  if (images.length === 0) return;
  images[currentIndex].classList.add('active');
  currentIndex = (currentIndex + 1) % images.length;
}

rotateImages();
setInterval(rotateImages, 3000);

document.getElementById('copy-phone')?.addEventListener('click', function () {
  const phoneNumber = '096 572 25 51';

  navigator.clipboard.writeText(phoneNumber).then(() => {
    const originalText = this.innerHTML;
    this.innerHTML = '<img src="assets/hotline.jpg" alt="phone icon"> Đã copy!';
    this.style.backgroundColor = '#2c3e29';

    setTimeout(() => {
      this.innerHTML = originalText;
      this.style.backgroundColor = '';
    }, 2000);
  }).catch((err) => {
    console.error('Không thể copy:', err);
    alert('Lỗi khi copy số điện thoại!');
  });
});

const blogData = {
  tip1: {
    title: 'Không có cân, không có app - vẫn ăn healthy được không?',
    content: 'Bạn vẫn có thể ăn healthy bằng cách ưu tiên thực phẩm tươi, đủ đạm, rau và tinh bột tốt theo khẩu phần hợp lý.'
  },
  tip2: {
    title: 'Vì sao ăn healthy mà vẫn tăng cân?',
    content: 'Nguyên nhân thường do tổng năng lượng nạp vào vẫn cao hơn nhu cầu hoặc khẩu phần chưa cân bằng.'
  },
  tip3: {
    title: 'Thế nào là một bữa ăn đủ chất?',
    content: 'Một bữa ăn đủ chất nên có đạm, tinh bột tốt, rau xanh và chất béo tốt với lượng phù hợp.'
  }
};

const modal = document.getElementById('blog-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('#blog-modal .close-btn');
const backBtn = document.getElementById('back-btn');

document.querySelectorAll('.tip-card a').forEach((btn, index) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const tipKey = `tip${index + 1}`;
    const data = blogData[tipKey];
    if (!modal || !modalBody || !data) return;

    modalBody.innerHTML = `
      <h2 style="color:#3E613A;margin-bottom:20px;">${data.title}</h2>
      <div style="line-height:1.6;color:#333;">${data.content}</div>
    `;
    modal.style.display = 'block';
  });
});

[closeBtn, backBtn].forEach((el) => {
  el?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });
});

window.addEventListener('click', (event) => {
  if (event.target === modal) modal.style.display = 'none';
});

