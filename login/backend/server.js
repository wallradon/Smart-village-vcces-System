const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// อนุญาตให้หน้าบ้านคุยกับหลังบ้านได้ และอ่านข้อมูล JSON ที่ส่งมาได้
app.use(cors());
app.use(express.json());

//Secret Key สำหรับแกะ JWT (ในการใช้งานจริงควรเก็บในไฟล์ .env)
const JWT_SECRET = 'my_super_secret_key_12345';

// 🗄️ จำลองฐานข้อมูล (Mock Database)
// หมายเหตุ: รหัสผ่าน "123456" และ "password123" ถูกเข้ารหัสด้วย bcrypt (Salt rounds = 10)
const usersDB = [
    {
        id: 27,
        username: "admin",
        password: "$2b$10$x9/87IYJdo/yNw1XTRSKy.ooNmehwsA0V8zQERu0OnxNlEHutIhUa" // password123
    },
    {
        id: 3,
        username: "user01",
        password: "$2b$10$bC3Zvj48pXPXPMu7eWpqTuYqTiI02mzrPMronJIM9T6x/Fe6soxPG" // 123456
    }
];


// Route สำหรับ Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, usernameOrHouse, password } = req.body;
        const inputUser = (usernameOrHouse || username || '').trim().toLowerCase();

        if (!inputUser || !password) {
            return res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้/เลขที่บ้าน และรหัสผ่าน" });
        }

        // 1. ค้นหาผู้ใช้ในฐานข้อมูล (ค้นหาจาก username)
        const user = usersDB.find(u =>
            u.username.toLowerCase() === inputUser
        );

        if (!user) {
            return res.status(401).json({ message: "ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง" });
        }

        // 2. ตรวจสอบรหัสผ่านดิบด้วย bcrypt.compare
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง" });
        }

        // 3. สร้าง JWT Token เมื่อตรวจสอบผ่าน
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: '1h' } // Token หมดอายุใน 1 ชั่วโมง
        );

        console.log(`[API] ล็อกอินสำเร็จ: ${user.username}`);

        // 4. ส่ง Token และข้อมูลเบื้องต้นกลับไปให้หน้าบ้าน
        return res.json({
            message: "เข้าสู่ระบบสำเร็จ",
            token: token,
            id: user.id
        });

    } catch (error) {
        console.error('[API Error] login:', error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

// เริ่มรันเซิร์ฟเวอร์บนพอร์ต 5000 หรือ 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Login: http://localhost:${PORT}/api/login`);
    console.log(`API CreateUser: http://localhost:${PORT}/api/users/createUser`);
    console.log(`=================================`);
});
