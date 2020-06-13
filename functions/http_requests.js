// let http = require("https");

// module.exports = (country) => {
//     let body = undefined;

//     let options = {
//         "method": "GET",
//         "hostname": "covid-19-coronavirus-statistics.p.rapidapi.com",
//         "port": null,
//         "path": "/v1/total?country=Canada",
//         // "path": "/v1/total?country=" + country,
//         "headers": {
//             "x-rapidapi-host": "covid-19-coronavirus-statistics.p.rapidapi.com",
//             "x-rapidapi-key": "b883903090msh7eef2b50e6cbe9cp1ff439jsnee4d6c48061f",
//             "useQueryString": true
//         }
//     };

//     let req = await http.request(options, function (res) {
//         let chunks = [];

//         res.on("data", function (chunk) {
//             chunks.push(chunk);
//         });

//         res.on("end", function () {
//             body = Buffer.concat(chunks);
//             console.log(body.toString());
//         });
//     });

//     req.end();
//     return body;
// }

//

// let request = require("request");

// module.exports = (country) => {
//     let options = {
//         method: 'GET',
//         url: 'https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/total',
//         qs: { country: country },
//         headers: {
//             'x-rapidapi-host': 'covid-19-coronavirus-statistics.p.rapidapi.com',
//             'x-rapidapi-key': 'b883903090msh7eef2b50e6cbe9cp1ff439jsnee4d6c48061f',
//             useQueryString: true
//         }
//     };

//     return request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         console.log(body);
//         return body;
//     });
// }

const axios = require("axios");

module.exports = (country) => {
    let data = false;
    axios({
        "method": "GET",
        "url": "https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/total",
        "headers": {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "covid-19-coronavirus-statistics.p.rapidapi.com",
            "x-rapidapi-key": "b883903090msh7eef2b50e6cbe9cp1ff439jsnee4d6c48061f",
            "useQueryString": true
        }, "params": {
            "country": country
        }
    })
        .then((response) => {
            console.log(response.data)
            data = response.data;
        })
        .catch((error) => {
            console.log(error)
            return false;
        })
    return data;
}