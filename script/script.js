let previousValues = {}; 
let weeklyRevenue = { Maandag: 0, Dinsdag: 0, Woensdag: 0, Donderdag: 0, Vrijdag: 0 };
let weeklyUnits = { man: 0, dins: 0, woens: 0, donder: 0, vrij: 0 };
let data; 
let previousData;
let myBarChart;
let testen = 0;
let total_new_companies = 0;


const secretKey = "RvJx23BHthcu3VDZGpM3";  
const dynamicField = new Date().toISOString().split('T')[0];

const devButton = document.querySelector('.dev');
const testBtn = document.querySelector('.test');



const testData ={
    "total": {
        "number_of_units": 7,
        "total_price": 3199.06,
        "new_companies": 3,
        "requests": {
            "total": 14,
            "accepted": 8,
            "percentage": 57.142857142857146
        }
    },
    "provinces": {
        "BE-HENEGOUWEN": {
            "total_price": 395.37
        },
        "BE-OOST-VLAANDEREN": {
            "total_price": 445.5
        },
        "BE-WEST-VLAANDEREN": {
            "total_price": 88.2
        },
        "BE-BRUSSEL": {
            "total_price": 1659.83
        },
        "BE-VLAAMS-BRABANT": {
            "total_price": 610.16
        }
    },
    "days": {
        "1": {
            "number_of_units": 7,
            "total_price": 3199.06,
            "new_companies": 3,
            "requests": {
                "total": 14,
                "accepted": 8,
                "percentage": 57.142857142857146
            }
        },
        "2": {
            "number_of_units": 0,
            "total_price": 0,
            "new_companies": 0
        },
        "3": {
            "number_of_units": 0,
            "total_price": 0,
            "new_companies": 0
        },
        "4": {
            "number_of_units": 0,
            "total_price": 0,
            "new_companies": 0
        },
        "5": {
            "number_of_units": 0,
            "total_price": 0,
            "new_companies": 0
        }
    }
};

    




const fetchData = async () => { 

    const url = 'http://localhost:300/api/data';

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
    .then(response => response.json()) 
    .then(fetchedData => {
        procesData(fetchedData);
    })
    .catch(error => {
        console.error('Error:', error);  
    });
};


function procesData(fetchedData) {
    previousData = data
    data = fetchedData;  
    detectChanges(); 
    renderDashboard(); 
    highlightCurrentDay(); 
    const province = data.provinces

    let gekleurdeProvinces = colorByPrice(province);
    initializeMap(gekleurdeProvinces)
    console.log('data is opgehaald!');
}

const renderRow = (label, value, isLegend) => {
    return `
        <div style='border:${isLegend ? '' : '2px dotted'};'; class="row">
            <span class="text">${label}</span>
            <strong class="text">${value}</strong>
        </div>
    `;
};
const renderBar = (total, accepted, percentage) => {
    return `
        <div class="bar">
            <span class="bar-total">${total}</span>
            <span class="bar-open">${total - accepted}</span>
            <div style="height: ${percentage}%" class="progress-bar-fill"></div>
            <span class="bar-accepted">${accepted}</span>
        </div>
    `;
};
const renderINFO = (naam, Toestelen, revenue, registrations, isLegend) => {
    return `
        <div class="info-box non-day">
            <strong>${isLegend ? '&nbsp;' : naam}</strong> 
            <div class='value-list'>
            ${renderRow(isLegend ? '' : '🏗️', Toestelen, isLegend)}
            ${renderRow(isLegend ? '' : '💰', revenue, isLegend)}
            ${renderRow(isLegend ? '' : '🏭', registrations, isLegend)}
            </div>
        </div>
    `;
};

const renderDashboard = () => {
    const total = document.querySelector('.summary');
    const info = document.querySelector('.info-text');
    const { total: { number_of_units: total_number_of_units, total_price }, days } = data;

    const daysOfWeek = {
        '1': { naam: 'Maandag', unitKey: 'man' },
        '2': { naam: 'Dinsdag', unitKey: 'dins' },
        '3': { naam: 'Woensdag', unitKey: 'woens' },
        '4': { naam: 'Donderdag', unitKey: 'donder' },
        '5': { naam: 'Vrijdag', unitKey: 'vrij' }
    };

    let htmlContent = '';
    let total_new_companies = 0;

    htmlContent += renderINFO('Legende', 'Toestellen', 'Omzet', 'Registraties', true);
    for (const day in days) {
        const { number_of_units, total_price, new_companies, requests } = days[day];
        let { total, accepted, percentage } = requests || {};


        if (total === undefined) total = 0;
        if (accepted === undefined) accepted = 0;
        if (percentage === undefined) percentage = 0;

        if (daysOfWeek[day]) {
            const { naam, unitKey } = daysOfWeek[day];

            weeklyRevenue[naam] = total_price;
            weeklyUnits[unitKey] = number_of_units;
            total_new_companies += new_companies;

    
            htmlContent += `
                <div class="info-box ${naam}">
                    <strong>${naam}</strong>
                    <div class="data-container">
                        <div class='value-list'>
                            ${renderRow('🏗️', number_of_units)}
                            ${renderRow('💰', `€ ${formatNumber(total_price)}`)}
                            ${renderRow('🏭', new_companies)}
                        </div>
                        ${renderBar(total, accepted, percentage)}

                    </div>
                </div>
            `;
        }
    }       
    htmlContent += renderINFO('Weektotaal', total_number_of_units, `€ ${formatNumber(total_price)}`, total_new_companies)
    info.innerHTML = htmlContent;
    updateChart();
};



function formatNumber(number) {
    return new Intl.NumberFormat('nl-NL', {
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0.
    }).format(number);
}




const highlightCurrentDay = () => {
    const d = new Date();
    const weekday = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
    const dayIndex = d.getDay();
    const dayName = weekday[dayIndex];  
    const div = document.querySelector(`.${dayName}`);
    if (div) {
        div.classList.add('active');
    }


    if (!previousValues[dayIndex]) {
        previousValues[dayIndex] = { 
            number_of_units: data.days[dayIndex]?.number_of_units || 0, 
            total_price: data.days[dayIndex]?.total_price || 0 
        };
    }
};




const detectChanges = () => {

    if (!data || !previousData) return;



    const d = new Date();
    const dayIndex = d.getDay(); 

  
    if (data.days[dayIndex]) {
        const oudeWaarden = { ...previousData.days[dayIndex] };
        if(testen === 1){
            testen = 0;
            data.days[dayIndex].number_of_units += Math.floor(Math.random() * 100);
            data.days[dayIndex].total_price += (Math.random() * 10000);
           
        }
        

        const differenceUnits = data.days[dayIndex].number_of_units - oudeWaarden.number_of_units;
        const differenceRevenue = (data.days[dayIndex].total_price - oudeWaarden.total_price).toFixed(2);
        console.log(`🏗️: +${differenceUnits} | 💰: +€${differenceRevenue}`);
        

        if(differenceUnits > 0  || differenceRevenue > 0) {
        addLogMessage(`🏗️: +${differenceUnits} | 💰: +€${differenceRevenue}`);
        }

        
        if (differenceRevenue > 1000) {
            console.log('🎉 Confetti!');
            startConfetti();
            setTimeout(stopConfetti, 3000);
            console.log("🎉 Confetti event verzonden!");
            sendDataToServer(differenceRevenue, differenceUnits);
        }
        
    }
};

devButton.addEventListener('click', function() {
    console.log('sending post data...');
    sendDataToServer(10000, 100);
});

function sendDataToServer(revenue, units) {
    const jsonData = {
        status: true,
        revenue: revenue,
        units: units
    };

    fetch('http://localhost:3000/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(jsonData) 
    })
    .then(response => response.json()) 
    .then(data => {
        console.log('Response van server:', data);
    })
    .catch(error => {
        console.error('Er is een fout opgetreden bij het versturen van de data:', error);
    });
}




function addLogMessage(message) {
    const logContainer = document.getElementById('notification-container');
    const animationTime = 1000;
    const holdTime = 1000 + animationTime; 

    const logEntry = document.createElement('div');
    logEntry.classList.add('notification-message');
    logEntry.textContent = message;


    logContainer.prepend(logEntry);

   

    logContainer.style.transition = `left ${animationTime}ms ease-in-out`; 
    logContainer.style.left = '-300px';
    logContainer.style.left = '0px';  
    
    setTimeout(() => {
        logContainer.style.left = '-300px';  
    }, holdTime);


    setTimeout(() => {
        logContainer.removeChild(logEntry);
    }, holdTime + animationTime); 
}


function updateLogTransparency() {
    const logMessages = document.querySelectorAll('.notification-message');
    logMessages.forEach((msg, index) => {
        const opacity = 1 - (index * 0.25); 
        const scale = 1 - (index * 0.1);
        msg.style.opacity = opacity;
        msg.style.transform = `scale(${scale})`;
    });
}








function updateChart() {
    const ctx = document.getElementById('myBarChart').getContext('2d');

    if (!myBarChart) {
        myBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(weeklyRevenue),
                datasets: [
                    {
                        label: 'Omzet per dag',
                        data: Object.values(weeklyRevenue),
                        backgroundColor: '#f9c73d',
                        borderColor: 'rgb(255, 200, 0)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Aantal toestellen per dag',
                        data: Object.values(weeklyUnits),
                        backgroundColor: 'rgba(228, 228, 228, 0.7)',
                        borderColor: 'rgb(255, 255, 255)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                aspectRatio: 2,
                scales: {
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        ticks: { stepSize: 1000, color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: 'white' },
                        grid: { drawOnChartArea: false }
                    }
                },
                plugins: {
                    legend: { labels: { color: 'white' } }
                }
            },
            plugins: [{
                beforeDraw: (chart) => {
                    const ctx = chart.ctx;
                    ctx.font = "bold 14px Arial";
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";

                    chart.data.datasets.forEach((dataset, datasetIndex) => {
                        const meta = chart.getDatasetMeta(datasetIndex);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            if (value > 0) {
                                const text = datasetIndex === 0 ? `€ ${formatNumber(value)}` : value;
                    ctx.fillText(text, bar.x, bar.y - 10);
                            }
                        });
                    });
                }
            }]
        });
    } else {
        myBarChart.data.datasets[0].data = Object.values(weeklyRevenue);
        myBarChart.data.datasets[1].data = Object.values(weeklyUnits);
        myBarChart.update();
    }
}



updateChart();



updateChart(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);


testBtn.addEventListener('click', function() {
    testen=1
    previousData = data
    data = testData
    detectChanges(); 
    renderDashboard(); 
    highlightCurrentDay(); 
});


const map = L.map('map').setView([50.8503, 4.3517], 7);

function initializeMap(province){

    createLayer("BE", belgie, province ).addTo(map);
    createLayer("BE", BEpro, province ).addTo(map);
    createLayer("LU", LUpro, province ).addTo(map);
    createLayer("NL", NLpro, province ).addTo(map);
}






function createLayer(iso, collection, province) {
  
    return L.geoJSON(collection,  {
        
        style: (feature) => ({
            weight: 0.5,
            color: "#000",
            opacity: 1,
            fillColor: chooseProvinceColor(feature, province ) || "#c3c7c4",
            fillOpacity: 1,
        }),
        
    });
}

function chooseProvinceColor(feature, pro) {
    const provinces = Object.keys(data.provinces);
    
    for (const province of provinces) {
        if (province.includes(feature.properties.region)) {
            const datas = colorByPrice(pro);
            return datas[province].kleur;
        }
    }
}

function getColorRange(colors, steps) {
    steps--;
    let counter = 0;
    const stepSize = steps / (colors.length - 1 > 0 ? colors.length - 1 : 1);
    const treshold = () => stepSize * (counter + 1);
  
    return [colors[0], ...numberArray(1, steps).map(i => {
      const percentage = (i - (counter * stepSize)) * (1 / stepSize);
      const color = interpolateColors(colors[counter], colors[counter + 1], percentage);
      if ((steps * percentage) > treshold()) counter++;
      return color;
    })];
  }
  const numberArray = (start, end) => Array.from(Array(Math.abs(end - start + 1)).keys()).map(i => i + start);

  function sanitizeColorValue(value) {
    return Math.min(255, Math.max(0, value));
  }
  
  function interpolateColors({ r: r1, g: g1, b: b1 }, { r: r2, g: g2, b: b2 }, percentage) {
    const r = sanitizeColorValue(Math.floor(r1 + ((r2 - r1) * percentage)));
    const g = sanitizeColorValue(Math.floor(g1 + ((g2 - g1) * percentage)));
    const b = sanitizeColorValue(Math.floor(b1 + ((b2 - b1) * percentage)));
    return {r, g, b};
  };
  
const steps = 15;
const colorRed = {r: 244, g: 67, b: 54};
const colorYellow = {r:249, g:199, b:61};
const colorGreen = {r:76, g:175, b:80};
const colorRange = getColorRange([colorRed, colorYellow, colorGreen], 15);
  
  
  
  
  
function colorByPrice(provinces) {

    const allPrices = Object.values(provinces).map(province => province.total_price);
    const maxPrice = Math.max(...allPrices);
    const ratio = (maxPrice / steps) + 1; 

    function bepaalKleur(prijs) {
        const index = Math.floor(prijs / ratio );
        const color = colorRange[index];
        if (!color) return "#c3c7c4";
        const {r, g, b} = color;
        return rgbToHex(r, g, b); 
    }


    let gekleurdeProvinces = {};
    for (let provinceCode in provinces) {
        let province = provinces[provinceCode];
        let kleur = bepaalKleur(province.total_price);
        gekleurdeProvinces[provinceCode] = {
            total_price: province.total_price,
            kleur: kleur
        };
    }

    return gekleurdeProvinces;
}
function rgbToHex(r, g, b) {

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));


    const hex = (x) => {
        const hexValue = x.toString(16).padStart(2, '0'); 
        return hexValue;
    };


    return `#${hex(r)}${hex(g)}${hex(b)}`;
}



document.addEventListener("DOMContentLoaded", () => {
    const switchContainer = document.querySelector('.switch-container');
    const switchToggle = document.querySelector('.switch-toggle');
    const savedState = localStorage.getItem('toggleState');

    if (savedState === "true") {
        switchContainer.classList.add('active');
        switchToggle.textContent = "ON";
        testMode = true;
        procesData(testData);
    } else {
        testMode = false;
        fetchData();
        setInterval(() => {
            fetchData();
            console.log('reloaded de data!');
        }, 60000 * 5);
    }
});

function toggleSwitch() {
    const switchContainer = document.querySelector('.switch-container');
    const switchToggle = document.querySelector('.switch-toggle');

    switchContainer.classList.toggle('active');
    const isActive = switchContainer.classList.contains('active');

    switchToggle.textContent = isActive ? 'ON' : 'OFF';

    localStorage.setItem('toggleState', isActive);


    if (isActive) {
        testMode = true;
        window.location.reload();
    } else {
        testMode = false;
        window.location.reload();
    }
}