// QR kod oluşturma servisi
import QRCode from 'qrcode';

const qrService = {
    // QR kod oluştur
    async createQR(listId) {
        try {
            const qrData = await QRCode.toDataURL(`https://okulprojesibunyamin.netlify.app/list.html?data=${listId}`);
            return qrData;
        } catch (error) {
            console.error('QR kod oluşturma hatası:', error);
            throw error;
        }
    },

    // QR kodu indir
    downloadQR(qrData, listId) {
        const link = document.createElement('a');
        link.download = `liste-qr-${listId}.png`;
        link.href = qrData;
        link.click();
    }
};

export default qrService;
