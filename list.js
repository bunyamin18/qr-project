// Gerekli elementleri sakla
let titleElement;
let itemsList;
let qrContainer;
let qrError;
let editButton;

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini al
    titleElement = document.getElementById('listTitle');
    itemsList = document.getElementById('itemsList');
    qrContainer = document.getElementById('qrContainer');
    qrError = document.getElementById('qrError');
    editButton = document.querySelector('.edit-button');

    // Kontroller
    if (!titleElement || !itemsList || !qrContainer || !qrError || !editButton) {
        console.error('Gerekli DOM elementleri bulunamadı');
        alert('Sayfa yüklenirken bir hata oluştu');
        return;
    }

    // URL parametrelerini al
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    const encodedData = urlParams.get('data');

    // Liste ID kontrolü
    if (!listId) {
        alert('Liste ID bulunamadı');
        window.location.href = 'index.html';
        return;
    }

    // Liste verisini al
    let listData = null;

    // İlk olarak URL'den veri al
    if (encodedData) {
        try {
            const decodedString = decodeURIComponent(encodedData);
            listData = JSON.parse(decodedString);
            console.log('URL\'den veri alındı');
            
            // Veri yapısını kontrol et
            if (!isValidListData(listData)) {
                throw new Error('Geçersiz liste verisi');
            }

        } catch (error) {
            console.error('URL verisi işlenirken hata:', error);
            alert('Liste verisi yüklenirken bir hata oluştu');
            window.location.href = 'index.html';
            return;
        }
    }

    // Eğer veri bulunduysa göster
    if (listData) {
        displayListData(listData);
    } else {
        alert('Liste bulunamadı');
        window.location.href = 'index.html';
    }

    // Düzenleme butonu event listener'ı ekle
    editButton.onclick = () => {
        window.location.href = `index.html?edit=true&data=${encodeURIComponent(JSON.stringify(listData))}`;
    };
});

// Veri yapısını kontrol et
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
            typeof item.value === 'string'
        )
    );
}

// Liste verisini göster
function displayListData(data) {
    // Başlığı göster
    titleElement.textContent = data.title;
    
    // Öğeleri göster
    data.items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'list-row';
        
        row.innerHTML = `
            <div class="content">
                <span class="label">İçerik</span>
                <div class="value">${escapeHtml(item.content)}</div>
            </div>
            <div class="value-container">
                <span class="label">Miktar/Değer</span>
                <div class="value">${escapeHtml(item.value)}</div>
            </div>
            <div class="image-container">
                <span class="label">Resim</span>
                ${item.image ? 
                    `<div class="image-wrapper">
                        <img src="${item.image}" class="item-image" alt="Ürün resmi" style="max-width: 100px; max-height: 100px;">
                    </div>` : 
                    '<div class="value">Resim yok</div>'
                }
            </div>
        `;
        
        itemsList.appendChild(row);
    });

    // QR kodu göster
    if (data.qrCode) {
        const qrImg = document.createElement('img');
        qrImg.src = data.qrCode;
        qrImg.alt = 'QR Kod';
        qrImg.style.maxWidth = '256px';
        qrImg.style.maxHeight = '256px';
        
        qrContainer.innerHTML = '';
        qrContainer.appendChild(qrImg);
        qrError.style.display = 'none';
    } else {
        qrContainer.innerHTML = '';
        qrError.style.display = 'block';
        qrError.textContent = 'QR kod oluşturulamadı';
    }
}

// HTML escape fonksiyonu
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
