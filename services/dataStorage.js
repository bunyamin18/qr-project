class DataStorage {
    constructor() {
        this.storageKey = 'lists';
    }

    // Tüm listeleri al
    getAllLists() {
        const lists = localStorage.getItem(this.storageKey);
        return lists ? JSON.parse(lists) : [];
    }

    // Liste ekle veya güncelle
    saveList(listData) {
        const lists = this.getAllLists();
        const existingIndex = lists.findIndex(list => list.id === listData.id);
        
        if (existingIndex !== -1) {
            lists[existingIndex] = listData;
        } else {
            lists.push(listData);
        }

        localStorage.setItem(this.storageKey, JSON.stringify(lists));
        return listData;
    }

    // Liste al
    getList(listId) {
        const lists = this.getAllLists();
        return lists.find(list => list.id === listId);
    }

    // Liste sil
    deleteList(listId) {
        const lists = this.getAllLists();
        const updatedLists = lists.filter(list => list.id !== listId);
        localStorage.setItem(this.storageKey, JSON.stringify(updatedLists));
    }
}

export default new DataStorage();
