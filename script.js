"use strict"
const url = "https://jsonplaceholder.typicode.com/users/";

async function lode(path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        console.log(data);
        updateData(data);
        // console.log(mainData);
    } catch (err) {
        console.log(err);
    }
}

function updateData(data) {
    const villageUser = document.querySelector('.villageUser');
    villageUser.innerHTML = "";
    data.forEach(element => {
        const childUl = document.createElement('li');
        const childLi_P = document.createElement('p');
        const childLi_a = document.createElement('a');
        childLi_P.textContent = `HOME ${element.id}`;
        childLi_a.textContent = `เพิ่มเติม`;
        childLi_a.href = "#";
        childLi_a.dataset.id = element.id;
        childUl.appendChild(childLi_P);
        childUl.appendChild(childLi_a);
        villageUser.appendChild(childUl);
    });
}

async function lodeUserDetail(id) {
    try{
        const res = await fetch(`${url}${id}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const user = await res.json();
        showDetail(user);
    }catch(err){
        console.error(err.message);
    }
}

const detailBox = document.querySelector('.detailBox');
function showDetail(user){

    detailBox.innerHTML = `
    <H2>${user.name}</H2>
    <P>Username: ${user.username}</P>
    <P>Email: ${user.email}</P>
    <P>Phone: ${user.phone}</P>
    <P>City: ${user.address.city}</P>
    <P>Company: ${user.company.name}</P>
    `;
}

document.querySelector('.villageUser').addEventListener('click',(e)=>{
    if(e.target.tagName === 'A'){
        e.preventDefault();
        const id = e.target.dataset.id;
        detailBox.innerHTML = "กำลังโหลด..."
        lodeUserDetail(id);
    }
});
lode(url);
