document.addEventListener('DOMContentLoaded', function() {
    // Get list ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    
    // Get list data
    let listData;
    if (listId) {
        // If we have an ID in the URL (from QR code), get that specific list
        listData = JSON.parse(localStorage.getItem(`list_${listId}`));
    } else {
        // Otherwise, get the current list
        listData = JSON.parse(localStorage.getItem('currentList'));
    }
    
    if (listData) {
        // Set title
        document.getElementById('listTitle').textContent = listData.title;
        
        // Display items
        const itemsList = document.getElementById('itemsList');
        listData.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'list-row';
            
            row.innerHTML = `
                <div class="content">
                    <span class="label">İçerik</span>
                    <div class="value">${item.content}</div>
                </div>
                <div class="quantity">
                    <span class="label">Miktar</span>
                    <div class="value">${item.quantity}</div>
                </div>
                <div class="image-container">
                    <span class="label">Resim</span>
                    ${item.image ? `<img src="${item.image}" class="item-image">` : '<div class="value">Resim yok</div>'}
                </div>
            `;
            
            itemsList.appendChild(row);
        });

        // Display QR code
        if (listData.qrCode) {
            document.getElementById('qrCode').src = listData.qrCode;
        }

        // Update edit button URL to include list ID
        const editButton = document.querySelector('button[onclick*="edit=true"]');
        if (editButton && listData.id) {
            editButton.onclick = () => {
                localStorage.setItem('editingList', JSON.stringify(listData));
                window.location.href = 'index.html?edit=true';
            };
        }
    } else {
        // If no list data found, redirect to index
        window.location.href = 'index.html';
    }
});
