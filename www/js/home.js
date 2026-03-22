function updateWidgets() {
    db.transaction(function(tx){
        tx.executeSql("SELECT SUM(amount) AS totalEarning FROM records WHERE type='Earning'", [], function(tx, res){
            var earning = res.rows.item(0).totalEarning || 0;

            tx.executeSql("SELECT SUM(amount) AS totalSpent FROM records WHERE type='Spend'", [], function(tx, res){
                var spent = res.rows.item(0).totalSpent || 0;

                document.getElementById('totalEarning').innerText = earning.toFixed(2);
                document.getElementById('totalSpent').innerText = spent.toFixed(2);
                document.getElementById('balance').innerText = (earning - spent).toFixed(2);
            });
        });
    });
}

document.addEventListener('deviceready', updateWidgets, false);