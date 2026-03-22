let records = [];
let currentPage = 1;
const recordsPerPage = 5;

function showModal(msg) {
    document.getElementById('modalText').innerText = msg;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function fetchRecords() {
    const filterType = document.getElementById('filterType').value;
    const filterYear = document.getElementById('filterYear').value;

    db.transaction(function(tx){
        let query = "SELECT * FROM records";
        let conditions = [];
        let params = [];

        if(filterType){
            conditions.push("type=?");
            params.push(filterType);
        }
        if(filterYear){
            conditions.push("year=?");
            params.push(filterYear);
        }
        if(conditions.length>0){
            query += " WHERE " + conditions.join(" AND ");
        }
        query += " ORDER BY recordNumber DESC";

        tx.executeSql(query, params, function(tx,res){
            records = [];
            for(let i=0;i<res.rows.length;i++) records.push(res.rows.item(i));
            currentPage = 1;
            renderTable();
        }, function(tx,error){ showModal("Error fetching records: "+error.message); });
    });
}

function populateFilterYears() {
    const yearSelect = document.getElementById('filterYear');
    const currentYear = new Date().getFullYear();
    for(let i = currentYear-10; i <= currentYear+10; i++){
        const option = document.createElement('option');
        option.value = i;
        option.text = i;
        yearSelect.add(option);
    }
}

function renderTable(){
    const tbody = document.getElementById('recordsBody');
    tbody.innerHTML = '';
    let start = (currentPage-1)*recordsPerPage;
    let end = Math.min(start+recordsPerPage, records.length);

    for(let i=start;i<end;i++){
        const r = records[i];
        tbody.innerHTML += `
            <tr>
                <td>${r.recordNumber}</td>
                <td>${r.year}</td>
                <td>${r.month}</td>
                <td>${r.amount.toFixed(2)}</td>
                <td>${r.type}</td>
                <td>${r.category}</td>
                <td>
                    <button onclick="editRecord(${r.recordNumber})">Edit</button>
                    <button onclick="deleteRecord(${r.recordNumber})">Delete</button>
                </td>
            </tr>
        `;
    }
    renderPagination();
}

function renderPagination(){
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(records.length/recordsPerPage);
    for(let i=1;i<=totalPages;i++){
        const btn = document.createElement('button');
        btn.innerText = i;
        if(i===currentPage) btn.style.fontWeight='bold';
        btn.addEventListener('click', ()=>{ currentPage=i; renderTable(); });
        pagination.appendChild(btn);
    }
}

function deleteRecord(id){
    if(confirm("Are you sure you want to delete this record?")){
        db.transaction(function(tx){
            tx.executeSql("DELETE FROM records WHERE recordNumber=?", [id], function(){
                showModal("Record deleted successfully!");
                fetchRecords();
            });
        });
    }
}

function editRecord(id){
    localStorage.setItem('editRecordId', id);
    window.location.href='form.html';
}

document.addEventListener('deviceready', function(){
    populateFilterYears();
    fetchRecords();
    document.getElementById('filterType').addEventListener('change', fetchRecords);
}, false);