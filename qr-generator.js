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
    
    // Window.dataStorage'ın varlığını kontrol et
    if (!window.dataStorage) {
        console.error("window.dataStorage bulunamadı! Lütfen script.js'in önce yüklendiğinden emin olun.");
        showError("Veri depolama hatası! Lütfen sayfayı yenileyin.");
        return;
    } else {
        console.log("window.dataStorage bulundu:", window.dataStorage);
    }
    
    // Get list ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');
    
    // Ensure we have a list ID
    if (!listId) {
        showError('Liste ID bulunamadı');
        return;
    }
    
    console.log("Liste ID:", listId);
    
    // Get list data using window.dataStorage
    const listData = window.dataStorage.getList(listId);
    
    console.log("Liste verisi:", listData);
    
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
                    });
                }
                
                previewItems.appendChild(previewItem);
            });
        } else {
            previewItems.innerHTML = '<p>Bu listede öğe yok.</p>';
        }
    }
    
    // Function to generate QR Code
    function generateQRCode(listData) {
        try {
            // QR kod için URL oluştur - sabit URL kullan (dinamik URL hesaplama sorunlu olabilir)
            const baseUrl = "https://okulprojesibunyamin.netlify.app";
            
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
            
            // QR kod resmi oluştur
            const qrImage = qr.createImgTag(8, 0); // Piksel boyutu
            qrContainer.innerHTML = qrImage;
            
            // QR kodunu daha büyük ve okunabilir yap
            const qrImg = qrContainer.querySelector('img');
            if (qrImg) {
                qrImg.style.width = '280px';  // Biraz daha büyük
                qrImg.style.height = '280px';
                qrImg.style.display = 'block';
                qrImg.style.margin = '0 auto';
                qrImg.style.border = '15px solid white'; // Daha geniş beyaz kenarlık 
                qrImg.style.backgroundColor = 'white';
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
        // Back button - go to home page
        if (backButton) {
            backButton.addEventListener('click', function() {
                window.location.href = 'index.html';
            });
        }
        
        // Edit button - go to edit page with list ID
        if (editButton) {
            editButton.addEventListener('click', function() {
                window.location.href = `index.html?edit=${listData.id}`;
            });
        }
        
        // Download button - download QR code as image
        if (downloadButton) {
            downloadButton.addEventListener('click', function() {
                try {
                    const qrImg = qrContainer.querySelector('img');
                    if (!qrImg) {
                        alert('QR kodu bulunamadı');
                        return;
                    }
                    
                    // Create a canvas to draw the QR code with border
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas size to include white border
                    const borderSize = 20; // White border around QR code
                    canvas.width = qrImg.naturalWidth + (borderSize * 2);
                    canvas.height = qrImg.naturalHeight + (borderSize * 2);
                    
                    // Fill with white background
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw QR code in the center
                    ctx.drawImage(qrImg, borderSize, borderSize);
                    
                    // Add list title at the bottom
                    ctx.font = 'bold 16px Arial';
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.fillText(listData.title, canvas.width / 2, canvas.height - 6);
                    
                    // Convert to data URL and download
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `QR_${listData.title.replace(/[^a-z0-9]/gi, '_')}.png`;
                    link.click();
                } catch (error) {
                    console.error('QR kod indirme hatası:', error);
                    alert('QR kod indirirken bir hata oluştu: ' + error.message);
                }
            });
        }
    }
    
    // Function to show error messages
    function showError(message) {
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
                </div>
            `;
        }
        
        // Only show back button when error occurs
        if (downloadButton) downloadButton.style.display = 'none';
        if (editButton) editButton.style.display = 'none';
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
