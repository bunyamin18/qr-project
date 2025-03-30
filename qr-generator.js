// QR Generator Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js for background animation
    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 180, density: { enable: true, value_area: 800 } },
                color: { value: ["#00f5ff", "#6e36df", "#2be8d9"] },
                shape: { type: "circle" },
                opacity: { value: 0.6, random: true },
                size: { value: 2, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#00f5ff",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 6,
                    direction: "right",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
    
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
            // Use the current base URL to ensure the QR code works in all environments
            const basePath = window.location.href.split('/').slice(0, -1).join('/');
            const listUrl = `${basePath}/list.html?listId=${listData.id}`;
            
            // Log URL for debugging
            console.log('Generated URL for QR code:', listUrl);
            
            // Create QR Code using qrcode-generator library
            qrContainer.innerHTML = '';
            
            const qr = qrcode(0, 'L');
            qr.addData(listUrl);
            qr.make();
            
            const qrImage = qr.createImgTag(5);
            qrContainer.innerHTML = qrImage;
            
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
        
        // Download button
        downloadButton.addEventListener('click', function() {
            try {
                // Get QR code image
                const qrImg = qrContainer.querySelector('img');
                
                if (!qrImg) {
                    throw new Error('QR kod resmi bulunamadı');
                }
                
                // Create a canvas element
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                // Set canvas dimensions
                canvas.width = qrImg.width;
                canvas.height = qrImg.height;
                
                // Draw QR code to canvas
                context.drawImage(qrImg, 0, 0);
                
                // Create a temporary link element
                const link = document.createElement('a');
                link.download = `${listData.title}_QR.png`;
                link.href = canvas.toDataURL('image/png');
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
            } catch (error) {
                console.error('Error downloading QR code:', error);
                alert('QR kod indirilirken bir hata oluştu: ' + error.message);
            }
        });
    }
    
    // Function to show error messages
    function showError(message) {
        // Display error for title
        if (listTitle) {
            listTitle.textContent = 'Hata';
        }
        
        // Display error for preview
        if (previewItems) {
            previewItems.innerHTML = `<p class="error-message">${message}</p>`;
        }
        
        // Display error for QR code
        if (qrContainer) {
            qrContainer.innerHTML = `<p class="error-message">${message}</p>`;
        }
        
        // Log error
        console.error('QR Generator Error:', message);
    }
    
    // Function to escape HTML to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
