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
            
            // Liste ID'yi localStorage'a da kaydediyoruz (paylaşılan URL'ler için)
            localStorage.setItem('currentQRListId', listData.id);
            
            // QR kod için URL oluştur - Göreceli URL kullan
            let baseUrl = window.location.protocol + '//' + window.location.host;
            
            // Eğer localhost ya da dosya sistemi üzerinden çalışıyorsak
            if (baseUrl.includes('localhost') || baseUrl.includes('file://')) {
                // Linklerimiz dosya sisteminde çalışsın
                baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            }
            
            console.log("Baz URL:", baseUrl);
            
            // Liste verisini Base64 ile kodla (compress için gereksiz bilgileri kaldır)
            // Resimleri de ekleyelim, ancak boyutu kontrol altında tutmak için
            // her bir resim için maksimum boyutu sınırlayalım
            
            // Resim sıkıştırma için yardımcı fonksiyon
            function compressImage(baseImage, maxImageSize = 2000) {
                // Eğer resim yoksa veya çok küçükse direkt döndür
                if (!baseImage || baseImage.length < maxImageSize) return baseImage;
                
                // Büyük bir resimse sıkıştır
                const compressRatio = maxImageSize / baseImage.length;
                console.log(`Resim sıkıştırılıyor. Orijinal: ${baseImage.length}, Hedef: ${maxImageSize}, Oran: ${compressRatio}`);
                
                // Resim bilgilerini kes (veri: kısmı hariç)
                if (baseImage.indexOf('data:image') === 0) {
                    // Base64 veri URI formatında, sadece temel bilgiyi alalım
                    const format = baseImage.split(';')[0] + ';base64,'; // örn: data:image/jpeg;base64,
                    const encodedData = baseImage.split(',')[1];
                    
                    // İlk 100 karakter ve son 100 karakter alınsın (çok büyük resimleri kısaltmak için)
                    if (encodedData.length > 200) {
                        const truncated = encodedData.substring(0, 100) + '...[kısaltıldı]...' + 
                                         encodedData.substring(encodedData.length - 100);
                        return `${format}${truncated}`;
                    }
                }
                
                return baseImage;
            }
            
            // Liste verilerini hazırla (resimler sıkıştırılmış olarak dahil)
            const compressedListData = {
                id: listData.id,
                title: listData.title,
                items: listData.items.map(item => {
                    // Her öğe için nesne oluştur
                    const compressedItem = {
                        content: item.content || '',
                        value: item.value || ''
                    };
                    
                    // Resim varsa ekle (sıkıştırarak)
                    if (item.image) {
                        compressedItem.image = compressImage(item.image);
                    }
                    
                    return compressedItem;
                })
            };
            
            // Liste verisini Base64 olarak kodla
            const encodedData = btoa(encodeURIComponent(JSON.stringify(compressedListData)));
            console.log("Encoded data length:", encodedData.length);
            
            // Tam URL oluştur - list.html için (veri de dahil)
            const listUrl = `${baseUrl}/list.html?data=${encodedData}`;
            
            // Alternatif URL (ID ile)
            const idUrl = `${baseUrl}/list.html?listId=${listData.id}`;
            
            // Log URL for debugging
            console.log('Veri URL uzunluğu:', listUrl.length);
            console.log('Alternatif URL (ID):', idUrl);
            
            // URL çok uzunsa sadece ID'yi kullan
            const finalUrl = listUrl.length > 1500 ? idUrl : listUrl;
            console.log('Kullanılan URL:', finalUrl);
            
            // QR kod için container'ı temizle
            qrContainer.innerHTML = '';
            
            // QR kod kütüphanesini kontrol et
            if (typeof QRCode !== 'function') {
                console.error("QRCode kütüphanesi mevcut değil. window objesi:", Object.keys(window));
                throw new Error('QR kod kütüphanesi yüklenemedi');
            }
            
            console.log("QRCode kütüphanesi mevcut, oluşturuluyor...");
            
            // QR kod boyutlarını belirle (container'a sığacak şekilde)
            const containerWidth = qrContainer.clientWidth || 300;
            const qrSize = Math.min(240, containerWidth - 40); // Kenar boşlukları için 40px çıkar
            
            console.log("QR kod boyutu:", qrSize, "Container genişliği:", containerWidth);
            
            // QR kod div oluştur
            const qrDiv = document.createElement('div');
            qrDiv.id = 'qrcode';
            qrDiv.style.margin = '0 auto';
            qrDiv.style.background = 'white';
            qrDiv.style.padding = '15px';
            qrDiv.style.borderRadius = '8px';
            qrDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
            qrDiv.style.maxWidth = '100%';
            qrDiv.style.width = qrSize + 'px';
            qrDiv.style.height = qrSize + 'px';
            qrDiv.style.display = 'flex';
            qrDiv.style.alignItems = 'center';
            qrDiv.style.justifyContent = 'center';
            
            qrContainer.appendChild(qrDiv);
            
            // URL'i direkt göster (sorun gidermeye yardımcı olur)
            const urlDisplay = document.createElement('div');
            urlDisplay.className = 'url-display';
            urlDisplay.innerHTML = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer">Listeye Git</a>`;
            urlDisplay.style.fontSize = '12px';
            urlDisplay.style.margin = '5px 0';
            urlDisplay.style.opacity = '0.7';
            urlDisplay.style.wordWrap = 'break-word';
            qrContainer.appendChild(urlDisplay);
            
            // QRCode kütüphanesini kullanarak QR kod oluştur
            const qrCode = new QRCode(qrDiv, {
                text: finalUrl,
                width: qrSize - 30, // İç padding için boyutu azalt
                height: qrSize - 30,
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
