document.addEventListener('DOMContentLoaded', function() {
    // Get list ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    
    if (!listId) {
        console.error('No list ID found in URL');
        window.location.href = 'index.html';
        return;
    }

    // Try to get list data from localStorage
    let listData = null;
    try {
        const storedData = localStorage.getItem(`list_${listId}`);
        if (storedData) {
            listData = JSON.parse(storedData);
            console.log('Got data from localStorage:', listData);
        }
    } catch (e) {
        console.error('Error getting data from localStorage:', e);
    }
    
    // If no data found, try currentList as fallback
    if (!listData) {
        try {
            const currentList = localStorage.getItem('currentList');
            if (currentList) {
                const currentData = JSON.parse(currentList);
                if (currentData.id === listId) {
                    listData = currentData;
                    console.log('Got data from currentList:', listData);
                }
            }
        } catch (e) {
            console.error('Error getting current list:', e);
        }
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
                    ${item.image ? `<img src="${item.image}" class="item-image" alt="Ürün resmi">` : '<div class="value">Resim yok</div>'}
                </div>
            `;
            
            itemsList.appendChild(row);
        });

        // Display QR code
        const qrCodeImg = document.getElementById('qrCode');
        if (qrCodeImg) {
            if (listData.qrCode) {
                qrCodeImg.src = listData.qrCode;
                console.log('QR code set from listData');
            } else {
                // Generate QR code if not exists
                const qr = qrcode(0, 'L');
                const currentUrl = window.location.href;
                const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
                const listUrl = `${baseUrl}list.html?id=${listId}`;
                
                qr.addData(listUrl);
                qr.make();
                
                const qrDataUrl = qr.createDataURL(10);
                qrCodeImg.src = qrDataUrl;
                
                // Save QR code
                listData.qrCode = qrDataUrl;
                localStorage.setItem(`list_${listData.id}`, JSON.stringify(listData));
                console.log('Generated new QR code');
            }
        }

        // Update edit button
        const editButton = document.querySelector('button[onclick*="edit=true"]');
        if (editButton) {
            editButton.onclick = () => {
                localStorage.setItem('editingList', JSON.stringify(listData));
                window.location.href = 'index.html?edit=true';
            };
        }
    } else {
        console.error('No list data found for ID:', listId);
        alert('Liste bulunamadı');
        window.location.href = 'index.html';
    }
});
