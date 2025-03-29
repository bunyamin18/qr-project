document.addEventListener('DOMContentLoaded', function() {
    const listData = JSON.parse(localStorage.getItem('currentList'));
    if (!listData) {
        window.location.href = 'index.html';
        return;
    }

    // Display list title
    document.getElementById('listTitleDisplay').textContent = listData.title;

    // Display items
    const listItemsContainer = document.getElementById('listItems');
    listData.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.content}</td>
            <td>${item.quantity}</td>
            <td class="image-cell">${item.image ? 
                `<img src="${item.image}" class="image-preview" alt="Ürün resmi">` : 
                '<div class="no-image">Resim yok</div>'
            }</td>
        `;
        listItemsContainer.appendChild(row);
    });

    // Generate QR Code if it doesn't exist
    if (!listData.qrCode) {
        const qr = qrcode(0, 'L');
        qr.addData(JSON.stringify({
            id: Date.now().toString(), // Unique ID for the list
            title: listData.title,
            items: listData.items
        }));
        qr.make();
        listData.qrCode = qr.createImgTag(5);
        localStorage.setItem('currentList', JSON.stringify(listData));
    }
    
    // Display QR Code
    document.getElementById('qrCode').innerHTML = listData.qrCode;

    // Edit button functionality
    document.getElementById('editButton').addEventListener('click', function() {
        localStorage.setItem('editingList', JSON.stringify(listData));
        window.location.href = 'index.html?edit=true';
    });
});
