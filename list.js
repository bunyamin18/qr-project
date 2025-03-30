import dataService from './services/dataService.js';
import qrService from './services/qrService.js';

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
    qrService.createQR(data.id).then(qrData => {
        if (qrData) {
            qrContainer.innerHTML = `
                <div class="qr-code-container">
                    <img src="${qrData}" alt="QR Kod">
                    <p class="qr-text">${data.id}</p>
                </div>
            `;
        } else {
            qrError.style.display = 'block';
            qrError.textContent = 'QR kod oluşturulamadı';
        }
    }).catch(error => {
        console.error('QR kod oluşturma hatası:', error);
        qrError.style.display = 'block';
        qrError.textContent = 'QR kod oluşturulamadı';
    });
}

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini al
    titleElement = document.getElementById('listTitle');
    itemsList = document.getElementById('itemsList');
    qrContainer = document.getElementById('qrContainer');
    qrError = document.getElementById('qrError');
    editButton = document.querySelector('.edit-button');
    newListButton = document.querySelector('.new-list-button');

    // Kontroller
    if (!titleElement || !itemsList || !qrContainer || !qrError || !editButton || !newListButton) {
        console.error('Gerekli DOM elementleri bulunamadı');
        alert('Sayfa yüklenirken bir hata oluştu');
        return;
    }

    // URL'den liste ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');

    // Veri kontrolü
    if (!listId) {
        alert('Liste verisi bulunamadı');
        window.location.href = 'index.html';
        return;
    }

    try {
        // Liste verisini al
        currentListData = dataService.getList(listId);
        
        if (!currentListData) {
            throw new Error('Liste bulunamadı');
        }

        // Veriyi göster
        displayListData(currentListData);

    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        alert('Liste verisi yüklenirken bir hata oluştu');
        window.location.href = 'index.html';
        return;
    }

    // Düzenleme butonu event listener'ı ekle
    editButton.onclick = () => {
        window.location.href = `index.html?listId=${currentListData.id}`;
    };

    // Yeni liste oluşturma butonu event listener'ı ekle
    newListButton.onclick = () => {
        window.location.href = 'index.html';
    };
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
