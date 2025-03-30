/**
 * QR Kod basit üretici - Dış kütüphaneye bağımlılık olmadan çalışan minimal sürüm
 */
class SimpleQR {
    constructor() {
        this.version = "1.0.0";
    }
    
    /**
     * Google Chart API kullanarak QR kod URL'si oluşturur
     * @param {string} data QR kodun içeriği
     * @param {number} size QR kod boyutu (px)
     * @returns {string} QR kod resim URL'si
     */
    generateQRUrl(data, size = 200) {
        // Google Chart API kullanarak QR kod oluştur (güvenilir ve her yerde çalışan bir yöntem)
        const encodedData = encodeURIComponent(data);
        return `https://chart.googleapis.com/chart?cht=qr&chl=${encodedData}&chs=${size}x${size}&chld=H|0`;
    }
    
    /**
     * QR kodunu bir HTML konteyner içine yerleştirir
     * @param {HTMLElement} container QR kodun yerleştirileceği HTML elementi
     * @param {string} data QR kodun içeriği
     * @param {number} size QR kod boyutu (px)
     */
    displayQR(container, data, size = 200) {
        // Önce konteyneri temizle
        container.innerHTML = '';
        
        // QR kod URL'si oluştur
        const qrUrl = this.generateQRUrl(data, size);
        
        // QR kod resmi oluştur
        const img = document.createElement('img');
        img.src = qrUrl;
        img.alt = "QR Kod";
        img.style.maxWidth = "100%";
        img.style.display = "block";
        img.style.margin = "0 auto";
        img.style.background = "#ffffff";
        img.style.padding = "10px";
        img.style.borderRadius = "8px";
        
        // Konteynere ekle
        container.appendChild(img);
        
        return img;
    }
}

// Global değişken olarak tanımla
window.SimpleQR = new SimpleQR();
