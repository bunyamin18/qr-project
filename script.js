document.getElementById('addItem').addEventListener('click', function() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="itemName" placeholder="Öğe Adı"></td>
        <td><input type="text" class="itemAmount" placeholder="Miktar"></td>
        <td><input type="file" class="itemImage" accept="image/*"></td>
    `;
    document.getElementById('itemList').appendChild(newRow);
});

document.getElementById('saveList').addEventListener('click', function() {
    const listName = document.getElementById('listName').value;
    const items = [];
    
    document.querySelectorAll('#itemList tr').forEach(row => {
        const itemName = row.querySelector('.itemName').value;
        const itemAmount = row.querySelector('.itemAmount').value;
        const itemImage = row.querySelector('.itemImage').files[0];

        if (itemName && itemAmount) {
            const reader = new FileReader();
            reader.onloadend = function() {
                items.push({ itemName, itemAmount, itemImage: reader.result });
                if (items.length === document.querySelectorAll('#itemList tr').length) {
                    saveAndGenerateQR(listName, items);
                }
            };
            if (itemImage) {
                reader.readAsDataURL(itemImage);
            } else {
                items.push({ itemName, itemAmount, itemImage: '' });
                if (items.length === document.querySelectorAll('#itemList tr').length) {
                    saveAndGenerateQR(listName, items);
                }
            }
        }
    });
});

function saveAndGenerateQR(listName, items) {
    const listData = JSON.stringify({ listName, items });
    const encodedData = btoa(listData);
    const qrCodeURL = `list.html?data=${encodedData}`;

    document.getElementById('qrCode').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeURL)}&size=200x200" alt="QR Code">`;
    document.getElementById('qrCodeContainer').style.display = 'block';
}
