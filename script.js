document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini al
    const form = document.getElementById('listForm');
    const itemsContainer = document.getElementById('items');
    const addRowButton = document.getElementById('addRow');
    const saveButton = document.getElementById('saveButton');
    const titleInput = document.getElementById('listTitle');

    // Kontroller
    if (!form || !itemsContainer || !addRowButton || !saveButton || !titleInput) {
        console.error('DOM elementleri bulunamadı');
        alert('Sayfa yüklenirken bir hata oluştu');
        return;
    }

    // Düzenleme modu kontrolü
    let currentListData = null;
    const urlParams = new URLSearchParams(window.location.search);
    const isEditing = urlParams.get('edit') === 'true';

    // Düzenleme modu için veri yükleme
    if (isEditing) {
        try {
            const editingData = localStorage.getItem('editingList');
            if (editingData) {
                currentListData = JSON.parse(editingData);
                titleInput.value = currentListData.title;
                itemsContainer.innerHTML = '';
                
                if (Array.isArray(currentListData.items)) {
                    currentListData.items.forEach(item => addNewRow(item));
                }

                const buttonText = saveButton.querySelector('.button-text');
                if (buttonText) {
                    buttonText.textContent = 'Değişiklikleri Kaydet';
                }
            }
        } catch (error) {
            console.error('Düzenleme verisi yüklenirken hata:', error);
            alert('Düzenleme verisi yüklenirken hata oluştu');
            return;
        }
    }

    // İlk satırı ekle
    if (itemsContainer.children.length === 0) {
        addNewRow();
    }

    // Olay dinleyicileri
    addRowButton.addEventListener('click', function() {
        addNewRow();
    });

    itemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-row')) {
            const row = e.target.closest('.form-row');
            if (row && itemsContainer.children.length > 1) {
                row.remove();
            }
        }
    });

    itemsContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('item-image')) {
            handleImageUpload(e.target);
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit();
    });

    // Resim yükleme fonksiyonu
    async function handleImageUpload(input) {
        if (!input.files || !input.files[0]) return;

        const file = input.files[0];
        const row = input.closest('.form-row');
        if (!row) return;

        const storedImage = row.querySelector('.stored-image');
        const container = input.parentElement;
        if (!storedImage || !container) return;

        try {
            const imageData = await readFileAsDataURL(file);
            storedImage.value = imageData;

            let preview = row.querySelector('.image-preview');
            if (preview) {
                preview.src = imageData;
            } else {
                preview = document.createElement('img');
                preview.src = imageData;
                preview.className = 'image-preview';
                preview.alt = 'Ürün resmi';
                container.appendChild(preview);
            }
        } catch (error) {
            console.error('Resim yükleme hatası:', error);
            alert('Resim yüklenirken hata oluştu');
        }
    }

    // Dosya okuma fonksiyonu
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsDataURL(file);
        });
    }

    // Yeni satır ekleme fonksiyonu
    function addNewRow(item = null) {
        const newRow = document.createElement('div');
        newRow.className = 'form-row item-row';
        newRow.innerHTML = `
            <div class="item-content-container">
                <label for="item-content">İçerik:</label>
                <input type="text" class="item-content" required>
            </div>
            <div class="item-value-container">
                <label for="item-value">Miktar/Değer:</label>
                <input type="text" class="item-value" required>
            </div>
            <div class="item-image-container">
                <label for="item-image">Resim:</label>
                <input type="file" class="item-image" accept="image/*">
                <input type="hidden" class="stored-image">
            </div>
            <button type="button" class="delete-row">×</button>
        `;
        
        if (item) {
            newRow.querySelector('.item-content').value = item.content;
            newRow.querySelector('.item-value').value = item.value;
            if (item.image) {
                newRow.querySelector('.stored-image').value = item.image;
                const preview = newRow.querySelector('.item-image-container');
                const img = document.createElement('img');
                img.src = item.image;
                img.className = 'image-preview';
                img.alt = 'Ürün resmi';
                preview.appendChild(img);
            }
        }
        
        itemsContainer.appendChild(newRow);
    }

    // Form gönderme fonksiyonu
    async function handleFormSubmit() {
        try {
            // Başlık kontrolü
            const title = titleInput.value.trim();
            if (!title) {
                throw new Error('Liste başlığı boş olamaz');
            }

            // Öğeler kontrolü
            const items = Array.from(itemsContainer.children);
            if (!items.length) {
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
            for (const row of items) {
                const content = row.querySelector('.item-content')?.value?.trim();
                const value = row.querySelector('.item-value')?.value?.trim();
                const storedImage = row.querySelector('.stored-image')?.value || '';
                
                if (!content || !value) {
                    throw new Error('Lütfen tüm içerik ve değer alanlarını doldurun');
                }

                listData.items.push({ 
                    content: content.substring(0, 50),
                    value: value.substring(0, 10),
                    image: storedImage 
                });
            }

            // QR kod oluşturma
            const qrData = await createQRCode(listId);
            if (qrData) {
                listData.qrCode = qrData;
            } else {
                throw new Error('QR kod oluşturulamadı');
            }

            // Veriyi URL'e ekle
            const finalData = JSON.stringify(listData);
            const encodedData = encodeURIComponent(finalData);
            const finalUrl = `list.html?id=${listId}&data=${encodedData}`;

            // Sayfaya yönlendir
            window.location.href = finalUrl;

        } catch (error) {
            console.error('Form gönderme hatası:', error);
            alert(error.message);
        }
    }

    // QR kod oluşturma fonksiyonu
    async function createQRCode(listId) {
        return new Promise((resolve, reject) => {
            try {
                // QR kod kütüphanesini kontrol et
                if (typeof QRCode === 'undefined') {
                    console.error('QR kod kütüphanesi yüklenemedi');
                    reject(new Error('QR kod kütüphanesi yüklenemedi'));
                    return;
                }

                // QR kod oluştur
                const qrElement = document.createElement('div');
                document.body.appendChild(qrElement);
                
                const qr = new QRCode(qrElement, {
                    text: `list.html?id=${listId}`,
                    width: 256,
                    height: 256,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                // QR kodu veri olarak al
                const canvas = qrElement.querySelector('canvas');
                if (canvas) {
                    const qrData = canvas.toDataURL();
                    document.body.removeChild(qrElement);
                    resolve(qrData);
                } else {
                    document.body.removeChild(qrElement);
                    reject(new Error('QR kod oluşturulamadı'));
                }

            } catch (error) {
                console.error('QR kod oluşturma hatası:', error);
                reject(error);
            }
        });
    }
});