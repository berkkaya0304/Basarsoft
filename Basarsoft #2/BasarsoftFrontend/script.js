document.addEventListener('DOMContentLoaded', (event) => {
    // Initialize the OpenLayers map
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
            new ol.layer.Vector({
                source: new ol.source.Vector({wrapX: false}),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([35.2433, 38.9637]), // Türkiye'nin merkezi
            zoom: 6.7,
        }),
    });

    // Initialize WKT tool
    const wkt = new ol.format.WKT();
    const vectorSource = new ol.source.Vector({wrapX: false});
    const vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            })
        })
    });
    map.addLayer(vectorLayer);

    // Fetch WKT data from the server and add to the map
    function loadWktData() {
        fetch('http://localhost:5297/point') // Sunucuya WKT verilerini almak için istek gönder
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Verileri JSON formatında al
            })
            .then(data => {
                data.value.forEach(item => {
                    const feature = wkt.readFeature(item.wkt);
                    feature.setId(item.id);

                                        // Geometri türüne göre stil belirle
                                        let style;
                                        if (feature.getGeometry().getType() === 'Point') {
                                            style = new ol.style.Style({
                                                image: new ol.style.Circle({
                                                    radius: 5, // Noktanın boyutu
                                                    fill: new ol.style.Fill({
                                                        color: '#FFA500' // Turuncu renk
                                                    }),
                                                    stroke: new ol.style.Stroke({
                                                        color: '#000', // Siyah kenar rengi
                                                        width: 2 // Kenar kalınlığı
                                                    })
                                                }),
                                                text: new ol.style.Text({
                                                    font: '12px Calibri,sans-serif',
                                                    overflow: true,
                                                    fill: new ol.style.Fill({
                                                        color: '#FFA500' // Etiket rengi
                                                    }),
                                                    stroke: new ol.style.Stroke({
                                                        color: '#000', // Siyah kenar rengi
                                                        width: 3 // Kenar kalınlığı
                                                    }),
                                                    text: item.name,
                                                    offsetY: -15

                                                })
                                            });
                                        } else if (feature.getGeometry().getType() === 'LineString') {
                                            style = new ol.style.Style({
                                                stroke: new ol.style.Stroke({
                                                    color: '#FFA500', // Turuncu renk
                                                    width: 4 // Çizgi kalınlığı
                                                }),
                                                text: new ol.style.Text({
                                                    font: '12px Calibri,sans-serif',
                                                    overflow: true,
                                                    fill: new ol.style.Fill({
                                                        color: '#000' // Etiket rengi
                                                    }),
                                                    stroke: new ol.style.Stroke({
                                                        color: '#FFA500', // Siyah kenar rengi
                                                        width: 3 // Kenar kalınlığı
                                                    }),
                                                    text: item.name
                                                })
                                            });
                                        } else if (feature.getGeometry().getType() === 'Polygon') {
                                            style = new ol.style.Style({
                                                stroke: new ol.style.Stroke({
                                                    color: '#FFA500', // Turuncu renk
                                                    width: 4 // Çizgi kalınlığı
                                                }),
                                                fill: new ol.style.Fill({
                                                    color: 'rgba(255, 165, 0, 0.3)' // Yarı şeffaf turuncu renk
                                                }),
                                                text: new ol.style.Text({
                                                    font: '12px Calibri,sans-serif',
                                                    overflow: true,
                                                    fill: new ol.style.Fill({
                                                        color: '#000' // Etiket rengi
                                                    }),
                                                    stroke: new ol.style.Stroke({
                                                        color: '#FFA500', // Siyah kenar rengi
                                                        width: 3 // Kenar kalınlığı
                                                    }),
                                                    text: item.name
                                                })
                                            });
                                        }
                    
                    feature.setStyle(style);

                    vectorSource.addFeature(feature);
                });
            })
            .catch(error => {
                console.error('Error loading WKT data:', error);
            });
    }

    // Sayfa yüklendiğinde WKT verilerini yükle
    loadWktData();

    // Draw interaction
    let drawInteraction;
    const drawControls = {
        point: new ol.interaction.Draw({
            source: vectorSource,
            type: 'Point'
        }),
        line: new ol.interaction.Draw({
            source: vectorSource,
            type: 'LineString'
        }),
        polygon: new ol.interaction.Draw({
            source: vectorSource,
            type: 'Polygon'
        })
    };

    function addDrawInteraction(type) {
        if (drawInteraction) {
            map.removeInteraction(drawInteraction);
        }
        drawInteraction = drawControls[type];
        map.addInteraction(drawInteraction);
        drawInteraction.on('drawend', function(evt) {
            const feature = evt.feature;
            const wktString = wkt.writeFeature(feature); // WKT metni burada oluşturuluyor

            // HTML içinde bir WKT input alanı varsa güncelle
            const wktInputElement = document.getElementById('wkt-input-modal');
            if (wktInputElement) {
                wktInputElement.value = wktString;
            }

            loadWktData();

            // Unique ID oluştur
            const featureId = Date.now();

            // Kullanıcıdan isim al
            const featureName = prompt("Enter a name for the feature:");

            // Sunucuya gönderilecek veri
            const data = {
                id: featureId,
                wkt: wktString,
                name: featureName || "Unnamed Feature"
            };

            // POST isteği ile sunucuya gönder
            fetch('http://localhost:5297/point', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                loadWktData();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error adding feature');
            });

            // Buton metnini sıfırla
            document.getElementById('button1').textContent = "Start Drawing";
        });
    }

    // Modal handling
    const modal = document.getElementById("wktModal");
    const btn = document.getElementById("button1");
    const span = document.getElementsByClassName("close")[0];
    const drawPointButton = document.getElementById("draw-point");
    const drawLineButton = document.getElementById("draw-line");
    const drawPolygonButton = document.getElementById("draw-polygon");
    // Open modal when button1 is clicked
    btn.onclick = function() {
        if (btn.textContent === "Exit Draw Mode") {
            // Exit draw mode
            if (drawInteraction) {
                map.removeInteraction(drawInteraction);
                drawInteraction = null;
            }
            btn.textContent = "Start Drawing";
        } else {
            modal.style.display = "block";
        }
    };

    // Close modal when user clicks on <span> (x)
    span.onclick = function() {
        modal.style.display = "none";
    };

    // Close modal when user clicks anywhere outside of the modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Draw buttons
    function handleDrawButtonClick(type) {
        addDrawInteraction(type);
        modal.style.display = "none";
        btn.textContent = "Exit Draw Mode";
    }

    drawPointButton.onclick = function() {
        handleDrawButtonClick('point');
    };

    drawLineButton.onclick = function() {
        handleDrawButtonClick('line');
    };

    drawPolygonButton.onclick = function() {
        handleDrawButtonClick('polygon');
    };

    document.getElementById('button2').addEventListener('click', showPointsInPanel);

let pointsListPanel; 

function showPointsInPanel() {
    fetch('http://localhost:5297/point')
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                const points = data.value;
                let tableContent = `
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>WKT</th>
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
                            <td>${point.wkt}</td>
                            <td>${point.name}</td>
                            <td>
                                <button class="update-button" >Güncelle</button>
                                <button class="delete-button" >Sil</button>
                                 <button class="view-button" >Haritada Gör</button>
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

// Handle Delete button click
document.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('delete-button')) {
        const row = event.target.closest('tr');
        const id = row.querySelector('td:first-child').textContent;
        deletePoint(id);
    }
});

function deletePoint(id) {
    fetch(`http://localhost:5297/point/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(() => {
        pointsListPanel.close();
        showPointsInPanel(); // Refresh the points list
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting point');
    });
};

// Handle View on Map button click
document.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('view-button')) {
        const row = event.target.closest('tr');
        const id = row.querySelector('td:first-child').textContent;
        viewOnMap(id);
    }
});

function viewOnMap(id) {
    fetch(`http://localhost:5297/point/${id}`)
        .then(response => response.json())
        .then(data => {
            const feature = wkt.readFeature(data.value.wkt);
                const geometry = feature.getGeometry();
                const coordinates = geometry.getType() === 'Point' ? geometry.getCoordinates() : geometry.getClosestPoint(map.getView().getCenter());             
                const lonLatCoordinates = ol.proj.toLonLat(coordinates);


                map.getView().animate({
                    center: ol.proj.fromLonLat(lonLatCoordinates),
                    zoom: 12,
                    duration: 1000
                });
                pointsListPanel.close();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error viewing point on map');
        });
};

// Handle Update button click
document.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('update-button')) {
        const row = event.target.closest('tr');
        const id = row.querySelector('td:first-child').textContent;
        const name = row.querySelector('td:nth-child(3)').textContent;
        openUpdatePanel(id, name);
    }
});

function openUpdatePanel(id, name) {
    jsPanel.create({
        theme: 'primary',
        headerTitle: 'Update Point',
        position: 'center-top 0 58',
        contentSize: '400 200',
        content: `
            <style>
                label { display: block; margin: 10px 0; }
                input { width: 100%; padding: 8px; }
            </style>
            <label for="update-name">Name:</label>
            <input type="text" id="update-name" value="${name}">
            <button id="save-update" style="margin-top: 10px;">Save</button>
        `,
        callback: function() {
            this.content.style.padding = '20px';
            this.header.style.backgroundColor = '#ff7700';
            this.header.style.color = 'white';

            document.getElementById('save-update').onclick = function() {
                const newName = document.getElementById('update-name').value;
                updatePoint(id, newName);
            };
        }
    });
}

async function updatePoint(id, newName) {
    try {
        // Fetch existing point data
        const response = await fetch(`http://localhost:5297/point/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data2 = await response.json();

        // Prepare updated data
        const data = {
            id: id,
            name: newName,
            wkt: data2.value.wkt // Assuming the server responds with `wkt`
        };

        // Send updated data
        const updateResponse = await fetch(`http://localhost:5297/point/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!updateResponse.ok) {
            throw new Error(`Network response was not ok: ${updateResponse.statusText}`);
        }

        // Close panel and refresh points list
        pointsListPanel.close();
        showPointsInPanel(); // Refresh the points list

    } catch (error) {
        console.error('Error:', error);
        alert('Error updating point: ' + error.message);
    }
}

});


