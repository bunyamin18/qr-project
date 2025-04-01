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
                items: listData.items.map(item => ({
                    content: item.content,
                    value: item.value,
                    image: item.image
                }))
            };
            
            // Liste verisini JSON'a dönüştür ve Base64 ile kodla
            const jsonData = JSON.stringify(minimalData);
            const base64Data = btoa(unescape(encodeURIComponent(jsonData)));
            
            console.log('Base64 veri boyutu:', base64Data.length, 'karakter');
            
            // Doğrudan HTML dosyasına giden URL oluştur
            const finalUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/viewer.html?data=' + encodeURIComponent(base64Data);
            
            console.log('Oluşturulan URL:', finalUrl);
            
            // QR kod için container'ı temizle
            qrContainer.innerHTML = '';
            
            // QR kod için div oluştur
            const qrDiv = document.createElement('div');
            qrDiv.id = 'qrcode';
            qrDiv.style.backgroundColor = 'white';
            qrDiv.style.padding = '15px';
            qrDiv.style.borderRadius = '8px';
            qrDiv.style.margin = '0 auto';
            qrDiv.style.textAlign = 'center';
            
            // Başlık ekle
            const titleElement = document.createElement('p');
            titleElement.style.margin = '5px 0 10px 0';
            titleElement.style.fontWeight = 'bold';
            titleElement.style.color = '#333';
            titleElement.textContent = escapeHtml(listData.title || 'Liste');
            qrDiv.appendChild(titleElement);
            
            // QR container'a div'i ekle
            qrContainer.appendChild(qrDiv);
            
            // QR kod olaylarını dinle
            const qrLoadedHandler = function(e) {
                console.log('QR kod yüklendi olayı alındı');
                
                // Olay dinleyiciyi kaldır
                document.removeEventListener('qrcode:loaded', qrLoadedHandler);
                document.removeEventListener('qrcode:error', qrErrorHandler);
                
                // QR kodu div'de göster
                const qrImage = e.detail.image;
                const qrUrl = e.detail.url;
                
                // Açıklama metni ekle
                const descElement = document.createElement('p');
                descElement.className = 'qr-description';
                descElement.style.textAlign = 'center';
                descElement.style.margin = '10px 0';
                descElement.style.fontSize = '14px';
                descElement.style.color = '#333';
                descElement.textContent = 'Bu QR kodu telefonunuzla tarayıp açın';
                qrDiv.appendChild(descElement);
                
                // URL Kopyala butonu
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-url-button';
                copyButton.textContent = 'URL Kopyala';
                copyButton.style.margin = '10px auto';
                copyButton.style.padding = '5px 15px';
                copyButton.style.backgroundColor = '#00f5ff';
                copyButton.style.color = '#000';
                copyButton.style.border = 'none';
                copyButton.style.borderRadius = '5px';
                copyButton.style.cursor = 'pointer';
                copyButton.style.display = 'block';
                
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
                qrDiv.appendChild(copyButton);
                
                // İndirme butonunu etkinleştir
                setupDownloadButton(listData, qrUrl);
            };
            
            const qrErrorHandler = function(e) {
                console.error('QR kod yüklenemedi olayı alındı');
                
                // Olay dinleyiciyi kaldır
                document.removeEventListener('qrcode:loaded', qrLoadedHandler);
                document.removeEventListener('qrcode:error', qrErrorHandler);
                
                // Tekrar dene ile yeni bir QR kod oluştur
                qrDiv.innerHTML = `
                    <div style="padding: 15px; background-color: rgba(255, 0, 0, 0.2); border-radius: 8px; text-align: center;">
                        <p style="color: #ff6b6b; margin: 0;">QR kod yüklenemedi. Lütfen tekrar deneyin.</p>
                        <button class="retry-qr-button" style="padding: 8px 15px; background-color: #00f5ff; color: #000; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Tekrar Dene</button>
                    </div>
                `;
                
                const retryButton = qrDiv.querySelector('.retry-qr-button');
                if (retryButton) {
                    retryButton.addEventListener('click', function() {
                        generateQRCode(listData);
                    });
                }
            };
            
            // QR kod olaylarını dinle
            document.addEventListener('qrcode:loaded', qrLoadedHandler);
            document.addEventListener('qrcode:error', qrErrorHandler);
            
            // HTML'de tanımladığımız createQRCode fonksiyonunu kullan
            if (window.createQRCode) {
                window.createQRCode(finalUrl, 'qrcode', 200, 200);
            } else {
                throw new Error('QR kod oluşturucu fonksiyon bulunamadı');
            }
            
        } catch (error) {
            console.error('QR kod oluşturma hatası:', error);
            qrContainer.innerHTML = `
                <div style="padding: 20px; background-color: rgba(255, 0, 0, 0.2); border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h3 style="color: #ff6b6b; margin-top: 0;">QR Kod Oluşturulamadı</h3>
                    <p>${error.message}</p>
                    <button id="retryQrButton" style="padding: 10px 20px; background-color: #00f5ff; color: #000; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Tekrar Dene</button>
                </div>
            `;
            
            const retryQrButton = document.getElementById('retryQrButton');
            if (retryQrButton) {
                retryQrButton.addEventListener('click', function() {
                    generateQRCode(listData);
                });
            }
        }
    }
    
    // İndirme butonunu hazırla
    function setupDownloadButton(listData, qrCodeUrl) {
        if (downloadButton) {
            downloadButton.disabled = false;
            
            // Önceki tüm event listener'ları temizle
            const newDownloadButton = downloadButton.cloneNode(true);
            downloadButton.parentNode.replaceChild(newDownloadButton, downloadButton);
            downloadButton = newDownloadButton;
            
            // Yeni event listener ekle
            downloadButton.addEventListener('click', function() {
                try {
                    // Yeni sekme aç ve QR kod resmi ile birlikte göster (indirme seçeneği ile)
                    const newTab = window.open();
                    newTab.document.write(`
                        <html>
                        <head>
                            <title>QR Kod - ${escapeHtml(listData.title)}</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    text-align: center;
                                    padding: 20px;
                                    background-color: #f5f5f5;
                                }
                                h2 {
                                    color: #333;
                                }
                                .qr-image {
                                    max-width: 300px;
                                    border: 1px solid #ccc;
                                    padding: 10px;
                                    background: white;
                                    border-radius: 5px;
                                    margin: 20px auto;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                }
                                p {
                                    color: #666;
                                    margin-top: 20px;
                                }
                                .download-link {
                                    display: inline-block;
                                    margin-top: 15px;
                                    background-color: #00f5ff;
                                    color: #333;
                                    padding: 10px 20px;
                                    text-decoration: none;
                                    border-radius: 5px;
                                    font-weight: bold;
                                }
                            </style>
                        </head>
                        <body>
                            <h2>QR Kod: ${escapeHtml(listData.title)}</h2>
                            <img src="${qrCodeUrl}" class="qr-image" alt="QR Kod">
                            <p>Resmi kaydetmek için aşağıdaki indirme bağlantısını kullanabilirsiniz veya resme sağ tıklayıp "Resmi Farklı Kaydet" seçeneğini kullanabilirsiniz.</p>
                            <a class="download-link" href="${qrCodeUrl}" download="qrcode-${escapeHtml(listData.title.replace(/\s+/g, '-'))}.png">QR Kodu İndir</a>
                        </body>
                        </html>
                    `);
                } catch (error) {
                    console.error('QR kod indirme hatası:', error);
                    alert('QR kod indirirken bir hata oluştu: ' + error.message);
                }
            });
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
                    newTab.document.write(`
                        <html>
                        <head>
                            <title>QR Kod - ${listData.title}</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    text-align: center;
                                    padding: 20px;
                                    background-color: #f5f5f5;
                                }
                                h2 {
                                    color: #333;
                                }
                                .qr-image {
                                    max-width: 300px;
                                    border: 1px solid #ccc;
                                    padding: 10px;
                                    background: white;
                                    border-radius: 5px;
                                    margin: 20px auto;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                }
                                p {
                                    color: #666;
                                    margin-top: 20px;
                                }
                                .download-link {
                                    display: inline-block;
                                    margin-top: 15px;
                                    background-color: #00f5ff;
                                    color: #333;
                                    padding: 10px 20px;
                                    text-decoration: none;
                                    border-radius: 5px;
                                    font-weight: bold;
                                }
                            </style>
                        </head>
                        <body>
                            <h2>QR Kod: ${listData.title}</h2>
                            <img src="${qrImg.src}" class="qr-image" alt="QR Kod">
                            <p>Resmi kaydetmek için aşağıdaki indirme bağlantısını kullanabilirsiniz veya resme sağ tıklayıp "Resmi Farklı Kaydet" seçeneğini kullanabilirsiniz.</p>
                            <a class="download-link" href="${qrImg.src}" download="qrcode-${escapeHtml(listData.title.replace(/\s+/g, '-'))}.png">QR Kodu İndir</a>
                        </body>
                        </html>
                    `);
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
