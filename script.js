let lists = {};

window.onload = function() {
    let urlParams = new URLSearchParams(window.location.search);
    let listName = urlParams.get("list");

    if (listName && lists[listName]) {
        displayList(listName);
    }

    loadSavedLists();
};

document.getElementById("listForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    let listName = document.getElementById("listName").value;
    if (!listName) return;

    lists[listName] = { items: [] };
    localStorage.setItem("lists", JSON.stringify(lists));

    generateQRCode(listName);

    loadSavedLists();
});

document.getElementById("addItemBtn").addEventListener("click", function() {
    let listName = document.getElementById("listName").value;
    if (!listName) return alert("Lütfen liste adı giriniz.");

    let itemName = document.getElementById("itemName").value;
    let itemQuantity = document.getElementById("itemQuantity").value;
    let itemImage = document.getElementById("itemImage").files[0];

    if (!itemName || !itemQuantity) return alert("Öğe adı ve miktarı gereklidir.");

    if (!lists[listName]) lists[listName] = { items: [] };

    let item = {
        itemName: itemName,
        quantity: itemQuantity,
        imgSrc: itemImage ? URL.createObjectURL(itemImage) : ""
    };

    lists[listName].items.push(item);
    localStorage.setItem("lists", JSON.stringify(lists));

    displayList(listName);
});

function generateQRCode(listName) {
    let url = `${window.location.origin}?list=${encodeURIComponent(listName)}`;
    let qrCodeDisplay = document.getElementById("qrCodeDisplay");
    qrCodeDisplay.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=150x150" alt="QR Code">`;
}

function displayList(listName) {
    let container = document.getElementById("savedLists");
    container.innerHTML = ""; 

    let div = document.createElement("div");
    div.innerHTML = `<h3>${listName}</h3>`;

    lists[listName].items.forEach(item => {
        div.innerHTML += `
            <p><strong>${item.itemName}</strong> - ${item.quantity} 
            ${item.imgSrc ? `<img src="${item.imgSrc}" width="50" height="50">` : ""}</p>
        `;
    });

    container.appendChild(div);
}

function loadSavedLists() {
    let savedLists = JSON.parse(localStorage.getItem("lists"));
    if (savedLists) lists = savedLists;

    let container = document.getElementById("savedLists");
    container.innerHTML = "";

    for (let listName in lists) {
        displayList(listName);
    }
}
