const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Enable CORS to allow frontend communication and parse JSON data
app.use(cors());
app.use(express.json());

// Secret key for JWT (In real apps, keep this in .env file)
const JWT_SECRET = 'my_super_secret_key_12345';

// 🗄️ Mock Database
// Note: Passwords "123456" and "password123" are hashed with bcrypt (Salt rounds = 10)
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
// ตรวจสอบความถูกต้องของ JWT Token (Authentication Middleware)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // ดึง Token ออกมาจาก "Bearer <TOKEN>"

    if (!token) {
        return res.status(401).json({ success: false, message: "Access token is missing" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
}

// Route for Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, usernameOrHouse, password } = req.body;
        const inputUser = (usernameOrHouse || username || '').trim().toLowerCase();

        if (!inputUser || !password) {
            return res.status(400).json({ message: "Username/House number and password are required" });
        }

        // 1. Find user in database by username
        const user = usersDB.find(u =>
            u.username.toLowerCase() === inputUser
        );

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 2. Check password with bcrypt.compare
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 3. Create JWT token when valid
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        console.log(`[API] Login success: ${user.username}`);

        // 4. Send token and user info to frontend
        return res.json({
            message: "Login successful",
            token: token,
            id: user.id
        });

    } catch (error) {
        console.error('[API Error] login:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Route for Register (Create new user for login)
app.post('/api/auth/register', async (req, res) => {
    try {
        // Get username and password for authentication
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Please enter your username and password" });
        }

        // Check for duplicate username
        const isDuplicate = usersDB.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (isDuplicate) {
            return res.status(400).json({ success: false, message: "Username is already taken. Please try another one." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user account
        const newUser = {
            id: usersDB.length > 0 ? Math.max(...usersDB.map(u => u.id)) + 1 : 1,
            username: username.toLowerCase(),
            password: hashedPassword
        };

        usersDB.push(newUser);
        console.log(`[API] Create User account successfully: ${newUser.username}`);

        return res.status(201).json({ success: true, message: "Account created successfully" });

    } catch (error) {
        console.error('[API Error] createUser:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Route for verifying token and getting current profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = usersDB.find(u => u.id === req.user.userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({
        success: true,
        user: {
            id: user.id,
            username: user.username
        }
    });
});

// Start server on port 5000 or 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Login: http://localhost:${PORT}/api/auth/login`);
    console.log(`API Register: http://localhost:${PORT}/api/auth/register`);
    console.log(`=================================`);
});
