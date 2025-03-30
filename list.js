// Liste görüntüleme script
document.addEventListener('DOMContentLoaded', function() {
    console.log("List.js yüklendi");
    
    // DOM elements
    const listTitle = document.getElementById('listTitle');
    const listItems = document.getElementById('listItems');
    const backButton = document.getElementById('backButton');
    const editButton = document.getElementById('editButton');
    
    // URL parametrelerini al
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');
    const encodedData = urlParams.get('data');
    
    console.log("Liste ID:", listId);
    console.log("Kodlanmış veri:", encodedData ? "Var (uzunluk: " + encodedData.length + ")" : "Yok");
    
    // Liste verisini al (önce encoded data, sonra localStorage)
    let listData = null;
    
    // Önce URL'den gelen kodlanmış veriyi kontrol et
    if (encodedData) {
        try {
            // Base64 decode
            const decodedData = decodeURIComponent(atob(encodedData));
            listData = JSON.parse(decodedData);
            console.log("URL'den liste verisi çözüldü:", listData);
            
            // Çözülen veriyi aynı zamanda localStorage'a da kaydedelim
            if (listData && listData.id) {
                saveListToLocalStorage(listData);
            }
        } catch (error) {
            console.error("URL'den gelen veri çözümlenemedi:", error);
        }
    }
    
    // Eğer URL'den veri gelmezse ve listId varsa localStorage'dan deneyelim
    if (!listData && listId) {
        try {
            listData = getListFromLocalStorage(listId);
            console.log("localStorage'dan liste verisi alındı:", listData);
        } catch (error) {
            console.error("localStorage'dan liste alınamadı:", error);
        }
    }
    
    // Liste verisi kontrolü
    if (!listData) {
        showError('Liste bulunamadı.');
        return;
    }
    
    // Liste başlığını göster
    listTitle.textContent = listData.title || 'İsimsiz Liste';
    
    // Liste öğelerini göster
    displayListItems(listData.items || []);
    
    // Düzenleme butonunu ayarla
    setupEditButton(listData.id);
    
    // Animasyonu başlat
    initCanvas();
    
    // Liste öğelerini gösterme fonksiyonu
    function displayListItems(items) {
        if (items && items.length > 0) {
            listItems.innerHTML = '';
            
            items.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'list-item';
                
                let itemContent = `
                    <div class="list-item-content">
                        <div class="list-item-number">${index + 1}</div>
                        <div class="list-item-text">${escapeHtml(item.content || '')}</div>
                    </div>
                `;
                
                if (item.value) {
                    itemContent += `
                        <div class="list-item-value">${escapeHtml(item.value)}</div>
                    `;
                }
                
                itemElement.innerHTML = itemContent;
                
                // Eğer görüntü varsa, bir görüntü düğmesi ekle
                if (item.image) {
                    const imageButton = document.createElement('button');
                    imageButton.className = 'view-image-button';
                    imageButton.innerHTML = '<i class="fas fa-image"></i> Resim';
                    imageButton.addEventListener('click', function() {
                        showImageModal(item.image);
                    });
                    
                    itemElement.appendChild(imageButton);
                }
                
                listItems.appendChild(itemElement);
            });
        } else {
            listItems.innerHTML = '<p>Bu listede hiç öğe yok.</p>';
        }
    }
    
    // Düzenleme butonunu ayarla
    function setupEditButton(id) {
        if (editButton && id) {
            editButton.addEventListener('click', function() {
                window.location.href = `index.html?edit=${id}`;
            });
        } else if (editButton) {
            editButton.style.display = 'none';
        }
    }
    
    // Ana sayfaya dönüş button listener
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // localStorage'dan liste alma fonksiyonu
    function getListFromLocalStorage(id) {
        const storedLists = localStorage.getItem('lists');
        
        if (!storedLists) {
            return null;
        }
        
        const lists = JSON.parse(storedLists);
        
        if (!Array.isArray(lists)) {
            return null;
        }
        
        return lists.find(list => list && list.id === id);
    }
    
    // Listeyi localStorage'a kaydetme fonksiyonu
    function saveListToLocalStorage(list) {
        if (!list || !list.id) return;
        
        try {
            // Mevcut listeleri al
            const storedLists = localStorage.getItem('lists');
            let lists = [];
            
            if (storedLists) {
                lists = JSON.parse(storedLists);
                if (!Array.isArray(lists)) {
                    lists = [];
                }
            }
            
            // Aynı ID'ye sahip listeyi ara
            const existingIndex = lists.findIndex(item => item && item.id === list.id);
            
            if (existingIndex >= 0) {
                // Mevcut listeyi güncelle
                lists[existingIndex] = list;
            } else {
                // Yeni liste ekle
                lists.push(list);
            }
            
            // Güncellenmiş listeyi kaydet
            localStorage.setItem('lists', JSON.stringify(lists));
            console.log("Liste localStorage'a kaydedildi:", list.id);
        } catch (error) {
            console.error("Liste kaydederken hata:", error);
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
    
    // Animasyon için canvas
    function initCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'techCanvas';
        document.querySelector('.tech-background').appendChild(canvas);
        
        const canvasEl = document.getElementById('techCanvas');
        
        // Canvas boyutunu ayarla
        function resizeCanvas() {
            canvasEl.width = window.innerWidth;
            canvasEl.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        const ctx = canvasEl.getContext('2d');
        
        // Animasyon değişkenleri
        let circuits = [];
        
        // Animasyon fonksiyonları
        function drawCenterGlow() {
            const centerX = canvasEl.width / 2;
            const centerY = canvasEl.height / 2;
            const time = Date.now() * 0.001;
            
            const gradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, 150 + Math.sin(time) * 50
            );
            
            gradient.addColorStop(0, 'rgba(0, 245, 255, 0.4)');
            gradient.addColorStop(0.5, 'rgba(0, 245, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 245, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Particles.js konfigürasyonu
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#00f5ff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 2,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#00f5ff",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": true,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.8
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
    
    // Hata mesajı gösterme fonksiyonu
    function showError(message) {
        console.error("HATA:", message);
        
        if (listTitle) {
            listTitle.textContent = 'HATA';
            listTitle.style.color = 'red';
        }
        
        if (listItems) {
            listItems.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <p class="error-message">${message}</p>
                    <p>Lütfen ana sayfaya dönün ve tekrar deneyin.</p>
                </div>
            `;
        }
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
