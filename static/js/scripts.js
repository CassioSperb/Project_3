// The data from the JSON file is arbitrarily named importedData as the argument.
d3.json("outputs/oil_database.json").then((importedData) => {
  // console.log(importedData);
    let data = importedData;
  // Sort the data array by using the miles value.
  data.sort(function(a, b) {
    return parseFloat(b.miles) - parseFloat(a.miles);
  });

  // Slice the first 10 objects for plotting.
  data = data.slice(0, 10);

  // Reverse the array because of the Plotly defaults.
  data = data.reverse();



        $.getJSON("outputs/oil_database.json", function(data) {
            let chartData = {};
            
            data.oil_data.forEach(function(item) {
                if (!chartData[item.Company]) {
                    chartData[item.Company] = [];
                }
                chartData[item.Company].push({
                    x: new Date(item.Quarter),
                    y: parseFloat(item['Percentage Change'])
                });
            });

            let dataSeries = [];
            for (let company in chartData) {
                dataSeries.push({
                    type: "line",
                    name: company,
                    showInLegend: true,
                    yValueFormatString: "#,##0.00'%'",
                    dataPoints: chartData[company]
                });
            }

            let chart = new CanvasJS.Chart("chartContainer", {
                animationEnabled: true,
                theme: "light2",
                title: {
                    text: "Quarterly Percentage Change per Company (Oil)"
                },
                axisX: {
                    valueFormatString: "YYYY-MM"
                },
                axisY: {
                    title: "Percentage Change",
                    suffix: "%"
                },
                legend: {
                    cursor: "pointer",
                    itemclick: function(e) {
                        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                            e.dataSeries.visible = false;
                        } else {
                            e.dataSeries.visible = true;
                        }
                        e.chart.render();
                    }
                },
                data: dataSeries
            });

            chart.render();
        });
    }
    </script>
</head>
<body>
    <div id="chartContainer" style="height: 500px; width: 100%;"></div>
</body>
</html>
