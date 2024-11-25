const WebSocket = require('ws');
const axios = require('axios');
const wss = new WebSocket.Server({ port: 8080 });
var conns = [];
var people = [];
console.log('WebSocket server is running on ws://localhost:8080');
//KEEP ALIVE
const url = `https://chat-backend-hdl3.onrender.com/`; // Replace with your Render URL
const interval = 30000; // Interval in milliseconds (30 seconds)
function reloadWebsite() {
  axios.get(url)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
        if (error.status == 426) {
            console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${error.status}`);
        } else {
            console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
        }
    });
}
reloadWebsite();
setInterval(reloadWebsite, interval);
//END KEEP ALIVE
function sendPeople() {
    var names = [];
    people.forEach(e => {
        names.push(e["name"])
        
    })
    people.forEach(person => {
        broadcast(JSON.stringify({"sender": "MEMBERS", "message": names}))
    })
}
function broadcast(message) {
    people.forEach(person => {
        person["socket"].send(message)
    })
}
// Listen for connection events
wss.on('connection', (ws) => {
    conns.push(ws);
    console.log('A new client connected.');
    ws.on('message', (message) => {
        var names = [];
        people.forEach(e => {
            names.push(e["name"])
        
        });
        ws.send(JSON.stringify({"sender": "MEMBERS", "message": names}))
        let json = JSON.parse(message)
        console.log(json)
        if (json["action"] == "sendName") {
            people.push({"name": json["name"], "socket": ws});
            sendPeople()
            broadcast(JSON.stringify({
                "sender": "SYSTEM",
                "message": json["name"] + " has joined the chat",
                "type": "public"
            }))
        } else if (json["action"] == "sendMessage") {
            broadcast(JSON.stringify({"sender": "MESSAGE", "message": json["message"], "sender": json["sender"], "type": "public"}))
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected.');
        conns = conns.filter(conn=> conn != ws);
        people.forEach(e => {
            if (e["socket"] == ws) {
                people = people.filter(person => {
                    person != e;
                })
            }
        })
        sendPeople()
    });
    ws.on('error', (error) => {
        console.error(`WebSocket error: ${error.message}`);
    });
});