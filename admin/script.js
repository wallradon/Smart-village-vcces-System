"use strict"
const url = "https://jsonplaceholder.typicode.com/users/";
let userData = []; //maineData
let isLoading = true; // lode State
//select menu
const navItems = document.querySelectorAll('nav li[data-target]');
const pages = document.querySelectorAll('.page')

function showPage(target) {

    pages.forEach(page => page.classList.remove('active')); //removeclass"active"
    navItems.forEach(li => li.classList.remove('user-select'));
    const targetPage = document.querySelector(`#page-${target}`);
    if (targetPage) {
        targetPage.classList.add('active');
        if (target === "user") {
            renderUserPage();
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
        hNumber.textContent = `${element.username}`;
        childLi_a.textContent = `แสดงข้อมูลเพิ่มเติม`;
        childLi_a.href = "#";
        childLi_a.dataset.id = element.id;
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
lode(url);
