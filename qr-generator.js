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
            
            // QR kodu için URL oluştur - tamamen bağımsız çalışacak şekilde
            // Data URL şeması kullanarak herhangi bir sunucuya bağlanmadan direkt çalışacak
            
            // Viewer.html'den minimal bir sürüm oluştur
            const minimalViewerHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liste Görüntüleyici</title>
    <style>
        :root {
            --primary-color: #00f5ff;
            --secondary-color: #6e36df;
            --accent-color: #2be8d9;
            --dark-bg: #0f1026;
            --light-bg: #1a2035;
            --text-color: #e0f7fa;
            --card-bg: rgba(15, 20, 45, 0.8);
            --card-shadow: 0 10px 30px rgba(0, 245, 255, 0.2);
            --glow-neon: 0 0 10px rgba(0, 245, 255, 0.5);
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            margin: 0;
            font-family: sans-serif;
            background: var(--dark-bg);
            min-height: 100vh;
            color: var(--text-color);
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(15, 20, 45, 0.9) 0%, rgba(26, 32, 53, 0.9) 100%);
            border-radius: 10px;
            box-shadow: var(--card-shadow);
            border: 1px solid var(--primary-color);
        }
        h1 {
            font-size: 28px;
            color: var(--primary-color);
            text-shadow: var(--glow-neon);
            margin-bottom: 10px;
        }
        .list-items {
            list-style-type: none;
            margin-bottom: 30px;
        }
        .list-item {
            background: var(--card-bg);
            border-radius: 8px;
            margin-bottom: 15px;
            padding: 15px;
            box-shadow: var(--card-shadow);
            border: 1px solid rgba(0, 245, 255, 0.2);
            transition: all 0.3s ease;
        }
        .item-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .item-content {
            font-size: 18px;
            flex: 1;
        }
        .item-value {
            background-color: rgba(0, 245, 255, 0.1);
            color: var(--primary-color);
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 16px;
            min-width: 80px;
            text-align: center;
            margin-left: 15px;
        }
        .item-image-container {
            margin-top: 10px;
            text-align: center;
            cursor: pointer;
        }
        .image-thumbnail, .image-placeholder {
            width: 100px;
            height: 100px;
            background-color: rgba(0, 245, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-color);
            border-radius: 6px;
            border: 1px solid var(--primary-color);
            margin: 0 auto;
        }
        .back-link {
            display: block;
            text-align: center;
            color: var(--primary-color);
            margin-top: 20px;
            text-decoration: none;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        .modal-content {
            max-width: 90%;
            max-height: 90%;
            padding: 20px;
            border-radius: 10px;
            background-color: var(--card-bg);
            border: 1px solid var(--primary-color);
            box-shadow: var(--card-shadow);
            position: relative;
        }
        .close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 24px;
            color: var(--primary-color);
            cursor: pointer;
            z-index: 1001;
        }
        .modal-image {
            max-width: 100%;
            max-height: 80vh;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1 id="listTitle"></h1>
        </header>
        
        <ul id="listItems" class="list-items"></ul>
        
        <a href="#" class="back-link" id="closeButton">Kapat</a>
    </div>
    
    <div id="imageModal" class="modal">
        <div class="modal-content">
            <span class="close-button" id="closeModal">&times;</span>
            <img id="modalImage" class="modal-image" src="" alt="">
        </div>
    </div>

    <script>
    // Liste verisi inline olarak eklenecek
    const listData = _DATA_PLACEHOLDER_;
    
    document.addEventListener('DOMContentLoaded', function() {
        const listTitle = document.getElementById('listTitle');
        const listItems = document.getElementById('listItems');
        const imageModal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const closeModal = document.getElementById('closeModal');
        const closeButton = document.getElementById('closeButton');
        
        // Kapatma düğmesi
        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.close();
        });
        
        // Modal kapatma
        closeModal.addEventListener('click', function() {
            imageModal.style.display = 'none';
        });
        
        // Modal dışına tıklama
        window.addEventListener('click', function(event) {
            if (event.target === imageModal) {
                imageModal.style.display = 'none';
            }
        });
        
        // Liste verilerini göster
        if (listData) {
            displayList(listData);
        } else {
            listTitle.textContent = 'HATA: Liste verisi bulunamadı';
        }
        
        // Liste gösterme fonksiyonu
        function displayList(data) {
            // Liste başlığını ayarla
            listTitle.textContent = data.title || 'İsimsiz Liste';
            
            // Liste öğelerini temizle
            listItems.innerHTML = '';
            
            if (!data.items || data.items.length === 0) {
                listItems.innerHTML = '<li class="list-item">Listede öğe bulunamadı</li>';
                return;
            }
            
            // Liste öğelerini oluştur
            data.items.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'list-item';
                
                // Öğe adı ve değeri yan yana
                const itemRow = document.createElement('div');
                itemRow.className = 'item-row';
                
                // İçerik
                if (item.content) {
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'item-content';
                    contentDiv.textContent = \`\${index + 1}. \${item.content}\`;
                    itemRow.appendChild(contentDiv);
                }
                
                // Değer
                if (item.value) {
                    const valueDiv = document.createElement('div');
                    valueDiv.className = 'item-value';
                    valueDiv.textContent = item.value;
                    itemRow.appendChild(valueDiv);
                }
                
                listItem.appendChild(itemRow);
                
                // Resim
                if (item.image) {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'item-image-container';
                    
                    try {
                        const img = document.createElement('img');
                        img.src = item.image;
                        img.alt = item.content || 'Liste öğesi';
                        img.className = 'image-thumbnail';
                        img.style.maxWidth = '100px';
                        img.style.maxHeight = '100px';
                        img.style.objectFit = 'cover';
                        
                        // Resme tıklama
                        img.addEventListener('click', function() {
                            modalImage.src = item.image;
                            modalImage.alt = item.content || 'Görüntü';
                            imageModal.style.display = 'flex';
                        });
                        
                        // Resim yükleme hatası
                        img.onerror = function() {
                            createImagePlaceholder(imageContainer, item.content);
                        };
                        
                        imageContainer.appendChild(img);
                    } catch (e) {
                        createImagePlaceholder(imageContainer, item.content);
                    }
                    
                    listItem.appendChild(imageContainer);
                } else if (item.imagePlaceholder) {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'item-image-container';
                    createImagePlaceholder(imageContainer, item.content);
                    listItem.appendChild(imageContainer);
                }
                
                listItems.appendChild(listItem);
            });
        }
        
        // Resim yer tutucu oluşturma
        function createImagePlaceholder(container, altText) {
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.textContent = 'Resim';
            placeholder.setAttribute('data-alt', altText || 'Görüntü');
            
            placeholder.addEventListener('click', function() {
                alert('Bu resim görüntülenemiyor.');
            });
            
            container.appendChild(placeholder);
            return placeholder;
        }
    });
    </script>
</body>
</html>`;

            // Liste verisini HTML içine yerleştir
            const htmlWithData = minimalViewerHtml.replace('_DATA_PLACEHOLDER_', JSON.stringify(minimalData));
            
            // Data URL oluştur (HTML içeriğini direkt barındıran URL)
            const finalUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlWithData)}`;
            
            console.log('Oluşturulan data URL uzunluğu:', finalUrl.length);
            
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
