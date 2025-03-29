document.addEventListener('DOMContentLoaded', function() {
    // Get list ID and data from URL
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    const encodedData = urlParams.get('data');
    
    // Try to get list data from URL first
    let listData = null;
    
    if (encodedData) {
        try {
            // Try to parse the data from URL
            listData = JSON.parse(decodeURIComponent(encodedData));
        } catch (e) {
            console.error('Error parsing URL data:', e);
        }
    }
    
    // If no data in URL, try localStorage
    if (!listData && listId) {
        try {
            listData = JSON.parse(localStorage.getItem(`list_${listId}`));
        } catch (e) {
            console.error('Error getting data from localStorage:', e);
        }
    }
    
    // If still no data, try current list
    if (!listData) {
        try {
            listData = JSON.parse(localStorage.getItem('currentList'));
        } catch (e) {
            console.error('Error getting current list:', e);
        }
    }
    
    if (listData) {
        // Save the data to localStorage for future use
        if (listId) {
            localStorage.setItem(`list_${listId}`, JSON.stringify(listData));
            localStorage.setItem('currentList', JSON.stringify(listData));
        }

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
        const qrCodeImg = document.getElementById('qrCode');
        if (listData.qrCode && qrCodeImg) {
            qrCodeImg.src = listData.qrCode;
            qrCodeImg.style.width = '200px';
            qrCodeImg.style.height = '200px';
        }
a
        // Update edit button
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
