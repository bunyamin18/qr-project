import dataStorage from './services/dataStorage.js';

// Gerekli elementleri sakla
let titleElement;
let itemsList;
let qrContainer;
let qrError;
let editButton;
let newListButton;
let currentListData;

// Liste verisini göster
function displayListData(data) {
    try {
        // Başlığı göster
        titleElement.textContent = data.title;
        
        // Öğeleri göster
        itemsList.innerHTML = '';
        data.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'list-row';
            
            row.innerHTML = `
                <div class="item-content">${escapeHtml(item.content)}</div>
                <div class="item-value">${escapeHtml(item.value)}</div>
                ${item.image ? `<img src="${item.image}" class="item-image" alt="Öğe resmi">` : ''}
            `;
            itemsList.appendChild(row);
        });

        // QR kodu göster
        qrContainer.innerHTML = '';
        qrError.style.display = 'none';

        // QR kod oluştur
        const qr = new QRCode(qrContainer, {
            text: `https://okulprojesibunyamin.netlify.app/list.html?listId=${data.id}`,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('Veri gösterme hatası:', error);
        qrError.style.display = 'block';
        qrError.textContent = 'Liste verisi gösterilirken bir hata oluştu';
    }
}

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    try {
        // DOM elementlerini al
        titleElement = document.getElementById('listTitle');
        itemsList = document.getElementById('itemsList');
        qrContainer = document.getElementById('qrContainer');
        qrError = document.getElementById('qrError');
        editButton = document.querySelector('.edit-button');
        newListButton = document.querySelector('.new-list-button');

        if (!titleElement || !itemsList || !qrContainer || !qrError || !editButton || !newListButton) {
            throw new Error('Gerekli DOM elementleri bulunamadı');
        }

        // URL'den liste ID'sini al
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');

        if (!listId) {
            throw new Error('Liste ID bulunamadı');
        }

        // Liste verisini al
        currentListData = dataStorage.getList(listId);
        
        if (!currentListData) {
            throw new Error('Liste bulunamadı');
        }

        // Veriyi göster
        displayListData(currentListData);

        // Düzenleme butonu event listener'ı ekle
        editButton.onclick = () => {
            try {
                window.location.href = `index.html?listId=${currentListData.id}`;
            } catch (error) {
                console.error('Düzenleme butonu hatası:', error);
                alert('Düzenleme sırasında bir hata oluştu');
            }
        };

        // Yeni liste oluşturma butonu event listener'ı ekle
        newListButton.onclick = () => {
            try {
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Yeni liste butonu hatası:', error);
                alert('Yeni liste oluşturulurken bir hata oluştu');
            }
        };

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
        window.location.href = 'index.html';
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
