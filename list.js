document.addEventListener('DOMContentLoaded', function() {
    // Try to get list data from URL or QR code
    let listData = null;
    let listId = null;

    // First check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    listId = urlParams.get('id');

    // If we have an ID, try to get the list
    if (listId) {
        listData = JSON.parse(localStorage.getItem(`list_${listId}`));
    }

    // If no list found and we have a hash (from QR), try that
    if (!listData && window.location.hash) {
        try {
            // Remove the # from the hash and decode
            const qrData = JSON.parse(decodeURIComponent(window.location.hash.substring(1)));
            if (qrData && qrData.id && qrData.data) {
                listId = qrData.id;
                listData = qrData.data;
                // Save the data to localStorage
                localStorage.setItem(`list_${listId}`, JSON.stringify(listData));
                localStorage.setItem('currentList', JSON.stringify(listData));
                // Remove the hash from URL
                window.location.hash = '';
            }
        } catch (e) {
            console.error('Error parsing QR data:', e);
        }
    }

    // If still no list, try current list
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
