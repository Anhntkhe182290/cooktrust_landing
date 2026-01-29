const images = document.querySelectorAll('.intro-images img');
let currentIndex = 0;

function rotateImages() {
    // Xóa class active của tất cả ảnh
    images.forEach(img => img.classList.remove('active'));

    // Thêm class active cho ảnh hiện tại
    images[currentIndex].classList.add('active');

    // Tăng index
    currentIndex = (currentIndex + 1) % images.length;
}

// Chạy ngay lập tức lần đầu
rotateImages();

// Lặp lại sau mỗi 3 giây
setInterval(rotateImages, 3000);

document.getElementById('copy-phone').addEventListener('click', function () {
    const phoneNumber = "096 572 25 52";

    navigator.clipboard.writeText(phoneNumber).then(() => {
        const originalText = this.innerHTML;

        // Hiện thông báo nhỏ
        this.innerHTML = `<img src="assets/hotline.jpg" alt="phone icon"> Đã copy!`;
        this.style.backgroundColor = "#2c3e29"; // Đổi màu khi cop thành công

        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.backgroundColor = "";
        }, 2000);

    }).catch(err => {
        console.error('Không thể copy: ', err);
        alert("Lỗi khi copy số điện thoại!");
    });
});

// Đọc tiếp
// Dữ liệu bài viết
const blogData = {
    tip1: {
        title: "Không có cân, không có app – vẫn ăn healthy được không?",
        content: `Nhiều người cho rằng ăn uống lành mạnh bắt buộc phải sử dụng 
        cân điện tử và ứng dụng đếm calo. Tuy nhiên, theo các chuyên gia dinh 
        dưỡng, ăn healthy không nhất thiết phụ thuộc vào các công cụ đo lường, 
        đặc biệt với những người hướng đến mục tiêu cải thiện sức khỏe và 
        duy trì vóc dáng.

        Yếu tố cốt lõi của chế độ ăn lành mạnh nằm ở chất lượng thực phẩm và sự 
        cân bằng dinh dưỡng, thay vì độ chính xác tuyệt đối của con số. 
        Việc quá chú trọng cân đo có thể tạo áp lực tâm lý, khiến người ăn 
        khó duy trì thói quen lâu dài.

        Trong thực tế, nhiều người lựa chọn phương pháp ước lượng khẩu phần 
        bằng bàn tay để phân chia lượng đạm, tinh bột, rau xanh và chất béo 
        trong mỗi bữa ăn. Đồng thời, việc quan sát cảm giác no và mức năng 
        lượng sau ăn cũng giúp điều chỉnh chế độ ăn phù hợp.`
    },
    tip2: {
        title: "Vì sao ăn healthy mà vẫn tăng cân?",
        content: `Nhiều người cho rằng ăn healthy sẽ tự động giảm cân, 
        nhưng thực tế ăn uống lành mạnh không đồng nghĩa với việc luôn kiểm 
        soát được cân nặng. Một số thực phẩm “healthy” như hạt, bơ, ngũ cốc 
        nguyên cám vẫn chứa nhiều năng lượng. Khi ăn với khẩu phần lớn, lượng 
        calo nạp vào có thể vượt nhu cầu của cơ thể.

        Bên cạnh đó, khẩu phần ăn chưa phù hợp với thể trạng hoặc thiếu cân 
        đối giữa đạm, tinh bột và rau xanh khiến cơ thể nhanh đói, dễ ăn 
        nhiều hơn. Việc ít vận động trong sinh hoạt hằng ngày cũng làm giảm 
        mức tiêu hao năng lượng, dẫn đến tích lũy mỡ thừa.

        Ngoài ra, tăng cân đôi khi đến từ khối lượng cơ hoặc sự phục hồi của 
        cơ thể sau thời gian ăn uống thiếu chất. Vì vậy, ăn healthy cần đi 
        kèm kiểm soát khẩu phần và lối sống phù hợp để đạt hiệu quả mong muốn.`
    },
    tip3: {
        title: "Thế nào là một bữa ăn đủ chất?",
        content: `Một bữa ăn đủ chất không phải là ăn thật nhiều hay ăn thật 
        ít, mà là đảm bảo sự cân đối giữa các nhóm dinh dưỡng thiết yếu. 
        Theo các khuyến nghị dinh dưỡng, một bữa ăn hợp lý cần có đủ bốn 
        thành phần chính.

        Thứ nhất là chất đạm, giúp xây dựng và phục hồi cơ thể, có trong thịt, 
        cá, trứng, đậu và các sản phẩm từ đậu. Thứ hai là tinh bột, nguồn cung
        cấp năng lượng chính, nên ưu tiên gạo lứt, khoai, ngũ cốc nguyên cám. 
        Thứ ba là rau xanh và trái cây, cung cấp vitamin, khoáng chất và chất xơ, 
        giúp hỗ trợ tiêu hóa. Cuối cùng là chất béo tốt từ dầu thực vật, bơ và các 
        loại hạt, cần thiết cho hoạt động của cơ thể.

        Bên cạnh việc đủ nhóm chất, khẩu phần ăn cần phù hợp với thể trạng và 
        mức độ vận động của mỗi người. Một bữa ăn đủ chất là bữa ăn giúp cơ 
        thể no vừa phải, có năng lượng ổn định và dễ duy trì lâu dài.`
    }
};

const modal = document.getElementById("blog-modal");
const modalBody = document.getElementById("modal-body");
const closeBtn = document.querySelector(".close-btn");
const backBtn = document.getElementById("back-btn");

document.querySelectorAll('.tip-card a').forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tipKey = `tip${index + 1}`;
        const data = blogData[tipKey];

        modalBody.innerHTML = `
            <h2 style="color: #3E613A; margin-bottom: 20px;">${data.title}</h2>
            <div style="line-height: 1.6; color: #333;">${data.content}</div>
        `;
        modal.style.display = "block";
    });
});

// Đóng modal
[closeBtn, backBtn].forEach(el => {
    el.onclick = () => modal.style.display = "none";
});

// Bấm ra ngoài vùng trắng cũng đóng
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};