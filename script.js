document.getElementById('addItemBtn').addEventListener('click', function() {
    const tableBody = document.querySelector('#listTable tbody');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td><input type="text" placeholder="Öğe adı" required></td>
        <td><input type="text" placeholder="Miktar" required></td>
        <td><input type="file" accept="image/*"></td>
    `;
    
    tableBody.appendChild(row);
});

document.getElementById('listForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const listName = document.getElementById('listName').value;
    const rows = document.querySelectorAll('#listTable tbody tr');
    
    const listData = {
        name: listName,
        items: []
    };
    
    rows.forEach(row => {
        const itemName = row.querySelector('td input[type="text"]:nth-child(1)').value;
        const itemQuantity = row.querySelector('td input[type="text"]:nth-child(2)').value;
        const itemImage = row.querySelector('td input[type="file"]').files[0];
        
        if (itemName && itemQuantity) {
            listData.items.push({
                name: itemName,
                quantity: itemQuantity,
                image: itemImage ? URL.createObjectURL(itemImage) : null
            });
        }
    });
    
    // Verileri localStorage'a kaydediyoruz
    const listDataEncoded = encodeURIComponent(JSON.stringify(listData));
    const qrCodeUrl = `https://okulprojesibunyamin.netlify.app/list.html?data=${listDataEncoded}`;
    
    // QR kodu oluşturuyoruz
    QRCode.toDataURL(qrCodeUrl, function (err, url) {
        if (err) {
            console.error(err);
            return;
        }

        // QR kodunu sayfada gösteriyoruz
        const qrCodeContainer = document.getElementById('qrCode');
        qrCodeContainer.innerHTML = `<img src="${url}" alt="QR Code">`;

        // Veriyi localStorage'a kaydediyoruz
        localStorage.setItem('listData', JSON.stringify(listData));  // Listeyi kaydet
        alert('Liste kaydedildi ve QR kodu oluşturuldu!');
    });
});
