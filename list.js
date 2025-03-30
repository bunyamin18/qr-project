// List viewing script
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
    
    // DOM Elements
    const listTitle = document.getElementById('listTitle');
    const listItems = document.getElementById('listItems');
    const backButton = document.getElementById('backButton');
    
    try {
        // Get list ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');
        
        if (!listId) {
            throw new Error('Liste ID bulunamadı');
        }
        
        // Get list data from storage
        const listData = window.dataStorage.getList(listId);
        
        if (!listData) {
            throw new Error('Liste bulunamadı');
        }
        
        // Display list title
        listTitle.textContent = listData.title;
        
        // Display list items
        if (listData.items && listData.items.length > 0) {
            // Clear any existing items
            listItems.innerHTML = '';
            
            // Add each item to the display
            listData.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'list-item';
                
                // Öğe Adı solda, Miktar/Değer sağda şeklinde göster
                let itemContent = `
                    <div class="item-content">${escapeHtml(item.content)}</div>
                    <div class="item-value">${escapeHtml(item.value)}</div>
                `;
                
                // Resim varsa görüntüleme butonunu ekle
                if (item.image) {
                    itemContent += `
                        <div class="preview-item-image">
                            <button type="button" class="view-image-button">Resim</button>
                        </div>
                    `;
                }
                
                itemElement.innerHTML = itemContent;
                
                // Resim görüntüleme butonu tıklama işlevi
                if (item.image) {
                    const imageButton = itemElement.querySelector('.view-image-button');
                    imageButton.addEventListener('click', function() {
                        // Resim modali oluştur
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
                        
                        // Resim elementi oluştur
                        const imgElement = document.createElement('img');
                        imgElement.src = item.image;
                        imgElement.style.maxWidth = '90%';
                        imgElement.style.maxHeight = '90%';
                        imgElement.style.objectFit = 'contain';
                        imgElement.style.borderRadius = '10px';
                        
                        // Tıklanınca kapat
                        modal.addEventListener('click', function() {
                            document.body.removeChild(modal);
                        });
                        
                        modal.appendChild(imgElement);
                        document.body.appendChild(modal);
                    });
                }
                
                listItems.appendChild(itemElement);
            });
        } else {
            // Liste boşsa
            listItems.innerHTML = '<p>Bu listede hiç öğe bulunmuyor.</p>';
        }
        
    } catch (error) {
        console.error('Error displaying list:', error);
        
        // Hata mesajı göster
        listTitle.textContent = 'Hata';
        listItems.innerHTML = `<p class="error-message">Bir hata oluştu: ${error.message}</p>`;
    }
    
    // Geri butonu işlevselliği
    backButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // HTML içeriği XSS saldırılarına karşı koruma
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
