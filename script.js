document.getElementById('newListButton').addEventListener('click', function() {
  const newList = prompt("Listeyi yazın:");

  if (newList) {
    const qrCodeContainer = document.createElement('div');
    new QRCode(qrCodeContainer, newList);
    document.getElementById('listContainer').appendChild(qrCodeContainer);
  }
});
