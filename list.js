document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini al
    const titleElement = document.getElementById('listTitle');
    const itemsList = document.getElementById('itemsList');
    const qrCodeImg = document.getElementById('qrCode');
    const qrError = document.getElementById('qrError');
    const editButton = document.querySelector('button[onclick*="edit=true"]');

    // Kontroller
    if (!titleElement || !itemsList || !qrCodeImg || !editButton) {
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

            // Veriyi localStorage'a kaydet
            localStorage.setItem(`list_${listId}`, JSON.stringify(listData));
            localStorage.setItem('currentList', JSON.stringify(listData));
        } catch (error) {
            console.error('URL verisi işlenirken hata:', error);
            console.log('LocalStorage\'dan veri alınıyor...');
        }
    }

    // Eğer URL'den veri alınamazsa, localStorage'dan al
    if (!listData) {
        try {
            const storedData = localStorage.getItem(`list_${listId}`);
            if (storedData) {
                listData = JSON.parse(storedData);
                console.log('LocalStorage\'dan veri alındı');
                
                // Veri yapısını kontrol et
                if (!isValidListData(listData)) {
                    throw new Error('Geçersiz liste verisi');
                }
            }
        } catch (error) {
            console.error('LocalStorage verisi işlenirken hata:', error);
            throw error;
        }
    }

    // Eğer veri bulunduysa göster
    if (listData) {
        displayListData(listData);
    } else {
        alert('Liste bulunamadı');
        window.location.href = 'index.html';
    }

    // Yardımcı fonksiyonlar
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
                            <div class="image-overlay"></div>
                        </div>` : 
                        '<div class="value">Resim yok</div>'
                    }
                </div>
            `;
            
            itemsList.appendChild(row);
        });

        // QR kodu göster
        if (data.qrCode) {
            qrCodeImg.src = data.qrCode;
            qrCodeImg.style.display = 'block';
            qrError.style.display = 'none';
        } else {
            qrCodeImg.style.display = 'none';
            qrError.style.display = 'block';
            qrError.textContent = 'QR kod oluşturulamadı';
        }

        // Düzenleme butonunu güncelle
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
