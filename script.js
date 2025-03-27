let listTitle = ""; // Liste başlığı
let items = []; // Öğeleri depolamak için bir dizi
let currentList = {}; // Şu an düzenlenmekte olan liste
let qrCodeUrl = ""; // QR kodu URL'si

document.getElementById("addItemBtn").addEventListener("click", function() {
    let itemName = document.getElementById("itemName").value;
    let itemQuantity = document.getElementById("itemQuantity").value;
    let itemImage = document.getElementById("itemImage").files[0];

    if (!itemName || !itemQuantity) return alert("Öğe adı ve miktarı gereklidir.");

    // Yeni öğe objesini oluştur
    let newItem = {
        itemName: itemName,
        quantity: itemQuantity,
        imgSrc: itemImage ? URL.createObjectURL(itemImage) : ""
    };

    // Öğeyi ekle
    items.push(newItem);

    // Öğeleri görüntüle
    displayItems();

    // Formu sıfırla
    document.getElementById("itemName").value = "";
    document.getElementById("itemQuantity").value = "";
    document.getElementById("itemImage").value = "";
});

document.getElementById("saveListBtn").addEventListener("click", function() {
    listTitle = document.getElementById("listTitle").value;
    if (!listTitle) return alert("Liste başlığı girilmelidir.");

    generateQRCode();
    alert("Liste kaydedildi!");
});

function displayItems() {
    let container = document.getElementById("itemListDisplay");
    container.innerHTML = ""; // Önceki öğeleri temizle

    items.forEach((item, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.itemName}</td>
            <td>${item.quantity}</td>
            <td>${item.imgSrc ? `<img src="${item.imgSrc}" width="50" height="50">` : ""}</td>
            <td><button onclick="editItem(${index})">Düzenle</button> <button onclick="deleteItem(${index})">Sil</button></td>
        `;
        container.appendChild(row);
    });
}

function generateQRCode() {
    // QR kodu için URL oluştur
    qrCodeUrl = `${window.location.origin}/list.html?title=${encodeURIComponent(listTitle)}&items=${encodeURIComponent(JSON.stringify(items))}`;
    let qrCodeDisplay = document.getElementById("qrCodeDisplay");
    qrCodeDisplay.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeUrl)}&size=150x150" alt="QR Code">`;
}

function deleteItem(index) {
    items.splice(index, 1);
    displayItems();
}

function editItem(index) {
    document.getElementById("editSection").style.display = "block";
    currentList = items[index];

    let editItemsContainer = document.getElementById("editItems");
    editItemsContainer.innerHTML = `
        <label for="editItemName">Öğe Adı:</label>
        <input type="text" id="editItemName" value="${currentList.itemName}">
        
        <label for="editItemQuantity">Miktar:</label>
        <input type="text" id="editItemQuantity" value="${currentList.quantity}">
        
        <label for="editItemImage">Resim Seç:</label>
        <input type="file" id="editItemImage" accept="image/*">
        
        <button onclick="saveEdit(${index})">Kaydet</button>
    `;
}

function saveEdit(index) {
    let editedName = document.getElementById("editItemName").value;
    let editedQuantity = document.getElementById("editItemQuantity").value;
    let editedImage = document.getElementById("editItemImage").files[0];

    items[index].itemName = editedName;
    items[index].quantity = editedQuantity;
    if (editedImage) items[index].imgSrc = URL.createObjectURL(editedImage);

    displayItems();
    document.getElementById("editSection").style.display = "none";
    alert("Düzenlemeler kaydedildi.");
}

// QR kodu okuttuğunda listeyi açacak olan sayfa
if (window.location.pathname.endsWith("list.html")) {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title");
    const itemsParam = params.get("items");
    const itemsList = JSON.parse(decodeURIComponent(itemsParam));

    document.body.innerHTML = `
        <h1>${title}</h1>
        <table>
            <thead>
                <tr>
                    <th>Öğe Adı</th>
                    <th>Miktar</th>
                    <th>Resim</th>
                </tr>
            </thead>
            <tbody>
                ${itemsList.map(item => `
                    <tr>
                        <td>${item.itemName}</td>
                        <td>${item.quantity}</td>
                        <td>${item.imgSrc ? `<img src="${item.imgSrc}" width="50" height="50">` : ""}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <button onclick="window.location.href='index.html'">Düzenle</button>
    `;
}
