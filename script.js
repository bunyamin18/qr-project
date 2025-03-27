let lists = JSON.parse(localStorage.getItem("lists")) || {};

function addItem() {
    let table = document.getElementById("itemTable").getElementsByTagName("tbody")[0];
    let row = table.insertRow();
    
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    
    cell1.innerHTML = `<input type="text" placeholder="Öğe Adı">`;
    cell2.innerHTML = `<input type="number" placeholder="Miktar">`;
    cell3.innerHTML = `<input type="file" accept="image/*" onchange="previewImage(this)">`;
    cell4.innerHTML = `<button onclick="deleteRow(this)">Sil</button>`;
}

function previewImage(input) {
    let file = input.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let img = document.createElement("img");
            img.src = e.target.result;
            img.width = 50;
            img.height = 50;
            input.parentElement.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

function deleteRow(button) {
    let row = button.parentElement.parentElement;
    row.remove();
}

function saveList() {
    let listName = document.getElementById("listName").value;
    if (!listName) {
        alert("Lütfen bir liste adı girin!");
        return;
    }

    let rows = document.querySelectorAll("#itemTable tbody tr");
    let items = [];

    rows.forEach(row => {
        let itemName = row.cells[0].querySelector("input").value;
        let quantity = row.cells[1].querySelector("input").value;
        let imgTag = row.cells[2].querySelector("img");
        let imgSrc = imgTag ? imgTag.src : "";

        if (itemName && quantity) {
            items.push({ itemName, quantity, imgSrc });
        }
    });

    if (items.length === 0) {
        alert("Lütfen en az bir öğe ekleyin!");
        return;
    }

    if (!lists[listName]) {
        lists[listName] = { items, qrCode: generateQRCode(listName) };
    } else {
        lists[listName].items = items; // Düzenleme modunda güncelleme
    }

    localStorage.setItem("lists", JSON.stringify(lists));
    loadSavedLists();
}

function generateQRCode(listName) {
    let url = `${window.location.origin}?list=${encodeURIComponent(listName)}`;
    return url;
}

function loadSavedLists() {
    let container = document.getElementById("savedLists");
    container.innerHTML = "";

    for (let listName in lists) {
        let div = document.createElement("div");
        div.innerHTML = `
            <h3>${listName}</h3>
            <a href="${lists[listName].qrCode}" target="_blank">
                <div id="qr-${listName}"></div>
            </a>
            <button onclick="editList('${listName}')">Düzenle</button>
        `;
        container.appendChild(div);

        let qr = new QRCode(document.getElementById(`qr-${listName}`), {
            text: lists[listName].qrCode,
            width: 100,
            height: 100
        });
    }
}

function editList(listName) {
    document.getElementById("listName").value = listName;
    document.querySelector("#itemTable tbody").innerHTML = "";

    lists[listName].items.forEach(item => {
        let table = document.getElementById("itemTable").getElementsByTagName("tbody")[0];
        let row = table.insertRow();
        
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        
        cell1.innerHTML = `<input type="text" value="${item.itemName}">`;
        cell2.innerHTML = `<input type="number" value="${item.quantity}">`;
        cell3.innerHTML = item.imgSrc ? `<img src="${item.imgSrc}" width="50" height="50">` : "";
        cell4.innerHTML = `<button onclick="deleteRow(this)">Sil</button>`;
    });
}

window.onload = function() {
    let urlParams = new URLSearchParams(window.location.search);
    let listName = urlParams.get("list");
    
    if (listName && lists[listName]) {
        editList(listName);
    }

    loadSavedLists();
};
