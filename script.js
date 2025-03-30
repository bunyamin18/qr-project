// Gerekli elementleri sakla
let titleInput;
let itemsContainer;
let currentListData;

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // Teknolojik arka plan efektini oluştur
    createTechBackground();

    // DOM elementlerini al
    titleInput = document.getElementById('listTitle');
    itemsContainer = document.getElementById('items');
    
    // Form submit event listener'ı ekle
    const form = document.getElementById('listForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Yeni öğe ekleme butonu event listener'ı ekle
    const addItemButton = document.querySelector('.add-row-button');
    if (addItemButton) {
        addItemButton.addEventListener('click', addItem);
    }

    // URL'den veri al
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    
    if (encodedData) {
        try {
            const decodedString = decodeURIComponent(encodedData);
            currentListData = JSON.parse(decodedString);
            
            // Veriyi form'a yükle
            if (currentListData) {
                titleInput.value = currentListData.title || '';
                
                // Mevcut öğeleri ekle
                currentListData.items.forEach(item => {
                    const row = createItemRow(item.content, item.value, item.image);
                    itemsContainer.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            alert('Liste verisi yüklenirken bir hata oluştu');
        }
    }

    // İlk satırı ekle
    if (itemsContainer.children.length === 0) {
        addItem();
    }
});

// Teknolojik arka plan efektini oluştur
function createTechBackground() {
    const techBackground = document.createElement('div');
    techBackground.className = 'create-tech-background';
    document.body.appendChild(techBackground);

    // Rastgele veri parçacıkları oluştur
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'data-particles';
        
        // Rastgele başlangıç pozisyonları
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        
        // Rastgele animasyon süresi
        particle.style.animationDuration = Math.random() * 5 + 5 + 's';
        
        techBackground.appendChild(particle);
    }

    // Rastgele kablo efektleri oluştur
    for (let i = 0; i < 10; i++) {
        const cable = document.createElement('div');
        cable.className = 'cable';
        
        // Rastgele pozisyonlar
        cable.style.left = Math.random() * 100 + 'vw';
        
        // Rastgele animasyon süresi
        cable.style.animationDuration = Math.random() * 2 + 2 + 's';
        
        techBackground.appendChild(cable);
    }
}

// Yeni öğe ekleme fonksiyonu
function addItem() {
    const row = createItemRow();
    itemsContainer.appendChild(row);
}

// Öğe satırı oluşturma fonksiyonu
function createItemRow(content = '', value = '', image = '') {
    const row = document.createElement('div');
    row.className = 'form-row';
    
    row.innerHTML = `
        <div class="item-content-container">
            <label>İçerik</label>
            <input type="text" class="item-content" value="${escapeHtml(content)}">
        </div>
        <div class="item-value-container">
            <label>Miktar/Değer</label>
            <input type="text" class="item-value" value="${escapeHtml(value)}">
        </div>
        <div class="item-image-container">
            <label>Resim</label>
            <input type="file" class="item-image" accept="image/*">
            ${image ? `<img src="${image}" class="image-preview" alt="Öğe resmi">` : ''}
        </div>
        <button type="button" class="delete-row">×</button>
    `;
    
    // Resim seçme event listener'ı ekle
    const imageInput = row.querySelector('.item-image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = row.querySelector('.image-preview');
                    if (preview) {
                        preview.src = e.target.result;
                    } else {
                        const img = document.createElement('img');
                        img.className = 'image-preview';
                        img.src = e.target.result;
                        img.style.maxWidth = '100px';
                        img.style.maxHeight = '100px';
                        img.style.objectFit = 'cover';
                        row.querySelector('.item-image-container').appendChild(img);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Silme butonu event listener'ı ekle
    const deleteButton = row.querySelector('.delete-row');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            row.remove();
        });
    }
    
    return row;
}

// HTML escape fonksiyonu
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Form gönderme fonksiyonu
function handleFormSubmit(event) {
    event.preventDefault();

    // Form verilerini al
    const title = titleInput.value.trim();
    const items = Array.from(itemsContainer.children)
        .map(row => {
            const content = row.querySelector('.item-content').value.trim();
            const value = row.querySelector('.item-value').value.trim();
            const imageInput = row.querySelector('.item-image');
            let image = '';
            
            // Mevcut resmi al
            const preview = row.querySelector('.image-preview');
            if (preview && preview.src) {
                image = preview.src;
            }

            return {
                content,
                value,
                image
            };
        })
        .filter(item => item.content || item.value || item.image); // Boş öğeleri filtrele

    // Veri doğrulama
    if (!title || items.length === 0) {
        alert('Lütfen liste başlığı ve en az bir öğe girin');
        return;
    }

    // Mevcut liste verisi varsa güncelle
    if (currentListData) {
        currentListData.title = title;
        currentListData.items = items;
    } else {
        // Yeni liste oluştur
        currentListData = {
            id: generateUniqueID(),
            title,
            items
        };
    }

    // Veriyi URL formatında kodla
    const encodedData = encodeURIComponent(JSON.stringify(currentListData));
    
    // QR kod sayfasına yönlendir
    window.location.href = `qr-generator.html?data=${encodedData}`;
}

// Benzersiz ID oluşturma fonksiyonu
function generateUniqueID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}