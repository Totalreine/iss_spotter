
const request = require("request")

const fetchMyIP = function(callback) {
    // use request to fetch IP address from JSON API
    request('https://api.ipify.org?format=json', (error, response, body) => {
        if (error) {
            callback(error, null);
            return;
        }
        // if non-200 status, assume server error
        if (response.statusCode !== 200) {
            const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
            callback(Error(msg), null);
            return;
        }

        let ip = JSON.parse(body).ip
        callback(null, ip)
        
    });
}

const fetchCoordsByIP = function(ip, callback) {
    console.log(ip)
    request(`http://ipwho.is/${ip}`, (error, response, body) => {
        if (error) {
            callback(error, null);
            return;
        }

        let data = JSON.parse(body)

        if (!data.success) {
            const message = `Success status was ${data.success}. Server message says: ${data.message} when fetching for IP ${data.ip}`;
            callback(Error(message), null);
            return;
        }

        let {latitude, longitude} = data

        callback(null, {latitude, longitude})
    });
}

const fetchISSFlyOverTimes = function(coords, callback) {
    request(`https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
        if (error) {
            callback(error, null);
            return;
        }

        if (response.statusCode !== 200) {
            callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
            return;
        }

        let data = JSON.parse(body).response
        callback(null, data)
    });
};


const nextISSTimesForMyLocation = function(callback) {
    
    fetchMyIP((error, ip) => {
        if (error) {
        return callback(error, null);
        }
    
        fetchCoordsByIP(ip, (error, loc) => {
            if (error) {
                return callback(error, null);
            }
    
            fetchISSFlyOverTimes(loc, (error, nextPasses) => {
                if (error) {
                return callback(error, null);
                }
        
                callback(null, nextPasses);
            });
        });
    });
};


module.exports = {  nextISSTimesForMyLocation };