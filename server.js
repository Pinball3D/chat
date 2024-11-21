const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
var people = [];
console.log('WebSocket server is running on ws://localhost:8080');
function sendPeople() {
    var names = [];
    people.forEach(e => {
        names.push(e["name"])
        
    })
    people.forEach(person => {
        person["ws"].send(JSON.stringify({"sender": "MEMBERS", "message": names}))
    })
}
// Listen for connection events
wss.on('connection', (ws) => {
    console.log('A new client connected.');
    ws.on('message', (message) => {
        let json = JSON.parse(message)
        console.log(json)
        if (json["action"] == "sendName") {
            people.push({"name": json["name"], "socket": ws});
            sendPeople()
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected.');
    });
    ws.on('error', (error) => {
        console.error(`WebSocket error: ${error.message}`);
    });
});