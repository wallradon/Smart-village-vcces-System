// 1. กำหนดข้อมูลสมมติ (Mock Data) สำหรับทดสอบการเข้าสู่ระบบ
const MOCK_USER = {
    username: "admin",
    password: "123"
};

// 2. ดึง Element จาก HTML (DOM Selection)
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");

// 3. ตรวจจับการกดปุ่มส่งฟอร์ม (Event Listener)
loginForm.addEventListener("submit", function (event) {
    // ป้องกันไม่ให้หน้าเว็บรีเฟรชตัวเองตามพฤติกรรมปกติของ Form
    event.preventDefault();

    // ดึงค่าที่ผู้ใช้พิมพ์กรอกเข้ามา
    const inputUsername = usernameInput.value;
    const inputPassword = passwordInput.value;

    // ตรวจสอบสิทธิ์ (Authentication Check)
    if (inputUsername === MOCK_USER.username && inputPassword === MOCK_USER.password) {
        // ถ้ารหัสถูกต้อง -> ซ่อนข้อความแจ้งเตือน, ออกบัตรผ่าน (Session Storage) และพาไปยังหน้า Admin
        errorMessage.style.display = "none";
        sessionStorage.setItem("isLoggedIn", "true");
        window.location.href = "../admin/admin.html";
    } else {
        // ถ้ารหัสไม่ถูกต้อง -> แสดงข้อความแจ้งเตือนสีแดง
        errorMessage.style.display = "block";
    }
});
