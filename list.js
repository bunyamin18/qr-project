document.addEventListener('DOMContentLoaded', function() {
    // Get list ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    
    // Get list data based on ID
    let listData = null;
    
    if (listId) {
        // Try to get the specific list by ID
        listData = JSON.parse(localStorage.getItem(`list_${listId}`));
    }
    
    // If no list found by ID, try to get current list
    if (!listData) {
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

        // Update edit button to preserve list ID
        const editButton = document.querySelector('button[onclick*="edit=true"]');
        if (editButton) {
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
