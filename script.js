document.getElementById('addItem').addEventListener('click', function() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="itemName" placeholder="Öğe Adı"></td>
        <td><input type="number" class="itemAmount" placeholder="Miktar"></td>
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
    const rows = document.querySelectorAll('#itemList tr');

    if (rows.length === 0) {
        alert("Lütfen en az bir öğe ekleyin!");
        return;
    }

    rows.forEach(row => {
        const itemName = row.querySelector('.itemName').value.trim();
        const itemAmount = row.querySelector('.itemAmount').value.trim();
        const itemImage = row.querySelector('.itemImage').files[0];

        if (!itemName || !itemAmount) {
            alert("Lütfen öğe adı ve miktarını girin!");
            return;
        }

        if (itemImage) {
            const reader = new FileReader();
            reader.onloadend = function() {
                items.push({ itemName, itemAmount, itemImage: reader.result });
                processedImages++;
                if (processedImages === rows.length) {
                    generateQRCode(listName, items);
                }
            };
            reader.readAsDataURL(itemImage);
        } else {
            items.push({ itemName, itemAmount, itemImage: '' });
            processedImages++;
            if (processedImages === rows.length) {
                generateQRCode(listName, items);
            }
        }
    });
});

function generateQRCode(listName, items) {
    const listData = { listName, items };
    const encodedData = encodeURIComponent(btoa(JSON.stringify(listData)));
    const qrCodeURL = `${window.location.origin}/list.html?data=${encodedData}`;

    const qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?data=${qrCodeURL}&size=200x200`;

    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = `<img src="${qrCodeImage}" alt="QR Code" onerror="this.onerror=null;this.src='error.png';">`;
    document.getElementById('qrCodeContainer').style.display = 'block';
}
