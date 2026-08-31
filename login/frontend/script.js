
const API_BASE_URL = 'http://localhost:8080';


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
async function handleRegister(e) {
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

    // Prepare date fields
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    const formatDate = (date) => date.toISOString().split('T')[0];
    console.log(formatDate(today));

    const payload = {
        houseNumber: houseno,
        ownerName: fullname,
        username: username,
        password: password,
        role: "member",
        registerDate: formatDate(today),
        memberStartDate: formatDate(today),
        memberExpireDate: formatDate(nextYear)
    };

    try {
        const response = await fetch('https://api-node-iot.onrender.com/api/users/createUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log(data);

        // ตรวจสอบการตอบกลับ (ถ้าสำเร็จจะได้ true หรือ status ok)
        if (response.ok && (data === true || data.success === true || data.status === 'success')) {
            alert('ลงทะเบียนสมาชิกสำเร็จ!');
            // Reset register form
            document.getElementById('form-register').reset();
            // Auto switch to login
            switchTab('login');
            document.getElementById('login-username').value = username;
            document.getElementById('login-password').focus();
        } else {
            const errorMessage = typeof data === 'string' ? data : (data.message || 'ไม่สามารถลงทะเบียนได้ (ชื่อผู้ใช้หรือเลขที่บ้านอาจซ้ำซ้อน)');
            alert(errorMessage);
        }
    } catch (error) {
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
}

/**
 * Handle Login Submission
 * @param {Event} e 
 */
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    try {
        // ส่งข้อมูลไปตรวจสอบที่หลังบ้าน (Backend API)
        const response = await fetch(`http://localhost:8080/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log(response.status);
        console.log(data.id);
        console.log(data.token);
        console.log(data.message);
        if (response.ok) {
            alert('เข้าสู่ระบบสำเร็จ!');
            // เก็บ Token และ ID ที่หลังบ้านส่งกลับมา
            localStorage.setItem('token', data.token);
            // ส่ง ID
            if (data.id) localStorage.setItem('userId', data.id);

            try {
                // ดึงข้อมูล users จาก Cloud API
                const usersResponse = await fetch('https://api-node-iot.onrender.com/api/users/getUsers');
                const usersList = await usersResponse.json();
                console.log(usersList);
                // หา user ที่ตรงกับ ID ที่ได้มาตอนล็อกอิน
                const currentUser = usersList.find(u => String(u.id) === String(data.id));
                if (currentUser) {
                    if (currentUser.role === 'admin') {
                        window.location.href = '../../admin/admin.html';
                    } else {
                        window.location.href = '../../user/user.html';
                    }
                } else {
                    // ถ้าหาไม่เจอใน Cloud อาจจะเป็น User ทดสอบ ให้ยึดตามหน้าเดิม
                    // window.location.href = '/dashboard.html';
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                window.location.href = '/dashboard.html';
            }
        } else {
            alert(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    } catch (error) {
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
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
