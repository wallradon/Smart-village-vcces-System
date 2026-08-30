/**
 * Smart Village VCCES System - Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if initial users exist in localStorage, if not initialize with demo account
    initLocalStorage();
});

/**
 * Initialize local storage with default demo user if empty
 */
function initLocalStorage() {
    const existingUsers = localStorage.getItem('smart_village_users');
    if (!existingUsers) {
        const defaultUser = [
            {
                fullname: 'สมชาย ใจดี',
                houseno: '99/88',
                username: 'admin',
                password: 'password123',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('smart_village_users', JSON.stringify(defaultUser));
    }
}

/**
 * Switch between Login and Register tabs
 * @param {string} tabName - 'login' or 'register'
 */
function switchTab(tabName) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const indicator = document.getElementById('tab-indicator');

    if (tabName === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');

        formLogin.classList.add('active');
        formRegister.classList.remove('active');

        indicator.style.transform = 'translateX(0%)';
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');

        formRegister.classList.add('active');
        formLogin.classList.remove('active');

        indicator.style.transform = 'translateX(100%)';
    }
}

/**
 * Toggle Password Visibility (Eye Icon)
 * @param {string} inputId - ID of the password input
 * @param {HTMLElement} btnElement - Toggle button element
 */
function togglePasswordVisibility(inputId, btnElement) {
    const pwdInput = document.getElementById(inputId);
    const icon = btnElement.querySelector('i');

    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        pwdInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Handle Registration Submission
 * @param {Event} e 
 */
function handleRegister(e) {
    e.preventDefault();

    const fullname = document.getElementById('reg-fullname').value.trim();
    const houseno = document.getElementById('reg-houseno').value.trim();
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;

    // Validations
    if (!fullname || !houseno || !username || !password) {
        alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
    }

    if (username.length < 4) {
        alert('ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
        return;
    }

    if (password.length < 6) {
        alert('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
    }

    // Retrieve existing users
    const users = JSON.parse(localStorage.getItem('smart_village_users') || '[]');

    // Check duplicate username or house number
    const isDuplicateUser = users.some(user => user.username === username);
    if (isDuplicateUser) {
        alert('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาลองชื่ออื่น');
        return;
    }

    // Save new user
    const newUser = {
        fullname,
        houseno,
        username,
        password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('smart_village_users', JSON.stringify(users));

    alert('ลงทะเบียนสำเร็จ! กำลังสลับไปหน้าเข้าสู่ระบบ...');

    // Reset register form
    document.getElementById('form-register').reset();

    // Auto switch to login
    switchTab('login');
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').focus();
}

/**
 * Handle Login Submission
 * @param {Event} e 
 */
function handleLogin(e) {
    e.preventDefault();

    const usernameOrHouse = document.getElementById('login-username').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    if (!usernameOrHouse || !password) {
        alert('กรุณากรอกชื่อผู้ใช้/เลขที่บ้าน และรหัสผ่าน');
        return;
    }

    // Retrieve stored users
    const users = JSON.parse(localStorage.getItem('smart_village_users') || '[]');

    // Find match by Username or House Number
    const foundUser = users.find(user =>
        (user.username.toLowerCase() === usernameOrHouse || user.houseno.toLowerCase() === usernameOrHouse)
        && user.password === password
    );

    if (foundUser) {
        alert(`ยินดีต้อนรับคุณ ${foundUser.fullname} (บ้านเลขที่ ${foundUser.houseno})!`);

        // Clear login password input
        document.getElementById('login-password').value = '';
    } else {
        alert('ชื่อผู้ใช้/เลขที่บ้าน หรือ รหัสผ่านไม่ถูกต้อง');
    }
}

/**
 * Handle Forgot Password Link
 * @param {Event} e 
 */
function handleForgotPassword(e) {
    e.preventDefault();
    alert('กรุณาติดต่อนิติบุคคล Smart Village VCCES เพื่อขอรีเซ็ตรหัสผ่าน');
}
