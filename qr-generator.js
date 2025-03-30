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
        
        // Liste önizleme görüntüsünü güncelle
        if (listData.items && listData.items.length > 0) {
            displayPreviewItems(listData.items);
        }
        
        // Liste başlığını güncelle
        if (listTitle) {
            listTitle.textContent = listData.title || 'Liste';
        }
        
        try {
            // Liste verisini JSON olarak hazırla - QR kodunda taşınabilecek kadar minimal olması için
            const minimalData = {
                id: listData.id,
                title: listData.title,
                items: listData.items.map(item => {
                    // Liste verilerini minimalize edelim
                    return {
                        name: item.name,
                        quantity: item.quantity,
                        // Resimleri şimdilik dahil etmiyoruz, çok büyük olabilirler
                        // image: item.image
                    };
                })
            };
            
            // Liste verisini JSON'a dönüştür ve Base64 ile kodla
            const jsonData = JSON.stringify(minimalData);
            const base64Data = btoa(unescape(encodeURIComponent(jsonData)));
            
            console.log('JSON veri boyutu:', jsonData.length, 'karakter');
            console.log('Base64 veri boyutu:', base64Data.length, 'karakter');
            
            // Liste verisini basit bir URL'de taşı 
            // viewer.html sayfası bunu alıp işleyecek
            const finalUrl = `${window.location.origin}${window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))}/viewer.html?data=${base64Data}`;
            
            console.log('Oluşturulan URL uzunluğu:', finalUrl.length);
            
            // QR kod için container'ı temizle
            qrContainer.innerHTML = '';
            
            try {
                // Kısa URL için Google Chart API kullanarak QR kod oluştur (en güvenilir yöntem)
                const encodedUrl = encodeURIComponent(finalUrl);
                const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodedUrl}&chs=200x200&chld=H|0`;
                
                // QR kod container oluştur
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
                
                // QR kod resmi oluştur
                const qrImg = document.createElement('img');
                qrImg.src = qrUrl;
                qrImg.alt = "QR Kod";
                qrImg.style.maxWidth = '100%';
                qrImg.style.display = 'block';
                qrImg.style.margin = '0 auto';
                qrImg.crossOrigin = "anonymous"; // CORS hatalarının önüne geçmek için
                
                // QR kod resmine referansı kaydet (indirme için)
                qrDiv.dataset.qrUrl = finalUrl;
                
                // QR kodu konteynere ekle
                qrDiv.appendChild(qrImg);
                qrContainer.appendChild(qrDiv);
                
                console.log("QR kod oluşturuldu");
                
                // Bilgi metni ekle
                const infoText = document.createElement('p');
                infoText.className = 'qr-description';
                infoText.style.textAlign = 'center';
                infoText.style.margin = '10px 0';
                infoText.style.fontSize = '14px';
                infoText.style.wordBreak = 'break-word';
                infoText.innerHTML = `Bu QR kod <strong>${escapeHtml(listData.title || 'Liste')}</strong> listesine bağlantı içerir.`;
                qrContainer.appendChild(infoText);
                
                // Uyarı mesajı
                const noticeText = document.createElement('p');
                noticeText.style.fontSize = '12px';
                noticeText.style.color = 'rgba(255,255,255,0.7)';
                noticeText.style.textAlign = 'center';
                noticeText.innerHTML = 'QR kodu telefonunuzla tarayıp açın';
                qrContainer.appendChild(noticeText);
                
                // Kopyalama butonu
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-url-button';
                copyBtn.textContent = 'URL Kopyala';
                copyBtn.style.marginTop = '10px';
                copyBtn.addEventListener('click', function() {
                    try {
                        navigator.clipboard.writeText(finalUrl).then(() => {
                            alert('URL kopyalandı!');
                        }).catch(err => {
                            console.error('URL kopyalama hatası:', err);
                            alert('URL kopyalanırken hata oluştu.');
                        });
                    } catch (e) {
                        console.error('Kopyalama hatası:', e);
                        alert('Tarayıcınız kopyalama işlemini desteklemiyor.');
                    }
                });
                qrContainer.appendChild(copyBtn);
                
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
                    
                    // Görüntünün yüklenmesini bekle
                    if (!qrImg.complete) {
                        alert('QR kod resmi hala yükleniyor, lütfen biraz bekleyip tekrar deneyin');
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
                    
                    // QR kodu çiz - resim yüklü olduğundan emin ol
                    try {
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
                    } catch (err) {
                        console.error('QR kod çizme hatası:', err);
                        
                        // Hata durumunda alternatif indirme yöntemi - doğrudan resmi indir
                        const link = document.createElement('a');
                        
                        // Eğer QR kod CORS hatası verirse doğrudan Google Charts API URL'sini kullan
                        const encodedUrl = encodeURIComponent(qrCodeElement.dataset.qrUrl || finalUrl);
                        link.href = `https://chart.googleapis.com/chart?cht=qr&chl=${encodedUrl}&chs=300x300&chld=H|0`;
                        link.download = `QR_${(listData.title || 'Liste').replace(/[^a-z0-9]/gi, '_')}.png`;
                        link.click();
                    }
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
