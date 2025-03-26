let items = [];

function addItem() {
    let itemInput = document.getElementById('listItem');
    let item = itemInput.value;
    
    if (item) {
        items.push(item);
        
        let itemList = document.getElementById('itemList');
        let li = document.createElement('li');
        li.textContent = item;
        itemList.appendChild(li);
        
        itemInput.value = '';
    }
}

function generateQR() {
    let listName = document.getElementById('listName').value;
    
    if (listName && items.length > 0) {
        let data = {
            name: listName,
            items: items
        };
        
        let qr = qrcode(0, 'M');
        qr.addData(JSON.stringify(data));
        qr.make();
        
        let qrCodeDiv = document.getElementById('qrCode');
        qrCodeDiv.innerHTML = qr.createImgTag(5);
    } else {
        alert('Liste ismi ve en az bir öğe ekleyin');
    }
}