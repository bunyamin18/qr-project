// List display script
document.addEventListener('DOMContentLoaded', function() {
    // Particles.js başlat
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

    // Gerekli elementleri sakla
    const listTitle = document.getElementById('listTitle');
    const itemsContainer = document.getElementById('items');
    
    if (!listTitle || !itemsContainer) {
        console.error('Gerekli DOM elementleri bulunamadı');
        alert('Sayfada bir sorun oluştu. Lütfen tekrar deneyin.');
        return;
    }

    // URL'den liste ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');
    
    if (!listId) {
        console.error('Liste ID bulunamadı');
        alert('Liste bulunamadı. Geçersiz URL.');
        return;
    }

    // dataStorage kontrolü
    if (!window.dataStorage) {
        console.error('dataStorage bulunamadı');
        alert('Veri servisi yüklenemedi. Lütfen sayfayı yenileyin.');
        return;
    }

    // Liste verisini al
    const listData = window.dataStorage.getList(listId);
    
    if (!listData) {
        console.error('Liste bulunamadı: ID=' + listId);
        alert('Liste bulunamadı. Silunmüş veya hiç oluşturulmamış olabilir.');
        return;
    }

    // Liste verisini göster
    displayListData(listData);

    // Düzenleme butonu event listener'ı
    const editButton = document.querySelector('.edit-button');
    if (editButton) {
        editButton.addEventListener('click', () => {
            window.location.href = `index.html?listId=${listId}`;
        });
    }

    // Geri butonu event listener'ı
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Liste verisini göster
    function displayListData(data) {
        try {
            // Başlığı göster
            listTitle.textContent = data.title;

            // Listeyi göster
            itemsContainer.innerHTML = '';
            
            data.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'list-item';
                
                // Miktar/Değer solda, Öğe Adı sağda şeklinde göster
                itemElement.innerHTML = `
                    <div class="item-value">${escapeHtml(item.value)}</div>
                    <div class="item-content">${escapeHtml(item.content)}</div>
                `;

                // Resim varsa görüntüleme butonunu ekle
                if (item.image) {
                    const viewButton = document.createElement('button');
                    viewButton.className = 'view-image-button';
                    viewButton.textContent = 'Resmi Görüntüle';
                    
                    viewButton.addEventListener('click', () => {
                        window.open(item.image, '_blank');
                    });

                    itemElement.appendChild(viewButton);
                }

                itemsContainer.appendChild(itemElement);
            });

        } catch (error) {
            console.error('Liste gösterme hatası:', error);
            alert('Liste gösterilemedi: ' + error.message);
        }
    }
});

// HTML escape fonksiyonu
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
