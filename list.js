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
        // Store the current list data
        localStorage.setItem('editingList', JSON.stringify(listData));
        window.location.href = 'index.html?edit=true';
    });

    // Check if we're editing an existing list
    if (window.location.search.includes('edit=true')) {
        const editingData = JSON.parse(localStorage.getItem('editingList'));
        if (editingData) {
            document.getElementById('listTitle').value = editingData.title;
            
            // Remove default empty row
            document.getElementById('items').innerHTML = '';
            
            // Add rows for each item
            editingData.items.forEach(item => {
                const newRow = document.createElement('div');
                newRow.className = 'form-group item-row';
                newRow.innerHTML = `
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                        <div style="flex: 2;">
                            <label>İçerik:</label>
                            <input type="text" class="item-content" required value="${item.content}">
                        </div>
                        <div style="flex: 1;">
                            <label>Miktar:</label>
                            <input type="number" class="item-quantity" required min="1" value="${item.quantity}">
                        </div>
                        <div style="flex: 2;">
                            <label>Resim:</label>
                            <input type="file" class="item-image" accept="image/*">
                            ${item.image ? `<img src="${item.image}" class="image-preview">` : ''}
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button type="button" class="btn btn-danger delete-row">Sil</button>
                        </div>
                    </div>
                `;
                document.getElementById('items').appendChild(newRow);
            });
            
            // Clear editing data
            localStorage.removeItem('editingList');
        }
    }
});
