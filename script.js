let listItems = [];

function addItem() {
    const itemInput = document.getElementById("listItem");
    if (itemInput.value.trim()) {
        listItems.push(itemInput.value.trim());
        updateListDisplay();
        itemInput.value = "";
    }
}

function updateListDisplay() {
    const listContainer = document.getElementById("itemList");
    listContainer.innerHTML = "";
    listItems.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = item;
        listContainer.appendChild(li);
    });
}

function generateQR() {
    const listName = document.getElementById("listName").value;
    if (!listName || listItems.length === 0) {
        alert("Lütfen liste ismi girin ve en az bir öğe ekleyin.");
        return;
    }

    const data = JSON.stringify({ name: listName, items: listItems });
    const qrContainer = document.getElementById("qrContainer");
    qrContainer.innerHTML = "";
    
    const qrCode = document.createElement("img");
    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
    qrContainer.appendChild(qrCode);
}

function resetForm() {
    document.getElementById("listName").value = "";
    listItems = [];
    updateListDisplay();
    document.getElementById("qrContainer").innerHTML = "";
}
