// QR Generator Script
document.addEventListener('DOMContentLoaded', function() {
    console.log("QR-generator.js yüklendi");
    
    // DOM elements
    const listTitle = document.getElementById('listTitle');
    const listPreview = document.getElementById('list-preview');
    const previewItems = document.getElementById('preview-items');
    const qrContainer = document.getElementById('qrContainer');
    const downloadButton = document.getElementById('downloadButton');
    const backButton = document.getElementById('backButton');
    const editButton = document.getElementById('editButton');
    
    // window.dataStorage kontrolü
    if (!window.dataStorage) {
        console.error("window.dataStorage bulunamadı - script.js önce yüklenmeli");
        showError("Veri yönetim sistemi bulunamadı. Lütfen sayfayı yenileyin.");
        return;
    }
    
    // Önce URL'den liste ID'sini almayı dene
    const urlParams = new URLSearchParams(window.location.search);
    let listId = urlParams.get('listId');
    
    console.log("URL'den alınan liste ID:", listId);
    
    // URL'den alınamazsa localStorage'dan almayı dene
    if (!listId) {
        listId = localStorage.getItem('currentQRListId');
        console.log("localStorage'dan alınan liste ID:", listId);
    }
    
    // Liste ID'si kontrolü
    if (!listId) {
        showError('Liste ID bulunamadı. Lütfen ana sayfaya dönün ve tekrar deneyin.');
        return;
    }
    
    try {
        console.log("Liste ID kullanılarak veri alınıyor:", listId);
        
        // Liste verisini al
        const listData = window.dataStorage.getList(listId);
        console.log("Alınan liste verisi:", listData);
        
        // Liste verisinin varlığını kontrol et
        if (!listData) {
            console.error("Liste verisi bulunamadı, ID:", listId);
            showError('Liste bulunamadı veya geçersiz. Lütfen ana sayfaya dönün ve tekrar deneyin.');
            return;
        }
        
        console.log("Liste verisi başarıyla alındı:", JSON.stringify(listData));
        
        // Liste başlığını göster
        listTitle.textContent = listData.title || 'İsimsiz Liste';
        
        // Liste öğelerini göster
        displayPreviewItems(listData.items || []);
        
        // QR kodu oluştur
        generateQRCode(listData);
        
        // Buton işlevlerini ayarla
        setupButtonListeners(listData);
        
    } catch (error) {
        console.error('QR generator hatası:', error);
        showError('QR kod oluşturulurken bir hata oluştu: ' + error.message);
    }
    
    // Liste öğelerini gösterme fonksiyonu
    function displayPreviewItems(items) {
        if (items && items.length > 0) {
            previewItems.innerHTML = '';
            
            items.forEach(item => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                // Öğe Adı solda, Miktar/Değer sağda gösterilecek
                let itemContent = `
                    <div class="preview-item-content">${escapeHtml(item.content || '')}</div>
                    <div class="preview-item-value">${escapeHtml(item.value || '')}</div>
                `;
                
                // If there's an image, add view button
                if (item.image) {
                    itemContent += `
                        <div class="preview-item-image">
                            <button type="button" class="view-image-button">Resim</button>
                        </div>
                    `;
                }
                
                previewItem.innerHTML = itemContent;
                
                // Add click handler for image preview
                if (item.image) {
                    const imageButton = previewItem.querySelector('.view-image-button');
                    if (imageButton) {
                        imageButton.addEventListener('click', function() {
                            showImageModal(item.image);
                        });
                    }
                }
                
                previewItems.appendChild(previewItem);
            });
        } else {
            previewItems.innerHTML = '<p>Bu listede hiç öğe yok.</p>';
        }
    }
    
    // Resim modalını gösterme fonksiyonu
    function showImageModal(imageUrl) {
        if (!imageUrl) return;
        
        // Create modal for image
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        
        // Create image element
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.style.maxWidth = '90%';
        imgElement.style.maxHeight = '90%';
        imgElement.style.objectFit = 'contain';
        imgElement.style.borderRadius = '10px';
        
        // Create close button
        const closeButton = document.createElement('div');
        closeButton.style.position = 'absolute';
        closeButton.style.top = '20px';
        closeButton.style.right = '20px';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '30px';
        closeButton.style.cursor = 'pointer';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Add image and close button to modal
        modal.appendChild(imgElement);
        modal.appendChild(closeButton);
        
        // Add click handler to close modal when clicking outside image
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Add modal to body
        document.body.appendChild(modal);
    }
    
    // QR kodu oluşturma fonksiyonu
    function generateQRCode(listData) {
        console.log("generateQRCode fonksiyonu çağrıldı", listData);
        
        try {
            // Veri kontrolü
            if (!listData || !listData.items) {
                throw new Error("Liste verileri eksik veya boş");
            }
            
            // Liste verilerini JSON formatında hazırla - daha basit bir yapıda
            const minimalData = {
                id: listData.id,
                title: listData.title,
                items: listData.items.map(item => {
                    // Liste verilerini en temel haliyle aktaralım
                    return {
                        content: item.content,
                        value: item.value,
                        image: item.image // Resim URL'sini de ekleyelim
                    };
                })
            };
            
            // Liste verisini JSON'a dönüştür ve Base64 ile kodla
            const jsonData = JSON.stringify(minimalData);
            const base64Data = btoa(unescape(encodeURIComponent(jsonData)));
            
            console.log('Base64 veri boyutu:', base64Data.length, 'karakter');
            
            // Doğrudan HTML dosyasına giden URL oluştur
            const finalUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/viewer.html?data=' + encodeURIComponent(base64Data);
            
            console.log('Oluşturulan URL:', finalUrl);
            
            // QR kodu oluştur - doğrudan Google Charts API kullanarak
            try {
                // URL'yi encode et
                const encodedUrl = encodeURIComponent(finalUrl);
                
                // Google Charts API ile QR kod URL'si oluştur
                const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodedUrl}&chs=200x200&chld=H|0`;
                
                // QR kod için container'ı temizle
                qrContainer.innerHTML = '';
                
                // QR kod div'ini oluştur
                const qrDiv = document.createElement('div');
                qrDiv.id = 'qrcode';
                qrDiv.style.backgroundColor = 'white';
                qrDiv.style.padding = '15px';
                qrDiv.style.borderRadius = '8px';
                qrDiv.style.margin = '0 auto';
                qrDiv.style.width = '200px';
                qrDiv.style.height = '200px';
                qrDiv.style.display = 'flex';
                qrDiv.style.alignItems = 'center';
                qrDiv.style.justifyContent = 'center';
                
                // QR kod resmi oluştur
                const qrImg = document.createElement('img');
                qrImg.src = qrCodeUrl;
                qrImg.alt = 'QR Kod';
                qrImg.style.maxWidth = '100%';
                qrImg.style.display = 'block';
                qrImg.style.margin = '0 auto';
                qrImg.style.background = '#ffffff';
                qrImg.style.padding = '10px';
                qrImg.style.borderRadius = '8px';
                
                // Resmi container'a ekle
                qrDiv.appendChild(qrImg);
                
                // QR kod container'a ekle
                qrContainer.appendChild(qrDiv);
                
                // QR kod başarıyla oluşturulduğunu logla
                console.log('QR kod başarıyla oluşturuldu');
                
                // İndirme butonunu etkinleştir
                if (downloadButton) {
                    downloadButton.disabled = false;
                    
                    // İndirme butonu işlevi
                    downloadButton.addEventListener('click', function() {
                        // QR kod URL'sini al ve yeni sekmede aç
                        const newTab = window.open(qrCodeUrl, '_blank');
                        if (!newTab) {
                            alert('Yeni pencere açılamadı. Lütfen pop-up engelleyicinizi kontrol edin.');
                        }
                    });
                }
            } catch (qrError) {
                console.error('QRCode oluşturma hatası:', qrError);
                throw new Error("QR kod oluşturulamadı: " + qrError.message);
            }
            
            // Liste bilgisi ekle
            const infoText = document.createElement('p');
            infoText.className = 'qr-description';
            infoText.style.textAlign = 'center';
            infoText.style.margin = '10px 0';
            infoText.style.fontSize = '14px';
            infoText.innerHTML = `Bu QR kod <strong>${escapeHtml(listData.title || 'Liste')}</strong> listesine bağlantı içerir.`;
            qrContainer.appendChild(infoText);
            
            // Uyarı mesajı
            const noticeText = document.createElement('p');
            noticeText.style.fontSize = '12px';
            noticeText.style.color = 'rgba(255,255,255,0.7)';
            noticeText.style.textAlign = 'center';
            noticeText.innerHTML = 'QR kodu telefonunuzla tarayıp açın';
            qrContainer.appendChild(noticeText);
            
            // URL Kopyala butonu ekle
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-url-button';
            copyButton.textContent = 'URL Kopyala';
            copyButton.style.marginTop = '10px';
            copyButton.addEventListener('click', function() {
                navigator.clipboard.writeText(finalUrl)
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
            
            // Hata mesajı sonrası tekrar deneme butonu ekle
            const retryButton = document.createElement('button');
            retryButton.textContent = 'Tekrar Dene';
            retryButton.className = 'retry-button';
            retryButton.addEventListener('click', function() {
                generateQRCode(listData);
            });
            qrContainer.appendChild(retryButton);
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
                try {
                    // QR kod div'ini bul
                    const qrCodeElement = document.getElementById('qrcode');
                    if (!qrCodeElement) {
                        alert('QR kodu bulunamadı');
                        return;
                    }
                    
                    // QR kod elementindeki img öğesini bul
                    const qrImg = qrCodeElement.querySelector('img');
                    if (!qrImg) {
                        alert('QR kod görüntüsü bulunamadı');
                        return;
                    }
                    
                    // Yeni sekme aç ve resmi göster (indirme için)
                    const newTab = window.open();
                    newTab.document.write(`<html><head><title>QR Kod - ${listData.title}</title></head>
                    <body style="text-align:center; padding:20px;">
                    <h2>QR Kod: ${listData.title}</h2>
                    <img src="${qrImg.src}" style="max-width:300px; border:1px solid #ccc; padding:10px;">
                    <p>Resmi kaydetmek için üzerine sağ tıklayıp "Resmi Farklı Kaydet" seçeneğini kullanabilirsiniz.</p>
                    </body></html>`);
                } catch (error) {
                    console.error('QR kod indirme hatası:', error);
                    alert('QR kod indirirken bir hata oluştu: ' + error.message);
                }
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
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <p class="error-message">${message}</p>
                    <p>Lütfen ana sayfaya dönün ve tekrar deneyin.</p>
                    <p class="debug-info">Hata zamanı: ${new Date().toLocaleString()}</p>
                </div>
            `;
        }
        
        // Sadece geri butonu göster
        if (downloadButton) downloadButton.style.display = 'none';
        if (editButton) editButton.style.display = 'none';
    }
    
    // HTML karakterlerini temizleme fonksiyonu
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
