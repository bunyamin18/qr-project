<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liste Görüntüleme</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', sans-serif;
            background-color: #f5f5f5;
        }

        .container {
            width: 90%;
            max-width: 800px;
            margin: 20px auto;
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .list-header h1 {
            text-align: center;
            color: #006064;
            margin-bottom: 0;
            font-size: 28px;
        }

        .list-header button {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            color: white;
            transition: transform 0.2s;
            background: linear-gradient(135deg, #4dd0e1, #00acc1);
        }

        .list-header button:hover {
            transform: translateY(-2px);
        }

        .list-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        .items-section, .qr-section {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .items-section h2, .qr-section h2 {
            color: #006064;
            margin-bottom: 15px;
        }

        .items-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .list-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            padding: 15px;
            border-radius: 10px;
            background: #f8f9fa;
        }

        .label {
            color: #00838f;
            font-weight: 500;
            margin-bottom: 5px;
        }

        .value {
            font-size: 16px;
            color: #333;
        }

        .image-wrapper {
            position: relative;
            width: 100px;
            height: 100px;
            border-radius: 8px;
            overflow: hidden;
        }

        .item-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }

        .qr-section {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        #qrCode {
            width: 200px;
            height: 200px;
            margin: 10px 0;
            display: none;
        }

        .action-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 30px;
        }

        .action-buttons button {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            color: white;
            transition: transform 0.2s;
        }

        .action-buttons button:hover {
            transform: translateY(-2px);
        }

        .action-buttons button:first-child {
            background: linear-gradient(135deg, #00bcd4, #0097a7);
        }

        .action-buttons button:last-child {
            background: linear-gradient(135deg, #4dd0e1, #00acc1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="list-header">
            <h1 id="listTitle"></h1>
            <button onclick="window.location.href='index.html'">Yeni Liste</button>
        </div>
        
        <div class="list-content">
            <div class="items-section">
                <h2>Ürünler</h2>
                <div id="itemsList" class="items-list"></div>
            </div>

            <div class="qr-section">
                <h2>QR Kod</h2>
                <div id="qrContainer">
                    <img id="qrCode" src="" alt="QR Kod" style="display: none;">
                </div>
            </div>
        </div>

        <div class="action-buttons">
            <button onclick="window.location.href='index.html?edit=true'">Düzenle</button>
            <button onclick="window.location.href='index.html'">Ana Sayfa</button>
        </div>
    </div>

    <script src="list.js"></script>
</body>
</html>
