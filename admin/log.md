# Change Log

## Version 1.0.1 (Current)
- **Feature/Fix:** เพิ่มเงื่อนไข fallback `?? '-'` สำหรับจัดการค่า null/undefined ในส่วนของข้อมูลที่ดึงมาจาก JSON โดยตรงในหน้าแสดงรายละเอียดพาหนะ
- **Refactoring:** ปรับเปลี่ยนชื่อตัวแปรและฟังก์ชันในไฟล์ `script.js` ให้สื่อความหมายและเข้าใจง่ายขึ้น:
  - ฟังก์ชัน `updateData` เปลี่ยนเป็น `renderUserList`
  - ฟังก์ชัน `moreDetailsUser` เปลี่ยนเป็น `renderUserDetail`
  - ฟังก์ชัน `vDetail` เปลี่ยนเป็น `renderVehicleDetail`
  - ตัวแปร `id` เปลี่ยนเป็น `userId`
  - ตัวแปร `carIndex` เปลี่ยนเป็น `vehicleIndex`
  - ตัวแปร `data` เปลี่ยนเป็น `vehicleData`
  - ตัวแปร `v` เปลี่ยนเป็น `vehicle`
  - ตัวแปร `t` เปลี่ยนเป็น `timeRecord`
  - ตัวแปร `timeIn` / `timeOut` เปลี่ยนเป็น `timeInHTML` / `timeOutHTML`
  - ตัวแปร `page` / `div` เปลี่ยนเป็น `htmlContent`
