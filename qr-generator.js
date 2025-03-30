// QR Code Generator Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js for background animation
    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#00bcd4" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#00bcd4",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
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
        
        if (!qrContainer || !downloadButton || !backButton) {
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

        // QR kod içeriğini hazırla - kullanıcı bunu ziyaret edecek
        const qrContent = `https://okulprojesibunyamin.netlify.app/list.html?listId=${listId}`;
        
        // QR Type set to 0 means automatic detection of QR version
        // Error correction level 'L' is lowest (7%)
        const qr = qrcode(0, 'L');
        qr.addData(qrContent);
        qr.make();

        // SVG QR code generation for better quality
        const qrImageSvg = qr.createSvgTag(4);
        qrContainer.innerHTML = qrImageSvg;
        
        // Style the SVG
        const svgElement = qrContainer.querySelector('svg');
        if (svgElement) {
            svgElement.style.width = '100%';
            svgElement.style.maxWidth = '300px';
            svgElement.style.height = 'auto';
        }

        // İndirme butonuna tıklama event listener'ı
        downloadButton.addEventListener('click', () => {
            // SVG'yi PNG'ye dönüştür ve indir
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

        // Geri butonu event listener'ı
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

    } catch (error) {
        console.error('QR kod oluşturma hatası:', error);
        alert(error.message || 'QR kod oluşturulurken bir hata oluştu');
    }
});
