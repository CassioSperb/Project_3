let sectorChart, companyChart;

// Load data from the JSON file
fetch('../../data/outputs/stocks_database.json')
    .then(response => response.json())
    .then(data => {
        window.stockData = data;
        populateCompanyFilter();
        populateRoiTable(data);
        updateCharts(); // Initial chart rendering
    });

// Populate the multi-select dropdown with company names
function populateCompanyFilter() {
    const companyFilter = document.getElementById('companyFilter');
    const companies = Array.from(new Set(window.stockData.map(stock => stock.Company)));
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        companyFilter.appendChild(option);
    });
}

// Get the selected companies from the multi-select dropdown
function getSelectedCompanies() {
    const selectedOptions = Array.from(document.getElementById('companyFilter').selectedOptions);
    return selectedOptions.map(option => option.value);
}

// Function to calculate the mean of the selected metric for each quarter in a given sector
function calculateQuarterlyMean(sector, metric) {
    // Filter data by sector and group by quarter
    const sectorData = window.stockData.filter(stock => stock.Sector === sector);
    const groupedByQuarter = sectorData.reduce((acc, stock) => {
        if (!acc[stock.Quarter]) {
            acc[stock.Quarter] = [];
        }
        acc[stock.Quarter].push(stock[metric]);
        return acc;
    }, {});

    // Calculate mean for each quarter
    const meanValues = Object.keys(groupedByQuarter).map(quarter => {
        const values = groupedByQuarter[quarter];
        const mean = values.reduce((sum, val) => sum + parseFloat(val), 0) / values.length;
        return mean;
    });

    return meanValues;
}

// Function to update both charts and the metric title
function updateCharts() {
    const metric = document.getElementById('sectorMetric').value;
    document.getElementById('metricTitle').textContent = `Metric: ${metric}`;

    if (sectorChart) sectorChart.destroy();
    if (companyChart) companyChart.destroy();

    drawSectorChart(metric);
    drawCompanyChart(metric);
}

// Function to draw sector chart with the quarterly means
function drawSectorChart(metric) {
    const ctx = document.getElementById('sectorChart').getContext('2d');

    // Calculate the mean for each quarter for Oil and Telecom sectors
    const oilMean = calculateQuarterlyMean('Oil', metric);
    const telecomMean = calculateQuarterlyMean('Telecom', metric);
    const quarters = [...new Set(window.stockData.map(stock => stock.Quarter))];  // Extract unique quarters

    sectorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: quarters,
            datasets: [{
                label: 'Oil - Quarterly Mean',
                data: oilMean,
                borderColor: 'blue',
                fill: false
            },
            {
                label: 'Telecom - Quarterly Mean',
                data: telecomMean,
                borderColor: 'green',
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Quarter'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: metric
                    },
                    grid: {
                        display: true
                    }
                }
            }
        }
    });
}

// Function to draw company chart with selected companies
function drawCompanyChart(metric) {
    const ctx = document.getElementById('companyChart').getContext('2d');

    const selectedCompanies = getSelectedCompanies();
    const companies = Array.from(new Set(window.stockData.map(stock => stock.Company)))
                          .filter(company => selectedCompanies.length === 0 || selectedCompanies.includes(company));

    const companyData = companies.map(company => {
        const companyStocks = window.stockData.filter(stock => stock.Company === company);
        return companyStocks.map(stock => stock[metric]);
    });

    const quarters = window.stockData.filter(stock => stock.Company === companies[0]).map(stock => stock.Quarter);

    const datasets = companies.map((company, index) => ({
        label: company,
        data: companyData[index],
        borderColor: `hsl(${index * 40}, 70%, 50%)`,
        fill: false
    }));

    companyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: quarters,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Quarter'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: metric
                    },
                    grid: {
                        display: true
                    }
                }
            }
        }
    });
}

// Populate ROI table with 2022Q4 data
function populateRoiTable(data) {
    const roiTable = document.getElementById('roiTable').getElementsByTagName('tbody')[0];
    const filteredData = data.filter(stock => stock.Quarter === '2022Q4');
    const sortedData = filteredData.sort((a, b) => b['Cumulative ROI (%)'] - a['Cumulative ROI (%)']);
    sortedData.forEach(stock => {
        const row = roiTable.insertRow();
        row.insertCell(0).textContent = stock.Company;
    
        // Format Cumulative ROI (%) as a percentage with two decimal places
        row.insertCell(1).textContent = `${parseFloat(stock['Cumulative ROI (%)']).toFixed(2)}%`;
    
        // Format Cumulative ROI on $1500 ($) as currency with two decimal places
        row.insertCell(2).textContent = `$${parseFloat(stock['Cumulative ROI on $1500 ($)']).toFixed(2)}`;
    });
}
