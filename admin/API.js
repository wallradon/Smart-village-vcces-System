// API Configuration (ดึงจากตัวแปรส่วนกลางเพื่อความปลอดภัย)
// เมื่อใช้ Build Tool เช่น Vite จะเปลี่ยนเป็น: import.meta.env.VITE_API_BASE_URL
const CONFIG = {
    API_BASE_URL: typeof process !== 'undefined' && process.env.API_BASE_URL ? process.env.API_BASE_URL : '/api',
    API_KEY: typeof process !== 'undefined' && process.env.API_KEY ? process.env.API_KEY : ''
};

// POST USER
async function createUser(userData) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/users/createUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': CONFIG.API_KEY
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (!response.ok) {
            // เช่น 400, 409 จาก backend
            throw new Error(result.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน');
        }

        console.log('สร้างผู้ใช้งานสำเร็จ:', result);
        return result;

    } catch (error) {
        console.error('createUser error:', error.message);
        throw error; // ให้ส่วนที่เรียกใช้ไปจัดการ error ต่อ (เช่น แสดง alert)
    }
}
// GET USER
async function getUser() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/users/getUsers`, {
            headers: {
                'X-API-Key': CONFIG.API_KEY
            }
        });

        const result = await response.json();

        if (!response.ok) {
            // เช่น 400, 409 จาก backend
            throw new Error(result.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน');
        }

        console.table(result);
        return result;

    } catch (error) {
        console.error('createUser error:', error.message);
        throw error; // ให้ส่วนที่เรียกใช้ไปจัดการ error ต่อ (เช่น แสดง alert)
    }
}


async function testData() {
    const userData = {
        houseNumber: "1",
        ownerName: "1",
        username: "2",
        password: "1",
        role: "USER",
        registerDate: "99/2/99",
        memberStartDate: "88/3/88",
        memberExpireDate: "77/3/77"
    };
    try {
        const post = await createUser(userData);
        console.log("post", post);
        
    } catch (error) {
        console.log(error.message);
    }
}

async function testDB() {
    // await testData() ;
    await getUser() ;
}
const BTN = document.querySelector(".PBTN");
BTN.addEventListener("click",(e) => {
    testDB();
});