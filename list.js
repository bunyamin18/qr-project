import dataStorage from './services/dataStorage.js';

// Gerekli elementleri sakla
let listTitle;
let itemsContainer;
let currentListData;

// Liste verisini göster
function displayListData(data) {
    try {
        // Başlığı göster
        listTitle.textContent = data.title;

        // Listeyi göster
        itemsContainer.innerHTML = '';
        
        data.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'list-item';
            
            // İçeriği ve değeri göster
            itemElement.innerHTML = `
                <div class="item-content">${escapeHtml(item.content)}</div>
                <div class="item-value">${escapeHtml(item.value)}</div>
            `;

            // Resim varsa görüntüleme butonunu ekle
            if (item.image) {
                const viewButton = document.createElement('button');
                viewButton.className = 'view-image-button';
                viewButton.textContent = 'Resmi Görüntüle';
                
                viewButton.addEventListener('click', () => {
                    window.open(item.image, '_blank');
                });

                itemElement.appendChild(viewButton);
            }

            itemsContainer.appendChild(itemElement);
        });

    } catch (error) {
        console.error('Liste gösterme hatası:', error);
        alert('Liste gösterilemedi');
    }
}

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    try {
        // DOM elementlerini al
        listTitle = document.getElementById('listTitle');
        itemsContainer = document.getElementById('items');
        
        if (!listTitle || !itemsContainer) {
            throw new Error('Gerekli DOM elementleri bulunamadı');
        }

        // URL'den veri al
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');
        
        if (listId) {
            // Liste verisini al
            currentListData = dataStorage.getList(listId);
            
            if (!currentListData) {
                throw new Error('Liste bulunamadı');
            }

            // Veriyi göster
            displayListData(currentListData);
        } else {
            throw new Error('Liste ID bulunamadı');
        }

        // Düzenleme butonu event listener'ı
        const editButton = document.querySelector('.edit-button');
        if (editButton) {
            editButton.addEventListener('click', () => {
                window.location.href = `index.html?listId=${listId}`;
            });
        }

        // Geri butonu event listener'ı
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
    }
});

// HTML escape fonksiyonu
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
