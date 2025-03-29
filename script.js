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
                const quantity = row.querySelector('.item-quantity')?.value?.trim();
                const storedImage = row.querySelector('.stored-image')?.value || '';
                
                if (!content || !quantity) {
                    throw new Error('Lütfen tüm içerik ve miktar alanlarını doldurun');
                }

                listData.items.push({ 
                    content: content.substring(0, 50),
                    quantity: quantity.substring(0, 10),
                    image: storedImage 
                });
            }

            // URL oluşturma
            const baseUrl = window.location.origin;
            const finalData = JSON.stringify(listData);
            const encodedData = encodeURIComponent(finalData);
            const listUrl = `${baseUrl}/list.html?id=${listId}`;

            // Veriyi kaydetme
            try {
                localStorage.setItem(`list_${listId}`, finalData);
            } catch (error) {
                console.warn('localStorage kapasitesi aşıldı, veri sadece URL üzerinden iletiliyor');
            }

            // QR kod oluşturma
            try {
                if (typeof qrcode !== 'function') {
                    throw new Error('QR kod kütüphanesi yüklenemedi');
                }

                const qr = qrcode(0, 'L');
                qr.addData(listUrl);
                qr.make();
                const qrCode = qr.createDataURL(10);

                if (!qrCode || typeof qrCode !== 'string') {
                    throw new Error('QR kod oluşturulamadı');
                }

                listData.qrCode = qrCode;

                // Yeni sayfaya yönlendir
                window.location.href = `${listUrl}&data=${encodedData}`;

            } catch (error) {
                console.error('QR kod oluşturma hatası:', error);
                throw new Error(error.message || 'QR kod oluşturulurken hata oluştu');
            }

        } catch (error) {
            console.error('Form gönderme hatası:', error);
            alert(error.message || 'Beklenmeyen bir hata oluştu');
            
            saveButton.disabled = false;
            const buttonText = saveButton.querySelector('.button-text');
            if (buttonText) {
                buttonText.textContent = isEditing ? 'Değişiklikleri Kaydet' : 'Kaydet';
            }
        }
    }

    // Yeni satır ekleme fonksiyonu
    function addNewRow(item = null) {
        const newRow = document.createElement('div');
        newRow.className = 'form-row item-row';
        newRow.innerHTML = `
            <div class="input-group content-field">
                <label>İçerik:</label>
                <input type="text" class="item-content" required value="${item?.content || ''}">
            </div>
            <div class="input-group">
                <label>Miktar:</label>
                <input type="text" class="item-quantity" required value="${item?.quantity || ''}">
            </div>
            <div class="input-group">
                <label>Resim:</label>
                <input type="file" class="item-image" accept="image/*">
                <input type="hidden" class="stored-image" value="${item?.image || ''