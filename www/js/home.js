function animateValueFixedDuration(element, end, duration = 1000) {
    const start = 0;
    const range = end - start;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1); // 0 → 1
        element.innerText = (start + range * progress).toFixed(2);

        if (progress < 1) {
            requestAnimationFrame(step); // continue animating
        } else {
            element.innerText = end.toFixed(2); // ensure final value
        }
    }

    requestAnimationFrame(step);
}

function updateWidgets() {
    db.transaction(function(tx){
        tx.executeSql("SELECT SUM(amount) AS totalEarning FROM records WHERE type='Earning'", [], function(tx, res){
            let earning = res.rows.item(0).totalEarning || 0;

            tx.executeSql("SELECT SUM(amount) AS totalSpent FROM records WHERE type='Spend'", [], function(tx, res){
                let spent = res.rows.item(0).totalSpent || 0;
                let balance = earning - spent;

                animateValueFixedDuration(document.getElementById('totalEarning'), earning, 800);
                animateValueFixedDuration(document.getElementById('totalSpent'), spent, 800);
                animateValueFixedDuration(document.getElementById('balance'), balance, 800);
            });
        });
    });
}

document.addEventListener('deviceready', updateWidgets, false);

document.addEventListener('deviceready', function () {
    if (window.StatusBar) {
        StatusBar.backgroundColorByHexString("#2c3e50");
        StatusBar.styleLightContent();
    }
    if (window.NavigationBar) {
        NavigationBar.backgroundColorByHexString("#2c3e50");
    }
});