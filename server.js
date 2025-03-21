const express = require('express');
const Yeelight = require('yeelight2');

const app = express();
app.use(express.json());

let status;
const data={
    "total": {
        "number_of_units": 105,
        "total_price": 58771.24,
        "new_companies": 18,
        "requests": {
            "total": 221,
            "accepted": 125,
            "percentage": 56.56108597285068
        }
    },
    "provinces": {
        "BE-ANTWERPEN": {
            "total_price": 7752.989999999999
        },
        "BE-WEST-VLAANDEREN": {
            "total_price": 3958.42
        },
        "NL-OVERIJSSEL": {
            "total_price": 472.65
        },
        "BE-VLAAMS-BRABANT": {
            "total_price": 7432.060000000001
        },
        "NL-NOORD-HOLLAND": {
            "total_price": 599.15
        },
        "BE-HENEGOUWEN": {
            "total_price": 3122.2599999999998
        },
        "BE-OOST-VLAANDEREN": {
            "total_price": 12400.91
        },
        "BE-BRUSSEL": {
            "total_price": 5576.010000000001
        },
        "DE-NORDRHEIN-WESTFALEN": {
            "total_price": 6632.88
        },
        "BE-LIMBURG": {
            "total_price": 2726.36
        },
        "NL-ZUID-HOLLAND": {
            "total_price": 530.05
        },
        "NL-ZEELAND": {
            "total_price": 1676.35
        },
        "NL-LIMBURG": {
            "total_price": 613.2
        },
        "NL-NOORD-BRABANT": {
            "total_price": 1130.42
        },
        "NL-UTRECHT": {
            "total_price": 391.56
        },
        "BE-LUIK": {
            "total_price": 2537.88
        },
        "FR-NORD": {
            "total_price": 1218.09
        }
    },
    "days": {
        "1": {
            "number_of_units": 24,
            "total_price": 10412.849999999997,
            "new_companies": 5,
            "requests": {
                "total": 57,
                "accepted": 36,
                "percentage": 63.1578947368421
            }
        },
        "2": {
            "number_of_units": 21,
            "total_price": 12705.330000000002,
            "new_companies": 5,
            "requests": {
                "total": 43,
                "accepted": 28,
                "percentage": 65.11627906976744
            }
        },
        "3": {
            "number_of_units": 28,
            "total_price": 18777.319999999992,
            "new_companies": 5,
            "requests": {
                "total": 47,
                "accepted": 28,
                "percentage": 59.57446808510638
            }
        },
        "4": {
            "number_of_units": 30,
            "total_price": 16272.669999999998,
            "new_companies": 3,
            "requests": {
                "total": 68,
                "accepted": 33,
                "percentage": 48.529411764705884
            }
        },
        "5": {
            "number_of_units": 2,
            "total_price": 603.07,
            "new_companies": 0,
            "requests": {
                "total": 6,
                "accepted": 0,
                "percentage": 0
            }
        }
    }
}



const cors = (req, res, next) => {
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Origin', req.get('origin') ? req.get('origin') : '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Set-Cookie, *');
    res.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS, PATCH');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
};

app.use(cors);


console.log('test')

const ipAddress = "192.168.10.25"; 

let light;

async function connectYeelight() {
    try {
        light = new Yeelight(ipAddress);
        light?.on("connected", () => {
            console.log("✅ Verbonden met Yeelight op:", ipAddress);
        });

      
        light?.on("error", (err) => {
            console.error("❌ Verbinding mislukt:", err);
        });

        light?.set_bright(100)
        
        light?.set_rgb(0xFFF5E1);
       
        light?.set_power(true)
        console.log("Lamp is aan!");
        
    } catch (error) {
        console.error("Fout bij verbinden of instellen van de lamp:", error);
        connectYeelight();
    }
}


connectYeelight();

async function procesData(data) {
    status = data.status
    const omzet = data.omzet
    if (omzet > 999) {
        await colorEffect(omzet)
    }
}



function getColor(num) {
    num = Math.max(1, Math.min(10, num));
    const greenValue = Math.floor(255 * (10 - num) / 9);
    const redValue = Math.floor(255 * (num - 1) / 9);
    const hexColor = `0x${redValue.toString(16).padStart(2, '0')}${greenValue.toString(16).padStart(2, '0')}00`;
    return hexColor;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const colorEffect = async (omzet) => {  
    let flikkers = Math.floor(omzet / 1000);
    if( flikkers > 15 ){
        flikkers = 15;
    }
    for (let i = 0; i < flikkers; i++) {
        await sleep(1000);
        light?.set_power(true)

        getColor(i)
            
            const hexColor = getColor(i);
            light?.set_rgb(hexColor);
        
    
        await sleep(1000); 
        light?.set_power(false)
    }
    await standby();
};


const standby = async ()=>{
    light?.set_power(true)
    await sleep(10000);
    light?.set_rgb(0xFFF5E1);
}





app.post('/data', async (req, res) => {
    const jsonData = req.body;
    res.send(JSON.stringify('data recived!!!'));
    await procesData(jsonData);
});


const PORT = 300;





app.get('/api/data', (req, res) => {

    res.json(data);
    updateData()
});


function updateData(){
    const d = new Date();
    const dayIndex = d.getDay(); 

    data.days[dayIndex].number_of_units += Math.floor(Math.random() * 100);
    data.days[dayIndex].total_price += (Math.random() * 1000);
}



app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});







