// Liste verilerini saklamak için bir servis
const dataService = {
    // Verileri localStorage'da sakla
    saveList(listData) {
        const lists = JSON.parse(localStorage.getItem('lists') || '[]');
        const existingList = lists.find(l => l.id === listData.id);
        
        if (existingList) {
            // Mevcut liste varsa güncelle
            const index = lists.findIndex(l => l.id === listData.id);
            lists[index] = listData;
        } else {
            // Yeni liste ekle
            lists.push(listData);
        }
        
        localStorage.setItem('lists', JSON.stringify(lists));
        return listData;
    },

    // Bir listeyi al
    getList(listId) {
        const lists = JSON.parse(localStorage.getItem('lists') || '[]');
        return lists.find(l => l.id === listId);
    },

    // Tüm listeleri al
    getAllLists() {
        return JSON.parse(localStorage.getItem('lists') || '[]');
    },

    // Bir listeyi sil
    deleteList(listId) {
        const lists = JSON.parse(localStorage.getItem('lists') || '[]');
        const updatedLists = lists.filter(l => l.id !== listId);
        localStorage.setItem('lists', JSON.stringify(updatedLists));
    }
};

export default dataService;
