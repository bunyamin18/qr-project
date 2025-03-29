document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const titleElement = document.getElementById('listTitle');
    const itemsList = document.getElementById('itemsList');
    const qrCodeImg = document.getElementById('qrCode');
    const editButton = document.querySelector('button[onclick*="edit=true"]');

    if (!titleElement || !itemsList || !qrCodeImg || !editButton) {
        console.error('Required DOM elements not found');
        redirectToHome('Gerekli elementler bulunamadı');
        return;
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    const encodedData = urlParams.get('data');

    if (!listId) {
        redirectToHome('Liste ID bulunamadı');
        return;
    }

    // Try to get list data
    let listData = null;

    // First try URL data
    if (encodedData) {
        try {
            // URL encoded string'i decode et
            const decodedString = decodeURIComponent(encodedData);
            listData = JSON.parse(decodedString);
            console.log('Got data from URL');
            
            // Validate data structure
            if (!isValidListData(listData)) {
                throw new Error('Geçersiz liste verisi');
            }

            // Save to localStorage for future use
            localStorage.setItem(`list_${listId}`, JSON.stringify(listData));
            localStorage.setItem('currentList', JSON.stringify(listData));
        } catch (error) {
            console.error('Error parsing URL data:', error);
            // URL'den veri alınamazsa, localStorage'dan deneyelim
            console.log('Trying to get data from localStorage...');
        }
    }

    // If no URL data, try localStorage
    if (!listData) {
        try {
            const storedData = localStorage.getItem(`list_${listId}`);
            if (storedData) {
                listData = JSON.parse(storedData);
                console.log('Got data from localStorage');
                
                // Validate data structure
                if (!isValidListData(listData)) {
                    throw new Error('Geçersiz liste verisi');
                }
            }
        } catch (error) {
            console.error('Error getting data from localStorage:', error);
            throw error;
        }
    }

    // Display list data if available
    if (listData) {
        displayListData(listData);
    } else {
        redirectToHome('Liste bulunamadı');
    }

    // Helper Functions
    function isValidListData(data) {
        return (
            data &&
            typeof data === 'object' &&
            typeof data.id === 'string' &&
            typeof data.title === 'string' &&
            Array.isArray(data.items) &&
            data.items.every(item => 
                item &&
                typeof item === 'object' &&
                typeof item.content === 'string' &&
                typeof item.quantity === 'string'
            )
        );
    }

    function displayListData(data) {
        // Set title
        titleElement.textContent = data.title;
        
        // Display items
        data.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'list-row';
            
            row.innerHTML = `
                <div class="content">
                    <span class="label">İçerik</span>
                    <div class="value">${escapeHtml(item.content)}</div>
                </div>
                <div class="quantity">
                    <span class="label">Miktar</span>
                    <div class="value">${escapeHtml(item.quantity)}</div>
                </div>
                <div class="image-container">
                    <span class="label">Resim</span>
                    ${item.image ? 
                        `<div class="image-wrapper">
                            <img src="${item.image}" class="item-image" alt="Ürün resmi" style="max-width: 100px; max-height: 100px;">
                            <div class="image-overlay"></div>
                        </div>` : 
                        '<div class="value">Resim yok</div>'
                    }
                </div>
            `;
            
            itemsList.appendChild(row);
        });

        // Display QR code
        if (data.qrCode) {
            // QR kodu Base64 formatında olabilir, onu düzeltelim
            const qrCodeUrl = data.qrCode.replace(/^data:image\/png;base64,/, '');
            qrCodeImg.src = `data:image/png;base64,${qrCodeUrl}`;
            qrCodeImg.style.display = 'block';
            console.log('QR code displayed');
        } else {
            qrCodeImg.style.display = 'none';
            console.log('No QR code available');
        }

        // Update edit button
        editButton.onclick = () => {
            localStorage.setItem('editingList', JSON.stringify(data));
            window.location.href = 'index.html?edit=true';
        };
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function redirectToHome(message) {
        if (message) {
            alert(message);
        }
        window.location.href = 'index.html';
    }
});
