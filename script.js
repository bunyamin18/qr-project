// Gerekli elementleri sakla
let titleInput;
let itemsContainer;
let currentListData;

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
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
    const listId = urlParams.get('id');
    
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
    } else if (listId) {
        fetch(`data/${listId}.json`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Liste verisi bulunamadı');
                }
            })
            .then(data => {
                currentListData = data;
                
                // Veriyi form'a yükle
                if (currentListData) {
                    titleInput.value = currentListData.title || '';
                    
                    // Mevcut öğeleri ekle
                    currentListData.items.forEach(item => {
                        const row = createItemRow(item.content, item.value, item.image);
                        itemsContainer.appendChild(row);
                    });
                }
            })
            .catch(error => {
                console.error('Veri yükleme hatası:', error);
                alert('Liste verisi yüklenirken bir hata oluştu');
            });
    }

    // İlk satırı ekle
    if (itemsContainer.children.length === 0) {
        addItem();
    }
});

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
    
    try {
        // Başlık kontrolü
        const title = titleInput.value.trim();
        if (!title) {
            throw new Error('Liste başlığı boş olamaz');
        }

        // Öğeler kontrolü
        const rows = Array.from(itemsContainer.children);
        if (!rows.length) {
            throw new Error('En az bir öğe eklemelisiniz');
        }

        // Liste ID'si
        let listId = currentListData?.id;
        if (!listId) {
            listId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        // Liste verisi oluşturma
        const listData = {
            id: listId,
            title: title,
            items: []
        };

        // Öğeleri ekleme
        for (const row of rows) {
            const content = row.querySelector('.item-content')?.value?.trim();
            const value = row.querySelector('.item-value')?.value?.trim();
            const imageInput = row.querySelector('.item-image');
            const image = imageInput?.files[0];
            
            if (!content || !value) {
                throw new Error('Lütfen tüm içerik ve değer alanlarını doldurun');
            }

            listData.items.push({ 
                content: content.substring(0, 50),
                value: value.substring(0, 10),
                image: image ? URL.createObjectURL(image) : ''
            });
        }

        // Veriyi JSON dosyasına kaydet
        fetch(`data/${listId}.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Veri kaydedilemedi');
            }
            return response.json();
        })
        .then(data => {
            // Sayfaya yönlendir
            window.location.href = `list.html?id=${listId}`;
        })
        .catch(error => {
            console.error('Veri kaydetme hatası:', error);
            throw new Error('Liste verisi kaydedilemedi');
        });

    } catch (error) {
        console.error('Form gönderme hatası:', error);
        alert(error.message);
    }
}