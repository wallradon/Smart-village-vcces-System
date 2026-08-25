# 📚 หัวข้อการเรียนรู้และเทคโนโลยีที่ใช้ในโปรเจกต์ (Learning & Technologies)

เอกสารนี้รวบรวมหัวข้อ เทคโนโลยี และทฤษฎีที่ใช้ในการพัฒนาโปรเจกต์ **Smart Village VCCES System** เพื่อนำไปใช้เป็นข้อมูลประกอบการจัดทำรูปเล่มปริญญานิพนธ์/โครงงาน

---

## 🟢 1. เทคโนโลยีและทฤษฎีที่ใช้งานอยู่ในปัจจุบัน (Current Implementation)
หัวข้อเหล่านี้คือสิ่งที่ถูกนำมาใช้เขียนโค้ดและทำงานอยู่ในระบบเวอร์ชันปัจจุบัน (`login.js`, `script.js`, `admin.html`)

### 1.1 Web Technologies (เทคโนโลยีเว็บพื้นฐาน)
- **HTML5 (Hypertext Markup Language):** 
  - การใช้ Semantic HTML (เช่น `<header>`, `<main>`, `<nav>`, `<section>`) เพื่อให้โครงสร้างเว็บชัดเจน
- **CSS3 (Cascading Style Sheets):**
  - **Flexbox & CSS Grid:** สำหรับจัดระเบียบ Layout ให้สวยงาม (เช่น จัดแถวตารางข้อมูล)
  - **Responsive Design:** การออกแบบให้หน้าเว็บรองรับอุปกรณ์และขนาดจอที่หลากหลาย
- **JavaScript (ES6+):** การเขียนโปรแกรมฝั่งไคลเอนต์ (Client-Side Scripting) เพื่อให้เว็บตอบสนองได้ (Dynamic)

### 1.2 JavaScript Concepts (ทฤษฎีและแนวคิดเชิงโปรแกรมมิ่ง)
- **DOM Manipulation:** การเข้าถึงและปรับเปลี่ยนโครงสร้างหน้าเว็บผ่าน JS (เช่น `document.querySelector`, `innerHTML`, `classList.add`)
- **Event Listeners & Event Delegation:** การดักจับเหตุการณ์การคลิกหรือพิมพ์ โดยเฉพาะแนวคิด Event Delegation ที่ดักจับจากตัวแม่ (Parent) เพื่อลดภาระของระบบ
- **Client-Side Authentication:** การจำลองการล็อกอินและเก็บข้อมูลการเข้าระบบไว้ใน `sessionStorage`
- **Array Methods:** การใช้ฟังก์ชันจัดการอาเรย์ เช่น `forEach` (วนลูปแสดงข้อมูล) และ `find` (ค้นหาข้อมูลลูกบ้านจาก ID)
- **Nullish Coalescing Operator (`??`):** การจัดการค่าว่าง (Fallback value) ป้องกันกรณีไม่มีข้อมูลส่งมาแล้วเกิด Error (เช่น `record.in ?? '-'`)
- **JSON (JavaScript Object Notation):** รูปแบบการจัดเก็บและรับส่งข้อมูล (ปัจจุบันจำลองไฟล์ `dataTest.json` เป็นเหมือนฐานข้อมูล)

### 1.3 System Architecture (สถาปัตยกรรมระบบเบื้องต้น)
- **Single Page Application (SPA) Routing:** การจำลองการเปลี่ยนหน้าเมนูโดยไม่ต้องโหลดหน้าเว็บใหม่ทั้งหมด (ซ่อน/แสดง `<section>`)
- **Separation of Concerns:** แนวคิดการแยกส่วนการทำงานให้ชัดเจน (แยกโครงสร้าง HTML, ความสวยงาม CSS, การทำงาน JS และไฟล์ข้อมูล API)

---

## 🔵 2. หัวข้อที่ต้องเรียนรู้เพิ่มเติมและนำไปพัฒนาต่อ (Future & Required Topics)
หัวข้อเหล่านี้คือสิ่งที่จะต้องนำมาเชื่อมต่อในอนาคต เพื่อให้โปรเจกต์นี้ทำงานได้สมบูรณ์แบบในบริบทของระบบ IoT และใช้งานได้จริง

### 2.1 Backend Development (การพัฒนาหลังบ้าน)
- **Server-Side Programming:** การเขียนเซิร์ฟเวอร์ (เช่น ใช้ Node.js + Express, Python, หรือ PHP)
- **Database Management (ระบบจัดการฐานข้อมูล):** 
  - การเก็บข้อมูลลูกบ้าน ทะเบียนรถ และเวลาเข้า-ออก ลงในฐานข้อมูลจริง (เช่น MySQL, PostgreSQL, หรือ MongoDB)
- **RESTful API:** การสร้างช่องทางสื่อสารระหว่างหน้าเว็บ (Frontend) และฐานข้อมูล (Backend)
- **Security & Server-Side Authentication:** 
  - เปลี่ยนจากการใช้ `sessionStorage` เป็นระบบความปลอดภัยมาตรฐาน เช่น JWT (JSON Web Token) หรือ Session Cookies
  - ป้องกันช่องโหว่ความปลอดภัย เช่น XSS (Cross-Site Scripting)

### 2.2 Internet of Things (IoT) Integration (การผสานรวมฮาร์ดแวร์และ IoT)
วิชานี้เป็นวิชา IoT ดังนั้นหัวข้อด้านฮาร์ดแวร์จึงสำคัญมากสำหรับการเขียนรูปเล่ม:
- **Microcontrollers:** บอร์ดสมองกลฝังตัว (เช่น ESP32, ESP8266, หรือ Raspberry Pi) สำหรับเป็นตัวควบคุมป้อมยาม
- **Communication Protocols (โปรโตคอลการสื่อสาร):**
  - **MQTT (Message Queuing Telemetry Transport):** โปรโตคอลน้ำหนักเบาสำหรับการส่งข้อมูลแบบ Real-time ระหว่างอุปกรณ์ IoT กับ Server
  - **HTTP/HTTPS:** สำหรับให้อุปกรณ์เรียกใช้งาน API เพื่อบันทึกข้อมูล
- **Sensor & Actuator Control:**
  - **Servo Motor / Relay:** การสั่งการเปิด-ปิดไม้กั้นอัตโนมัติเมื่อตรวจสอบทะเบียนรถผ่าน
  - **ALPR (Automatic License Plate Recognition):** ระบบกล้องอ่านและวิเคราะห์ป้ายทะเบียนรถ (อาจใช้ ESP32-CAM คู่กับเซิร์ฟเวอร์ประมวลผลภาพ)

### 2.3 Advanced Frontend Features (การปรับปรุงส่วนแสดงผลเพิ่มเติม)
- **Pagination / Infinite Scroll:** เทคนิคการแบ่งหน้าแสดงข้อมูลเมื่อมีรายการรถเข้า-ออกจำนวนมาก
- **ES6 Modules:** การปรับโครงสร้างโค้ด JavaScript แยกเป็นหลายๆ ไฟล์ (import/export) ให้เป็นระเบียบยิ่งขึ้น
- **Search & Filter Algorithms:** อัลกอริทึมการค้นหาและคัดกรองข้อมูลลูกบ้านจากหน้าเว็บ
