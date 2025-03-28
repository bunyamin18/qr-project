document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get("id");

    if (!listId) {
        document.body.innerHTML = "<h2>Liste bulunamadı!</h2>";
        return;
    }

    const listData = JSON.parse(localStorage.getItem(`list-${listId}`));

    if (!listData) {
        document.body.innerHTML = "<h2>Liste verisi bulunamadı!</h2>";
        return;
    }

    document.getElementById("listTitle").textContent = listData.title;

    const tbody = document.querySelector("#listTable tbody");
    listData.items.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${item.name}</td><td>${item.quantity}</td>`;
        tbody.appendChild(row);
    });

    document.getElementById("editList").addEventListener("click", function () {
        tbody.innerHTML = "";
        listData.items.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" value="${item.name}"></td>
                <td><input type="text" value="${item.quantity}"></td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById("editList").style.display = "none";
        document.getElementById("saveChanges").style.display = "block";
    });

    document.getElementById("saveChanges").addEventListener("click", function () {
        const newItems = [];
        document.querySelectorAll("#listTable tbody tr").forEach(row => {
            const inputs = row.querySelectorAll("input");
            newItems.push({
                name: inputs[0].value,
                quantity: inputs[1].value
            });
        });

        listData.items = newItems;
        localStorage.setItem(`list-${listId}`, JSON.stringify(listData));

        alert("Değişiklikler kaydedildi!");
        location.reload();
    });
});
