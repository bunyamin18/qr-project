import dataStorage from './services/dataStorage.js';

// DOM elementleri
const form = document.getElementById('listForm');
const titleInput = document.getElementById('listTitle');
const itemsContainer = document.getElementById('items');
const addRowButton = document.getElementById('addRow');

// Form gönderme fonksiyonu
async function handleFormSubmit(event) {
    event.preventDefault();

    try {
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
        if (!title) {
            throw new Error('Lütfen liste başlığı girin');
        }

        if (items.length === 0) {
            throw new Error('Lütfen en az bir öğe ekleyin');
        }

        // Liste verisini oluştur
        const listData = {
            title,
            items
        };

        // Veriyi sakla
        const savedList = await dataStorage.saveList(listData);
        
        // QR kod sayfasına yönlendir
        window.location.href = `qr-generator.html?listId=${savedList.id}&title=${title}&items=${JSON.stringify(items)}`;

    } catch (error) {
        console.error('Form gönderme hatası:', error);
        alert(error.message || 'Liste kaydedilirken bir hata oluştu');
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
            <input type="text" class="item-content" value="${escapeHtml(content)}" style="width: 100%;">
        </div>
        <div class="item-value-container">
            <label>Miktar/Değer</label>
            <input type="text" class="item-value" value="${escapeHtml(value)}" style="width: 100%;">
        </div>
        <div class="item-image-container">
            <label>Resim</label>
            <input type="file" class="item-image" accept="image/*">
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
                    const preview = document.createElement('img');
                    preview.className = 'image-preview';
                    preview.src = e.target.result;
                    preview.style.maxWidth = '100px';
                    preview.style.maxHeight = '100px';
                    
                    // Mevcut önizlemeyi temizle
                    const existingPreview = row.querySelector('.image-preview');
                    if (existingPreview) {
                        existingPreview.remove();
                    }
                    
                    // Yeni önizlemeyi ekle
                    row.insertBefore(preview, imageInput);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Silme butonu event listener'ı
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
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Form gönderme event listener'ı
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // Yeni öğe ekleme butonu event listener'ı
        if (addRowButton) {
            addRowButton.addEventListener('click', addItem);
        }

        // Başlangıçta bir öğe ekle
        addItem();

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
    }
});