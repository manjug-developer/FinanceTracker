function populateYears() {
    const yearSelect = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    for(let i=currentYear-10; i<=currentYear+10; i++){
        let option = document.createElement('option');
        option.value = i;
        option.text = i;
        yearSelect.add(option);
    }
}

function populateMonths() {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const monthSelect = document.getElementById('month');
    months.forEach(m => {
        let option = document.createElement('option');
        option.value = m;
        option.text = m;
        monthSelect.add(option);
    });
}

function updateCategory() {
    const type = document.getElementById('type').value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';

    let categories = [];
    if(type === 'Earning') categories = ["Salary","Stocks","PF","Mutual Fund"];
    else if(type === 'Spend') categories = ["Monthly Expence","Trip","Rent","Shopping"];

    categories.forEach(c => {
        let option = document.createElement('option');
        option.value = c;
        option.text = c;
        categorySelect.add(option);
    });
}

function showModal(msg) {
    document.getElementById('modalText').innerText = msg;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

document.addEventListener('deviceready', function(){
    populateYears();
    populateMonths();
    document.getElementById('type').addEventListener('change', updateCategory);

    const form = document.getElementById('recordForm');
    const editId = localStorage.getItem('editRecordId');

    if(editId){
        db.transaction(function(tx){
            tx.executeSql("SELECT * FROM records WHERE recordNumber=?", [editId], function(tx,res){
                if(res.rows.length>0){
                    const r = res.rows.item(0);
                    document.getElementById('year').value = r.year;
                    document.getElementById('month').value = r.month;
                    document.getElementById('amount').value = r.amount;
                    document.getElementById('type').value = r.type;
                    updateCategory();
                    document.getElementById('category').value = r.category;
                }
            });
        });

        form.addEventListener('submit', function(e){
            e.preventDefault();
            const year = document.getElementById('year').value;
            const month = document.getElementById('month').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const type = document.getElementById('type').value;
            const category = document.getElementById('category').value;

            db.transaction(function(tx){
                tx.executeSql("UPDATE records SET year=?, month=?, amount=?, type=?, category=? WHERE recordNumber=?",
                    [year, month, amount, type, category, editId],
                    function(){ showModal("Record updated successfully!"); localStorage.removeItem('editRecordId'); form.reset(); updateCategory(); },
                    function(tx,error){ showModal("Error updating record: "+error.message); }
                );
            });
        });

    } else {
        form.addEventListener('submit', function(e){
            e.preventDefault();
            const year = document.getElementById('year').value;
            const month = document.getElementById('month').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const type = document.getElementById('type').value;
            const category = document.getElementById('category').value;

            if(!year || !month || !amount || !type || !category){ showModal("All fields required"); return; }

            db.transaction(function(tx){
                tx.executeSql("INSERT INTO records (year, month, amount, type, category) VALUES (?,?,?,?,?)",
                    [year, month, amount, type, category],
                    function(){ showModal("Record saved successfully!"); form.reset(); updateCategory(); },
                    function(tx,error){ showModal("Error saving record: "+error.message); }
                );
            });
        });
    }

}, false);