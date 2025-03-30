import dataStorage from './services/dataStorage.js';

// URL'den liste ID'sini al
const urlParams = new URLSearchParams(window.location.search);
const listId = urlParams.get('listId');
let currentListData = null;

if (listId) {
    try {
        // Liste verisini al
        currentListData = dataStorage.getList(listId);
        
        if (!currentListData) {
            throw new Error('Liste bulunamadı');
        }

        // QR kodu oluştur
        const qrPreview = document.getElementById('qrPreview');
        const qr = new QRCode(qrPreview, {
            text: `https://okulprojesibunyamin.netlify.app/list.html?listId=${currentListData.id}`,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Liste verisini göster
        const titleElement = document.createElement('h2');
        titleElement.textContent = currentListData.title;
        titleElement.style.marginBottom = '20px';
        qrPreview.appendChild(titleElement);

        // Öğeleri göster
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'items-container';
        currentListData.items.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.className = 'item-row';
            
            itemRow.innerHTML = `
                <div class="item-content">${escapeHtml(item.content)}</div>
                <div class="item-value">${escapeHtml(item.value)}</div>
                ${item.image ? `<img src="${item.image}" class="item-image" alt="Öğe resmi">` : ''}
            `;
            itemsContainer.appendChild(itemRow);
        });
        qrPreview.appendChild(itemsContainer);

    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        alert('Liste verisi yüklenirken bir hata oluştu');
        window.location.href = 'index.html';
    }
}

// İndirme butonu event listener'ı
document.getElementById('downloadQR').addEventListener('click', () => {
    try {
        if (currentListData) {
            const qrElement = document.querySelector('.qr-preview canvas');
            if (qrElement) {
                const link = document.createElement('a');
                link.download = `liste-qr-${currentListData.id}.png`;
                link.href = qrElement.toDataURL("image/png");
                link.click();
            }
        }
    } catch (error) {
        console.error('QR kodu indirme hatası:', error);
        alert('QR kodu indirilirken bir hata oluştu');
    }
});

// Listeye dön butonu event listener'ı
document.getElementById('backToList').addEventListener('click', () => {
    try {
        if (currentListData) {
            window.location.href = `list.html?listId=${currentListData.id}`;
        }
    } catch (error) {
        console.error('Listeye dönme hatası:', error);
        alert('Listeye dönme sırasında bir hata oluştu');
    }
});

// Yeni liste oluşturma butonu event listener'ı
document.querySelector('.new-list-button').addEventListener('click', () => {
    try {
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Yeni liste hatası:', error);
        alert('Yeni liste oluşturulurken bir hata oluştu');
    }
});

// Düzenleme butonu event listener'ı
document.querySelector('.edit-button').addEventListener('click', () => {
    try {
        if (currentListData) {
            window.location.href = `index.html?listId=${currentListData.id}`;
        }
    } catch (error) {
        console.error('Düzenleme hatası:', error);
        alert('Düzenleme sırasında bir hata oluştu');
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
