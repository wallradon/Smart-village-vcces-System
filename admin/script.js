"use strict"

// 0. ตรวจสอบสิทธิ์การเข้าถึง (Authentication Guard / Route Protection)
// ตรวจสอบสถานะการเข้าสู่ระบบจาก sessionStorage
if (sessionStorage.getItem("isLoggedIn") !== "true") {
    // หากไม่มีการเข้าสู่ระบบ (isLoggedIn ไม่เป็น "true") ให้ส่งกลับไปยังหน้า Login ทันที
    window.location.href = "../login/login.html";
}

// ===================== ตัวแปรสถานะหลักของแอป (Global App State) =====================
const url = "./dataTest.json"; // ที่อยู่ของไฟล์ JSON หรือ API endpoint สำหรับโหลดข้อมูลลูกบ้าน
let mainData = [];       // ตัวแปรส่วนกลางสำหรับเก็บข้อมูลลูกบ้านทั้งหมดหลังจากดึงจากเซิร์ฟเวอร์เสร็จสิ้น
let isLoading = true;    // สถานะการดาวน์โหลดข้อมูล (true = กำลังดาวน์โหลดข้อมูล, false = ดึงข้อมูลเสร็จสิ้นแล้ว)
// fetchStatus ได้ถูกประกาศใช้ใน API.js เพื่อติดตามสถานะ HTTP Response ล่าสุด

// ===================== เมนู / การสลับหน้า (Menu Navigation & Page Router) =====================
const navItems = document.querySelectorAll('nav li[data-target]'); // ดึงปุ่มเมนูทั้งหมดใน Navbar ที่มี data-target
const pages = document.querySelectorAll('.page');                  // ดึง element หน้าเนื้อหาทั้งหมดที่มี class "page"


/**
 * ฟังก์ชันสลับการแสดงผลของหน้าเพจ (Page Router)
 * @param {string} target - ชื่อหน้าปลายทางที่ต้องการสลับไปแสดงผล (ตรงกับส่วนต่อท้าย id ของหน้า เช่น 'home', 'user', 'vehicle')
 * @param {Object} params - พารามิเตอร์อื่นๆ ที่ต้องการส่งต่อไปให้หน้าเพจปลายทาง (เช่น { id: 1, carIndex: 0 })
 */
function showPage(target, params) {
    // 1. ซ่อนหน้าเพจทั้งหมดก่อน โดยเอาคลาส 'active' ออก
    pages.forEach(page => page.classList.remove('active'));

    // 2. ยกเลิกการเน้นสีเมนูใน Navbar ทั้งหมด โดยเอาคลาส 'user-select' ออก
    navItems.forEach(li => li.classList.remove('user-select'));

    // 3. แสดงหน้าเพจปลายทางที่เลือก โดยเพิ่มคลาส 'active' กลับเข้าไปที่ id ของหน้านั้นๆ (#page-[target])
    const targetPage = document.querySelector(`#page-${target}`);
    if (targetPage) {
        targetPage.classList.add('active');
        renderUserPage(target, params);       // เรียกใช้ฟังก์ชันตัวกลางเพื่อ Render ข้อมูลลงในหน้านี้
    }

    // 4. ไฮไลต์ปุ่มเมนูใน Navbar ของหน้าปัจจุบันเพื่อให้ผู้ใช้ทราบว่ากำลังอยู่ในเมนูใด
    const activeLi = document.querySelector(`nav li[data-target="${target}"]`);
    if (activeLi) activeLi.classList.add('user-select');
}

// ผูกเหตุการณ์คลิก (Click Event) ให้กับเมนูทุกอันใน Navbar เพื่อเรียกใช้งานฟังก์ชันสลับหน้า showPage
navItems.forEach(li => {
    li.addEventListener('click', (e) => {
        e.preventDefault(); // ป้องกันพฤติกรรมเริ่มต้นของเบราว์เซอร์
        showPage(li.dataset.target); // เข้าถึงชื่อหน้าปลายทางผ่าน dataset.target และเปิดหน้านั้น
    });
});

// ===================== ระบบออกจากระบบ (Logout System) =====================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // ลบสถานะการเข้าสู่ระบบจาก sessionStorage
        sessionStorage.removeItem("isLoggedIn");
        // พาลูกบ้าน/ผู้จัดการระบบ กลับไปยังหน้าหลัก (Landing Page)
        window.location.href = "../index.html";
    });
}

// เปิดหน้าแรก (หน้า home) ทันทีที่ผู้ใช้งานเข้าสู่ระบบเป็นค่าเริ่มต้น
showPage('home');


/**
 * ฟังก์ชันสำหรับอัปเดต/รีเฟรชข้อมูลในหน้าเพจที่เปิดอยู่ ณ ปัจจุบัน
 * มักถูกเรียกใช้หลังจากดึงข้อมูลจาก API หรือ JSON เสร็จเรียบร้อย
 */
function refreshCurrentPage() {
    // ค้นหาว่าเมนูใดในแถบนำทางกำลังเป็นเมนูที่ถูกเลือกใช้งานอยู่
    const activeLi = document.querySelector('nav li.user-select');
    if (activeLi) {
        const target = activeLi.dataset.target;
        // ทำการ Render เนื้อหาของหน้านั้นใหม่อีกครั้งเพื่ออัปเดต UI ให้สอดคล้องกับข้อมูลใหม่
        renderUserPage(target, null);
    }
}

// ===================== ตัวกลางตัดสินใจว่าจะ render อะไร (Render Router) =====================
/**
 * ฟังก์ชันตัวกลางสำหรับตรวจสอบสถานะของข้อมูล (Loading/Error/Success) ก่อนทำการแสดงผลในหน้านั้นๆ
 * @param {string} target - หน้าเพจปลายทาง
 * @param {Object} params - ข้อมูลพารามิเตอร์ส่งผ่าน (เช่น id ของผู้ใช้งาน)
 */
function renderUserPage(target, params) {
    // 1. ค้นหา element ของหน้าเพจที่ผู้ใช้เปิดอยู่
    const targetPage = document.querySelector(`#page-${target}`);

    // 2. ค้นหาพื้นที่แสดงผลข้อความสถานะโหลด/ข้อผิดพลาดในหน้าเฉพาะนั้นๆ เพื่อไม่ให้กระทบต่อโครงสร้างหน้าอื่น
    let loadingContainer = null;
    if (targetPage) {
        loadingContainer = targetPage.querySelector('.dataLoading') || targetPage.querySelector('#UserData');
    }

    // 3. ตรวจสอบสถานะการดาวน์โหลด: หากยังดาวน์โหลดข้อมูลไม่สำเร็จ ให้แสดงข้อความสถานะกำลังโหลด (Loading)
    if (isLoading) {
        if (loadingContainer) {
            loadingContainer.innerHTML = `<p class="loading-text">กำลังดาวน์โหลดข้อมูล (Loading data...)</p>`;
        }
        return;
    }

    // 4. ตรวจสอบข้อผิดพลาดในการโหลด: หากรหัส HTTP Status ไม่ถูกต้อง (ไม่อยู่ในช่วง 200-299) ให้แจ้งเตือนข้อผิดพลาด
    if (fetchStatus < 200 || fetchStatus > 299) {
        if (loadingContainer) {
            loadingContainer.innerHTML = `<p class="loading-text" style="color: red;">เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง (HTTP Code: ${fetchStatus})</p>`;
        }
        return;
    }

    // 5. หากดาวน์โหลดข้อมูลเสร็จสมบูรณ์ ให้นำข้อมูลมาแสดงผลแยกตามชื่อหน้า (target)
    if (target === "user") {
        console.log(`เปิดหน้าแสดงรายการข้อมูลลูกบ้านทั้งหมด`);
        renderUserList(mainData);
    } else if (target === "userDetail") {
        console.log(`เปิดหน้าแสดงรายละเอียดของลูกบ้าน ID:`, params.id);
        renderUserDetail(Number(params.id));
    } else if (target === "vehicleDetail") {
        console.log(`เปิดหน้าแสดงรายละเอียดประวัติเข้า-ออกของยานพาหนะ ID: ${params.id}, ลำดับรถ: ${params.carIndex}`);
        renderVehicleDetail(Number(params.id), Number(params.carIndex));
    } else if (target === "vehicle") {
        console.log(`เปิดหน้าแสดงประวัติยานพาหนะเข้า-ออกทั้งหมด`);
        renderVehicleList(mainData);
    } else if (target === "home") {
        // สามารถเพิ่มการเรนเดอร์หน้าแรก Dashboard หรือสถิติที่นี่ในอนาคต
    }
}

// ===================== Render หน้า VEHICLE DATA (รายการประวัติการเข้า-ออกของรถยนต์) =====================
/**
 * ฟังก์ชันจัดการ Render รายชื่อประเภทรถ, ป้ายทะเบียน และเวลาเข้า-ออกทั้งหมดที่มีในระบบลงในหน้า VEHICLE DATA
 * @param {Array} users - ชุดข้อมูลลูกบ้านทั้งหมดพร้อมรายการยานพาหนะ
 */
function renderVehicleList(users) {
    const vehicleDataContainer = document.querySelector('#VehicleData');
    if (!vehicleDataContainer) return; // ยุติหากไม่พบ container บนหน้าเว็บ

    let htmlContent = "";
    let foundCount = 0; // ตัวแปรสำหรับนับจำนวนข้อมูลรถที่ประมวลผล

    // วนลูปตรวจสอบข้อมูลผู้ใช้แต่ละราย
    users.forEach(user => {
        // คัดกรองเฉพาะผู้ใช้ที่มีข้อมูลยานพาหนะลงทะเบียนไว้
        if (user.vehicles && user.vehicles.length > 0) {
            user.vehicles.forEach((vehicle) => {
                const plate = vehicle.plate || ""; // ป้ายทะเบียนรถ
                const type = vehicle.type || "-";    // ประเภทรถ (เช่น รถยนต์, จักรยานยนต์)

                // หากรถคันดังกล่าวมีประวัติเวลาเข้า-ออกระบบแล้ว ให้ทำการวนลูปแสดงรายละเอียดประวัติแต่ละรอบ
                if (vehicle.timeInOut && vehicle.timeInOut.length > 0) {
                    vehicle.timeInOut.forEach((record) => {
                        foundCount++;
                        const recordText = `เข้า: ${record.in ?? '-'} | ออก: ${record.out ?? '-'}`;

                        htmlContent += `
                        <div class="User VehicleRow">
                            <h2>${type}</h2>
                            <h2>${plate}</h2>
                            <h2>${recordText}</h2>
                        </div>
                        `;
                    });
                } else {
                    // หากยังไม่มีประวัติการเข้า-ออกเลย ให้แสดงรายละเอียดข้อมูลรถพร้อมแจ้งเตือนว่ายังไม่มีประวัติ
                    foundCount++;
                    htmlContent += `
                    <div class="User VehicleRow">
                        <h2>${type}</h2>
                        <h2>${plate}</h2>
                        <h2>ยังไม่มีประวัติเข้า-ออกในระบบ</h2>
                    </div>
                    `;
                }
            });
        }
    });

    // หากไม่พบรถของใครที่มีประวัติหรือลงทะเบียนไว้ในหมู่บ้านเลย ให้ขึ้นแจ้งเตือน
    if (foundCount === 0) {
        htmlContent = `<p class="loading-text">ไม่พบข้อมูลยานพาหนะในระบบ</p>`;
    }

    // เขียนโครงสร้าง HTML ลงหน้าแสดงผล
    vehicleDataContainer.innerHTML = htmlContent;
}


// ===================== Render หน้า USER DATA (รายการข้อมูลลูกบ้าน) =====================
/**
 * ฟังก์ชันสำหรับ Render ลำดับและเลขที่บ้านของผู้ใช้งานทั้งหมด
 * @param {Array} users - ข้อมูลรายชื่อผู้ใช้งานระบบทั้งหมด
 */
function renderUserList(users) {
    const userDataContainer = document.querySelector('#UserData');
    if (!userDataContainer) return;

    let htmlContent = "";
    // วนลูปสร้าง HTML รายชื่อลูกบ้าน
    users.forEach(user => {
        htmlContent += `
        <div class="User">
            <h2>${user.id}</h2>
            <h2>${user.houseNumber}</h2>
            <!-- ลิงก์สำหรับกดเข้าไปดูรายละเอียดข้อมูลบ้านและผู้พักอาศัยเพิ่มเติม โดยอ้างอิง data-id -->
            <a href="#" data-id="${user.id}" data-target="userDetail" >แสดงข้อมูลเพิ่มเติม</a>
        </div>
        `;
    });
    // นำ HTML ไปแปะในหน้าเว็บรวดเดียว เพื่อลด Reflow / Repaint ช่วยเพิ่มประสิทธิภาพความเร็ว
    userDataContainer.innerHTML = htmlContent;
}

// ===================== Render หน้ารายละเอียดผู้ใช้งานและยานพาหนะที่ลงทะเบียนไว้ (User Detail) =====================
/**
 * ฟังก์ชันสร้างและเรนเดอร์ข้อมูลรายละเอียดเจ้าบ้านและรถยนต์ทุกคันที่เป็นเจ้าของ
 * @param {number} userId - รหัสประจำตัว (ID) ของลูกบ้านที่เลือก
 */
function renderUserDetail(userId) {
    // ค้นหาข้อมูลลูกบ้านโดยใช้ ID
    const user = mainData.find(u => u.id === userId);
    const userDetailContainer = document.querySelector('#page-userDetail');

    // ป้องกันแอปพลิเคชันค้างกรณีหากค้นหาผู้ใช้งานคนนี้ไม่พบในระบบ
    if (!user) {
        userDetailContainer.innerHTML = `<p class="loading-text">ไม่พบข้อมูลผู้ใช้งาน</p>`;
        return;
    }
    console.log("กำลังเรนเดอร์ข้อมูลลูกบ้าน:", user);

    // วนลูปดึงข้อมูลรถทั้งหมดของบ้านหลังนี้มาจัดทำรายการ HTML
    let vehiclesHTML = '';
    if (user.vehicles && user.vehicles.length > 0) {
        user.vehicles.forEach((vehicle, index) => {
            vehiclesHTML += `
            <div class="headVlist">
                <p class="Vlist">${vehicle.plate}</p>
                <p class="Vlist">${vehicle.type}</p>
                <!-- ลิงก์สำหรับขอดูเวลาเข้า-ออกโดยเฉพาะของรถคันนี้ โดยส่ง id ลูกบ้าน และ index ของรถไปใน dataset -->
                <a href="" data-target="vehicleDetail" data-car-index="${index}" data-id="${user.id}">แสดงข้อมูลเพิ่มเติม</a>
            </div>`;
        });
    } else {
        // แถวว่างกรณีบ้านหลังนี้ไม่มีการลงทะเบียนยานพาหนะไว้
        vehiclesHTML = `<div class="headVlist">
                            <p class="Vlist">-</p>
                            <p class="Vlist">-</p>
                            <p></p>
                        </div>`;
    }

    // อัปเดต HTML ของหน้าข้อมูลส่วนบุคคลและข้อมูลรถ
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
                    <p class="homeList">วันที่เข้าอยู่: ${user.regitter ?? '-'}</p>
                    <p class="homeList">วันที่สมัครสมาชิก: ${user.dateMember ?? '-'} | วันหมดอายุการใช้งาน: ${user.MemberTimeout ?? '-'}</p>
                </div>
            </section>
            <section class="vehicleUser">
                <h1 class="vehicleList">รายละเอียดยานพาหนะที่ลงทะเบียน</h1>
                <div class="headVlist">
                    <h3 class="Vlist">ป้ายทะเบียน</h3>
                    <h3 class="Vlist">ประเภทยานพาหนะ</h3>
                    <h3 class="Vlist">ดูข้อมูลเจาะลึก</h3>
                </div>
                ${vehiclesHTML}
            </section>`;
}


// ===================== Render รายละเอียดรถคันเฉพาะและการจัดกลุ่มประวัติเวลาเข้า-ออก (Vehicle Detail) =====================
/**
 * ฟังก์ชันสำหรับ Render ประวัติการเข้า-ออกของรถแต่ละคันอย่างละเอียดในรูปแบบของการ์ดตารางประวัติเวลา
 * @param {number} userId - รหัส ID ของเจ้าบ้านผู้ถือกรรมสิทธิ์รถ
 * @param {number} vehicleIndex - ลำดับของรถที่ระบุในรายการ Array (เช่น คันแรก = 0, คันสอง = 1)
 */
function renderVehicleDetail(userId, vehicleIndex) {
    const user = mainData.find(u => u.id === userId);
    const vehicleDetailContainer = document.querySelector("#page-vehicleDetail");
    if (!user) {
        vehicleDetailContainer.innerHTML = `<p class="loading-text">ไม่พบข้อมูลเจ้าบ้าน</p>`;
        return;
    }

    // คัดกรองตัวรถยนต์โดยอ้างอิงลำดับดัชนีของ array รถ
    const vehicleData = user.vehicles[vehicleIndex];
    if (!vehicleData) {
        vehicleDetailContainer.innerHTML = `<p class="loading-text">ไม่พบข้อมูลยานพาหนะของเจ้าบ้านหลังนี้</p>`;
        return;
    }

    // จัดระเบียบชุดเวลาเข้า และ เวลาออก เพื่อแยกแสดงผลเป็นคนละฝั่งในแบบกริด (Grid Column)
    let timeInHTML = '';
    let timeOutHTML = '';

    // ตรวจสอบว่ามีข้อมูลเวลาบันทึกเข้าออกบ้างหรือไม่
    if (vehicleData.timeInOut && vehicleData.timeInOut.length > 0) {
        vehicleData.timeInOut.forEach((timeRecord) => {
            timeInHTML += `
            <span class="time-record">${timeRecord.in ?? '-'}</span>
            `;
            timeOutHTML += `
            <span class="time-record">${timeRecord.out ?? '-'}</span>
            `;
        });
    } else {
        // หากไม่มีข้อมูลประวัติใดๆ ในทะเบียนเลย
        timeInHTML += `<span class="time-record">-</span>`;
        timeOutHTML += `<span class="time-record">-</span>`;
    }

    // สร้างเนื้อหาการ์ดข้อมูลประวัติรถยนต์แบบกริด
    let htmlContent = `<div class="vehicle-card">
    <!-- ส่วนแสดงหัวข้อการ์ดและวันลงทะเบียน -->
    <div class="v-title">รายละเอียดข้อมูลยานพาหนะ (Vehicle Details)</div>
    <div class="v-date">ลงทะเบียนเข้าระบบ: ${vehicleData.regitter ?? '-'} </div>
    
    <!-- ตารางแสดงรายละเอียดรถยนต์และบันทึกเวลา -->
    <div class="v-grid">
        <div class="v-item">ป้ายทะเบียน: ${vehicleData.plate ?? '-'}</div>
        <div class="v-item">ประเภทยานพาหนะ: ${vehicleData.type ?? '-'}</div>
        
        <div class="v-item" style="font-weight: bold;">ประวัติเวลาเข้า</div>
        <div class="v-item" style="font-weight: bold;">ประวัติเวลาออก</div>
        
        <!-- รายการเวลาเข้า (ฝั่งซ้าย) -->
        <div class="v-item v-time" id="time-in-list">
            ${timeInHTML}
        </div>
        
        <!-- รายการเวลาออก (ฝั่งขวา) -->
        <div class="v-item v-time" id="time-out-list">
            ${timeOutHTML}
        </div>
    </div>
    </div>`;
    vehicleDetailContainer.innerHTML = htmlContent;
}

// ===================== ระบบดักจับเหตุการณ์คลิกลิงก์แบบสากล (Event Delegation) =====================
// เนื่องจากข้อมูลลูกบ้าน และข้อมูลรถต่างๆ ถูกเรนเดอร์ขึ้นมาใหม่หลังจากโหลดหน้าจออยู่เสมอ
// เพื่อหลีกเลี่ยงการเสียเวลาผูก addEventListener ให้ปุ่มใหม่ๆ เราจึงใช้ Event Delegation 
// โดยคอยดักจับการคลิกที่กล่องครอบคลุมเนื้อหาหลัก `.main-content` เพียงจุดเดียว
document.querySelector('.main-content').addEventListener('click', (e) => {
    // หาว่าสิ่งที่คลิกคือปุ่มหรือลิงก์ <a> ที่มี attribute data-target หรือไม่
    const link = e.target.closest('a[data-target]');
    if (!link) return; // หากเป็นการคลิกพื้นที่อื่นๆ ให้ข้ามการทำงานนี้ไป

    e.preventDefault(); // ยกเลิกการรีโหลดหน้าของลิงก์แบบเดิม

    // แกะข้อมูลที่เก็บไว้บน HTML Element (data-target, data-id, data-car-index เป็นต้น)
    const { target, ...params } = link.dataset;

    console.log(`การทำงานนำทาง: สลับไปยังหน้า ${target}`);
    console.log(`ข้อมูลพารามิเตอร์เสริม:`, params);

    // สั่งสลับหน้าตามการควบคุมเส้นทางหน้าจอ พร้อมส่งพารามิเตอร์ไปด้วย
    showPage(target, params);
});

// เริ่มดึงข้อมูลลูกบ้านทันทีที่เว็บแอปพลิเคชันหรือสคริปต์ตัวนี้ถูกเรียกใช้งาน
getUser(url);