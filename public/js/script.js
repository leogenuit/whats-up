// https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event

document.addEventListener("DOMContentLoaded", () => {
  console.log("Whats-up JS imported successfully!");
});
const allRooms = document.querySelector(".allsroom");
const dedicatedRoom = document.querySelector(".dedicatedRoom");
const messageTemplate = document.getElementById("message-template");
const messagesContainer = document.querySelector(".messages");
const back = document.querySelector(".back");
const friends = document.querySelector(".friends");

let socket = io();
//let messages = document.querySelector(".messages");
let form = document.getElementById("form");
let input = document.getElementById("input");
let listUsers = document.querySelector(".connected");
let listUsersNotConnected = document.querySelector(".disconnected");

const userId = form.dataset.id;

socket.on("connect", () => {
  const sessionID = socket.id;
  socket.emit("add user", userId);
  socket.emit("get user", userId);
});

socket.on("all users", (users, notConnectUsers) => {
  listUsers.innerHTML = "";
  listUsersNotConnected.innerHTML = "";
  if (!users.length) {
    let title = document.createElement("h2");
    title.textContent = "No one connected 🙃";
    listUsers.appendChild(title);
  } else {
    let title = document.createElement("h2");
    title.textContent = "Connected now 😀";
    listUsers.appendChild(title);
  }

  users.forEach((element) => {
    let div = document.createElement("div");
    div.classList.add("room", "flex");
    div.dataset.id = element.user._id;
    div.textContent = element.user.username;
    listUsers.appendChild(div);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (input.value) {
        socket.emit(
          "chat message",
          input.value,
          userId,
          div.dataset.id,
          messagesContainer.dataset.room
        );
        input.value = "";
      }
      // if (input.value) {
      //   const msg = input.value;
      //   console.log(msg);
      //   socket.on("private message", (chatroom, msg) => {
      //     // socket
      //     //   .to(chatroom)
      //     //   .emit("chat message", input.value, userId, div.dataset.id);
      //   });
      //   input.value = "";
      // }
    });

    div.addEventListener("click", async function (e) {
      e.preventDefault();
      // const id = await fetchSocket(div.dataset.id);
      socket.emit(
        "chatroom on",
        div.dataset.id,
        userId,
        messagesContainer.dataset.room
      );
      console.log(messagesContainer.dataset.room);
      if (messagesContainer.dataset.room) {
        socket.emit(
          "get messages",
          userId,
          div.dataset.id,
          messagesContainer.dataset.room
        );
      }
    });
  });

  socket.on();
  notConnectUsers.forEach((element) => {
    let div = document.createElement("div");
    div.classList.add("room", "flex", "grey");
    div.dataset.id = element._id;
    div.textContent = element.username;
    listUsersNotConnected.appendChild(div);

    div.addEventListener("click", function (e) {
      e.preventDefault();
      socket.emit("some room", div.dataset.id, userId);
      console.log("", messagesContainer.dataset.room);
      socket.emit("get messages", div.dataset.id, userId);
    });
  });
});

socket.on("all messages", function (message, room, participant) {
  console.log(message);
  if (!participant.includes(userId)) return;
  allRooms.classList.add("hidden");
  listUsersNotConnected.classList.add("hidden");
  friends.classList.add("hidden");
  dedicatedRoom.classList.remove("hidden");
  messagesContainer.innerHTML = "";
  message.forEach((element) => {
    // if (element.chatroom === messagesContainer.dataset.room) {
    formatMessage(element);
    // }
  });
  back.addEventListener("click", function (e) {
    e.preventDefault();
    allRooms.classList.remove("hidden");
    listUsersNotConnected.classList.remove("hidden");
    dedicatedRoom.classList.add("hidden");
    friends.classList.remove("hidden");
  });
});

socket.on("chat message", function ({ message, foreignId, id, room }) {
  if (room !== messagesContainer.dataset.room) {
    return;
  }
  formatMessage(message);
});

socket.on("delete user", (user) => {
  //console.log(user);
});
socket.on("one chatroom", ({ chatroom, foreignId, id }) => {
  console.table({ userId, id, foreignId, chatroom });
  if (userId === id || userId === foreignId) {
    messagesContainer.dataset.room = chatroom._id;
  }
  socket.emit(
    "get messages",
    userId,
    userId === id ? foreignId : id,
    messagesContainer.dataset.room
  );
});

function formatMessage(element) {
  const clone = messageTemplate.content.cloneNode(true);
  clone.querySelector("img").src = element.author.picture;
  clone.querySelector("p").textContent = element.content;
  clone.querySelector("small").textContent = element.createdAt;
  //messagesContainer.dataset.room = element.chatroom;
  messagesContainer.append(clone);
}

async function fetchSocket(id) {
  const rawRes = await axios.get("http://localhost:3000/socket/" + id);
  return rawRes.data.socketId;

  // return res.socketId;
}
