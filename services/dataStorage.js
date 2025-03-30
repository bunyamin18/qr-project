class DataStorage {
    constructor() {
        this.storageKey = 'lists';
        this.initializeStorage();
    }

    // Depolamayı başlat
    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    // Tüm listeleri al
    getAllLists() {
        try {
            const lists = localStorage.getItem(this.storageKey);
            return lists ? JSON.parse(lists) : [];
        } catch (error) {
            console.error('Veri okuma hatası:', error);
            return [];
        }
    }

    // Liste ekle veya güncelle
    saveList(listData) {
        try {
            const lists = this.getAllLists();
            const existingIndex = lists.findIndex(list => list.id === listData.id);
            
            if (existingIndex !== -1) {
                lists[existingIndex] = listData;
            } else {
                lists.push(listData);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(lists));
            return listData;
        } catch (error) {
            console.error('Veri kaydetme hatası:', error);
            throw new Error('Liste kaydedilirken bir hata oluştu');
        }
    }

    // Liste al
    getList(listId) {
        try {
            const lists = this.getAllLists();
            return lists.find(list => list.id === listId);
        } catch (error) {
            console.error('Veri okuma hatası:', error);
            return null;
        }
    }

    // Liste sil
    deleteList(listId) {
        try {
            const lists = this.getAllLists();
            const updatedLists = lists.filter(list => list.id !== listId);
            localStorage.setItem(this.storageKey, JSON.stringify(updatedLists));
        } catch (error) {
            console.error('Veri silme hatası:', error);
        }
    }
}

export default new DataStorage();
