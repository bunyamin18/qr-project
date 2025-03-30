// QR Generator Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js for background animation
    // Arka plan animasyonu script.js içinde genel olarak tanımlandı
    
    // DOM elements
    const listTitle = document.getElementById('listTitle');
    const listPreview = document.getElementById('list-preview');
    const previewItems = document.getElementById('preview-items');
    const qrContainer = document.getElementById('qrContainer');
    const downloadButton = document.getElementById('downloadButton');
    const backButton = document.getElementById('backButton');
    const editButton = document.getElementById('editButton');
    
    // Get list ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');
    
    // Ensure we have a list ID
    if (!listId) {
        showError('Liste ID bulunamadı');
        return;
    }
    
    // Get list data
    const listData = window.dataStorage.getList(listId);
    
    // Ensure we have list data
    if (!listData) {
        showError('Liste bulunamadı');
        return;
    }
    
    try {
        // Display list title
        listTitle.textContent = listData.title;
        
        // Display preview items
        displayPreviewItems(listData.items);
        
        // Generate and display QR Code
        generateQRCode(listData);
        
        // Setup button event listeners
        setupButtonListeners(listData);
        
    } catch (error) {
        console.error('Error in QR generator:', error);
        showError('QR kod oluşturulurken bir hata oluştu: ' + error.message);
    }
    
    // Function to display preview items
    function displayPreviewItems(items) {
        if (items && items.length > 0) {
            previewItems.innerHTML = '';
            
            items.forEach(item => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                // Öğe Adı solda, Miktar/Değer sağda gösterilecek
                let itemContent = `
                    <div class="preview-item-content">${escapeHtml(item.content)}</div>
                    <div class="preview-item-value">${escapeHtml(item.value)}</div>
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
                    imageButton.addEventListener('click', function() {
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
                        imgElement.src = item.image;
                        imgElement.style.maxWidth = '90%';
                        imgElement.style.maxHeight = '90%';
                        imgElement.style.objectFit = 'contain';
                        imgElement.style.borderRadius = '10px';
                        
                        // Add close on click
                        modal.addEventListener('click', function() {
                            document.body.removeChild(modal);
                        });
                        
                        modal.appendChild(imgElement);
                        document.body.appendChild(modal);
                    });
                }
                
                previewItems.appendChild(previewItem);
            });
        } else {
            previewItems.innerHTML = '<p>Bu listede hiç öğe bulunmuyor.</p>';
        }
    }
    
    // Function to generate QR Code
    function generateQRCode(listData) {
        try {
            // QR kod için tam URL oluştur
            const currentUrl = window.location.href;
            // Protocol ve domain kısmını al (http://example.com)
            const urlParts = currentUrl.split('/');
            const protocol = urlParts[0];
            const domain = urlParts[2];
            const baseUrl = protocol + '//' + domain;
            
            // Tam URL oluştur
            const listUrl = `${baseUrl}/list.html?listId=${listData.id}`;
            
            // Log URL for debugging
            console.log('Generated URL for QR code:', listUrl);
            
            // Create QR Code using qrcode-generator library
            qrContainer.innerHTML = '';
            
            // QR kod ayarlarını güncelle - daha yüksek hata düzeltme düzeyi ve daha büyük boyut
            const qr = qrcode(4, 'H'); // 0->4 (daha yüksek versiyon) ve L->H (daha iyi hata düzeltme)
            qr.addData(listUrl);
            qr.make();
            
            // Daha büyük ve net QR kod oluştur
            const qrImage = qr.createImgTag(10, 0); // Daha büyük piksel boyutu (5->10)
            qrContainer.innerHTML = qrImage;
            
            // QR kodunu daha büyük ve okunabilir yap
            const qrImg = qrContainer.querySelector('img');
            if (qrImg) {
                qrImg.style.width = '260px';
                qrImg.style.height = '260px';
                qrImg.style.display = 'block';
                qrImg.style.margin = '0 auto';
                qrImg.style.border = '10px solid white'; // Beyaz kenarlık ekle
                qrImg.style.backgroundColor = 'white'; // Beyaz arka plan ekle
                qrImg.style.borderRadius = '8px';
                qrImg.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
            }
            
            // Add info text
            const infoText = document.createElement('p');
            infoText.className = 'qr-description';
            infoText.innerHTML = `Bu QR kod <a href="${listUrl}" target="_blank">${listData.title}</a> listesine bağlantı içerir.`;
            qrContainer.appendChild(infoText);
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            qrContainer.innerHTML = '<p class="error-message">QR kod oluşturulamadı: ' + error.message + '</p>';
        }
    }
    
    // Function to setup button event listeners
    function setupButtonListeners(listData) {
        // Back button
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
        
        // Edit button
        editButton.addEventListener('click', function() {
            window.location.href = `index.html?listId=${listData.id}`;
        });
        
        // Download button - QR kodunu JPG olarak indir
        downloadButton.addEventListener('click', function() {
            try {
                const qrImg = qrContainer.querySelector('img');
                if (!qrImg) {
                    throw new Error('QR kod bulunamadı');
                }
                
                // QR kod görüntüsünü bir Canvas'a çiz
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Daha büyük ve beyaz kenarlıklı bir canvas oluştur
                canvas.width = 300;
                canvas.height = 300;
                
                // Beyaz arka plan çiz
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Görüntüyü canvas'a çiz
                const img = new Image();
                img.onload = function() {
                    // QR kodu canvas'ın ortasına yerleştir
                    const padding = 20;
                    ctx.drawImage(img, padding, padding, canvas.width - (padding * 2), canvas.height - (padding * 2));
                    
                    // Canvas'ı indirilecek bağlantıya dönüştür
                    const link = document.createElement('a');
                    link.download = `${listData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr_kod.jpg`;
                    
                    // Canvas'ı yüksek kaliteli JPEG'e dönüştür
                    link.href = canvas.toDataURL('image/jpeg', 1.0);
                    link.click();
                };
                img.onerror = function() {
                    throw new Error('QR kod görüntüsü yüklenemedi');
                };
                img.src = qrImg.src;
                
            } catch (error) {
                console.error('Error downloading QR code:', error);
                alert('QR kod indirilirken bir hata oluştu: ' + error.message);
            }
        });
    }
    
    // Function to show error messages
    function showError(message) {
        if (listTitle) {
            listTitle.textContent = 'Hata';
            listTitle.style.color = '#ff5757';
        }
        
        if (listPreview) {
            previewItems.innerHTML = `<p class="error-message">${message}</p>`;
        }
        
        if (qrContainer) {
            qrContainer.innerHTML = '';
        }
        
        if (downloadButton) {
            downloadButton.style.display = 'none';
        }
        
        if (editButton) {
            editButton.style.display = 'none';
        }
    }
    
    // Function to escape HTML to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
