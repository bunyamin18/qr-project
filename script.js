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
    let qrCodeContainer = document.getElementById("qrcode");
    qrCodeContainer.innerHTML = "";
    new QRCode(qrCodeContainer, listString);
}
