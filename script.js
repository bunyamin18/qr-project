document.addEventListener('DOMContentLoaded', function() {
    // ... önceki kodlar ...

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

                // Resmi sıkıştır
                const compressedImage = await compressImage(storedImage);
                
                listData.items.push({ 
                    content: content.substring(0, 50),
                    quantity: quantity.substring(0, 10),
                    image: compressedImage 
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

    // Resim sıkıştırma fonksiyonu
    async function compressImage(imageData) {
        if (!imageData) return '';

        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.src = imageData;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Resmi maksimum 500px genişliğe indir
                    const maxWidth = 500;
                    const scale = maxWidth / img.width;
                    const newWidth = maxWidth;
                    const newHeight = img.height * scale;
                    
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
                    
                    // Kaliteyi düşür
                    const compressedData = canvas.toDataURL('image/jpeg', 0.5);
                    resolve(compressedData);
                };
                img.onerror = () => reject(new Error('Resim yüklenemedi'));
            } catch (error) {
                reject(error);
            }
        });
    }

    // ... diğer kodlar ...
});