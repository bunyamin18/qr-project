// Gerekli elementleri sakla
import dataStorage from './services/dataStorage.js';

let titleInput;
let itemsContainer;
let currentListData;

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
                    // Resim URL'sini sakla
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

        // Mevcut liste verisi varsa güncelle
        if (currentListData) {
            currentListData.title = title;
            currentListData.items = items;
        } else {
            // Yeni liste oluştur
            currentListData = {
                title,
                items
            };
        }

        // Veriyi sakla
        const savedList = await dataStorage.saveList(currentListData);
        
        // QR kod sayfasına yönlendir
        window.location.href = `qr-generator.html?listId=${savedList.id}`;

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
                    // Resmi önizleme olarak göster
                    const preview = document.createElement('img');
                    preview.className = 'image-preview';
                    preview.src = e.target.result;
                    preview.style.maxWidth = '100px';
                    preview.style.maxHeight = '100px';
                    preview.style.objectFit = 'cover';
                    
                    // Mevcut önizleme varsa kaldır
                    const existingPreview = row.querySelector('.image-preview');
                    if (existingPreview) {
                        existingPreview.remove();
                    }
                    
                    // Yeni önizlemeyi ekle
                    const imageContainer = row.querySelector('.item-image-container');
                    imageContainer.appendChild(preview);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Silme butonu event listener'ı ekle
    const deleteButton = row.querySelector('.delete-row');
    if (deleteButton) {
        deleteButton.style.position = 'absolute';
        deleteButton.style.top = '8px';
        deleteButton.style.right = '8px';
        deleteButton.style.fontSize = '20px';
        deleteButton.style.padding = '0 8px';
        deleteButton.style.borderRadius = '50%';
        deleteButton.addEventListener('click', () => {
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
        // DOM elementlerini al
        titleInput = document.getElementById('listTitle');
        itemsContainer = document.getElementById('items');
        
        if (!titleInput || !itemsContainer) {
            throw new Error('Gerekli DOM elementleri bulunamadı');
        }

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
        const listId = urlParams.get('listId');
        
        if (listId) {
            // Liste verisini al
            currentListData = dataStorage.getList(listId);
            
            if (!currentListData) {
                throw new Error('Liste bulunamadı');
            }

            // Veriyi form'a yükle
            titleInput.value = currentListData.title || '';
            
            // Mevcut öğeleri ekle
            currentListData.items.forEach(item => {
                const row = createItemRow(item.content, item.value, item.image);
                itemsContainer.appendChild(row);
            });
        }

        // İlk satırı ekle
        if (itemsContainer.children.length === 0) {
            addItem();
        }

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
    }
});