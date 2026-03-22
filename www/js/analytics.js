window.onerror = function(msg, url, line) {
    alert("Error: " + msg + "\nLine: " + line);
    return false;
};

const app = {
    barChart: null,
    spendPieChart: null,
    earningPieChart: null,

    initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

    setTimeout(function() {
        if (!window.appReady) {
            app.loadYearDropdown();
        }
        }, 3000);
    },

    onDeviceReady: function() {
        window.appReady = true;
        this.loadYearDropdown();
    },

    // ------------------------
    // Load Year Dropdown
    // ------------------------
    loadYearDropdown: function() {
    db.transaction(function(tx){
        tx.executeSql(
            "SELECT DISTINCT year FROM records ORDER BY year DESC",
            [],
            function(tx, res){
                const yearFilter = document.getElementById("yearFilter");
                yearFilter.innerHTML = "";

                // All Time option
                let opt = document.createElement("option");
                opt.value = "all";
                opt.text = "All Time";
                yearFilter.add(opt);

                for(let i=0; i<res.rows.length; i++){
                    let y = res.rows.item(i).year;
                    let option = document.createElement("option");
                    option.value = y;
                    option.text = y;
                    yearFilter.add(option);
                }

                // Set default selection
                yearFilter.value = "all";

                // Change event
                yearFilter.addEventListener("change", function(){
                    app.renderCharts();
                });

                // Render charts AFTER dropdown ready
                app.renderCharts();
            }
        );
    });
},

    // ------------------------
    // Render Charts
    // ------------------------
    renderCharts: function() {
        const year = document.getElementById("yearFilter").value;

        if(year === "all"){
            this.drawYearlyBarChart();
            this.drawSpendPieChart();
            this.drawEarningPieChart();
        } else {
            this.drawMonthlyBarChart(year);
            this.drawSpendPieChart(year);
            this.drawEarningPieChart(year);
        }
    },

    // ------------------------
    // Yearly Bar Chart
    // ------------------------
    drawYearlyBarChart: function() {
        db.transaction(function(tx){
            tx.executeSql(
                "SELECT year, type, SUM(amount) total FROM records GROUP BY year, type ORDER BY year",
                [],
                function(tx,res){

                    let years = [];
                    let earningData = [];
                    let spendData = [];

                    for(let i=0;i<res.rows.length;i++){
                        let r = res.rows.item(i);
                        if(!years.includes(r.year)) years.push(r.year);
                    }

                    years.forEach(function(y){
                        let earning=0, spend=0;
                        for(let i=0;i<res.rows.length;i++){
                            let r=res.rows.item(i);
                            if(r.year==y && r.type=="Earning") earning=r.total;
                            if(r.year==y && r.type=="Spend") spend=r.total;
                        }
                        earningData.push(earning);
                        spendData.push(spend);
                    });

                    if(app.barChart) app.barChart.destroy();

                    app.barChart = new Chart(document.getElementById("barChart"), {
                        type:'bar',
                        data:{
                            labels:years,
                            datasets:[
                                {label:'Earning', data:earningData, backgroundColor:'green'},
                                {label:'Spend', data:spendData, backgroundColor:'red'}
                            ]
                        }
                    });
                }
            );
        });
    },

    // ------------------------
    // Monthly Bar Chart
    // ------------------------
    drawMonthlyBarChart: function(year) {

        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

        db.transaction(function(tx){
            tx.executeSql(
                "SELECT month, type, SUM(amount) total FROM records WHERE year=? GROUP BY month, type",
                [year],
                function(tx,res){

                    let earningData = [];
                    let spendData = [];

                    months.forEach(function(m){
                        let earning=0, spend=0;
                        for(let i=0;i<res.rows.length;i++){
                            let r=res.rows.item(i);
                            if(r.month==m && r.type=="Earning") earning=r.total;
                            if(r.month==m && r.type=="Spend") spend=r.total;
                        }
                        earningData.push(earning);
                        spendData.push(spend);
                    });

                    if(app.barChart) app.barChart.destroy();

                    app.barChart = new Chart(document.getElementById("barChart"), {
                        type:'bar',
                        data:{
                            labels:months,
                            datasets:[
                                {label:'Earning', data:earningData, backgroundColor:'green'},
                                {label:'Spend', data:spendData, backgroundColor:'red'}
                            ]
                        }
                    });
                }
            );
        });
    },

    // ------------------------
    // Spend Pie
    // ------------------------
    drawSpendPieChart: function(year=null) {

        let query = "SELECT category, SUM(amount) total FROM records WHERE type='Spend'";
        let params = [];

        if(year){
            query += " AND year=?";
            params.push(year);
        }

        query += " GROUP BY category";

        db.transaction(function(tx){
            tx.executeSql(query, params, function(tx,res){

                let labels=[], data=[];

                for(let i=0;i<res.rows.length;i++){
                    let r=res.rows.item(i);
                    labels.push(r.category);
                    data.push(r.total);
                }

                if(app.spendPieChart) app.spendPieChart.destroy();

                app.spendPieChart = new Chart(document.getElementById("spendPieChart"), {
                    type:'pie',
                    data:{
                        labels:labels,
                        datasets:[{
                            data:data,
                            backgroundColor:['#36A2EB','#FF6384','#FFCE56','#4BC0C0','#9966FF','#FF9F40']
                        }]
                    }
                });
            });
        });
    },

    // ------------------------
    // Earning Pie
    // ------------------------
    drawEarningPieChart: function(year=null) {

        let query = "SELECT category, SUM(amount) total FROM records WHERE type='Earning'";
        let params = [];

        if(year){
            query += " AND year=?";
            params.push(year);
        }

        query += " GROUP BY category";

        db.transaction(function(tx){
            tx.executeSql(query, params, function(tx,res){

                let labels=[], data=[];

                for(let i=0;i<res.rows.length;i++){
                    let r=res.rows.item(i);
                    labels.push(r.category);
                    data.push(r.total);
                }

                if(app.earningPieChart) app.earningPieChart.destroy();

                app.earningPieChart = new Chart(document.getElementById("earningPieChart"), {
                    type:'pie',
                    data:{
                        labels:labels,
                        datasets:[{
                            data:data,
                            backgroundColor:['#8BC34A','#03A9F4','#FFC107','#E91E63','#9C27B0']
                        }]
                    }
                });
            });
        });
    }
};

app.initialize();