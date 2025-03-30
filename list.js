// Liste görüntüleme script
document.addEventListener('DOMContentLoaded', function() {
    console.log("List.js yüklendi");
    
    // DOM elemanlarını tanımlama
    const listTitle = document.getElementById('listTitle');
    const listItems = document.getElementById('listItems');
    const backButton = document.getElementById('backButton');
    const editButton = document.getElementById('editButton');
    
    // URL parametrelerini al
    const urlParams = new URLSearchParams(window.location.search);
    
    // Desteklenen tüm parametre adları için kontrol et 
    // (hem listId hem id parametresi desteklenir - Netlify ile uyumlu)
    const listId = urlParams.get('listId') || urlParams.get('id');
    const encodedData = urlParams.get('data');
    
    console.log("Liste ID:", listId);
    console.log("Kodlanmış veri:", encodedData ? "Var (uzunluk: " + encodedData.length + ")" : "Yok");
    
    // Liste verisini al (önce encoded data, sonra localStorage)
    let listData = null;
    
    // URL-safe Base64 decode fonksiyonu (artık kullanılmıyor ama eski URL'leri desteklemek için tutuluyor)
    function urlSafeBase64Decode(str) {
        try {
            // URL güvenli Base64'ü standart Base64'e çevir
            const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            return decodeURIComponent(atob(base64));
        } catch (e) {
            console.error("Base64 decode hatası:", e);
            return null;
        }
    }
    
    // Önce URL'den gelen kodlanmış veriyi kontrol et (geriye dönük uyumluluk)
    if (encodedData) {
        try {
            const decodedData = urlSafeBase64Decode(encodedData);
            if (decodedData) {
                listData = JSON.parse(decodedData);
                console.log("URL'den liste verisi çözüldü:", listData);
                
                // Çözülen veriyi aynı zamanda localStorage'a da kaydedelim
                if (listData && listData.id) {
                    saveListToLocalStorage(listData);
                }
            } else {
                throw new Error("Veri çözülemedi");
            }
        } catch (error) {
            console.error("URL'den gelen veri çözümlenemedi:", error);
        }
    }
    
    // 1. Öncelikle özel depolama alanını kontrol et (QR-özel veri)
    if (!listData && listId) {
        const specialData = localStorage.getItem(`list_data_${listId}`);
        if (specialData) {
            try {
                listData = JSON.parse(specialData);
                console.log("Özel depolama alanından liste verisi yüklendi:", listData);
            } catch (e) {
                console.error("Özel depolama verisi çözümlenemedi:", e);
            }
        }
    }
    
    // 2. Eğer özel depoda bulunamazsa, normal localStorage'ı kontrol et
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
        showError('Liste bulunamadı. Lütfen ana sayfaya dönün ve tekrar deneyin.');
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
    
    // Helper fonksiyonlar:
    
    // localStorage'dan liste al
    function getListFromLocalStorage(id) {
        const lists = JSON.parse(localStorage.getItem('lists') || '[]');
        const foundList = lists.find(list => list.id === id);
        if (!foundList) {
            throw new Error('Liste bulunamadı');
        }
        return foundList;
    }
    
    // Liste öğelerini göster
    function displayListItems(items) {
        // Önceki öğeleri temizle
        listItems.innerHTML = '';
        
        if (!items || items.length === 0) {
            listItems.innerHTML = '<li class="no-items">Listede öğe bulunmamaktadır</li>';
            return;
        }
        
        // Listeyi oluştur
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'list-item';
            
            // İçerik ekle
            if (item.content) {
                const contentDiv = document.createElement('div');
                contentDiv.className = 'item-content';
                contentDiv.textContent = item.content;
                listItem.appendChild(contentDiv);
            }
            
            // Değer ekle (varsa)
            if (item.value) {
                const valueDiv = document.createElement('div');
                valueDiv.className = 'item-value';
                valueDiv.textContent = item.value;
                listItem.appendChild(valueDiv);
            }
            
            // Resim ekle (varsa)
            if (item.image) {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'item-image';
                const img = document.createElement('img');
                img.src = item.image;
                img.alt = item.content || 'Liste öğesi';
                img.loading = 'lazy'; // Lazy loading
                imageDiv.appendChild(img);
                listItem.appendChild(imageDiv);
            }
            
            listItems.appendChild(listItem);
        });
    }
    
    // Liste düzenleme butonunu ayarla
    function setupEditButton(listId) {
        if (editButton) {
            editButton.addEventListener('click', function() {
                window.location.href = `index.html?edit=${listId}`;
            });
        }
    }
    
    // Hata göster
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-container';
        errorDiv.innerHTML = `
            <div class="error-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60">
                    <path fill="#FFC107" d="M12 2L1 21h22L12 2zm0 5.99L16.53 16h-9.06L12 7.99zM11 10v4h2v-4h-2zm0 5v2h2v-2h-2z"/>
                </svg>
            </div>
            <div class="error-message">${message}</div>
        `;
        
        // Hata mesajını HTML'e ekle
        const container = document.querySelector('.container') || document.body;
        container.prepend(errorDiv);
        
        // Liste öğeleri ve başlığı gizle
        if (listTitle) listTitle.style.display = 'none';
        if (listItems) listItems.style.display = 'none';
    }
    
    // Liste verilerini localStorage'a kaydet
    function saveListToLocalStorage(listData) {
        if (!listData || !listData.id) return;
        
        try {
            // Mevcut listeleri al
            const lists = JSON.parse(localStorage.getItem('lists') || '[]');
            
            // Bu liste zaten var mı kontrol et
            const existingListIndex = lists.findIndex(list => list.id === listData.id);
            
            if (existingListIndex >= 0) {
                // Var olan listeyi güncelle
                lists[existingListIndex] = listData;
            } else {
                // Yeni liste ekle
                lists.push(listData);
            }
            
            // Güncellenmiş liste dizisini kaydet
            localStorage.setItem('lists', JSON.stringify(lists));
            console.log(`Liste "${listData.title}" localStorage'a kaydedildi.`);
        } catch (error) {
            console.error('Liste kaydetme hatası:', error);
        }
    }
    
    // Particles.js animasyonu
    function initCanvas() {
        try {
            if (typeof particlesJS === 'function') {
                particlesJS('particles-js', {
                    "particles": {
                        "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
                        "color": { "value": "#0073e6" },
                        "shape": { "type": "circle" },
                        "opacity": { "value": 0.5, "random": false },
                        "size": { "value": 3, "random": true },
                        "line_linked": {
                            "enable": true,
                            "distance": 150,
                            "color": "#0073e6",
                            "opacity": 0.4,
                            "width": 1
                        },
                        "move": {
                            "enable": true,
                            "speed": 2,
                            "direction": "none",
                            "random": false,
                            "straight": false,
                            "out_mode": "out",
                            "bounce": false
                        }
                    },
                    "interactivity": {
                        "detect_on": "canvas",
                        "events": {
                            "onhover": { "enable": true, "mode": "grab" },
                            "onclick": { "enable": true, "mode": "push" },
                            "resize": true
                        }
                    },
                    "retina_detect": true
                });
            }
        } catch (error) {
            console.warn('particles.js animasyonu yüklenemedi:', error);
        }
    }
});
