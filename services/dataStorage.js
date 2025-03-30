// Veri depolama servisi
const dataStorage = {
    // Liste verilerini sakla
    async saveList(listData) {
        try {
            // Liste ID'si oluştur
            const listId = Date.now().toString();
            
            // Liste verisini hazırla
            const list = {
                id: listId,
                title: listData.title,
                items: listData.items
            };

            // Veriyi localStorage'a kaydet
            const lists = JSON.parse(localStorage.getItem('lists') || '[]');
            lists.push(list);
            localStorage.setItem('lists', JSON.stringify(lists));

            return list;
        } catch (error) {
            console.error('Liste kaydetme hatası:', error);
            throw error;
        }
    },

    // Liste verisini al
    getList(listId) {
        try {
            const lists = JSON.parse(localStorage.getItem('lists') || '[]');
            return lists.find(list => list.id === listId);
        } catch (error) {
            console.error('Liste alma hatası:', error);
            throw error;
        }
    },

    // Tüm listeleri al
    getAllLists() {
        try {
            return JSON.parse(localStorage.getItem('lists') || '[]');
        } catch (error) {
            console.error('Listeler alma hatası:', error);
            throw error;
        }
    }
};

export default dataStorage;
