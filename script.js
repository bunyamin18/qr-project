function addRow() {
    let table = document.getElementById("listBody");
    let row = table.insertRow();
    row.innerHTML = `
        <td><input type="text" placeholder="Öğe Adı" required></td>
        <td><input type="number" placeholder="Miktar" required></td>
        <td><input type="file"></td>
        <td><button class="delete-btn" onclick="deleteRow(this)">🗑️</button></td>
    `;
}

function deleteRow(btn) {
    let row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function saveList() {
    let title = document.getElementById("listTitle").value;
    if (!title.trim()) {
        alert("Lütfen bir liste adı girin!");
        return;
    }
    let rows = document.querySelectorAll("#listBody tr");
    if (rows.length === 0) {
        alert("Lütfen en az bir öğe ekleyin!");
        return;
    }
    
    let listData = { title: title, items: [] };
    rows.forEach(row => {
        let inputs = row.getElementsByTagName("input");
        listData.items.push({
            name: inputs[0].value,
            quantity: inputs[1].value
        });
    });
    
    let listString = JSON.stringify(listData);
    let encodedData = encodeURIComponent(listString);
    let siteURL = window.location.href.split("?")[0] + "?data=" + encodedData;
    
    let qrCodeContainer = document.getElementById("qrcode");
    qrCodeContainer.innerHTML = "";
    new QRCode(qrCodeContainer, siteURL);
}

function loadListFromURL() {
    let params = new URLSearchParams(window.location.search);
    let data = params.get("data");
    if (data) {
        let listData = JSON.parse(decodeURIComponent(data));
        document.getElementById("listTitle").value = listData.title;
        let table = document.getElementById("listBody");
        listData.items.forEach(item => {
            let row = table.insertRow();
            row.innerHTML = `
                <td><input type="text" value="${item.name}" required></td>
                <td><input type="number" value="${item.quantity}" required></td>
                <td><input type="file"></td>
                <td><button class="delete-btn" onclick="deleteRow(this)">🗑️</button></td>
            `;
        });
    }
}

document.addEventListener("DOMContentLoaded", loadListFromURL);
