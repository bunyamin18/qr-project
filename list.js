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
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #00bcd4, #80deea);
            font-family: 'Segoe UI', sans-serif;
        }

        .container {
            width: 90%;
            max-width: 800px;
            margin: 20px auto;
            background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
            padding: 30px;
            border-radius: 20px;
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
            display: flex;
            gap: 20px;
        }

        .items-section {
            flex: 2;
        }

        .items-section h2 {
            color: #006064;
            margin-bottom: 15px;
        }

        .items-list {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .qr-section {
            flex: 1;
        }

        .qr-section h2 {
            color: #006064;
            margin-bottom: 15px;
        }

        #qrContainer {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
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
