"use strict"
const url = "./dataTest.json";
let userData = []; //maineData
let isLoading = true; // lode State
//select menu
const navItems = document.querySelectorAll('nav li[data-target]');
const pages = document.querySelectorAll('.page')

function showPage(target, id) {

    pages.forEach(page => page.classList.remove('active')); //removeclass"active"
    navItems.forEach(li => li.classList.remove('user-select'));  //removeclass"user-select"
    const targetPage = document.querySelector(`#page-${target}`);
    if (targetPage) {
        targetPage.classList.add('active');
        if (target === "user") {
            renderUserPage();
        } else if (target === "userDetail") {
            console.log(`Open moreDetailsUser`)
            moreDetailsUser(Number(id));
        } else if (target === "vehicle") {
            // code hear
        } else if (target === "home") {
            //code hear
        }
    }
    const activeLi = document.querySelector(`nav li[data-target="${target}"]`);
    if (activeLi) activeLi.classList.add('user-select');
}
navItems.forEach(li => {
    li.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(li.dataset.target);
    });
});

showPage('home');

async function lode(path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        userData = data;
        isLoading = false;
        const userPage = document.querySelector('#page-user');
        if (userPage.classList.contains('active')) {
            renderUserPage();
        }
    } catch (err) {
        console.log(err);
    }
}

function updateData(data) {
    const UserData = document.querySelector('#UserData');
    UserData.innerHTML = "";
    data.forEach(element => {
        const div = document.createElement('div');
        const number = document.createElement('h2');
        const hNumber = document.createElement('h2');
        const childLi_a = document.createElement('a');
        number.textContent = `${element.id}`;
        hNumber.textContent = `${element.houseNumber}`;
        childLi_a.textContent = `แสดงข้อมูลเพิ่มเติม`;
        childLi_a.href = "#";
        childLi_a.dataset.id = element.id;
        childLi_a.dataset.target = `userDetail`;
        div.classList.add('User');

        div.appendChild(number);
        div.appendChild(hNumber);
        div.appendChild(childLi_a);

        UserData.appendChild(div);
    });
}
//loding ....
function renderUserPage() {
    if (isLoading) {
        const UserData = document.querySelector('#UserData');
        UserData.innerHTML = `<p class="loading-text">กำลังโหลดข้อมูล...</p>`;
    } else {
        updateData(userData);
    }
}

// moreDetails
function moreDetailsUser(id) {
    const user = userData.find(u => u.id === id);
    const moreUserde = document.querySelector('#page-userDetail');

    console.log(user);

    let vehiclesHTML = '';
    if (user.vehicles.length > 0) {
        user.vehicles.forEach(v => {
            vehiclesHTML += `
            <div class="headVlist">
                <p class="Vlist">${v.plate}</p>
                <p class="Vlist">${v.type}</p>
                <a href="">แสดงข้อมูลเพิ่มเติม</a>
            </div>`;
        });
    } else {
        vehiclesHTML = `<div class="headVlist">
                            <p class="Vlist">-</p>
                            <p class="Vlist">-</p>
                            <p></p>
                        </div>`;
    }

    moreUserde.innerHTML = `
        <section class="homeDetail">
            <div class="homeNumber">
                <p class="homeList">เลขที่บ้าน</p>
                <p class="homeList">${user.houseNumber}</p>
            </div>
            <div class="nameOwner">
                <p class="homeList">ชื่อเจ้าบ้าน</p>
                <p class="homeList">${user.ownerName}</p>
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

document.querySelector('#UserData').addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        const targetPage = e.target.dataset.target; // "userDetail"
        // show moreDetail
        if (targetPage) {
            showPage(targetPage, Number(e.target.dataset.id));
        }
    }
});


lode(url);
