document.addEventListener('DOMContentLoaded', function() {
    const listData = JSON.parse(localStorage.getItem('currentList'));
    
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
    }
});
