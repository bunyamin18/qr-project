<script src="qrcode.min.js"></script>

window.dataStorage = {
    lists: {
        "1": { id: "1", title: "Örnek Liste", items: [{ content: "Öğe 1", value: "Değer 1" }] }
    },
    getList: function (id) {
        return this.lists[id];
    }
};

// QR kodu görüntüleme sayfası için JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('QR Generator sayfası yüklendi');
    
    // DOM öğelerini seç
    const listTitle = document.getElementById('listTitle');
    const previewItems = document.getElementById('preview-items');
    const qrContainer = document.getElementById('qrContainer');
    const backButton = document.getElementById('backButton');
    const editButton = document.getElementById('editButton');
    const downloadButton = document.getElementById('downloadButton');
    
    // İndirme butonu başlangıçta devre dışı
    if (downloadButton) {
        downloadButton.disabled = true;
    }
    
    // URL'den liste id'sini al - Üç farklı parametre adını deneyecek (listId, id, veya data)
    const urlParams = new URLSearchParams(window.location.search);
    let listId = urlParams.get('listId') || urlParams.get('id');
    const base64Data = urlParams.get('data');
    
    console.log('URL parametreleri:', {listId, base64Data});
    
    // Base64 data parametresi varsa, viewer.html için viewer.js'deki gibi çalış
    if (base64Data) {
        try {
            // Base64'ten JSON verisini çıkar
            const jsonData = decodeURIComponent(escape(atob(base64Data)));
            const listData = JSON.parse(jsonData);
            
            console.log('Base64 veriden liste alındı:', listData);
            
            // Verileri göster
            displayListData(listData);
            generateQRCode(listData);
        } catch (error) {
            console.error('Base64 verisini çözme hatası:', error);
            showError('QR kod verisini çözümlerken bir hata oluştu. Geçersiz veya bozuk QR kod.');
        }
        return;
    }
    
    // Liste ID kontrolü
    if (!listId) {
        console.error('URL parametresinde liste ID bulunamadı');
        showError('Liste ID parametresi eksik. Ana sayfaya geri dönün ve bir liste seçin.');
        return;
    }
    
    console.log('Liste ID:', listId);
    
    // dataStorage objesi var mı kontrol et
    if (!window.dataStorage) {
        console.error('dataStorage objesi bulunamadı');
        showError('Veri depolama sistemi yüklenemedi. Sayfayı yenileyin veya daha sonra tekrar deneyin.');
        return;
    }
    
    // Liste verilerini al
    const listData = window.dataStorage.getList(listId);
    
    if (listData) {
        console.log('Liste verileri bulundu:', listData);
        displayListData(listData);
        generateQRCode(listData);
    } else {
        console.error('Liste verisi bulunamadı. ID:', listId);
        showError('Liste bulunamadı. Lütfen geçerli bir liste seçin.');
    }
    
    // Ana sayfaya dönme butonunu ayarla
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Liste düzenleme butonunu ayarla
    if (editButton) {
        editButton.addEventListener('click', function() {
            if (listId) {
                window.location.href = 'index.html?edit=' + listId;
            } else {
                alert('Düzenlenecek liste bulunamadı!');
            }
        });
    }
    
    // Liste verilerini görüntüle
    function displayListData(listData) {
        // Liste başlığını ayarla
        if (listTitle) {
            listTitle.textContent = listData.title || 'Liste';
        }
        
        // Liste öğelerini göster
        if (previewItems) {
            previewItems.innerHTML = '';
            
            if (listData.items && listData.items.length > 0) {
                listData.items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'preview-item';
                    
                    let itemHtml = `<div class="item-content">${escapeHtml(item.content)}</div>`;
                    
                    if (item.value) {
                        itemHtml += `<div class="item-value">${escapeHtml(item.value)}</div>`;
                    }
                    
                    itemElement.innerHTML = itemHtml;
                    previewItems.appendChild(itemElement);
                });
            } else {
                previewItems.innerHTML = '<p>Bu listede öğe bulunmuyor.</p>';
            }
        }
    }
    
    // Hata mesajını göster
    function showError(message) {
        if (listTitle) {
            listTitle.textContent = 'Hata';
        }
        
        if (previewItems) {
            previewItems.innerHTML = `<p style="color: #ff6b6b;">${message}</p>`;
        }
        
        if (qrContainer) {
            qrContainer.innerHTML = `
                <div style="padding: 20px; background-color: rgba(255, 0, 0, 0.2); border-radius: 8px; text-align: center;">
                    <h3 style="color: #ff6b6b; margin-top: 0;">QR Kod Oluşturulamadı</h3>
                    <p>${message}</p>
                    <button onclick="window.location.href='index.html'" style="padding: 10px 20px; background-color: #00f5ff; color: #000; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Ana Sayfaya Dön</button>
                </div>
            `;
        }
    }
    
    // HTML karakterlerini escape et
    function escapeHtml(text) {
        if (!text) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    // QR kod oluşturma fonksiyonu
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
            
            // QR container'ı temizle
            qrContainer.innerHTML = '';
            
            // Yükleme göstergesini ekle
            qrContainer.innerHTML = `
                <div class="qr-loading" style="text-align: center; padding: 15px;">
                    <p>QR Kod yükleniyor...</p>
                    <div style="width: 40px; height: 40px; border: 3px solid rgba(0, 245, 255, 0.3); border-radius: 50%; border-top-color: #00f5ff; margin: 10px auto; animation: qr-spin 1s linear infinite;"></div>
                </div>
                <style>
                    @keyframes qr-spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            // HTML'de tanımladığımız generateQRImage fonksiyonunu kullan
            setTimeout(function() {
                try {
                    // QR kodu oluştur (HTML'de tanımlanan fonksiyon)
                    const { img, url } = generateQRImage(finalUrl, 200);
                    
                    // QR kod için kutu oluştur
                    const qrBox = document.createElement('div');
                    qrBox.style.backgroundColor = 'white';
                    qrBox.style.padding = '15px';
                    qrBox.style.borderRadius = '8px';
                    qrBox.style.margin = '0 auto';
                    qrBox.style.width = '230px';
                    qrBox.style.textAlign = 'center';
                    
                    // Başlık ekle
                    const titleElement = document.createElement('p');
                    titleElement.style.margin = '0 0 10px 0';
                    titleElement.style.fontWeight = 'bold';
                    titleElement.style.color = '#333';
                    titleElement.textContent = escapeHtml(listData.title || 'Liste');
                    qrBox.appendChild(titleElement);
                    
                    // QR kodu ekle
                    qrBox.appendChild(img);
                    
                    // Açıklama
                    const descElement = document.createElement('p');
                    descElement.style.margin = '10px 0 0 0';
                    descElement.style.fontSize = '14px';
                    descElement.style.color = '#333';
                    descElement.textContent = 'Bu QR kodu telefonunuzla tarayıp açın';
                    qrBox.appendChild(descElement);
                    
                    // QR container'ı temizle ve QR kutusunu ekle
                    qrContainer.innerHTML = '';
                    qrContainer.appendChild(qrBox);
                    
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
                    qrContainer.appendChild(copyButton);
                    
                    // İndirme butonunu etkinleştir
                    setupDownloadButton(listData, url);
                } catch (error) {
                    console.error('QR kod oluşturma hatası (ikincil):', error);
                    qrContainer.innerHTML = `
                        <div style="padding: 15px; background-color: rgba(255, 0, 0, 0.2); border-radius: 8px; text-align: center;">
                            <p style="color: #ff6b6b; margin: 0;">QR kod oluşturulamadı. Lütfen tekrar deneyin.</p>
                            <button onclick="window.location.reload()" style="padding: 8px 15px; background-color: #00f5ff; color: #000; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Sayfayı Yenile</button>
                        </div>
                    `;
                }
            }, 500);
            
        } catch (error) {
            console.error('QR kod oluşturma hatası:', error);
            qrContainer.innerHTML = `
                <div style="padding: 20px; background-color: rgba(255, 0, 0, 0.2); border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h3 style="color: #ff6b6b; margin-top: 0;">QR Kod Oluşturulamadı</h3>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background-color: #00f5ff; color: #000; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Tekrar Dene</button>
                </div>
            `;
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
});

// QR kodu oluşturmak için yardımcı fonksiyon
function generateQRImage(data, size) {
    const qrCodeContainer = document.createElement('div');
    const qrCode = new QRCode(qrCodeContainer, {
        text: data,
        width: size,
        height: size,
    });

    const img = qrCodeContainer.querySelector('img');
    const url = img.src;

    return { img, url };
}
