# Software Diagram - Smart Village VCCES System

## 1. System Flowchart (ผังการทำงานหลักของระบบ)

```mermaid
flowchart TD
    A([เริ่มต้น: เปิดหน้า Landing Page<br/>index.html]) --> B{Session ยัง Login อยู่ไหม?<br/>sessionStorage.isLoggedIn}
    B -->|ใช่| D[พาไป Admin Dashboard<br/>admin/admin.html]
    B -->|ไม่| C[กดปุ่ม Login]
    C --> E{เลือกประเภทผู้ใช้งาน}
    E -->|ลูกบ้าน Resident| F[login/login.html?role=resident]
    E -->|นิติบุคคล Juristic| G[login/login.html?role=admin]
    F --> H[กรอก Username / Password]
    G --> H
    H --> I{ตรวจสอบสิทธิ์<br/>username=admin, password=123}
    I -->|ไม่ถูกต้อง| J[แสดงข้อความ Error สีแดง] --> H
    I -->|ถูกต้อง| K[เซ็ต sessionStorage<br/>isLoggedIn = true]
    K --> L([เข้าสู่ Admin Dashboard])

    L --> M{Fetch ข้อมูล<br/>admin/dataTest.json}
    M -->|"รอ 3 วิ (จำลอง)"| N[สถานะ Loading<br/>Loading data...]
    N --> O{HTTP Status 200-299?}
    O -->|ไม่| P["แสดงข้อความ Error<br/>Data loading error (Code)"]
    O -->|ใช่| Q[เก็บข้อมูลลง mainData]
    Q --> R[Render หน้าแสดงผล]
    P --> R

    R --> S{เลือกเมนูใน Nav}
    S -->|HOME| T["หน้า Home<br/>(ยังไม่ได้ทำ)"]
    S -->|VEHICLE DATA| U[แสดงรายการยานพาหนะ<br/>ประเภท / ทะเบียน / เวลาเข้า-ออก]
    S -->|USER DATA| V[แสดงรายการลูกบ้าน<br/>ลำดับ / เลขที่บ้าน]
    V --> W[คลิก 'แสดงข้อมูลเพิ่มเติม']
    W --> X[หน้า User Detail<br/>เลขที่บ้าน / ชื่อเจ้าบ้าน / วันที่ / รถ]
    U --> Y[คลิก 'แสดงข้อมูลเพิ่มเติม']
    Y --> Z[หน้า Vehicle Detail<br/>ทะเบียน / ประเภท / ประวัติเข้า-ออก]

    U --> AA[กดปุ่ม Logout]
    X --> AA
    Z --> AA
    T --> AA
    AA --> AB[ลบ sessionStorage.isLoggedIn]
    AB --> A
```

## 2. Sequence Diagram (ลำดับการทำงานของระบบ)

```mermaid
sequenceDiagram
    actor ผู้ใช้ as User
    participant LP as "Landing Page<br/>(index.html)"
    participant LG as "Login Module<br/>(login/)"
    participant AD as "Admin Dashboard<br/>(admin/admin.html + script.js)"
    participant JSON as "Mock Data<br/>(admin/dataTest.json)"

    ผู้ใช้->>LP: เปิดหน้าเว็บ
    LP->>LP: เช็ก sessionStorage.isLoggedIn
    alt ยังไม่ได้ Login
        LP->>ผู้ใช้: แสดงปุ่ม เข้าสู่ระบบ
        ผู้ใช้->>LP: เลือกบทบาท (Resident / Juristic)
        LP->>LG: เปิดหน้า login.html?role=...
        ผู้ใช้->>LG: กรอก username / password
        LG->>LG: ตรวจสอบกับ MOCK_USER (admin/123)
        alt รหัสถูกต้อง
            LG->>LG: sessionStorage.isLoggedIn = "true"
            LG->>AD: redirect ไป admin.html
        else รหัสไม่ถูกต้อง
            LG->>ผู้ใช้: แสดงข้อความ Error
        end
    else Login แล้ว
        LP->>AD: redirect ไป admin.html
    end

    AD->>AD: Authentication Guard<br/>เช็ก isLoggedIn อีกครั้ง
    alt ยังไม่ Login
        AD-->>LG: redirect กลับหน้า Login
    end
    AD->>JSON: fetch(dataTest.json) หลัง delay 3 วิ
    JSON-->>AD: ข้อมูลลูกบ้าน (JSON Array)
    AD->>AD: เก็บใน mainData, isLoading=false
    AD->>AD: Render หน้าตามเมนูที่เลือก
    ผู้ใช้->>AD: คลิกเมนู (HOME / VEHICLE / USER)
    AD->>ผู้ใช้: แสดงข้อมูลที่ render
    ผู้ใช้->>AD: คลิกดูรายละเอียดรถ/บ้าน
    AD->>ผู้ใช้: แสดง User/Vehicle Detail
    ผู้ใช้->>AD: กด Logout
    AD->>AD: ลบ sessionStorage, redirect ไป Landing Page
```

## 3. ER Diagram (โครงสร้างฐานข้อมูลที่วางแผนไว้)

```mermaid
erDiagram
    USERS ||--o{ VEHICLES : "1 ลูกบ้าน มีได้หลายรถ"
    VEHICLES ||--o{ VEHICLE_LOGS : "1 รถ มีได้หลายประวัติ"
    USERS {
        int id PK
        string houseNumber
        string ownerName
        date registerDate
        date memberStartDate
        date memberExpireDate
    }
    VEHICLES {
        int id PK
        int user_id FK
        string plate
        string type
        date registerDate
    }
    VEHICLE_LOGS {
        int id PK
        int vehicle_id FK
        datetime time_in
        datetime time_out
    }
```
