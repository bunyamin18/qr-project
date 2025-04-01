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
            
            // QR kod için container'ı hazırla
            qrContainer.innerHTML = '';
            
            // QR kod div'i oluştur
            const qrDiv = document.createElement('div');
            qrDiv.id = 'qrcode';
            qrDiv.style.backgroundColor = 'white';
            qrDiv.style.padding = '15px';
            qrDiv.style.borderRadius = '8px';
            qrDiv.style.margin = '0 auto';
            qrDiv.style.width = '230px';
            qrDiv.style.height = '230px';
            qrDiv.style.position = 'relative';
            qrDiv.style.zIndex = '10';
            
            // QR container'a ekle
            qrContainer.appendChild(qrDiv);
            
            // QR kodu oluştur (Gömülü QRCode kütüphanesi ile)
            try {
                console.log('QRCode sınıfı kontrol ediliyor...');
                
                if (typeof QRCode === 'function') {
                    console.log('QRCode sınıfı mevcut, QR kodu oluşturuluyor...');
                    
                    // QR kod oluşturucusu
                    const qrcode = new QRCode(qrDiv, {
                        text: finalUrl,
                        width: 200,
                        height: 200,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                    
                    // QR kod oluşturma sonrası olayları dinle
                    document.addEventListener('qrcode:loaded', function qrLoaded(e) {
                        console.log('QR kod yüklendi olayı alındı');
                        document.removeEventListener('qrcode:loaded', qrLoaded);
                        
                        // QR kod ile ilgili bilgileri ekle
                        addQRInfoElements(listData, finalUrl);
                        
                        // İndirme butonunu hazırla
                        setupDownloadButton(listData, qrcode);
                    });
                    
                    document.addEventListener('qrcode:error', function qrError() {
                        console.error('QR kod yüklenirken hata oluştu');
                        document.removeEventListener('qrcode:error', qrError);
                        
                        // Hata durumunda alternatif yöntem dene
                        fallbackQRGeneration(listData, finalUrl, qrDiv);
                    });
                    
                    // 3 saniye içinde yüklenme olayı gelmezse, timeout ile alternatif yönteme geç
                    setTimeout(function() {
                        console.log('QR kod yükleme zaman aşımı kontrolü');
                        if (!qrDiv.querySelector('img') || qrDiv.querySelector('img').complete === false) {
                            console.warn('QR kod yüklenemedi, alternatif yöntem deneniyor...');
                            fallbackQRGeneration(listData, finalUrl, qrDiv);
                        }
                    }, 3000);
                    
                } else {
                    console.error('QRCode sınıfı bulunamadı, alternatif yöntem deneniyor...');
                    fallbackQRGeneration(listData, finalUrl, qrDiv);
                }
            } catch (qrError) {
                console.error('QR kod oluşturma hatası:', qrError);
                fallbackQRGeneration(listData, finalUrl, qrDiv);
            }
        } catch (error) {
            console.error('Genel QR kod oluşturma hatası:', error);
            qrContainer.innerHTML = `
                <div style="padding: 20px; background-color: rgba(255, 0, 0, 0.2); border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h3 style="color: #ff6b6b; margin-top: 0;">QR Kod Oluşturulamadı</h3>
                    <p>${error.message}</p>
                    <button id="retryQrButton" style="padding: 10px 20px; background-color: #00f5ff; color: #000; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Tekrar Dene</button>
                </div>
            `;
            
            // Tekrar deneme butonu için olay dinleyicisi ekle
            const retryQrButton = document.getElementById('retryQrButton');
            if (retryQrButton) {
                retryQrButton.addEventListener('click', function() {
                    generateQRCode(listData);
                });
            }
        }
    }
    
    // QR kod oluşturma alternatif yöntemi
    function fallbackQRGeneration(listData, finalUrl, qrDiv) {
        console.log('Alternatif QR kod oluşturma yöntemi kullanılıyor...');
        
        try {
            // Google Charts API kullanarak QR kod oluşturma
            const encodedUrl = encodeURIComponent(finalUrl);
            const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodedUrl}&chs=200x200&chld=H|0`;
            
            // QR kod div içeriğini temizle
            qrDiv.innerHTML = '';
            
            // QR kod resmi oluştur
            const qrImg = document.createElement('img');
            qrImg.src = qrCodeUrl;
            qrImg.alt = 'QR Kod';
            qrImg.style.maxWidth = '200px';
            qrImg.style.maxHeight = '200px';
            qrImg.style.display = 'block';
            qrImg.style.margin = '0 auto';
            
            // Yükleme olaylarını dinle
            qrImg.onload = function() {
                console.log('Alternatif QR kod resmi başarıyla yüklendi');
                qrDiv.innerHTML = '';
                qrDiv.appendChild(qrImg);
                
                // QR kod ile ilgili bilgileri ekle
                addQRInfoElements(listData, finalUrl);
                
                // İndirme butonunu hazırla (QR kod resim URL'si ile)
                setupDownloadButton(listData, null, qrCodeUrl);
            };
            
            qrImg.onerror = function() {
                console.error('Alternatif QR kod resmi yüklenemedi');
                qrDiv.innerHTML = `
                    <div style="padding: 15px; background-color: rgba(255, 0, 0, 0.2); border-radius: 8px; text-align: center;">
                        <p style="color: #fff; margin: 0;">QR kod yüklenemedi. Lütfen tekrar deneyin.</p>
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
            
            // Görünür bir yükleme göstergesini div içine ekle
            qrDiv.innerHTML = `
                <div style="text-align: center; padding: 15px;">
                    <p>QR Kod yükleniyor...</p>
                    <div style="width: 40px; height: 40px; border: 3px solid rgba(0, 245, 255, 0.3); border-radius: 50%; border-top-color: #00f5ff; margin: 10px auto; animation: qr-spin 1s linear infinite;"></div>
                </div>
                <style>
                    @keyframes qr-spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            // Resmi yüklenmeye başlat
            qrImg.src = qrCodeUrl;
            
        } catch (error) {
            console.error('Alternatif QR kod oluşturma hatası:', error);
            qrDiv.innerHTML = `
                <div style="padding: 15px; background-color: rgba(255, 0, 0, 0.2); border-radius: 8px; text-align: center;">
                    <p style="color: #fff; margin: 0;">QR kod oluşturulamadı: ${error.message}</p>
                    <button class="retry-qr-button" style="padding: 8px 15px; background-color: #00f5ff; color: #000; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Tekrar Dene</button>
                </div>
            `;
            
            const retryButton = qrDiv.querySelector('.retry-qr-button');
            if (retryButton) {
                retryButton.addEventListener('click', function() {
                    generateQRCode(listData);
                });
            }
        }
    }
    
    // QR kod bilgilerini ekle
    function addQRInfoElements(listData, finalUrl) {
        // Liste bilgisi ekle
        const infoText = document.createElement('p');
        infoText.className = 'qr-description';
        infoText.style.textAlign = 'center';
        infoText.style.margin = '10px 0';
        infoText.style.fontSize = '14px';
        infoText.style.position = 'relative';
        infoText.style.zIndex = '10';
        infoText.innerHTML = `Bu QR kod <strong>${escapeHtml(listData.title || 'Liste')}</strong> listesine bağlantı içerir.`;
        qrContainer.appendChild(infoText);
        
        // Uyarı mesajı
        const noticeText = document.createElement('p');
        noticeText.style.fontSize = '12px';
        noticeText.style.color = 'rgba(255,255,255,0.7)';
        noticeText.style.textAlign = 'center';
        noticeText.style.position = 'relative';
        noticeText.style.zIndex = '10';
        noticeText.innerHTML = 'QR kodu telefonunuzla tarayıp açın';
        qrContainer.appendChild(noticeText);
        
        // URL Kopyala butonu ekle
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-url-button';
        copyButton.textContent = 'URL Kopyala';
        copyButton.style.marginTop = '10px';
        copyButton.style.position = 'relative';
        copyButton.style.zIndex = '10';
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
    }
    
    // İndirme butonunu hazırla
    function setupDownloadButton(listData, qrcode, fallbackQrUrl) {
        if (downloadButton) {
            downloadButton.disabled = false;
            
            // Önceki tüm event listener'ları temizle
            const newDownloadButton = downloadButton.cloneNode(true);
            downloadButton.parentNode.replaceChild(newDownloadButton, downloadButton);
            downloadButton = newDownloadButton;
            
            // Yeni event listener ekle
            downloadButton.addEventListener('click', function() {
                try {
                    let qrImgSrc = '';
                    
                    // QR kod resmi URL'sini alın (farklı kaynaklardan kontrol edin)
                    if (qrcode && typeof qrcode.getImageSrc === 'function') {
                        qrImgSrc = qrcode.getImageSrc();
                    } else if (qrcode && qrcode.getLastQRCode && qrcode.getLastQRCode()) {
                        qrImgSrc = qrcode.getLastQRCode().url;
                    } else if (fallbackQrUrl) {
                        qrImgSrc = fallbackQrUrl;
                    } else {
                        // Sayfadaki QR kod görüntüsünü bulun
                        const qrElement = document.getElementById('qrcode');
                        const qrImg = qrElement ? qrElement.querySelector('img') : null;
                        
                        if (qrImg && qrImg.src) {
                            qrImgSrc = qrImg.src;
                        } else {
                            throw new Error('QR kod görüntüsü bulunamadı');
                        }
                    }
                    
                    // QR kod görüntüsünü yeni sekmede aç
                    if (qrImgSrc) {
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
                                </style>
                            </head>
                            <body>
                                <h2>QR Kod: ${escapeHtml(listData.title)}</h2>
                                <img src="${qrImgSrc}" class="qr-image" alt="QR Kod">
                                <p>Resmi kaydetmek için üzerine sağ tıklayıp "Resmi Farklı Kaydet" seçeneğini kullanabilirsiniz.</p>
                            </body>
                            </html>
                        `);
                    } else {
                        alert('QR kod resmi bulunamadı');
                    }
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
