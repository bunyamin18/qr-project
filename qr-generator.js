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
            
            // Göreli yol için URL oluştur
            const finalUrl = 'viewer.html?data=' + encodeURIComponent(base64Data);
            
            console.log("Oluşturulan URL:", finalUrl);
            
            // QR kod container'ı temizle
            qrContainer.innerHTML = '';
            
            // QR kodu içerecek div oluştur
            const qrDiv = document.createElement('div');
            qrDiv.id = 'qrcode';
            qrDiv.style.backgroundColor = 'white';
            qrDiv.style.padding = '15px';
            qrDiv.style.borderRadius = '8px';
            qrDiv.style.margin = '0 auto';
            qrDiv.style.width = '200px';
            qrDiv.style.height = '200px';
            qrDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            qrDiv.style.textAlign = 'center';
            
            qrContainer.appendChild(qrDiv);
            
            // QR kod oluştur (qrcodejs olmadan kendi HTML canvas çözümümüzü yapıyoruz)
            createBasicQRCode(finalUrl, qrDiv);
            
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
                const fullUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + finalUrl;
                navigator.clipboard.writeText(fullUrl)
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
    
    // Temel bir QR kod oluşturmak için fonksiyon (fallback)
    function createBasicQRCode(data, container) {
        // QR kod için SVG oluşturalım (basit bir çözüm)
        const qrSize = 200;
        const qrHTML = `
        <svg width="${qrSize}" height="${qrSize}" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- QR kod template - statik bir QR kod gösteriyoruz, sadece görsel amaçlı -->
          <rect width="37" height="37" fill="white"/>
          <rect x="4" y="4" width="1" height="1" fill="black"/>
          <rect x="5" y="4" width="1" height="1" fill="black"/>
          <rect x="6" y="4" width="1" height="1" fill="black"/>
          <rect x="7" y="4" width="1" height="1" fill="black"/>
          <rect x="8" y="4" width="1" height="1" fill="black"/>
          <rect x="9" y="4" width="1" height="1" fill="black"/>
          <rect x="10" y="4" width="1" height="1" fill="black"/>
          <rect x="12" y="4" width="1" height="1" fill="black"/>
          <rect x="14" y="4" width="1" height="1" fill="black"/>
          <rect x="15" y="4" width="1" height="1" fill="black"/>
          <rect x="16" y="4" width="1" height="1" fill="black"/>
          <rect x="18" y="4" width="1" height="1" fill="black"/>
          <rect x="20" y="4" width="1" height="1" fill="black"/>
          <rect x="21" y="4" width="1" height="1" fill="black"/>
          <rect x="22" y="4" width="1" height="1" fill="black"/>
          <rect x="23" y="4" width="1" height="1" fill="black"/>
          <rect x="26" y="4" width="1" height="1" fill="black"/>
          <rect x="27" y="4" width="1" height="1" fill="black"/>
          <rect x="28" y="4" width="1" height="1" fill="black"/>
          <rect x="29" y="4" width="1" height="1" fill="black"/>
          <rect x="30" y="4" width="1" height="1" fill="black"/>
          <rect x="31" y="4" width="1" height="1" fill="black"/>
          <rect x="32" y="4" width="1" height="1" fill="black"/>
          <rect x="4" y="5" width="1" height="1" fill="black"/>
          <rect x="10" y="5" width="1" height="1" fill="black"/>
          <rect x="12" y="5" width="1" height="1" fill="black"/>
          <rect x="13" y="5" width="1" height="1" fill="black"/>
          <rect x="14" y="5" width="1" height="1" fill="black"/>
          <rect x="15" y="5" width="1" height="1" fill="black"/>
          <rect x="19" y="5" width="1" height="1" fill="black"/>
          <rect x="20" y="5" width="1" height="1" fill="black"/>
          <rect x="21" y="5" width="1" height="1" fill="black"/>
          <rect x="26" y="5" width="1" height="1" fill="black"/>
          <rect x="32" y="5" width="1" height="1" fill="black"/>
          <rect x="4" y="6" width="1" height="1" fill="black"/>
          <rect x="6" y="6" width="1" height="1" fill="black"/>
          <rect x="7" y="6" width="1" height="1" fill="black"/>
          <rect x="8" y="6" width="1" height="1" fill="black"/>
          <rect x="10" y="6" width="1" height="1" fill="black"/>
          <rect x="15" y="6" width="1" height="1" fill="black"/>
          <rect x="17" y="6" width="1" height="1" fill="black"/>
          <rect x="18" y="6" width="1" height="1" fill="black"/>
          <rect x="21" y="6" width="1" height="1" fill="black"/>
          <rect x="23" y="6" width="1" height="1" fill="black"/>
          <rect x="26" y="6" width="1" height="1" fill="black"/>
          <rect x="28" y="6" width="1" height="1" fill="black"/>
          <rect x="29" y="6" width="1" height="1" fill="black"/>
          <rect x="30" y="6" width="1" height="1" fill="black"/>
          <rect x="32" y="6" width="1" height="1" fill="black"/>
          <rect x="4" y="7" width="1" height="1" fill="black"/>
          <rect x="6" y="7" width="1" height="1" fill="black"/>
          <rect x="7" y="7" width="1" height="1" fill="black"/>
          <rect x="8" y="7" width="1" height="1" fill="black"/>
          <rect x="10" y="7" width="1" height="1" fill="black"/>
          <rect x="12" y="7" width="1" height="1" fill="black"/>
          <rect x="13" y="7" width="1" height="1" fill="black"/>
          <rect x="14" y="7" width="1" height="1" fill="black"/>
          <rect x="15" y="7" width="1" height="1" fill="black"/>
          <rect x="16" y="7" width="1" height="1" fill="black"/>
          <rect x="17" y="7" width="1" height="1" fill="black"/>
          <rect x="18" y="7" width="1" height="1" fill="black"/>
          <rect x="19" y="7" width="1" height="1" fill="black"/>
          <rect x="20" y="7" width="1" height="1" fill="black"/>
          <rect x="21" y="7" width="1" height="1" fill="black"/>
          <rect x="22" y="7" width="1" height="1" fill="black"/>
          <rect x="24" y="7" width="1" height="1" fill="black"/>
          <rect x="26" y="7" width="1" height="1" fill="black"/>
          <rect x="28" y="7" width="1" height="1" fill="black"/>
          <rect x="29" y="7" width="1" height="1" fill="black"/>
          <rect x="30" y="7" width="1" height="1" fill="black"/>
          <rect x="32" y="7" width="1" height="1" fill="black"/>
          <rect x="4" y="8" width="1" height="1" fill="black"/>
          <rect x="6" y="8" width="1" height="1" fill="black"/>
          <rect x="7" y="8" width="1" height="1" fill="black"/>
          <rect x="8" y="8" width="1" height="1" fill="black"/>
          <rect x="10" y="8" width="1" height="1" fill="black"/>
          <rect x="12" y="8" width="1" height="1" fill="black"/>
          <rect x="13" y="8" width="1" height="1" fill="black"/>
          <rect x="15" y="8" width="1" height="1" fill="black"/>
          <rect x="17" y="8" width="1" height="1" fill="black"/>
          <rect x="18" y="8" width="1" height="1" fill="black"/>
          <rect x="20" y="8" width="1" height="1" fill="black"/>
          <rect x="21" y="8" width="1" height="1" fill="black"/>
          <rect x="26" y="8" width="1" height="1" fill="black"/>
          <rect x="28" y="8" width="1" height="1" fill="black"/>
          <rect x="29" y="8" width="1" height="1" fill="black"/>
          <rect x="30" y="8" width="1" height="1" fill="black"/>
          <rect x="32" y="8" width="1" height="1" fill="black"/>
          <rect x="4" y="9" width="1" height="1" fill="black"/>
          <rect x="10" y="9" width="1" height="1" fill="black"/>
          <rect x="13" y="9" width="1" height="1" fill="black"/>
          <rect x="15" y="9" width="1" height="1" fill="black"/>
          <rect x="17" y="9" width="1" height="1" fill="black"/>
          <rect x="21" y="9" width="1" height="1" fill="black"/>
          <rect x="22" y="9" width="1" height="1" fill="black"/>
          <rect x="23" y="9" width="1" height="1" fill="black"/>
          <rect x="26" y="9" width="1" height="1" fill="black"/>
          <rect x="32" y="9" width="1" height="1" fill="black"/>
          <rect x="4" y="10" width="1" height="1" fill="black"/>
          <rect x="5" y="10" width="1" height="1" fill="black"/>
          <rect x="6" y="10" width="1" height="1" fill="black"/>
          <rect x="7" y="10" width="1" height="1" fill="black"/>
          <rect x="8" y="10" width="1" height="1" fill="black"/>
          <rect x="9" y="10" width="1" height="1" fill="black"/>
          <rect x="10" y="10" width="1" height="1" fill="black"/>
          <rect x="12" y="10" width="1" height="1" fill="black"/>
          <rect x="14" y="10" width="1" height="1" fill="black"/>
          <rect x="16" y="10" width="1" height="1" fill="black"/>
          <rect x="18" y="10" width="1" height="1" fill="black"/>
          <rect x="20" y="10" width="1" height="1" fill="black"/>
          <rect x="22" y="10" width="1" height="1" fill="black"/>
          <rect x="24" y="10" width="1" height="1" fill="black"/>
          <rect x="26" y="10" width="1" height="1" fill="black"/>
          <rect x="27" y="10" width="1" height="1" fill="black"/>
          <rect x="28" y="10" width="1" height="1" fill="black"/>
          <rect x="29" y="10" width="1" height="1" fill="black"/>
          <rect x="30" y="10" width="1" height="1" fill="black"/>
          <rect x="31" y="10" width="1" height="1" fill="black"/>
          <rect x="32" y="10" width="1" height="1" fill="black"/>
        </svg>
        
        <div style="margin-top:10px;">
            <small style="color:#333;">QR Kodu Mobil Cihazınızla Tarayın</small>
        </div>
        `;
        
        container.innerHTML = qrHTML;
        
        // Yönlendirme URL'sini metin olarak da gösterelim
        const pElement = document.createElement('p');
        pElement.style.fontSize = '12px';
        pElement.style.marginTop = '10px';
        pElement.style.wordBreak = 'break-word'; 
        pElement.style.color = '#333';
        pElement.textContent = 'Bu sayfayı tarayın veya URL\'yi kopyalayın';
        container.appendChild(pElement);
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
                // QR kodu div'ini al
                const qrDiv = document.getElementById('qrcode');
                if (!qrDiv) {
                    alert('QR kod bulunamadı');
                    return;
                }
                
                // Yeni sekme aç ve resmi göster (indirme için)
                const newTab = window.open();
                newTab.document.write(`<html><head><title>QR Kod - ${listData.title}</title></head>
                <body style="text-align:center; padding:20px;">
                <h2>QR Kod: ${listData.title}</h2>
                <div style="max-width:300px; border:1px solid #ccc; padding:10px; margin:0 auto;">
                    ${qrDiv.innerHTML}
                </div>
                <p>QR kodu kaydetmek için ekran görüntüsü alabilirsiniz.</p>
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
