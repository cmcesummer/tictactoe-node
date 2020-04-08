var express = require("express");

var app = express();

var server = require("http").Server(app);
var io = require("socket.io")(server);

server.listen(8800);

app.use(express.static("public"));

const cache = {};

const history = [];

const ha = [];
const hb = [];

function check(array) {
  const arr = [...array];
  arr.sort();
  const last = arr[2];
  const mid = arr[1];
  const first = arr[0];
  if (last - 1 === mid) {
    if (last % 3 === 2) {
      return mid - 1 === first;
    }
    return false;
  }
  if (last - 3 === mid) {
    if (last >= 6) {
      return mid - 3 === first;
    }
    return false;
  }
  if (mid === 4) {
    if (last - 4 === mid) {
      return mid - 4 === first;
    }
    if (last - 2 === mid) {
      return mid - 2 === first;
    }
    return false;
  }
  return false;
}

io.on("connection", function (socket) {
  console.log(`connect:`, socket.id);

  socket.on("init", ({ player }) => {
    cache[player] = socket.id;
    socket.emit("news", { history });
  });

  socket.on("step", function (data) {
    const { my = "", player } = data;
    history.push({ my: my * 1, player });
    if (history.length === 7) {
      history.shift();
    }
    let flag = false;
    if (player === "A") {
      ha.push(my * 1);
      if (ha.length === 4) {
        ha.shift();
      }
      flag = check(ha);
    }
    if (player === "B") {
      hb.push(my * 1);
      if (hb.length === 4) {
        hb.shift();
      }
      flag = check(hb);
    }
    console.log(history, player, flag);
    Object.keys(cache).map((key) => {
      const id = cache[key];
      const sc = io.sockets.sockets[id];
      sc.emit("news", { history });
      if (flag) {
        sc.emit("end", { player });
      }
    });
  });
});
