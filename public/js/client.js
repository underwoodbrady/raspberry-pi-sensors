let socket = io();

const chatForm = document.getElementById("chat-form"),
    chatInput = document.getElementById("chat-input"),
    chatText = document.getElementById("chat-text");

let addChatFormatted = (id, chat) => {
    if (id === "[SERVER]")
        chatText.innerHTML += `<div class="text-entry"><p><span class="semibold title server-text">${id}</span><span class="semibold">${chat}</span></p></div>`;
    else
        chatText.innerHTML += `<div class="text-entry"><p><span class="semibold title">${id}:</span>${chat}</p></div>`;
};

socket.on("initChat", (data) => {
    console.log("init", data);
    for (let i = 0, e = data.length; i < e; i++) {
        addChatFormatted(data[i].id, data[i].chat);
    }
});

socket.on("addToChat", (data) => {
    console.log("add", data);
    addChatFormatted(data.id, data.chat);
});

chatForm.onsubmit = (e) => {
    e.preventDefault();
    if (chatInput.value[0] === "/")
        socket.emit("commandToServer", chatInput.value);
    else socket.emit("chatToServer", chatInput.value);
    chatInput.value = "";
};

socket.on("startPingTest", () => {
    const start = Date.now();
    socket.volatile.emit("ping", () => {
        const latency = Date.now() - start;
        socket.emit("pingToServer", latency);
    });
});

socket.on('disconnect', function(){
    document.title = "Rover Data 🔴";
});
