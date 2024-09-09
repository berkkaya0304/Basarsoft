// OpenLayers map initialization
const map = new ol.Map({
    target: 'map',
    controls: [
        new ol.control.Zoom({
            zoomInLabel: '+',
            zoomOutLabel: '-'
        })
    ],
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM({
                attributions: []
            }),
        }),
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([35.2433, 38.9637]), // Türkiye'nin merkezi
        zoom: 6.7,
    }),
});

let addPointMode = false;

// Popup öğesini oluştur
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
});

map.addOverlay(overlay);

closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

function addPointToMap(point) {
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([point.pointX, point.pointY])),
        name: point.name,
        id: point.id,
        pointX: point.pointX,
        pointY: point.pointY
    });
    marker.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
                color: 'orange'
            }),
            stroke: new ol.style.Stroke({
                color: 'black',
                width: 2
            })
        }),
        text: new ol.style.Text({
            text: point.name,
            font: '12px sans-serif',
            fill: new ol.style.Fill({
                color: '#fff'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0,0,0,0.6)',
                width: 3
            }),
            offsetY: -20
        })
    }));

    const vectorSource = new ol.source.Vector({
        features: [marker]
    });
    const markerLayer = new ol.layer.Vector({
        source: vectorSource
    });
    map.addLayer(markerLayer);
}

// Sayfa yüklendiğinde tüm noktaları API'den çekip haritaya ekle
window.addEventListener('load', () => {
    fetch('http://localhost:5297/Point')
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                const points = data.value;
                points.forEach(point => addPointToMap(point));
            } else {
                alert('Noktalar alınırken bir hata oluştu!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Noktalar alınırken bir hata oluştu!');
        });
});

// Buton 1: Yeni nokta ekleme modunu aç/kapat
document.getElementById('button1').addEventListener('click', () => {
    addPointMode = !addPointMode;
    if (addPointMode) {
        map.getTargetElement().style.cursor = 'crosshair';
        document.getElementById('button1').textContent = 'Nokta Ekleme Modunu Kapat';
    } else {
        map.getTargetElement().style.cursor = 'default';
        document.getElementById('button1').textContent = 'Yeni Nokta Ekle';
    }
});

// Haritaya tıklama olayını dinle
map.on('click', (event) => {
    if (addPointMode) {
        const coordinates = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
        const pointX = coordinates[0].toFixed(6);
        const pointY = coordinates[1].toFixed(6);

        // Open a jsPanel for adding a new point
        jsPanel.create({
            theme: 'primary',
            headerTitle: 'Yeni Nokta Ekle',
            position: 'center-top 0 58',
            contentSize: '400 200',
            content: `
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #333; margin-bottom: 20px;">Nokta Bilgileri</h2>
                    <div style="margin-bottom: 15px;">
                        <label for="pointName" style="display: block; margin-bottom: 5px; color: #555;">Nokta Adı:</label>
                        <input type="text" id="pointName" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div style="width: 48%;">
                            <label style="display: block; margin-bottom: 5px; color: #555;">Point X:</label>
                            <input type="text" id="pointX" value="${pointX}" readonly style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;">
                        </div>
                        <div style="width: 48%;">
                            <label style="display: block; margin-bottom: 5px; color: #555;">Point Y:</label>
                            <input type="text" id="pointY" value="${pointY}" readonly style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;">
                        </div>
                    </div>
                    <button id="addPointButton" style="width: 100%; padding: 10px; background-color: #ed6f07; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Ekle</button>
                </div>
            `,
            callback: function(panel) {
                this.header.style.backgroundColor = '#ff7700';
                this.header.style.color = 'white'; // Text color to be visible on orange
                panel.content.querySelector('#addPointButton').addEventListener('click', function () {
                    const pointName = panel.content.querySelector('#pointName').value;

                    if (!pointName) {
                        alert('Lütfen geçerli bir ad girin!');
                        return;
                    }

                    const newPoint = {
                        pointX: coordinates[0],
                        pointY: coordinates[1],
                        name: pointName
                    };

                    // Yeni noktayı API'ye gönder
                    fetch('http://localhost:5297/Point', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newPoint)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status) {
                            addPointToMap(newPoint);
                            panel.close(); // Close the jsPanel after successful addition
                        } else {
                            alert('Nokta eklenirken bir hata oluştu!');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Nokta eklenirken bir hata oluştu!');
                    });
                });
            }
        });
    } else {
        // Herhangi bir noktaya tıklanıldığında popup açılır
        map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
            if (feature.getGeometry().getType() === 'Point') {
                const pointId = feature.get('id');
                const pointX = feature.get('pointX');
                const pointY = feature.get('pointY');
                const currentName = feature.get('name');

                const coordinates = feature.getGeometry().getCoordinates();
                overlay.setPosition(coordinates);

                // Popup içeriğini doldur
                content.innerHTML = `
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #333; margin-bottom: 20px;">Nokta Bilgileri</h2>
                    <div style="margin-bottom: 15px;">
                        <label for="pointName" style="display: block; margin-bottom: 5px; color: #555;">Nokta Adı:</label>
                        <input type="text" id="pointName" value="${currentName}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div style="width: 48%;">
                            <label style="display: block; margin-bottom: 5px; color: #555;">Point X:</label>
                            <input type="text" id="pointX" value="${pointX}" readonly style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;">
                        </div>
                        <div style="width: 48%;">
                            <label style="display: block; margin-bottom: 5px; color: #555;">Point Y:</label>
                            <input type="text" id="pointY" value="${pointY}" readonly style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;">
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <button id="updatePointButton" style="width: 48%; padding: 10px; background-color: #ed6f07; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Güncelle!</button>
                        <button id="deletePointButton" style="width: 48%; padding: 10px; background-color: #d9534f; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Sil!</button>
                    </div>
                </div>
            `;

                // Güncelle butonu için olay dinleyicisi
                document.getElementById('updatePointButton').addEventListener('click', function () {
                    updatePoint(pointId);
                });

                document.getElementById('deletePointButton').addEventListener('click', function () {
                    if (confirm('Bu noktayı silmek istediğinizden emin misiniz?')) {
                        fetch('http://localhost:5297/Point/' + pointId, {
                            method: 'DELETE'
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status) {
                                refreshMap();
                                overlay.setPosition(undefined); // Popup'ı kapat
                            }
                        })
                        .catch(error => {
                        });
                    }
                });
            }
        });
    }
    }
);


document.getElementById('button2').addEventListener('click', showPointsInPanel);

let pointsListPanel; 

function showPointsInPanel() {
    fetch('http://localhost:5297/Point')
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                const points = data.value;
                let tableContent = `
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Point X</th>
                                <th>Point Y</th>
                                <th>Name</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                points.forEach(point => {
                    tableContent += `
                        <tr>
                            <td>${point.id}</td>
                            <td>${point.pointX}</td>
                            <td>${point.pointY}</td>
                            <td>${point.name}</td>
                            <td>
                                <button class="update-button" onclick="updatePoint(${point.id}, pointsListPanel)">Güncelle</button>
                                <button class="delete-button" onclick="deletePoint(${point.id}, pointsListPanel)">Sil</button>
                                 <button class="view-button" onclick="viewOnMap(${point.pointX}, ${point.pointY})">Haritada Gör</button>
                            </td>
                        </tr>
                    `;
                });

                tableContent += `
                        </tbody>
                    </table>
                `;

            
                    pointsListPanel = jsPanel.create({
                        theme: 'primary',
                        headerTitle: 'Nokta Listesi',
                        position: 'center-top 0 58',
                        contentSize: '800 450',
                        color: "white",
                        content: `
                            <style>
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }
                                th, td {
                                    border: 1px solid #ddd;
                                    padding: 8px;
                                    text-align: left;
                                }
                                thead {
                                    background-color: #ff7700;
                                    color: white;
                                }
                                .update-button, .delete-button {
                                    padding: 5px 10px;
                                    margin: 2px;
                                    border: none;
                                    border-radius: 3px;
                                    cursor: pointer;
                                }
                                .update-button {
                                    background-color: #4CAF50;
                                    color: white;
                                }
                                .delete-button {
                                    background-color: #f44336;
                                    color: white;
                                }
                            </style>
                            ${tableContent}
                        `,
                        callback: function() {
                            this.content.style.padding = '20px';
                            this.header.style.backgroundColor = '#ff7700'; // Orange color
                            this.header.style.color = 'white';
                        }
                    });
            } else {
                alert('Noktalar alınırken bir hata oluştu!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Noktalar alınırken bir hata oluştu!');
        });
}

function viewOnMap(longitude, latitude) {
    // Convert coordinates from EPSG:4326 to EPSG:3857
    const coordinates = ol.proj.fromLonLat([longitude, latitude]);

    // Center the map on the given coordinates
    map.getView().animate({
        center: coordinates,
        duration: 1000 // Animation duration in milliseconds
    });
}

function updatePoint(id, panel2) {
    // Fetch the current point data to pre-fill the form
    fetch('http://localhost:5297/Point/' + id)
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                const currentPoint = data.value;

                // Create a jsPanel for choosing update method
                jsPanel.create({
                    theme: 'primary',
                    headerTitle: 'Güncelleme Yöntemi Seçin',
                    position: 'center-top 0 58',
                    contentSize: '300 150',
                    content: `
                        <div style="padding: 20px; text-align: center;">
                            <button id="manualUpdateButton" style="padding: 10px; margin: 10px; background-color: #ed6f07; color: white; border: none; cursor: pointer;">Manuel Güncelleme</button>
                            <button id="formUpdateButton" style="padding: 10px; margin: 10px; background-color: #ed6f07; color: white; border: none; cursor: pointer;">Form ile Güncelleme</button>
                        </div>
                    `,
                    callback: function(panel) {
                        this.header.style.backgroundColor = '#ff7700';
                        this.header.style.color = 'white';

                        panel.content.querySelector('#manualUpdateButton').addEventListener('click', function () {
                            panel2.close();
                            enableMapSelection(id,currentPoint, panel2);
                        });

                        panel.content.querySelector('#formUpdateButton').addEventListener('click', function () {
                            panel2.close();
                            showUpdateForm(id, currentPoint, panel2);
                        });
                    }
                });
            }
        })
        .catch(error => {
        });
}

function updatePoint(id, panel2) {
    // Fetch the current point data to pre-fill the form
    fetch('http://localhost:5297/Point/' + id)
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                const currentPoint = data.value;

                // Create a jsPanel for choosing update method
                jsPanel.create({
                    theme: 'primary',
                    headerTitle: 'Güncelleme Yöntemi Seçin',
                    position: 'center-top 0 58',
                    contentSize: '300 150',
                    content: `
                        <div style="padding: 20px; text-align: center;">
                            <button id="manualUpdateButton" style="padding: 10px; margin: 10px; background-color: #ed6f07; color: white; border: none; cursor: pointer;">Manuel Güncelleme</button>
                            <button id="formUpdateButton" style="padding: 10px; margin: 10px; background-color: #ed6f07; color: white; border: none; cursor: pointer;">Form ile Güncelleme</button>
                        </div>
                    `,
                    callback: function(panel) {
                        this.header.style.backgroundColor = '#ff7700';
                        this.header.style.color = 'white';

                        panel.content.querySelector('#manualUpdateButton').addEventListener('click', function () {
                            panel2.close();
                            enableMapSelection(id,currentPoint, panel2);
                        });

                        panel.content.querySelector('#formUpdateButton').addEventListener('click', function () {
                            panel2.close();
                            showUpdateForm(id, currentPoint, panel2);
                        });
                    }
                });
            }
        })
        .catch(error => {
        });
}

function updatePoint(id) {
    // Fetch the current point data to pre-fill the form
    fetch('http://localhost:5297/Point/' + id)
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                const currentPoint = data.value;

                // Create a jsPanel for choosing update method
                jsPanel.create({
                    theme: 'primary',
                    headerTitle: 'Güncelleme Yöntemi Seçin',
                    position: 'center-top 0 58',
                    contentSize: '300 150',
                    content: `
                        <div style="padding: 20px; text-align: center;">
                            <button id="manualUpdateButton" style="padding: 10px; margin: 10px; background-color: #ed6f07; color: white; border: none; cursor: pointer;">Manuel Güncelleme</button>
                            <button id="formUpdateButton" style="padding: 10px; margin: 10px; background-color: #ed6f07; color: white; border: none; cursor: pointer;">Form ile Güncelleme</button>
                        </div>
                    `,
                    callback: function(panel) {
                        this.header.style.backgroundColor = '#ff7700';
                        this.header.style.color = 'white';

                        panel.content.querySelector('#manualUpdateButton').addEventListener('click', function () {
                            enableMapSelection(id,currentPoint);
                        });

                        panel.content.querySelector('#formUpdateButton').addEventListener('click', function () {
                            showUpdateForm(id, currentPoint);
                        });
                    }
                });
            }
        })
        .catch(error => {
        });
}

function enableMapSelection(id,currentPoint, panel2) {
    // Haritada yeni bir konum seçilmesini sağlayan bildirim paneli
    jsPanel.create({
        theme: 'primary',
        headerTitle: 'Konum Seçimi',
        position: 'center-top 0 58',
        contentSize: '300 150',
        content: `
            <div style="padding: 20px; text-align: center;">
                <p>Haritada yeni bir konum seçin.</p>
                <button id="cancelSelectionButton" style="padding: 10px; margin-top: 10px; background-color: #ed6f07; color: white; border: none; cursor: pointer;">İptal</button>
            </div>
        `,
        callback: function(panel) {
            this.header.style.backgroundColor = '#ff7700';
            this.header.style.color = 'white';

            // Haritada tıklama olayını ekle
            const clickListener = map.on('singleclick', function(evt) {
                const coordinate = evt.coordinate;
                const lonLat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
                updatePointCoordinates(id, currentPoint, lonLat[0], lonLat[1], panel2);
                panel.close();
                // Tıklama olayını kaldır
                ol.Observable.unByKey(clickListener);
            });

            // İptal butonuna tıklama olayı ekle
            panel.content.querySelector('#cancelSelectionButton').addEventListener('click', function() {
                panel.close();
                ol.Observable.unByKey(clickListener);
            });
        }
    });
}

function updatePointCoordinates(id,currentPoint, newX, newY, panel2) {
    const updatedPoint = {
        id: id,
        pointX: newX,
        pointY: newY,
        name: currentPoint.name
    };

    fetch('http://localhost:5297/Point/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPoint)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status) {
            refreshMap();
            panel2.close();
            jsPanel.create({
                theme: 'primary',
                headerTitle: 'İşlem Başarılı',
                position: 'center',
                contentSize: '400 300',
                content: `
                    <div style="padding: 20px; text-align: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h2 style="color: #4CAF50; margin-top: 20px;">Nokta Başarıyla Güncellendi!</h2>
                        <p style="margin-top: 20px;">Harita ve nokta listesi yenilendi.</p>
                        <button id="closeSuccessPanel" style="padding: 10px 20px; margin-top: 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px;">Tamam</button>
                    </div>
                `,
                callback: function(successPanel) {
                    this.header.style.backgroundColor = '#4CAF50';
                    this.header.style.color = 'white';
                    successPanel.content.querySelector('#closeSuccessPanel').addEventListener('click', function() {
                        successPanel.close();
                    });
                }
            });
        } else {
            alert('Nokta güncellenirken bir hata oluştu: ' + (data.message || 'Bilinmeyen hata'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Nokta güncellenirken bir hata oluştu: ' + error.message);
    });
}

function showUpdateForm(id, currentPoint, panel2) {
    jsPanel.create({
        theme: 'primary',
        headerTitle: 'Nokta Bilgilerini Güncelle',
        position: 'center-top 0 58',
        contentSize: '400 250',
        content: `
            <div style="padding: 20px;">
                <label for="newPointName">Yeni Nokta Adı:</label><br>
                <input type="text" id="newPointName" value="${currentPoint.name}" style="width: 100%; margin-bottom: 10px; padding: 5px;"><br>

                <label for="newPointX">Yeni X Koordinatı (longitude):</label><br>
                <input type="text" id="newPointX" value="${currentPoint.pointX}" style="width: 100%; margin-bottom: 10px; padding: 5px;"><br>

                <label for="newPointY">Yeni Y Koordinatı (latitude):</label><br>
                <input type="text" id="newPointY" value="${currentPoint.pointY}" style="width: 100%; margin-bottom: 10px; padding: 5px;"><br>

                <button id="updatePointButton" style="padding: 10px; background-color: #ed6f07; color: white; border: none; cursor: pointer;">Güncelle</button>
            </div>
        `,
        callback: function(panel) {
            this.header.style.backgroundColor = '#ff7700'; // Orange color
            this.header.style.color = 'white';
            panel.content.querySelector('#updatePointButton').addEventListener('click', function () {
                const newName = panel.content.querySelector('#newPointName').value;
                const newPointX = parseFloat(panel.content.querySelector('#newPointX').value);
                const newPointY = parseFloat(panel.content.querySelector('#newPointY').value);

                if (!newName || isNaN(newPointX) || isNaN(newPointY)) {
                    alert('Lütfen geçerli bilgiler girin!');
                    return;
                }

                const updatedPoint = {
                    id: id,
                    pointX: newPointX,
                    pointY: newPointY,
                    name: newName
                };

                // Send the updated point details to the backend
                fetch('http://localhost:5297/Point/' + id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedPoint)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status) {
                        refreshMap(); // Refresh the map to reflect changes
                        showPointsInPanel(); // Refresh the points list panel
                        panel.close(); // Close the jsPanel
                        panel2.close();
                    } else {
                        alert('Nokta güncellenirken bir hata oluştu: ' + (data.message || 'Bilinmeyen hata'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Nokta güncellenirken bir hata oluştu: ' + error.message);
                });
            });
        }
    });
}

function enableMapSelection(id,currentPoint) {
    // Haritada yeni bir konum seçilmesini sağlayan bildirim paneli
    jsPanel.create({
        theme: 'primary',
        headerTitle: 'Konum Seçimi',
        position: 'center-top 0 58',
        contentSize: '300 150',
        content: `
            <div style="padding: 20px; text-align: center;">
                <p>Haritada yeni bir konum seçin.</p>
                <button id="cancelSelectionButton" style="padding: 10px; margin-top: 10px; background-color: #ed6f07; color: white; border: none; cursor: pointer;">İptal</button>
            </div>
        `,
        callback: function(panel) {
            this.header.style.backgroundColor = '#ff7700';
            this.header.style.color = 'white';

            // Haritada tıklama olayını ekle
            const clickListener = map.on('singleclick', function(evt) {
                const coordinate = evt.coordinate;
                const lonLat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
                updatePointCoordinates(id, currentPoint, lonLat[0], lonLat[1]);
                panel.close();
                // Tıklama olayını kaldır
                ol.Observable.unByKey(clickListener);
            });

            // İptal butonuna tıklama olayı ekle
            panel.content.querySelector('#cancelSelectionButton').addEventListener('click', function() {
                panel.close();
                ol.Observable.unByKey(clickListener);
            });
        }
    });
}

function updatePointCoordinates(id,currentPoint, newX, newY) {
    const updatedPoint = {
        id: id,
        pointX: newX,
        pointY: newY,
        name: currentPoint.name
    };

    fetch('http://localhost:5297/Point/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPoint)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status) {
            refreshMap();
            jsPanel.create({
                theme: 'primary',
                headerTitle: 'İşlem Başarılı',
                position: 'center',
                contentSize: '400 300',
                content: `
                    <div style="padding: 20px; text-align: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h2 style="color: #4CAF50; margin-top: 20px;">Nokta Başarıyla Güncellendi!</h2>
                        <p style="margin-top: 20px;">Harita ve nokta listesi yenilendi.</p>
                        <button id="closeSuccessPanel" style="padding: 10px 20px; margin-top: 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px;">Tamam</button>
                    </div>
                `,
                callback: function(successPanel) {
                    this.header.style.backgroundColor = '#4CAF50';
                    this.header.style.color = 'white';
                    successPanel.content.querySelector('#closeSuccessPanel').addEventListener('click', function() {
                        successPanel.close();
                    });
                }
            });
        } else {
            alert('Nokta güncellenirken bir hata oluştu: ' + (data.message || 'Bilinmeyen hata'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Nokta güncellenirken bir hata oluştu: ' + error.message);
    });
}

function showUpdateForm(id, currentPoint) {
    jsPanel.create({
        theme: 'primary',
        headerTitle: 'Nokta Bilgilerini Güncelle',
        position: 'center-top 0 58',
        contentSize: '400 250',
        content: `
            <div style="padding: 20px;">
                <label for="newPointName">Yeni Nokta Adı:</label><br>
                <input type="text" id="newPointName" value="${currentPoint.name}" style="width: 100%; margin-bottom: 10px; padding: 5px;"><br>

                <label for="newPointX">Yeni X Koordinatı (longitude):</label><br>
                <input type="text" id="newPointX" value="${currentPoint.pointX}" style="width: 100%; margin-bottom: 10px; padding: 5px;"><br>

                <label for="newPointY">Yeni Y Koordinatı (latitude):</label><br>
                <input type="text" id="newPointY" value="${currentPoint.pointY}" style="width: 100%; margin-bottom: 10px; padding: 5px;"><br>

                <button id="updatePointButton" style="padding: 10px; background-color: #ed6f07; color: white; border: none; cursor: pointer;">Güncelle</button>
            </div>
        `,
        callback: function(panel) {
            this.header.style.backgroundColor = '#ff7700'; // Orange color
            this.header.style.color = 'white';
            panel.content.querySelector('#updatePointButton').addEventListener('click', function () {
                const newName = panel.content.querySelector('#newPointName').value;
                const newPointX = parseFloat(panel.content.querySelector('#newPointX').value);
                const newPointY = parseFloat(panel.content.querySelector('#newPointY').value);

                if (!newName || isNaN(newPointX) || isNaN(newPointY)) {
                    alert('Lütfen geçerli bilgiler girin!');
                    return;
                }

                const updatedPoint = {
                    id: id,
                    pointX: newPointX,
                    pointY: newPointY,
                    name: newName
                };

                // Send the updated point details to the backend
                fetch('http://localhost:5297/Point/' + id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedPoint)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status) {
                        refreshMap(); // Refresh the map to reflect changes
                        showPointsInPanel(); // Refresh the points list panel
                        panel.close(); // Close the jsPanel
                    } else {
                        alert('Nokta güncellenirken bir hata oluştu: ' + (data.message || 'Bilinmeyen hata'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Nokta güncellenirken bir hata oluştu: ' + error.message);
                });
            });
        }
    });
}



function deletePoint(id, panel) {
    if (confirm('Bu noktayı silmek istediğinizden emin misiniz?')) {
        fetch('http://localhost:5297/Point/' + id, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                refreshMap();
                showPointsInPanel();
                panel.close();
            } else {
                alert('Nokta silinirken bir hata oluştu!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Nokta silinirken bir hata oluştu!');
        });
    }
}


function refreshMap() {
    // Clear existing layers
    map.getLayers().getArray().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            layer.getSource().clear();
        }
    });

    // Fetch and add points again
    fetch('http://localhost:5297/Point')
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                const points = data.value;
                points.forEach(point => addPointToMap(point));
            } else {
                alert('Noktalar alınırken bir hata oluştu!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Noktalar alınırken bir hata oluştu!');
        });
}
