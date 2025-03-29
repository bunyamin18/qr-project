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
            <td>${item.image ? `<img src="${item.image}" class="image-preview">` : 'Resim yok'}</td>
        `;
        listItemsContainer.appendChild(row);
    });

    // Generate QR Code
    const qr = qrcode(0, 'L');
    qr.addData(JSON.stringify(listData));
    qr.make();
    document.getElementById('qrCode').innerHTML = qr.createImgTag(5);

    // Edit button functionality
    document.getElementById('editButton').addEventListener('click', function() {
        // Store the current list data in editingList
        localStorage.setItem('editingList', JSON.stringify(listData));
        // Redirect to index.html with edit parameter
        window.location.href = 'index.html?edit=true';
    });
});
