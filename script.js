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
    const listName = document.getElementById('listName').value.trim();
    if (!listName) {
        alert("Lütfen bir liste başlığı girin!");
        return;
    }

    const items = [];
    let processedImages = 0;
    const totalRows = document.querySelectorAll('#itemList tr').length;

    if (totalRows === 0) {
        alert("Lütfen en az bir öğe ekleyin!");
        return;
    }

    document.querySelectorAll('#itemList tr').forEach(row => {
        const itemName = row.querySelector('.itemName').value.trim();
        const itemAmount = row.querySelector('.itemAmount').value.trim();
        const itemImage = row.querySelector('.itemImage').files[0];

        if (!itemName || !itemAmount) {
            alert("Lütfen öğe adı ve miktarını girin!");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = function() {
            items.push({ itemName, itemAmount, itemImage: reader.result || '' });
            processedImages++;
            if (processedImages === totalRows) {
                saveAndGenerateQR(listName, items);
            }
        };

        if (itemImage) {
            reader.readAsDataURL(itemImage);
        } else {
            items.push({ itemName, itemAmount, itemImage: '' });
            processedImages++;
            if (processedImages === totalRows) {
                saveAndGenerateQR(listName, items);
            }
        }
    });
});

function saveAndGenerateQR(listName, items) {
    const listData = { listName, items };
    const encodedData = encodeURIComponent(btoa(JSON.stringify(listData)));
    const qrCodeURL = `${window.location.origin}/list.html?data=${encodedData}`;

    document.getElementById('qrCode').innerHTML = `
        <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeURL)}&size=200x200" alt="QR Code">
    `;
    document.getElementById('qrCodeContainer').style.display = 'block';
}
