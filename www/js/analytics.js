// --- 1. Global Error Catching (for debugging) ---
window.onerror = function(msg, url, line) {
    alert("Error: " + msg + "\nLine: " + line);
    return false;
};

alert("Step 1: JS file loaded");

// --- 2. Initialize App ---
const app = {
    initialize: function() {
        // Listen for Cordova's ready event
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        
        // Fallback: If deviceready doesn't fire in 3 seconds, try rendering anyway
        setTimeout(function() {
            if (!window.appReady) {
                alert("Note: deviceready timed out, forcing render...");
                app.renderCharts();
            }
        }, 3000);
    },

    onDeviceReady: function() {
        window.appReady = true;
        alert("Step 2: Device is Ready!");
        this.renderCharts();
    },

    renderCharts: function() {
        try {
            alert("Step 3: Attempting to draw charts...");

            // --- BAR CHART ---
            const barCanvas = document.getElementById('myBarChart');
            if (barCanvas) {
                new Chart(barCanvas.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                        datasets: [{
                            label: 'Daily Users',
                            data: [12, 19, 3, 5, 2],
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }

            // --- PIE CHART ---
            const pieCanvas = document.getElementById('myPieChart');
            if (pieCanvas) {
                new Chart(pieCanvas.getContext('2d'), {
                    type: 'pie',
                    data: {
                        labels: ['Android', 'iOS', 'Web'],
                        datasets: [{
                            data: [60, 30, 10],
                            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
                        }]
                    },
                    options: {
                        responsive: true
                    }
                });
            }

            alert("Step 4: Charts rendered successfully!");

        } catch (e) {
            alert("Render Error: " + e.message);
        }
    }
};

// Start the app logic
app.initialize();