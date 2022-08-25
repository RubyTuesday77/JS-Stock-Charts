// Function to assign colors to individual stock symbols
function getColor(stock) {
    if(stock === "GME") {
        return 'rgba(61, 161, 61, 0.7)'  // green
    }
    if(stock === "MSFT") {
        return 'rgba(209, 4, 25, 0.7)'  // red
    }
    if(stock === "DIS") {
        return 'rgba(18, 4, 209, 0.7)'  // blue
    }
    if(stock === "BNTX") {
        return 'rgba(166, 43, 158, 0.7)'  // purple
    }
}

// Function to add stock charts based on data pulled form Twelve Data API
async function main() {
    // Created variables targeting empty <canvas> elements; JS will populate with charts
    const timeChartCanvas = document.querySelector('#time-chart');
    const highestPriceChartCanvas = document.querySelector('#highest-price-chart');
    const averagePriceChartCanvas = document.querySelector('#average-price-chart');

    /* Commented out, as API key expired
    // Create fetch request, passes stock symbols: GME, MSFT, DIS, and BNTX
    const response = await fetch('https://api.twelvedata.com/time_series?symbol=GME,MSFT,DIS,BNTX&interval=1day&format=JSON&apikey=0cd98fba6f7b4b918dd88fd784b672d8');
    const result = await response.json();
    console.log(result);
    */

    // Saved data from above API URL as "stock_data.json" file and created a fetch request to pull "result" variable from that file
    const response = await fetch(`stock_data.json`, { mode: "no-cors" })
    const result = await response.json()
    // console.log(result) returned object: {GME: {…}, MSFT: {…}, DIS: {…}, BNTX: {…}}

    // Below can also be written as "const { GME, MSFT, DIS, BNTX } = result"
    let GME = result.GME
    let MSFT = result.MSFT
    let DIS = result.DIS
    let BNTX = result.BNTX

    const stocks = [GME, MSFT, DIS, BNTX];

    stocks.forEach(stock => stock.values.reverse())  // reverse values so earliest datetime in array is first
 
    /* Line Chart for Stock Price Over Time: X-axis = date (value.datetime); Y-axis = highest stock price (value.high)
   Each stock represented by a separate line, with multiple data points. */
    new Chart(timeChartCanvas.getContext('2d'), {
        type: 'line',  // set graph type
        data: {
            /* Uses map to generate an array of the datetimes to use as x-axis values. Since every stock has the same datetimes can hardcode 
            stocks[0] as the x-axis label. Used .substring(5) to remove the first characters, "2022-" from datetime */
            labels: stocks[0].values.map(value => value.datetime.substring(5)),
            // Generates the label, data (array) and background/border colors for each stock
            datasets: stocks.map(stock => ({
                label: stock.meta.symbol,  // Uses meta.symbol value as label for each stock
                // Generates an array of value.high values for every datetime
                data: stock.values.map(value => parseFloat(value.high)),
                // Applies returned value from getColor function above to represent corresponding stock dataset.
                backgroundColor: getColor(stock.meta.symbol),  // Applies color to stock labels and data points
                borderColor: getColor(stock.meta.symbol)  // Applies color to label borders and lines between data points
            }))
        },
        options: {
            scales: {
                x: {  // Added label to x-axis
                    title: {
                        text: '2022 Date',
                        display: true
                    }
                },
                y: {  // Added label to y-axis
                    title: {
                        text: 'Stock Price (USD)',
                        display: true
                    }
                }
            }
        }
    });

    /* Bar Chart for Highest Stock Price: X-axis = stock symbol; Y-axis = highest stock value from 7.14 - 8.24
    Each stock will be represented by a colored bar with one data point. */
    new Chart(highestPriceChartCanvas.getContext('2d'), {
        type: 'bar', // set graph type
        data: {
            // Uses map to generate an array of the stock symbols to use as x-axis values.
            labels: stocks.map(stock => stock.meta.symbol),
            datasets: [{
                label: 'Highest',
                // Generates an array of the highest value for each stock, returned from below findHighest function
                data: stocks.map(stock => (findHighest(stock.values))),
                // Applies returned value from getColor function above to represent corresponding stock dataset (bar).
                backgroundColor: stocks.map(stock => (getColor(stock.meta.symbol)))
            }]
        },
        options: {
            scales: {
                x: {  // Added label to x-axis
                    title: {
                        text: 'Company',
                        display: true
                    }
                },
                y: {  // Added label to y-axis
                    title: {
                        text: `Highest Stock Price (USD)`,
                        display: true
                    }
                }
            },
            plugins: {
                title: {  // Added title to show date range
                    text: 'Stock Price from 7/14/2022 - 8/24/2022',
                    display: true
                },
                legend: {  // Removed legend
                    display: false
                }
            }
        }
    });
    
    // Pie Chart for Average Stock Price: Slice = stock symbol; Size of slice = average stock value from 7.14 - 8.24
    new Chart(averagePriceChartCanvas.getContext('2d'), {
        type: 'pie', // set graph type
        data: {
            // Uses map to generate an array of the stock symbols to use as x-axis values.
            labels: stocks.map(stock => stock.meta.symbol),
            datasets: [{
                label: 'Average',
                // Generates an array of the highest value for each stock, returned from below findHighest function
                data: stocks.map(stock => (findAverage(stock.values))),
                // Applies returned value from getColor function above to represent corresponding stock dataset (bar).
                backgroundColor: stocks.map(stock => (getColor(stock.meta.symbol)))
            }]
        },
        options: {
            plugins: {
                title: {  // Added title to show date range
                    text: 'Stock Price from 7/14/2022 - 8/24/2022',
                    display: true
                }
            }
        }
    })
}

// Function to return highest value for each stock symbol
function findHighest(values) {
    let highest = 0;  // set highest value at 0
    // use forEach to compare the high value for each datetime and return the highest one
    values.forEach(value => {
        if(parseFloat(value.high) > highest) {
            highest = value.high
        }
    })
    return highest  // Returns highest value when all datetimes have been evaluated
}

// Function to return average value for each stock symbol
function findAverage(values) {
    let totalHighValues = 0;  // set totalHighValues at 0
    values.forEach(value => {  // use forEach to add the "high" value of each date to the previous
        totalHighValues += parseFloat(value.high)
    })
    return totalHighValues / values.length  // calculate average by dividing total by number of values
}


main()
