let express = require("express"),
    app = express(),
    serv = require("http").Server(app),
    path = require("path");

/* ONLY ON RASPBERRY PI "npm install node-dht-sensor"
const sensor = require("node-dht-sensor");
*/

let requests = [];

app.get("/", function (req, res) {
    //console.log(req.header('x-forwarded-for') || req.connection.remoteAddress);
    res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));

app.use(express.static(path.join(__dirname, "public")));

let port = process.env.PORT;

if (port == null || port == "") {
    port = 2020;
}

serv.listen(port);

let io = require("socket.io")(serv, {});

let CLIENT_LIST = [],
    chatList = [];

chatList.push({ id: "[SERVER]", chat: `Started on port ${port}` });

let addToChat = (ip, chat) =>{
    let chatFormat = {
        id: ip,
        chat: chat,
    };

    chatList.push(chatFormat);

    for (let i in CLIENT_LIST) {
        CLIENT_LIST[i].emit("addToChat", chatFormat);
    }
}

let testOne = () => {
    /* ONLY ON RASPBERRY PI
    sensor.read(11, 17, function(err, temperature, humidity) {
        if (!err) {
          console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);
        }
      });
      */
    return "No data";
}

let testTwo = () => {
    return "No data";
}

let resetOne = () => {
    return "Reset sensor one";
}

let resetTwo = () => {
    return "Reset sensor two";
}


io.sockets.on("connection", (socket) => {
    socket.ping = 0;

    CLIENT_LIST.push(socket);

    socket.emit("initChat", chatList);

    socket.on("chatToServer", (data) => {
        addToChat(socket.request.connection.remoteAddress.slice(-3), data);
    });

    socket.on("commandToServer", (data) => {

        addToChat(socket.request.connection.remoteAddress.slice(-3), data);

        switch (data) {
            case "/ping":
            case "/p":
                socket.emit("startPingTest");
                break;
            case "/test1":
                let testOneResult = testOne();
                addToChat("[SERVER]", testOneResult);
                break;
            case "/test2":
                let testTwoResult = testTwo();
                addToChat("[SERVER]", testTwoResult);
                break;
            case "/reset1":
                let resetOneResult = resetOne();
                addToChat("[SERVER]", resetOneResult);
                break;
            case "/reset2":
                let resetTwoResult = resetTwo();
                addToChat("[SERVER]", resetTwoResult);
                break;
            case "/ip":
                addToChat("[SERVER]", socket.request.connection.remoteAddress);
                break;
            case "/sip":
                addToChat("[SERVER]", socket.handshake.headers.host);
                break;
            default:
                addToChat("[SERVER]", `Unknown command "${data}"`)
                break;
        }
    });

    socket.on("ping", (cb) => {
        cb();
    });

    socket.on("pingToServer", (data)=>{
        addToChat("[SERVER]", `${data}ms`);
    })

    socket.on("disconnect", () => {
        CLIENT_LIST.splice(socket, 1);
    });
});
