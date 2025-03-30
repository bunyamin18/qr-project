// QR Code Generator Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js for background animation - sci-fi data transfer effect
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

    try {
        // DOM elementlerini al
        const qrContainer = document.getElementById('qrContainer');
        const downloadButton = document.querySelector('.download-button');
        const backButton = document.querySelector('.back-button');
        const editButton = document.querySelector('.edit-button');
        const previewTitle = document.getElementById('preview-title');
        const previewItems = document.getElementById('preview-items');
        
        if (!qrContainer || !downloadButton || !backButton || !editButton || !previewTitle || !previewItems) {
            throw new Error('Gerekli DOM elementleri bulunamadı');
        }

        // Check if dataStorage is available globally
        if (!window.dataStorage) {
            throw new Error('Veri depolama servisi bulunamadı');
        }

        // URL'den liste ID'sini al
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');
        
        if (!listId) {
            throw new Error('Liste ID bulunamadı');
        }

        // Liste verisini al
        const listData = window.dataStorage.getList(listId);
        if (!listData) {
            throw new Error('Liste bulunamadı');
        }

        // Liste önizlemesini göster
        renderListPreview(listData);

        // Mutlak URL oluşturma - doğru URL oluşturmak önemli
        const fullUrl = window.location.href;
        const baseUrl = fullUrl.substring(0, fullUrl.lastIndexOf('/') + 1);
        const appUrl = baseUrl + "list.html?listId=" + listId;
        
        console.log("QR kod için oluşturulan URL:", appUrl);
        
        // QR kodu oluştur 
        generateQRCode(appUrl);

        // Liste önizlemesini oluştur
        function renderListPreview(list) {
            // Başlığı göster
            previewTitle.textContent = list.title;
            
            // Öğeleri temizle
            previewItems.innerHTML = '';
            
            // Öğeleri göster - Öğe Adı solda, Miktar/Değer sağda
            list.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'preview-item';
                
                itemElement.innerHTML = `
                    <div class="preview-item-content">${escapeHtml(item.content)}</div>
                    <div class="preview-item-value">${escapeHtml(item.value)}</div>
                `;
                
                // Resim varsa göster
                if (item.image) {
                    const imagePreview = document.createElement('div');
                    imagePreview.className = 'preview-item-image';
                    imagePreview.innerHTML = `<img src="${item.image}" alt="Öğe resmi" class="thumbnail">`;
                    itemElement.appendChild(imagePreview);
                }
                
                previewItems.appendChild(itemElement);
            });
        }

        // QR kodu oluştur
        function generateQRCode(content) {
            try {
                console.log("QR Kod URL'si:", content);
                // QR Type set to 0 means automatic detection of QR version
                // Error correction level 'H' is highest (30%) - helps in case QR code is distorted
                const qr = window.qrcode(0, 'H');
                qr.addData(content);
                qr.make();
                
                // SVG QR code generation for better quality
                const qrImageSvg = qr.createSvgTag(5); // SVG QR kodu daha büyük yap
                qrContainer.innerHTML = qrImageSvg;
                
                // Style the SVG
                const svgElement = qrContainer.querySelector('svg');
                if (svgElement) {
                    svgElement.style.width = '100%';
                    svgElement.style.maxWidth = '220px'; // QR kodu daha büyük yap
                    svgElement.style.height = 'auto';
                }

                // QR Kod açıklaması ekle
                const qrDescription = document.createElement('p');
                qrDescription.className = 'qr-description';
                qrDescription.innerHTML = `Bu QR kodu taratarak <a href="${content}" target="_blank">bu adrese</a> ulaşabilirsiniz.`;
                qrContainer.appendChild(qrDescription);

            } catch (error) {
                console.error('QR kod oluşturma hatası:', error);
                qrContainer.innerHTML = '<p class="error">QR kod oluşturulamadı</p>';
            }
        }

        // İndirme butonuna tıklama event listener'ı
        downloadButton.addEventListener('click', () => {
            // SVG'yi PNG'ye dönüştür ve indir
            const svgElement = qrContainer.querySelector('svg');
            if (!svgElement) {
                alert('QR kod bulunamadı');
                return;
            }
            
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Canvas'ı PNG'ye dönüştür ve indir
                const pngUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `liste_${listId}.png`;
                link.href = pngUrl;
                link.click();
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        });
        
        // Düzenleme butonuna tıklama event listener'ı
        editButton.addEventListener('click', () => {
            window.location.href = `index.html?listId=${listId}`;
        });

        // Geri butonu event listener'ı
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

    } catch (error) {
        console.error('QR kod oluşturma hatası:', error);
        alert(error.message || 'QR kod oluşturulurken bir hata oluştu');
    }
});

// HTML escape fonksiyonu
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
