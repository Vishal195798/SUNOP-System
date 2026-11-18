// =====================================
// SUNOP - Main JavaScript
// =====================================


// =====================================
// Global Data
// =====================================

let solarPlants = [];

let solarData = {
    voltage: 0,
    current: 0,
    power: 0,
    temperature: 0,
    energyToday: 0,
    plantId: 0,
    plantName: "",
    location: "",
    capacity: 0,
    totalPanels: 0
};


// =====================================
// Chart Variables
// =====================================

let powerChart = null;
let energyHistoryChart = null;
let plantEnergyChart = null;

let powerValues = [];
let timeLabels = [];
let lastPlottedReadingId = null;


// =====================================
// Get Solar Data
// =====================================

function getSolarDataFromBackend() {

    fetch("http://localhost:8080/solar/latest")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Solar API Error: " +
                    response.status
                );
            }

            return response.json();

        })

        .then(data => {

            console.log("Solar Data:", data);

            if (!data || data.id == null) {
                console.log("No solar data found yet");
                return;
            }

            const latestData = data;

            solarData.plantId =
                latestData.plantId || 0;

            solarData.voltage =
                latestData.voltage || 0;

            solarData.current =
                latestData.current || 0;

            solarData.power =
                latestData.power || 0;

            solarData.temperature =
                latestData.temperature || 0;

            solarData.energyToday =
                latestData.energyToday || 0;

            solarData.plantName =
                latestData.plantName || "";

            solarData.location =
                latestData.location || "";

            solarData.capacity =
                latestData.capacity || 0;

            solarData.totalPanels =
                latestData.totalPanels || 0;


            // Dashboard

            const dashboardPower =
                document.getElementById("dashboardPower");

            if (dashboardPower) {
                dashboardPower.innerText =
                    Number(latestData.power ?? 0).toFixed(2) + " W";
            }


            const dashboardEnergy =
                document.getElementById("dashboardEnergy");

            if (dashboardEnergy) {
                dashboardEnergy.innerText =
                    latestData.energyToday + " kWh";
            }


            const dashboardTemperature =
                document.getElementById("dashboardTemperature");

            if (dashboardTemperature) {
                dashboardTemperature.innerText =
                    latestData.temperature + " °C";
            }
// Live Monitoring

            const voltageValue =
                document.getElementById("voltageValue");

            if (voltageValue) {
                voltageValue.innerText =
                    latestData.voltage + " V";
            }


            const currentValue =
                document.getElementById("currentValue");

            if (currentValue) {
                currentValue.innerText =
                    latestData.current + " A";
            }


            const powerValue =
                document.getElementById("powerValue");

            if (powerValue) {
                powerValue.innerText =
                    Number(latestData.power ?? 0).toFixed(2) + " W";
            }


            const temperatureValue =
                document.getElementById("temperatureValue");

            if (temperatureValue) {
                temperatureValue.innerText =
                    latestData.temperature + " °C";
            }


            const energyTodayValue =
                document.getElementById("energyTodayValue");

            if (energyTodayValue) {
                energyTodayValue.innerText =
                    latestData.energyToday + " kWh";
            }
// Power graph

            if (latestData.id !== lastPlottedReadingId) {
                updatePowerChart(Number(latestData.power ?? 0));
                lastPlottedReadingId = latestData.id;
            }

        })

        .catch(error => {

            console.error(
                "Backend Error:",
                error
            );

        });

}


// =====================================
// Get All Solar Plants
// =====================================

function getAllSolarPlants() {

    fetch("http://localhost:8080/plants")
        .then(response => {
            if (!response.ok) {
                throw new Error("Plants API Error: " + response.status);
            }
            return response.json();
        })
        .then(plants => {
            console.log("Solar Plants:", plants);
            solarPlants = Array.isArray(plants) ? plants : [];

            const container = document.getElementById("plantsContainer");
            if (container) {
                container.innerHTML = "";
                if (solarPlants.length === 0) {
                    container.innerHTML = "<p>No solar plants found.</p>";
                } else {
                    solarPlants.forEach(plant => {
                        const card = document.createElement("div");
                        card.className = "plant-section";
                        card.innerHTML = `
                            <h2>${plant.plantName ?? "Solar Plant"}</h2>
                            <p><strong>Location:</strong> ${plant.location ?? "-"}</p>
                            <p><strong>Capacity:</strong> ${plant.capacity ?? 0} kW</p>
                            <p><strong>Total Panels:</strong> ${plant.totalPanels ?? 0}</p>
                        `;
                        container.appendChild(card);
                    });
                }
            }

            // Keep the plant selector used by the plant-wise reports.
            const reportPlant = document.getElementById("reportPlant");
            if (reportPlant) {
                const selectedValue = reportPlant.value;
                reportPlant.innerHTML = '<option value="">Select Solar Plant</option>';
                solarPlants.forEach(plant => {
                    const option = document.createElement("option");
                    option.value = plant.id;
                    option.textContent = plant.plantName ?? `Plant ${plant.id}`;
                    reportPlant.appendChild(option);
                });
                if (solarPlants.some(plant => String(plant.id) === selectedValue)) {
                    reportPlant.value = selectedValue;
                }
            }
        })
        .catch(error => {
            console.error("Plants Error:", error);
            const container = document.getElementById("plantsContainer");
            if (container) {
                container.innerHTML = "<p>Unable to load solar plants.</p>";
            }
        });
}

// =====================================
// Energy Reports
// =====================================

function getEnergyReports() {

    fetch("http://localhost:8080/reports")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Reports API Error: " +
                    response.status
                );
            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Reports:",
                data
            );


            const todayEnergy =
                document.getElementById(
                    "todayEnergy"
                );

            if (todayEnergy) {
                todayEnergy.innerText =
                    Number(data.today || 0).toFixed(1) +
                    " kWh";
            }


            const weeklyEnergy =
                document.getElementById(
                    "weeklyEnergy"
                );

            if (weeklyEnergy) {
                weeklyEnergy.innerText =
                    Number(data.weekly || 0).toFixed(1) +
                    " kWh";
            }


            const monthlyEnergy =
                document.getElementById(
                    "monthlyEnergy"
                );

            if (monthlyEnergy) {
                monthlyEnergy.innerText =
                    Number(data.monthly || 0).toFixed(1) +
                    " kWh";
            }

        })

        .catch(error => {

            console.error(
                "Reports Error:",
                error
            );

        });

}


// =====================================
// Daily Energy History
// =====================================

function getDailyEnergyHistory() {

    fetch("http://localhost:8080/reports/daily")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Daily Reports API Error: " +
                    response.status
                );
            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Daily Energy History:",
                data
            );


            // Table

            const table =
                document.getElementById(
                    "dailyEnergyTable"
                );

            if (table) {

                table.innerHTML = "";

                if (data.length === 0) {

                    table.innerHTML = `
                        <tr>
                            <td colspan="2">
                                No daily energy data available
                            </td>
                        </tr>
                    `;

                } else {

                    data.forEach(item => {

                        const row =
                            document.createElement("tr");

                        row.innerHTML = `
                            <td>${item.date}</td>
                            <td>
                                ${Number(item.energy).toFixed(2)}
                                kWh
                            </td>
                        `;

                        table.appendChild(row);

                    });

                }

            }


            // Graph

            const canvas =
                document.getElementById(
                    "energyHistoryChart"
                );

            if (!canvas) {
                return;
            }

            const labels =
                data.map(item => item.date);

            const values =
                data.map(
                    item => Number(item.energy)
                );


            if (energyHistoryChart) {
                energyHistoryChart.destroy();
            }


            energyHistoryChart =
                new Chart(
                    canvas,
                    {
                        type: "bar",

                        data: {

                            labels: labels,

                            datasets: [
                                {
                                    label:
                                        "Energy Generated (kWh)",

                                    data: values,

                                    borderWidth: 1
                                }
                            ]

                        },

                        options: {

                            responsive: true,

                            scales: {

                                y: {
                                    beginAtZero: true,

                                    title: {
                                        display: true,
                                        text: "Energy (kWh)"
                                    }
                                },

                                x: {
                                    title: {
                                        display: true,
                                        text: "Date"
                                    }
                                }

                            }

                        }

                    }
                );

        })

        .catch(error => {

            console.error(
                "Daily History Error:",
                error
            );

        });

}


// =====================================
// Plant-wise Report
// =====================================

function getPlantWiseReport() {

    const dropdown =
        document.getElementById(
            "reportPlant"
        );

    const table =
        document.getElementById(
            "plantDailyEnergyTable"
        );

    if (!dropdown || !table) {
        return;
    }

    const plantId =
        Number(dropdown.value);


    if (!plantId) {

        table.innerHTML = `
            <tr>
                <td colspan="2">
                    Select a solar plant
                </td>
            </tr>
        `;


        if (plantEnergyChart) {

            plantEnergyChart.destroy();

            plantEnergyChart = null;

        }

        return;
    }


    fetch(
        `http://localhost:8080/reports/plant/${plantId}`
    )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Plant Report API Error: " +
                    response.status
                );

            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Plant-wise Report:",
                data
            );


            // Table

            table.innerHTML = "";

            if (data.length === 0) {

                table.innerHTML = `
                    <tr>
                        <td colspan="2">
                            No energy data available
                        </td>
                    </tr>
                `;

            } else {

                data.forEach(item => {

                    const row =
                        document.createElement("tr");

                    row.innerHTML = `
                        <td>${item.date}</td>
                        <td>
                            ${Number(item.energy).toFixed(2)}
                            kWh
                        </td>
                    `;

                    table.appendChild(row);

                });

            }


            // Graph

            const canvas =
                document.getElementById(
                    "plantEnergyChart"
                );

            if (!canvas) {
                return;
            }


            const labels =
                data.map(item => item.date);

            const values =
                data.map(
                    item => Number(item.energy)
                );


            if (plantEnergyChart) {
                plantEnergyChart.destroy();
            }


            plantEnergyChart =
                new Chart(
                    canvas,
                    {
                        type: "bar",

                        data: {

                            labels: labels,

                            datasets: [
                                {
                                    label:
                                        "Energy Generated (kWh)",

                                    data: values,

                                    borderWidth: 1
                                }
                            ]

                        },

                        options: {

                            responsive: true,

                            scales: {

                                y: {
                                    beginAtZero: true,

                                    title: {
                                        display: true,
                                        text: "Energy (kWh)"
                                    }
                                },

                                x: {
                                    title: {
                                        display: true,
                                        text: "Date"
                                    }
                                }

                            }

                        }

                    }
                );

        })

        .catch(error => {

            console.error(
                "Plant-wise Report Error:",
                error
            );

            table.innerHTML = `
                <tr>
                    <td colspan="2">
                        Failed to load plant report
                    </td>
                </tr>
            `;

        });

}


// =====================================
// Setup Plant-wise Report
// =====================================

function setupPlantWiseReport() {

    const dropdown =
        document.getElementById(
            "reportPlant"
        );

    if (!dropdown) {
        return;
    }

    dropdown.addEventListener(
        "change",
        getPlantWiseReport
    );

}


// =====================================
// Alerts
// =====================================

// =====================================
// Get Current Alerts
// =====================================

function getAlerts() {

    fetch("http://localhost:8080/alerts")

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Alerts API Error: " +
                    response.status
                );

            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Current Alerts:",
                data
            );


            const alertsList =
                document.getElementById(
                    "alertsList"
                );


            if (!alertsList) {
                return;
            }


            alertsList.innerHTML = "";


            // =================================
            // No Alerts
            // =================================

            if (
                !Array.isArray(data) ||
                data.length === 0
            ) {

                alertsList.innerHTML = `

                    <div class="alert-card alert-info">

                        <div class="alert-icon">
                            ℹ
                        </div>

                        <div class="alert-content">

                            <h3>No Alerts</h3>

                            <p>
                                No alert information available.
                            </p>

                        </div>

                    </div>

                `;

            }


            // =================================
            // Create Alert Cards
            // =================================

            data.forEach(alert => {

                const card =
                    document.createElement("div");


                const icon =
                    document.createElement("div");


                const content =
                    document.createElement("div");


                card.className =
                    "alert-card";


                icon.className =
                    "alert-icon";


                content.className =
                    "alert-content";


                // =================================
                // CRITICAL
                // =================================

                if (
                    alert.level ===
                    "CRITICAL"
                ) {

                    card.classList.add(
                        "alert-critical"
                    );

                    icon.innerText =
                        "🔴";


                    content.innerHTML = `

                        <h3>
                            CRITICAL ALERT
                        </h3>

                        <p>
                            ${alert.message}
                        </p>

                    `;

                }


                // =================================
                // WARNING
                // =================================

                else if (
                    alert.level ===
                    "WARNING"
                ) {

                    card.classList.add(
                        "alert-warning"
                    );

                    icon.innerText =
                        "⚠";


                    content.innerHTML = `

                        <h3>
                            WARNING
                        </h3>

                        <p>
                            ${alert.message}
                        </p>

                    `;

                }


                // =================================
                // INFO
                // =================================

                else if (
                    alert.level ===
                    "INFO"
                ) {

                    card.classList.add(
                        "alert-info"
                    );

                    icon.innerText =
                        "ℹ";


                    content.innerHTML = `

                        <h3>
                            INFORMATION
                        </h3>

                        <p>
                            ${alert.message}
                        </p>

                    `;

                }


                // =================================
                // NORMAL / OK
                // =================================

                else {

                    card.classList.add(
                        "alert-normal"
                    );

                    icon.innerText =
                        "✓";


                    content.innerHTML = `

                        <h3>
                            SYSTEM NORMAL
                        </h3>

                        <p>
                            ${alert.message}
                        </p>

                    `;

                }


                card.appendChild(icon);

                card.appendChild(content);

                alertsList.appendChild(card);

            });

        })

        .catch(error => {

            console.error(
                "Alerts Error:",
                error
            );


            const alertsList =
                document.getElementById(
                    "alertsList"
                );


            if (!alertsList) {
                return;
            }


            alertsList.innerHTML = `

                <div class="alert-card alert-info">

                    <div class="alert-icon">
                        ℹ
                    </div>

                    <div class="alert-content">

                        <h3>
                            Unable to Load Alerts
                        </h3>

                        <p>
                            Please check the backend connection.
                        </p>

                    </div>

                </div>

            `;

        });


    // Load history

    getAlertHistory();

}

// =====================================
// Get Alert History
// =====================================

function getAlertHistory() {

    const table =
        document.getElementById(
            "alertHistoryTable"
        );

    if (!table) {
        return;
    }


    fetch("http://localhost:8080/alerts/history")

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Alert History API Error: " +
                    response.status
                );

            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Alert History:",
                data
            );

            table.innerHTML = "";


            // =================================
            // No Alert History
            // =================================

            if (
                !Array.isArray(data) ||
                data.length === 0
            ) {

                table.innerHTML = `
                    <tr>
                        <td colspan="4">
                            No alert history available
                        </td>
                    </tr>
                `;

                return;
            }


            // =================================
            // Display Alert History
            // =================================

            data.forEach(alert => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `
                    <td>
                        ${alert.dateTime}
                    </td>

                    <td>
                        ${alert.plantName}
                    </td>

                    <td>
                        ${alert.level}
                    </td>

                    <td>
                        ${alert.message}
                    </td>
                `;


                table.appendChild(row);

            });

        })

        .catch(error => {

            console.error(
                "Alert History Error:",
                error
            );


            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        Unable to load alert history
                    </td>
                </tr>
            `;

        });

}

// =====================================
// Settings
// =====================================

function getSettingsData() {

    fetch("http://localhost:8080/settings")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Settings API Error: " +
                    response.status
                );
            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Settings:",
                data
            );


            const plantName =
                document.getElementById(
                    "settingsPlantName"
                );

            if (plantName) {
                plantName.innerText =
                    data.plantName || "---";
            }


            const location =
                document.getElementById(
                    "settingsLocation"
                );

            if (location) {
                location.innerText =
                    data.location || "---";
            }


            const capacity =
                document.getElementById(
                    "settingsCapacity"
                );

            if (capacity) {
                capacity.innerText =
                    (data.capacity || 0) +
                    " kW";
            }


            const panels =
                document.getElementById(
                    "settingsPanels"
                );

            if (panels) {
                panels.innerText =
                    data.totalPanels || 0;
            }

        })

        .catch(error => {

            console.error(
                "Settings Error:",
                error
            );

        });

}

// =====================================
// Check System Status
// =====================================

function checkSystemStatus() {

    const backendStatus =
        document.getElementById(
            "backendStatus"
        );

    const solarApiStatus =
        document.getElementById(
            "solarApiStatus"
        );

    const plantsApiStatus =
        document.getElementById(
            "plantsApiStatus"
        );

    const databaseStatus =
        document.getElementById(
            "databaseStatus"
        );


    // Backend / Solar API

    fetch("http://localhost:8080/solar/latest")

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Solar API failed"
                );

            }

            return response.json();

        })

        .then(() => {

            if (backendStatus) {
                backendStatus.innerText =
                    "✓ Connected";
            }

            if (solarApiStatus) {
                solarApiStatus.innerText =
                    "✓ Working";
            }

            if (databaseStatus) {
                databaseStatus.innerText =
                    "✓ Connected through API";
            }

        })

        .catch(error => {

            console.error(
                "System Status Error:",
                error
            );

            if (backendStatus) {
                backendStatus.innerText =
                    "✗ Not Connected";
            }

            if (solarApiStatus) {
                solarApiStatus.innerText =
                    "✗ Not Working";
            }

            if (databaseStatus) {
                databaseStatus.innerText =
                    "✗ Not Available";
            }

        });


    // Plants API

    fetch("http://localhost:8080/plants")

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Plants API failed"
                );

            }

            return response.json();

        })

        .then(() => {

            if (plantsApiStatus) {
                plantsApiStatus.innerText =
                    "✓ Working";
            }

        })

        .catch(error => {

            console.error(
                "Plants API Error:",
                error
            );

            if (plantsApiStatus) {
                plantsApiStatus.innerText =
                    "✗ Not Working";
            }

        });

}

// =====================================
// Refresh Settings
// =====================================

function refreshSettings() {

    const message =
        document.getElementById(
            "settingsRefreshMessage"
        );

    if (message) {

        message.innerText =
            "Refreshing settings...";

    }


    getSettingsData();

    getAllSolarPlants();

    checkSystemStatus();


    setTimeout(() => {

        if (message) {

            message.innerText =
                "✓ Settings refreshed successfully";

        }

    }, 1000);

}


// =====================================
// Navigation
// =====================================

function hideAllSections() {

    const sections = [

        "dashboardSection",
        "solarPlantsSection",
        "monitoringSection",
        "reportsSection",
        "alertsSection",
        "settingsSection"

    ];


    sections.forEach(id => {

        const section =
            document.getElementById(id);

        if (section) {
            section.style.display = "none";
        }

    });

}


// Dashboard

function showDashboard() {

    hideAllSections();

    const section =
        document.getElementById(
            "dashboardSection"
        );

    if (section) {
        section.style.display = "block";
    }

}


// Solar Plants

function showSolarPlants() {

    hideAllSections();

    const section =
        document.getElementById(
            "solarPlantsSection"
        );

    if (section) {
        section.style.display = "block";
    }

}


// Monitoring

function showMonitoring() {

    hideAllSections();

    const section =
        document.getElementById(
            "monitoringSection"
        );

    if (section) {
        section.style.display = "block";
    }

}


// Reports

function showReports() {

    hideAllSections();

    const section =
        document.getElementById(
            "reportsSection"
        );

    if (section) {
        section.style.display = "block";
    }

}


// Alerts

function showAlerts() {

    hideAllSections();

    const section =
        document.getElementById(
            "alertsSection"
        );

    if (section) {
        section.style.display = "block";
    }

}


// Settings

function showSettings() {

    hideAllSections();

    const section =
        document.getElementById(
            "settingsSection"
        );

    if (section) {
        section.style.display = "block";
    }

}


// =====================================
// Power Chart
// =====================================

function createPowerChart() {

    const canvas =
        document.getElementById(
            "powerChart"
        );

    if (!canvas) {
        return;
    }


    powerChart =
        new Chart(
            canvas,
            {
                type: "line",

                data: {

                    labels: timeLabels,

                    datasets: [

                        {
                            label:
                                "Power (W)",

                            data:
                                powerValues,

                            borderWidth: 2,

                            tension: 0.3
                        }

                    ]

                },

                options: {

                    responsive: true,

                    scales: {

                        y: {
                            beginAtZero: true
                        }

                    }

                }

            }
        );

}


// =====================================
// Update Power Chart
// =====================================

function updatePowerChart(power) {

    if (!powerChart) {
        return;
    }


    const currentTime =
        new Date().toLocaleTimeString();


    timeLabels.push(
        currentTime
    );


    powerValues.push(
        power
    );


    if (timeLabels.length > 10) {

        timeLabels.shift();

        powerValues.shift();

    }


    powerChart.data.labels =
        timeLabels;

    powerChart.data.datasets[0].data =
        powerValues;

    powerChart.update();

}


// =====================================
// Message Helper
// =====================================

function showMessage(elementId, message, type) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.innerText = message;

    element.className = "";

    if (type === "success") {

        element.classList.add(
            "message-success"
        );

    } else if (type === "error") {

        element.classList.add(
            "message-error"
        );

    } else {

        element.classList.add(
            "message-info"
        );
    }
}


// =====================================
// Start Application
// =====================================

createPowerChart();


setupPlantWiseReport();

showDashboard();

getSolarDataFromBackend();

getAllSolarPlants();

getEnergyReports();

getDailyEnergyHistory();

getAlerts();

getSettingsData();
checkSystemStatus();

// =====================================
// Automatic Refresh
// =====================================

setInterval(
    getSolarDataFromBackend,
    2000
);


setInterval(
    getAllSolarPlants,
    10000
);


setInterval(
    getEnergyReports,
    10000
);


setInterval(
    getDailyEnergyHistory,
    10000
);


setInterval(
    getAlerts,
    5000
);


setInterval(
    getSettingsData,
    10000
);


function logout() {

    localStorage.removeItem("sunopLoggedIn");

    localStorage.removeItem("sunopUsername");

    localStorage.removeItem("sunopRole");

    window.location.href = "login.html";
}