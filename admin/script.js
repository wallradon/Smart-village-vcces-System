"use strict"

// 0. ตรวจสอบสิทธิ์การเข้าถึง (Authentication Guard / Route Protection)
if (sessionStorage.getItem("isLoggedIn") !== "true") {
    // หากไม่มีบัตรผ่าน ให้เด้งกลับไปหน้า Login ทันที
    window.location.href = "../login/login.html";
}

// ===================== ตัวแปรสถานะหลักของแอป =====================
const url = "./dataTest.json";
let mainData = [];       // ข้อมูลลูกบ้านทั้งหมดที่โหลดมาจาก JSON
let isLoading = true;    // true = กำลังโหลดข้อมูลอยู่ (ยังไม่มีข้อมูลให้แสดง)
let fetchStatus = 0;     // เก็บ HTTP status ของการ fetch ล่าสุด (0 = ยังไม่เคยลอง)

// ===================== เมนู / การสลับหน้า =====================
const navItems = document.querySelectorAll('nav li[data-target]');
const pages = document.querySelectorAll('.page');


function showPage(target, params) {
    pages.forEach(page => page.classList.remove('active'));        // ปิดทุกหน้าก่อน
    navItems.forEach(li => li.classList.remove('user-select'));    // เอาไฮไลต์เมนูออกก่อน

    const targetPage = document.querySelector(`#page-${target}`);
    if (targetPage) {
        targetPage.classList.add('active');   // เปิดเฉพาะหน้าที่ต้องการ
        renderUserPage(target, params);           // สั่ง render เนื้อหาของหน้านั้น
    }

    // ไฮไลต์เมนูที่ตรงกับหน้าปัจจุบัน (ทำงานได้ทั้งตอนคลิกเองและตอนเรียกจากโค้ด)
    const activeLi = document.querySelector(`nav li[data-target="${target}"]`);
    if (activeLi) activeLi.classList.add('user-select');
}

// ผูก event คลิกเมนูทุกอัน ให้เรียก showPage ตาม data-target ของ li นั้นๆ
navItems.forEach(li => {
    li.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(li.dataset.target);
    });
});

// ===================== ระบบออกจากระบบ (Logout System) =====================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // ลบข้อมูลเซสชัน (Clear Session)
        sessionStorage.removeItem("isLoggedIn");
        // ดีดกลับหน้าหลัก (Landing Page)
        window.location.href = "../index.html";
    });
}

// เปิดหน้า home เป็นค่าเริ่มต้นตอนโหลดสคริปต์
showPage('home');

// ===================== โหลดข้อมูลจาก dataTest.json =====================
/**
 * ดึงข้อมูลจากไฟล์ JSON แล้วอัปเดตสถานะ loading / error
 * มีการหน่วงเวลาจำลอง (simulate delay) ไว้เพื่อทดสอบ loading state
 */
async function load(path) {
    try {
        // จำลองการหน่วงเวลา 3 วินาที เพื่อให้เห็น loading state ชัดๆ ตอน dev
        await new Promise(resolve => setTimeout(resolve, 3000));

        const res = await fetch(path);
        fetchStatus = res.status;
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        mainData = data;
        isLoading = false;
        refreshCurrentPage(); // ข้อมูลมาแล้ว ให้ re-render หน้าที่เปิดอยู่ตอนนี้
    } catch (err) {
        console.log(err);
        isLoading = false;
        // ถ้า fetchStatus ยังเป็น 0 แปลว่า request ไม่ถึงเซิร์ฟเวอร์เลย (เช่นเน็ตหลุด)
        // ให้ตั้งเป็น 500 เพื่อให้ผ่านเงื่อนไข error state และแสดงข้อความแจ้งเตือนได้
        if (fetchStatus === 0) fetchStatus = 500;
        refreshCurrentPage();
    }
}

/**
 * หา li เมนูที่กำลัง active อยู่ แล้วสั่ง render หน้านั้นซ้ำอีกครั้ง
 * ใช้ตอนโหลดข้อมูลเสร็จ (หรือ error) เพื่ออัปเดตหน้าปัจจุบันโดยไม่ต้องรอ user คลิกใหม่
 */
function refreshCurrentPage() {
    const activeLi = document.querySelector('nav li.user-select');
    if (activeLi) {
        const target = activeLi.dataset.target;
        // หน้า user/home/vehicle ไม่ต้องใช้ id ตอน refresh อัตโนมัติ
        renderUserPage(target, null);
    }
}

// ===================== ตัวกลางตัดสินใจว่าจะ render อะไร =====================
/**
 * ฟังก์ชันกลางที่เรียกทุกครั้งที่ต้อง render เนื้อหาในหน้าใดหน้าหนึ่ง
 * เช็คสถานะตามลำดับ: loading -> error -> success แล้วค่อยตัดสินใจว่า
 * จะ render ข้อมูลจริงของหน้านั้น (user / userDetail / vehicle / home)
 */
function renderUserPage(target, params) {
    // 1. หาหน้าที่กำลังเปิดอยู่
    const targetPage = document.querySelector(`#page-${target}`);

    // 2. หา container สำหรับแสดงข้อความ loading/error "ภายใน" หน้านั้นเท่านั้น
    //    (กันไม่ให้ไปทับ container ของหน้าอื่นโดยไม่ตั้งใจ)
    let loadingContainer = null;
    if (targetPage) {
        loadingContainer = targetPage.querySelector('.dataLoading') || targetPage.querySelector('#UserData');
    }
    // หมายเหตุ: หน้า #page-userDetail ยังไม่มี .dataLoading หรือ #UserData อยู่ข้างใน
    // ถ้าจะรองรับ loading/error ตอนเข้าหน้านี้โดยตรง (เช่นแชร์ลิงก์) ต้องเพิ่ม container ให้หน้านี้ด้วย

    // 3. เช็คสถานะ "กำลังโหลด"
    if (isLoading) {
        if (loadingContainer) {
            loadingContainer.innerHTML = `<p class="loading-text">Loading data...</p>`;
        }
        return;
    }

    // 4. เช็คสถานะ "error" (HTTP status ไม่อยู่ในช่วง 200-299)
    if (fetchStatus < 200 || fetchStatus > 299) {
        if (loadingContainer) {
            loadingContainer.innerHTML = `<p class="loading-text" style="color: red;">Data loading error Please try again later(Code: ${fetchStatus})</p>`;
        }
        return;
    }

    // 5. สถานะ "สำเร็จ" -> render เนื้อหาจริงตามหน้า
    if (target === "user") {
        console.log(`Open USER DATA`);
        renderUserList(mainData);
    } else if (target === "userDetail") {
        console.log(`Open moreDetailsUser`);
        renderUserDetail(Number(params.id));
    } else if (target === "vehicleDetail") {
        renderVehicleDetail(Number(params.id), Number(params.carIndex));
    } else if (target === "vehicle") {
        // ยังไม่ได้ทำ
    } else if (target === "home") {
        // ยังไม่ได้ทำ
    }
}


// ===================== Render หน้า USER DATA (list) =====================
/**
 * สร้างรายการ user ทั้งหมดใส่ใน #UserData
 * (ตั้งค่า innerHTML ครั้งเดียวหลัง loop จบ เพื่อลด reflow/repaint)
 */
function renderUserList(users) {
    const userDataContainer = document.querySelector('#UserData');
    let htmlContent = "";
    users.forEach(user => {
        htmlContent += `
        <div class="User">
            <h2>${user.id}</h2>
            <h2>${user.houseNumber}</h2>
            <a href="#" data-id="${user.id}" data-target="userDetail" >แสดงข้อมูลเพิ่มเติม</a>
        </div>
        `;
    });
    userDataContainer.innerHTML = htmlContent;
}
// ===================== Render หน้ารายละเอียด user =====================

function renderUserDetail(userId) {
    const user = mainData.find(u => u.id === userId);
    const userDetailContainer = document.querySelector('#page-userDetail');

    // กันกรณีหา user ไม่เจอ (id ผิด หรือข้อมูลยังไม่มา) ไม่งั้นจะ error ตอนอ่าน user.vehicles
    if (!user) {
        userDetailContainer.innerHTML = `<p class="loading-text">ไม่พบข้อมูล</p>`;
        return;
    }
    console.log(user);

    // สร้างรายการยานพาหนะของ user คนนี้ (ถ้ามี)
    let vehiclesHTML = '';
    if (user.vehicles.length > 0) {
        user.vehicles.forEach((vehicle, index) => {
            vehiclesHTML += `
            <div class="headVlist">
                <p class="Vlist">${vehicle.plate}</p>
                <p class="Vlist">${vehicle.type}</p>
                <a href="" data-target="vehicleDetail" data-car-index="${index}" data-id="${user.id}">แสดงข้อมูลเพิ่มเติม</a>
            </div>`;
        });
    } else {
        vehiclesHTML = `<div class="headVlist">
                            <p class="Vlist">-</p>
                            <p class="Vlist">-</p>
                            <p></p>
                        </div>`;
    }

    userDetailContainer.innerHTML = `
            <section class="homeDetail">
                <div class="homeNumber">
                    <p class="homeList">เลขที่บ้าน</p>
                    <p class="homeList">${user.houseNumber}</p>
                </div>
                <div class="nameOwner">
                    <p class="homeList">ชื่อเจ้าบ้าน</p>
                    <p class="homeList">${user.ownerName}</p>
                </div>
                <div class="TimeData">
                    <p class="homeList">วันที่เข้าอยู่ ${user.regitter ?? '-'}</p>
                    <p class="homeList">วันที่สมัครสมาชิก ${user.dateMember ?? '-'} | วันหมดอายุ ${user.MemberTimeout ?? '-'}</p>
                </div>
            </section>
                <section class="vehicleUser">
                    <h1 class="vehicleList">รายละเอียดยานพาหนะ</h1>
                    <div class="headVlist">
                        <h3 class="Vlist">ป้ายทะเบียน</h3>
                        <h3 class="Vlist">ประเภทยานพาหนะ</h3>
                        <h3 class="Vlist"></h3>
                    </div>
                    ${vehiclesHTML}
                </section>`;
}


// แสดงข้อมูลรถแต่ละคัน
function renderVehicleDetail(userId, vehicleIndex) {
    const user = mainData.find(u => u.id === userId);
    const vehicleDetailContainer = document.querySelector("#page-vehicleDetail");
    if (!user) {
        vehicleDetailContainer.innerHTML = `<p class="loading-text">ไม่พบข้อมูล</p>`;
        return;
    }
    const vehicleData = user.vehicles[vehicleIndex];//เข้าถึงข้อมูลรถ
    if (!vehicleData) {
        vehicleDetailContainer.innerHTML = `<p class="loading-text">ไม่พบข้อมูลยานพาหนะ</p>`;
        return;
    }

    let timeInHTML = '';
    let timeOutHTML = '';
    if (vehicleData.timeInOut.length > 0) {
        vehicleData.timeInOut.forEach((timeRecord) => {
            timeInHTML += `
            <span class="time-record">${timeRecord.in ?? '-'}</span>
            `
            timeOutHTML += `
            <span class="time-record">${timeRecord.out ?? '-'}</span>
            `
        });
    } else {
        timeInHTML += `
            <span class="time-record">-</span>
            `
        timeOutHTML += `
        <span class="time-record">-</span>
        `
    }
    let htmlContent = `<div class="vehicle-card">
    <!-- head -->
    <div class="v-title">Vehicle information.</div>
    <div class="v-date">Register : ${vehicleData.regitter ?? '-'} </div>
    
    <!-- time -->
    <div class="v-grid">
    <div class="v-item">ป้ายทะเบียน : ${vehicleData.plate ?? '-'}</div>
    <div class="v-item">ประเภท : ${vehicleData.type ?? '-'}</div>
    
    <div class="v-item">เวลาเข้า</div>
    <div class="v-item">เวลาออก</div>
    
    <!-- Box สำหรับเวลาเข้า-->
    <div class="v-item v-time" id="time-in-list">
    ${timeInHTML}
    </div>
    
    <!-- Box สำหรับเวลาออก -->
    <div class="v-item v-time" id="time-out-list">
    ${timeOutHTML}
    </div>
    </div>
    </div>`;
    vehicleDetailContainer.innerHTML = htmlContent;
}

// ===================== Event delegation สำหรับลิงก์ในรายการ user =====================
// ใช้วิธี delegate ที่ #UserData ตัวเดียว แทนการผูก event ให้ทุก <a> ที่สร้างขึ้นใหม่
// เพราะ element พวกนี้ถูกสร้างใหม่ทุกครั้งที่ updateData() รันใหม่
document.querySelector('.main-content').addEventListener('click', (e) => {
    const link = e.target.closest('a[data-target]');
    if (!link) return;
    e.preventDefault();

    const { target, ...params } = link.dataset;

    console.log(`target:${target}`);
    console.log(`params:`, params);
    showPage(target, params);
});
// เริ่มโหลดข้อมูลทันทีที่สคริปต์รัน
load(url);