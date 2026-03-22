var db;

document.addEventListener('deviceready', function() {
    db = window.sqlitePlugin.openDatabase({name: 'finance.db', location: 'default'}, function() {
        console.log("DB Opened");

        db.transaction(function(tx) {
            // Create table if not exists
            tx.executeSql(`CREATE TABLE IF NOT EXISTS records (
                recordNumber INTEGER PRIMARY KEY AUTOINCREMENT,
                year INTEGER,
                month TEXT,
                amount REAL,
                type TEXT,
                category TEXT
            );`);

            // Ensure 'amount' column exists (in case old table was missing it)
            tx.executeSql("PRAGMA table_info(records);", [], function(tx, res){
                let hasAmount = false;
                for(let i=0;i<res.rows.length;i++){
                    if(res.rows.item(i).name === "amount") hasAmount = true;
                }
                if(!hasAmount){
                    tx.executeSql("ALTER TABLE records ADD COLUMN amount REAL;", [], function(){
                        console.log("Added missing 'amount' column");
                    });
                }
            });
        }, function(error){
            console.log("DB Error: " + error.message);
        });
    }, function(error){
        console.log("Open DB Error: " + error.message);
    });
}, false);