// QR Generator Script
document.addEventListener('DOMContentLoaded', function() {
    console.log("QR-generator.js yüklendi");
    
    // DOM elements
    const listTitle = document.getElementById('listTitle');
    const listPreview = document.getElementById('list-preview');
    const previewItems = document.getElementById('preview-items');
    const qrContainer = document.getElementById('qrContainer');
    const backButton = document.getElementById('backButton');
    const editButton = document.getElementById('editButton');
    const downloadButton = document.getElementById('downloadButton');
    
    // URL'den listId'yi al
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');
    
    if (!listId) {
        showError('Liste ID bilgisi eksik');
        return;
    }
    
    // localStorage'dan liste verilerini al
    try {
        // localStorage'dan listeyi al
        const lists = JSON.parse(localStorage.getItem('lists') || '[]');
        const listData = lists.find(list => list.id === listId);
        
        if (!listData) {
            showError('Liste bulunamadı');
            return;
        }
        
        // Liste başlığını güncelle
        listTitle.textContent = listData.title || 'Liste';
        
        // Liste önizleme görüntüsünü güncelle
        if (listData.items && listData.items.length > 0) {
            displayPreviewItems(listData.items);
        }
        
        // QR kodu oluştur
        generateQRCode(listData);
        
        // Buton dinleyicilerini ayarla
        setupButtonListeners(listData);
        
    } catch (error) {
        console.error('Liste yüklenirken hata:', error);
        showError('Liste verilerine erişilemedi: ' + error.message);
    }
    
    // Liste öğelerini gösterme fonksiyonu
    function displayPreviewItems(items) {
        // Önizleme alanını temizle
        previewItems.innerHTML = '';
        
        // Maks. 5 öğe göster
        const maxItemsToShow = Math.min(items.length, 5);
        
        // Öğeleri ekle
        for (let i = 0; i < maxItemsToShow; i++) {
            const item = items[i];
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'preview-item';
            
            const contentSpan = document.createElement('span');
            contentSpan.className = 'item-name';
            contentSpan.textContent = item.name || '';
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'item-value';
            valueSpan.textContent = item.quantity || '';
            
            itemDiv.appendChild(contentSpan);
            itemDiv.appendChild(valueSpan);
            
            previewItems.appendChild(itemDiv);
        }
        
        // Eğer gösterilmeyen öğeler varsa, bir bilgi mesajı ekle
        if (items.length > maxItemsToShow) {
            const moreItemsMsg = document.createElement('p');
            moreItemsMsg.textContent = `... ve ${items.length - maxItemsToShow} öğe daha`;
            moreItemsMsg.style.fontSize = '12px';
            moreItemsMsg.style.fontStyle = 'italic';
            moreItemsMsg.style.textAlign = 'center';
            moreItemsMsg.style.marginTop = '10px';
            previewItems.appendChild(moreItemsMsg);
        }
    }
    
    // QR kodu oluşturma fonksiyonu
    function generateQRCode(listData) {
        try {
            // Liste verilerini JSON formatında hazırla
            const jsonData = JSON.stringify({
                id: listData.id,
                title: listData.title,
                items: listData.items.map(item => ({
                    name: item.name || '',
                    quantity: item.quantity || ''
                }))
            });
            
            // Veriyi base64 formatına dönüştür (UTF-8 uyumlu)
            const base64Data = btoa(unescape(encodeURIComponent(jsonData)));
            
            // Doğrudan viewer.html sayfasına giden URL oluştur
            const finalUrl = 'viewer.html?data=' + encodeURIComponent(base64Data);
            
            console.log("Oluşturulan QR URL:", finalUrl);
            
            // QR kod container'ı temizle
            qrContainer.innerHTML = '';
            
            // QR kodu içerecek div oluştur
            const qrOuterDiv = document.createElement('div');
            qrOuterDiv.style.backgroundColor = 'white';
            qrOuterDiv.style.padding = '15px';
            qrOuterDiv.style.borderRadius = '8px';
            qrOuterDiv.style.margin = '0 auto';
            qrOuterDiv.style.width = '200px';
            qrOuterDiv.style.height = '200px';
            qrOuterDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            
            // Google Chart API ile QR kod üret - daha küçük bir URL oluştur
            const qrImg = document.createElement('img');
            const qrUrl = encodeURIComponent(finalUrl);
            qrImg.src = 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=' + qrUrl + '&choe=UTF-8';
            qrImg.alt = "QR Kod";
            qrImg.style.width = "100%";
            qrImg.style.height = "100%";
            
            // Hata durumunu yönet
            qrImg.onerror = function() {
                console.error("QR kod resmi yüklenemedi");
                qrOuterDiv.innerHTML = "QR kod yüklenirken hata oluştu. Lütfen tekrar deneyin.";
            };
            
            qrOuterDiv.appendChild(qrImg);
            qrContainer.appendChild(qrOuterDiv);
            
            // Liste bilgisi ekle
            const infoText = document.createElement('p');
            infoText.textContent = `Bu QR kod "${listData.title}" listesine bağlantı içerir.`;
            infoText.style.textAlign = 'center';
            infoText.style.marginTop = '10px';
            infoText.style.color = '#00f5ff';
            qrContainer.appendChild(infoText);
            
            // URL Kopyala butonu ekle
            const copyButton = document.createElement('button');
            copyButton.textContent = 'URL Kopyala';
            copyButton.className = 'copy-url-button';
            copyButton.addEventListener('click', function() {
                navigator.clipboard.writeText(window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + finalUrl)
                    .then(() => {
                        alert('URL kopyalandı!');
                    })
                    .catch(err => {
                        console.error('Kopyalama hatası:', err);
                        alert('URL kopyalanamadı.');
                    });
            });
            qrContainer.appendChild(copyButton);
            
        } catch (error) {
            console.error('QR kod oluşturma hatası:', error);
            qrContainer.innerHTML = `<p class="error-message">QR kod oluşturulamadı: ${error.message}</p>`;
        }
    }
    
    // Buton işlevlerini ayarlama fonksiyonu
    function setupButtonListeners(listData) {
        // Ana sayfaya dönüş
        if (backButton) {
            backButton.addEventListener('click', function() {
                window.location.href = 'index.html';
            });
        }
        
        // Listenin düzenlenmesi
        if (editButton && listData && listData.id) {
            editButton.addEventListener('click', function() {
                window.location.href = `index.html?edit=${listData.id}`;
            });
        } else if (editButton) {
            editButton.style.display = 'none';
        }
        
        // QR kodun indirilmesi
        if (downloadButton) {
            downloadButton.addEventListener('click', function() {
                // QR kodu al
                const qrImage = qrContainer.querySelector('img');
                if (!qrImage) {
                    alert('QR kod bulunamadı');
                    return;
                }
                
                // Yeni sekme aç ve resmi göster (indirme için)
                const newTab = window.open();
                newTab.document.write(`<html><head><title>QR Kod - ${listData.title}</title></head>
                <body style="text-align:center; padding:20px;">
                <h2>QR Kod: ${listData.title}</h2>
                <img src="${qrImage.src}" style="max-width:300px; border:1px solid #ccc; padding:10px;">
                <p>Resmi kaydetmek için üzerine sağ tıklayıp "Resmi Farklı Kaydet" seçeneğini kullanabilirsiniz.</p>
                </body></html>`);
            });
        }
    }
    
    // Hata mesajı gösterme fonksiyonu
    function showError(message) {
        console.error("HATA:", message);
        
        if (listTitle) {
            listTitle.textContent = 'Hata';
            listTitle.style.color = 'red';
        }
        
        if (listPreview) {
            listPreview.style.display = 'none';
        }
        
        if (qrContainer) {
            qrContainer.innerHTML = `
            <div class="error-box">
                <p class="error-message">${message}</p>
                <button onclick="window.location.href='index.html'" class="retry-button">
                    Ana Sayfaya Dön
                </button>
            </div>`;
        }
    }
});
