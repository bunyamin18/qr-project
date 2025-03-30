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
        try {
            // İşlem başlangıcı
            console.log("QR kod oluşturma başladı. Liste verisi:", JSON.stringify(listData));
            
            // ID kontrolü
            if (!listData || !listData.id) {
                throw new Error('Liste ID bilgisi eksik');
            }
            
            // Liste ID'yi localStorage'a kesinlikle kaydet
            localStorage.setItem('currentQRListId', listData.id);
            localStorage.setItem(`list_data_${listData.id}`, JSON.stringify(listData));
            console.log(`Liste verileri localStorage'a kaydedildi: 'list_data_${listData.id}'`);
            
            // Liste verisini daha küçük bir formata getir
            const minimalData = {
                id: listData.id,
                title: listData.title,
                items: listData.items.map(item => {
                    // Sadece önemli alanları al, veriyi küçült
                    const minItem = {
                        content: item.content || '',
                        value: item.value || ''
                    };
                    
                    // Resim varsa, ama boyutu uygunsa dahil et
                    if (item.image) {
                        // Veri URL mi kontrol et
                        if (item.image.startsWith('data:image')) {
                            // Resim verisi çok büyük değilse dahil et (2000 karakter limitli)
                            if (item.image.length < 2000) {
                                minItem.image = item.image;
                            } else {
                                // Çok büyük resimlerin yerine yer tutucu koy
                                minItem.imagePlaceholder = true;
                            }
                        } else {
                            // Standart resim URL'si ise dahil et
                            minItem.image = item.image;
                        }
                    }
                    
                    return minItem;
                })
            };
            
            // Her tarayıcıda doğrudan açılabilecek bir URL oluştur 
            // Viewer.html dosyasını direkt aç - data URL parametresi listede taşınsın
            // Tarayıcıdan bağımsız URL oluştur
            const absolutePath = location.href.substring(0, location.href.lastIndexOf('/'));
            const viewerPath = absolutePath + "/viewer.html";
            
            // Tam URL oluştur - liste verilerini JSON olarak URL'ye ekle
            const finalUrl = `${viewerPath}?data=${encodeURIComponent(JSON.stringify(minimalData))}`;
            
            console.log('Kullanılan URL:', finalUrl);
            
            // QR kod için container'ı temizle
            qrContainer.innerHTML = '';
            
            // QR kod div oluştur
            const qrDiv = document.createElement('div');
            qrDiv.id = 'qrcode';
            qrDiv.style.margin = '0 auto';
            qrDiv.style.background = 'white';
            qrDiv.style.padding = '15px';
            qrDiv.style.borderRadius = '8px';
            qrDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
            qrDiv.style.maxWidth = '100%';
            qrDiv.style.width = '240px';
            qrDiv.style.height = '240px';
            qrDiv.style.display = 'flex';
            qrDiv.style.alignItems = 'center';
            qrDiv.style.justifyContent = 'center';
            
            qrContainer.appendChild(qrDiv);
            
            // QR kod oluştururken test amaçlı alternatif bir URL de göster
            // Bu, telefonda QR kodu taramanıza gerek kalmadan test etmenizi sağlar
            const testUrl = `${window.location.origin}/list.html?rawData=${encodeURIComponent(JSON.stringify(minimalData))}`;
            
            // URL'i direkt göster (sorun gidermeye yardımcı olur)
            const urlDisplay = document.createElement('div');
            urlDisplay.className = 'url-display';
            urlDisplay.innerHTML = `
                <p>QR kod URL'si: <a href="${finalUrl}" target="_blank">${finalUrl}</a></p>
                <p>Test URL'si: <a href="${testUrl}" target="_blank">Yerel Test</a></p>
            `;
            urlDisplay.style.fontSize = '12px';
            urlDisplay.style.margin = '10px 0';
            urlDisplay.style.opacity = '0.7';
            urlDisplay.style.wordWrap = 'break-word';
            qrContainer.appendChild(urlDisplay);
            
            // QRCode kütüphanesini kullanarak QR kod oluştur
            const qrCode = new QRCode(qrDiv, {
                text: finalUrl,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H  // En yüksek hata düzeltme seviyesi
            });
            
            console.log("QR kod oluşturuldu");
            
            // Bilgi metni ekle
            const infoText = document.createElement('p');
            infoText.className = 'qr-description';
            infoText.style.textAlign = 'center';
            infoText.style.margin = '10px 0';
            infoText.style.wordBreak = 'break-word';
            infoText.innerHTML = `Bu QR kod <strong>${escapeHtml(listData.title || 'Liste')}</strong> listesine bağlantı içerir.`;
            qrContainer.appendChild(infoText);
            
            // Test linki oluştur - URL'yi kopyalamak için
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-url-button';
            copyBtn.textContent = 'URL Kopyala';
            copyBtn.style.marginTop = '10px';
            copyBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(finalUrl).then(() => {
                    alert('URL kopyalandı!');
                }).catch(err => {
                    console.error('URL kopyalama hatası:', err);
                    // Fallback
                    const textArea = document.createElement('textarea');
                    textArea.value = finalUrl;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('URL kopyalandı!');
                });
            });
            qrContainer.appendChild(copyBtn);
            
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
                    
                    // Canvas oluştur ve QR kodu çiz
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Canvas boyutunu ayarla
                    const borderSize = 20;
                    canvas.width = qrImg.naturalWidth + (borderSize * 2);
                    canvas.height = qrImg.naturalHeight + (borderSize * 2) + 30; // Başlık için ek alan
                    
                    // Beyaz arka plan
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // QR kodu çiz
                    ctx.drawImage(qrImg, borderSize, borderSize);
                    
                    // Liste başlığını ekle
                    ctx.font = 'bold 16px Arial';
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.fillText(listData.title || 'Liste', canvas.width / 2, canvas.height - 10);
                    
                    // İndir
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `QR_${(listData.title || 'Liste').replace(/[^a-z0-9]/gi, '_')}.png`;
                    link.click();
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
