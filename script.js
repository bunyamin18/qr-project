let currentList = null;
let currentListId = null;

function addNewRow() {
    const tableBody = document.getElementById('listItemsBody');
    const newRow = tableBody.insertRow();
    
    newRow.innerHTML = `
        <td><input type="text" class="item-name"></td>
        <td><input type="text" class="item-value"></td>
        <td><input type="file" accept="image/*" class="item-image"></td>
        <td><button onclick="removeRow(this)">Sil</button></td>
    `;
}

function removeRow(button) {
    button.closest('tr').remove();
}

function saveList() {
    const listTitle = document.getElementById('listTitle').value;
    const listItemsBody = document.getElementById('listItemsBody');
    const rows = listItemsBody.getElementsByTagName('tr');
    
    const listItems = [];
    
    for (let row of rows) {
        const itemName = row.querySelector('.item-name').value;
        const itemValue = row.querySelector('.item-value').value;
        const imageInput = row.querySelector('.item-image');
        
        if (itemName && itemValue) {
            const listItem = {
                name: itemName,
                value: itemValue,
                image: null
            };
            
            if (imageInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    listItem.image = e.target.result;
                };
                reader.readAsDataURL(imageInput.files[0]);
            }
            
            listItems.push(listItem);
        }
    }
    
    if (!listTitle || listItems.length === 0) {
        alert('Lütfen liste başlığı ve en az bir liste elemanı girin.');
        return;
    }
    
    const list = {
        id: Date.now().toString(),
        title: listTitle,
        items: listItems
    };
    
    localStorage.setItem(list.id, JSON.stringify(list));
    generateQRCode(list.id);
}

function generateQRCode(listId) {
    const qrCodeDisplay = document.getElementById('qrCodeDisplay');
    const generatedQRCode = document.getElementById('generatedQRCode');
    const listShareLink = document.getElementById('listShareLink');
    
    const shareLink = `${window.location.origin}/list.html?id=${listId}`;
    
    const qr = qrcode(0, 'M');
    qr.addData(shareLink);
    qr.make();
    generatedQRCode.src = qr.createDataURL(10);
    
    listShareLink.textContent = shareLink;
    qrCodeDisplay.style.display = 'flex';
}

function closeQRModal() {
    const qrCodeDisplay = document.getElementById('qrCodeDisplay');
    qrCodeDisplay.style.display = 'none';
}