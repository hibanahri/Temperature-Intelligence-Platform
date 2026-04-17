const API_URL = 'http://localhost:5000';

// Comparison history storage
let comparisonHistory = [];

// Alerts history storage
let alertsHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeForm();
    initializeComparisonForm();
    initializeCharts();
    setDefaultDateTime();
    setupRollingAverageCalculation();
});

// Tab Navigation
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Form Initialization
function initializeForm() {
    const form = document.getElementById('predictionForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handlePrediction();
    });
}

// Setup rolling average auto-calculation
function setupRollingAverageCalculation() {
    const tempLag1 = document.getElementById('tempLag1');
    const tempLag24 = document.getElementById('tempLag24');
    const rollingMean24 = document.getElementById('rollingMean24');

    function calculateRollingAverage() {
        const lag1 = parseFloat(tempLag1.value) || 0;
        const lag24 = parseFloat(tempLag24.value) || 0;
        const avg = ((lag1 + lag24) / 2).toFixed(1);
        rollingMean24.value = avg;
    }

    tempLag1.addEventListener('input', calculateRollingAverage);
    tempLag24.addEventListener('input', calculateRollingAverage);

    // Also setup for comparison form
    const compTempLag1 = document.getElementById('compTempLag1');
    const compTempLag24 = document.getElementById('compTempLag24');
    const compRollingMean = document.getElementById('compRollingMean');

    function calculateCompRollingAverage() {
        const lag1 = parseFloat(compTempLag1.value) || 0;
        const lag24 = parseFloat(compTempLag24.value) || 0;
        const avg = ((lag1 + lag24) / 2).toFixed(1);
        compRollingMean.value = avg;
    }

    compTempLag1.addEventListener('input', calculateCompRollingAverage);
    compTempLag24.addEventListener('input', calculateCompRollingAverage);
}

// Comparison Form Initialization
function initializeComparisonForm() {
    const form = document.getElementById('comparisonForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleComparison();
    });

    const now = new Date();
    document.getElementById('compDate').valueAsDate = now;
    document.getElementById('compTime').value = now.toTimeString().slice(0, 5);
}

// Set default date and time
function setDefaultDateTime() {
    const now = new Date();
    document.getElementById('date').valueAsDate = now;
    document.getElementById('time').value = now.toTimeString().slice(0, 5);
}

// Calculate rolling average manually
function calculateRollingAvg() {
    const tempLag1 = parseFloat(document.getElementById('tempLag1').value) || 0;
    const tempLag24 = parseFloat(document.getElementById('tempLag24').value) || 0;
    const avg = ((tempLag1 + tempLag24) / 2).toFixed(1);
    document.getElementById('rollingMean24').value = avg;
}

// Sample data loaders for Prediction tab
function loadSampleIn() {
    document.getElementById('roomId').value = 'Room_101';
    document.getElementById('date').value = '2018-12-08';
    document.getElementById('time').value = '09:26';
    document.getElementById('tempLag1').value = '29';
    document.getElementById('tempLag24').value = '28';
    document.getElementById('rollingMean24').value = '28.5';
    document.getElementById('location').value = 'indoor';
    document.getElementById('tempMin').value = '18';
    document.getElementById('tempMax').value = '25';
}

function loadSampleOut() {
    document.getElementById('roomId').value = 'Room_101';
    document.getElementById('date').value = '2018-12-08';
    document.getElementById('time').value = '09:25';
    document.getElementById('tempLag1').value = '42';
    document.getElementById('tempLag24').value = '40';
    document.getElementById('rollingMean24').value = '41';
    document.getElementById('location').value = 'outdoor';
    document.getElementById('tempMin').value = '18';
    document.getElementById('tempMax').value = '25';
}

// Sample data loaders for Comparison tab
function loadCompSampleIn() {
    document.getElementById('compRoomId').value = 'Room_101';
    document.getElementById('compDate').value = '2018-12-08';
    document.getElementById('compTime').value = '09:26';
    document.getElementById('compTempLag1').value = '29';
    document.getElementById('compTempLag24').value = '28';
    document.getElementById('compRollingMean').value = '28.5';
    document.getElementById('compLocation').value = 'indoor';
    document.getElementById('compTempMin').value = '18';
    document.getElementById('compTempMax').value = '25';
    document.getElementById('actualTemp').value = '29';
}

function loadCompSampleOut() {
    document.getElementById('compRoomId').value = 'Room_101';
    document.getElementById('compDate').value = '2018-12-08';
    document.getElementById('compTime').value = '09:25';
    document.getElementById('compTempLag1').value = '42';
    document.getElementById('compTempLag24').value = '40';
    document.getElementById('compRollingMean').value = '41';
    document.getElementById('compLocation').value = 'outdoor';
    document.getElementById('compTempMin').value = '18';
    document.getElementById('compTempMax').value = '25';
    document.getElementById('actualTemp').value = '42';
}

// Handle Prediction
async function handlePrediction() {
    const btn = document.getElementById('predictBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    const tempLag1 = parseFloat(document.getElementById('tempLag1').value);
    const tempLag24 = parseFloat(document.getElementById('tempLag24').value);
    const rollingMean = parseFloat(document.getElementById('rollingMean24').value);
    
    // Auto-calculate rolling mean if not manually set
    const calculatedRollingMean = rollingMean || ((tempLag1 + tempLag24) / 2);

    // Get user email from localStorage
    const user = getUser();
    const userEmail = user ? user.email : null;
    console.log('User data:', user);
    console.log('User email:', userEmail);

    const formData = {
        room_id: document.getElementById('roomId').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        temp_min: parseFloat(document.getElementById('tempMin').value),
        temp_max: parseFloat(document.getElementById('tempMax').value),
        temp_lag_1: tempLag1,
        temp_lag_24: tempLag24,
        rolling_mean_24: calculatedRollingMean,
        location: document.getElementById('location').value,
        user_email: userEmail
    };
    console.log('Form data being sent:', formData);

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.status === 'success') {
            displayPrediction(formData, data);
        } else {
            showError(data.error || 'Prediction failed');
        }
    } catch (error) {
        showError('Error connecting to server: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generate Prediction';
    }
}

// Display Prediction Results
function displayPrediction(inputData, result) {
    const resultsContent = document.getElementById('resultsContent');
    
    const temp = result.prediction;
    const tempChange = temp - inputData.temp_lag_1;
    const confidence = result.confidence || 92.5;
    const minThreshold = inputData.temp_min;
    const maxThreshold = inputData.temp_max;
    
    // Sync thresholds to alerts tab
    updateAlertCards();
    
    let status, statusClass, recommendation, alertHtml = '';
    let alertType = null;
    
    // Check thresholds and determine status
    if (temp < minThreshold) {
        status = 'COLD ALERT';
        statusClass = 'cold';
        alertType = 'cold';
        recommendation = 'Predicted temperature (' + temp.toFixed(1) + 'C) is BELOW minimum threshold (' + minThreshold + 'C). Immediate action recommended: check heating systems or insulation.';
        alertHtml = `<div class="alert-banner cold-alert">ALERT: Temperature below ${minThreshold}C threshold</div>`;
    } else if (temp > maxThreshold) {
        status = 'HOT ALERT';
        statusClass = 'hot';
        alertType = 'hot';
        recommendation = 'Predicted temperature (' + temp.toFixed(1) + 'C) is ABOVE maximum threshold (' + maxThreshold + 'C). Immediate action recommended: check cooling systems or ventilation.';
        alertHtml = `<div class="alert-banner hot-alert">ALERT: Temperature above ${maxThreshold}C threshold</div>`;
    } else {
        status = 'NORMAL';
        statusClass = 'optimal';
        recommendation = 'Predicted temperature (' + temp.toFixed(1) + 'C) is within acceptable range (' + minThreshold + 'C - ' + maxThreshold + 'C). No immediate action required.';
    }
    
    // Add to alerts history if threshold exceeded
    if (alertType) {
        const now = new Date();
        const timestamp = now.toLocaleString();
        addAlert(alertType, temp, inputData.room_id, timestamp);
    }

    resultsContent.innerHTML = `
        <div class="prediction-result">
            ${alertHtml}
            <div class="temp-display ${statusClass}">
                <div class="temp-status">Status: ${status}</div>
                <div class="temp-value">${temp.toFixed(1)} C</div>
                <div class="temp-label">Predicted Temperature</div>
                <div class="temp-confidence">Confidence: ${confidence.toFixed(1)}%</div>
            </div>

            <div class="threshold-info">
                <div class="threshold-item">
                    <span class="threshold-label">Min Threshold:</span>
                    <span class="threshold-value">${minThreshold} C</span>
                </div>
                <div class="threshold-item">
                    <span class="threshold-label">Max Threshold:</span>
                    <span class="threshold-value">${maxThreshold} C</span>
                </div>
                <div class="threshold-item">
                    <span class="threshold-label">Rolling Avg (24h):</span>
                    <span class="threshold-value">${inputData.rolling_mean_24.toFixed(1)} C</span>
                </div>
            </div>

            <div class="recommendation-box ${statusClass !== 'optimal' ? 'alert-recommendation' : ''}">
                <h4>Recommendation</h4>
                <p>${recommendation}</p>
            </div>

            <div class="trend-box">
                <span class="trend-label">Temperature Trend (vs 1h ago)</span>
                <span class="trend-value ${tempChange >= 0 ? 'up' : 'down'}">
                    ${tempChange >= 0 ? '+' : ''}${tempChange.toFixed(2)} C
                </span>
            </div>
        </div>
    `;
}

// Handle Comparison
async function handleComparison() {
    const tempLag1 = parseFloat(document.getElementById('compTempLag1').value);
    const tempLag24 = parseFloat(document.getElementById('compTempLag24').value);
    const rollingMean = parseFloat(document.getElementById('compRollingMean').value);
    
    const calculatedRollingMean = rollingMean || ((tempLag1 + tempLag24) / 2);

    const formData = {
        room_id: document.getElementById('compRoomId').value,
        date: document.getElementById('compDate').value,
        time: document.getElementById('compTime').value,
        temp_min: parseFloat(document.getElementById('compTempMin').value),
        temp_max: parseFloat(document.getElementById('compTempMax').value),
        temp_lag_1: tempLag1,
        temp_lag_24: tempLag24,
        rolling_mean_24: calculatedRollingMean,
        location: document.getElementById('compLocation').value
    };

    const actualTemp = parseFloat(document.getElementById('actualTemp').value);

    if (isNaN(actualTemp)) {
        alert('Please enter a valid actual temperature value.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.status === 'success') {
            displayComparison(actualTemp, data.prediction, formData);
        } else {
            alert('Prediction failed: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error connecting to server: ' + error.message);
    }
}

// Display Comparison Results
function displayComparison(actual, predicted, inputData) {
    const resultsDiv = document.getElementById('comparisonResults');
    resultsDiv.style.display = 'block';

    const difference = actual - predicted;
    const absoluteError = Math.abs(difference);
    const percentageError = Math.abs(difference / actual) * 100;
    const squaredError = Math.pow(difference, 2);

    let rating, ratingClass, accuracyPercent;
    if (absoluteError <= 0.5) {
        rating = 'Excellent';
        ratingClass = 'rating-excellent';
        accuracyPercent = 95;
    } else if (absoluteError <= 1.0) {
        rating = 'Good';
        ratingClass = 'rating-good';
        accuracyPercent = 75;
    } else if (absoluteError <= 2.0) {
        rating = 'Fair';
        ratingClass = 'rating-fair';
        accuracyPercent = 50;
    } else {
        rating = 'Poor';
        ratingClass = 'rating-poor';
        accuracyPercent = 20;
    }

    document.getElementById('displayActual').textContent = actual.toFixed(2);
    document.getElementById('displayPredicted').textContent = predicted.toFixed(2);
    document.getElementById('displayDifference').textContent = (difference >= 0 ? '+' : '') + difference.toFixed(2);

    document.getElementById('metricAE').textContent = absoluteError.toFixed(3) + ' C';
    document.getElementById('metricPE').textContent = percentageError.toFixed(2) + '%';
    document.getElementById('metricSE').textContent = squaredError.toFixed(4);
    document.getElementById('metricAccuracy').textContent = rating;
    document.getElementById('metricAccuracy').className = 'metric-value ' + ratingClass;

    const accuracyFill = document.getElementById('accuracyFill');
    accuracyFill.style.left = `calc(${accuracyPercent}% - 10px)`;

    const historyEntry = {
        timestamp: `${inputData.date} ${inputData.time}`,
        room: inputData.room_id,
        actual: actual,
        predicted: predicted,
        error: absoluteError,
        percentError: percentageError,
        rating: rating,
        ratingClass: ratingClass
    };

    comparisonHistory.unshift(historyEntry);
    updateHistoryTable();
    updateAggregateMetrics();

    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update History Table
function updateHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    
    if (comparisonHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-table">No comparison data available. Submit a comparison to begin.</td></tr>';
        return;
    }

    tbody.innerHTML = comparisonHistory.map(entry => `
        <tr>
            <td>${entry.timestamp}</td>
            <td>${entry.room}</td>
            <td>${entry.actual.toFixed(2)}</td>
            <td>${entry.predicted.toFixed(2)}</td>
            <td>${entry.error.toFixed(3)}</td>
            <td>${entry.percentError.toFixed(2)}%</td>
            <td class="${entry.ratingClass}">${entry.rating}</td>
        </tr>
    `).join('');
}

// Update Aggregate Metrics
function updateAggregateMetrics() {
    if (comparisonHistory.length === 0) {
        document.getElementById('aggregateMetrics').style.display = 'none';
        return;
    }

    document.getElementById('aggregateMetrics').style.display = 'block';

    const mae = comparisonHistory.reduce((sum, entry) => sum + entry.error, 0) / comparisonHistory.length;
    const mse = comparisonHistory.reduce((sum, entry) => sum + Math.pow(entry.error, 2), 0) / comparisonHistory.length;
    const rmse = Math.sqrt(mse);
    const mpe = comparisonHistory.reduce((sum, entry) => sum + entry.percentError, 0) / comparisonHistory.length;

    document.getElementById('aggMAE').textContent = mae.toFixed(3) + ' C';
    document.getElementById('aggRMSE').textContent = rmse.toFixed(3) + ' C';
    document.getElementById('aggMPE').textContent = mpe.toFixed(2) + '%';
    document.getElementById('aggCount').textContent = comparisonHistory.length;
}

// Show Error
function showError(message) {
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.innerHTML = `
        <div style="background: #fee2e2; border-left: 3px solid #c53030; padding: 16px; border-radius: 4px; color: #991b1b;">
            <strong>Error:</strong> ${message}
        </div>
    `;
}

// Update Alert Cards based on prediction form thresholds
function updateAlertCards() {
    const minThreshold = parseFloat(document.getElementById('tempMin').value) || 18;
    const maxThreshold = parseFloat(document.getElementById('tempMax').value) || 25;
    
    document.getElementById('coldAlertValue').innerHTML = '&lt; ' + minThreshold + ' C';
    document.getElementById('optimalRangeValue').textContent = minThreshold + '-' + maxThreshold + ' C';
    document.getElementById('hotAlertValue').innerHTML = '&gt; ' + maxThreshold + ' C';
}

// Sync thresholds from prediction form to alerts tab
function syncThresholdsToAlerts() {
    updateAlertCards();
}

// Clear all alerts
function clearAlerts() {
    alertsHistory = [];
    updateAlertsDisplay();
}

// Add alert to history
function addAlert(type, temperature, room, timestamp) {
    alertsHistory.unshift({
        type: type,
        temperature: temperature,
        room: room,
        timestamp: timestamp
    });
    updateAlertsDisplay();
}

// Update alerts display
function updateAlertsDisplay() {
    const alertsList = document.getElementById('alertsList');
    
    if (alertsHistory.length === 0) {
        alertsList.innerHTML = '<div class="empty-state"><p>No alerts generated yet. Make predictions to generate alerts.</p></div>';
        return;
    }
    
    alertsList.innerHTML = alertsHistory.map(alert => {
        const alertClass = alert.type === 'cold' ? 'warning' : (alert.type === 'hot' ? 'danger' : 'success');
        const icon = alert.type === 'cold' ? 'COLD' : (alert.type === 'hot' ? 'HOT' : 'OK');
        return `
            <div class="alert-item ${alertClass}">
                <div class="alert-icon">${icon}</div>
                <div class="alert-content">
                    <p class="alert-title">${alert.room} - ${alert.type === 'cold' ? 'Temperature too low' : (alert.type === 'hot' ? 'Temperature too high' : 'Temperature normal')}</p>
                    <p class="alert-time">${alert.temperature.toFixed(1)} C - ${alert.timestamp}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Initialize Charts (using static visualization images now)
function initializeCharts() {
    // Charts are now static images from the visualization folder
    // No dynamic chart initialization needed
}
