const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const MainDefinition = grpc.loadPackageDefinition(
  protoLoader.loadSync(path.resolve(__dirname, "./protos/gaming/main.proto"))
);

const platforms = [
  { id: 1, name: "Sega Genesis" },
  { id: 2, name: "Super Nintendo" },
  { id: 3, name: "Sega Dreamcast" },
  { id: 4, name: "Nintendo 64" },
];

const games = [
  { id: 1, name: "Sonic", platform: platforms[0] },
  { id: 2, name: "Sonic 2", platform: platforms[0] },
  {
    id: 3,
    name: "Super Mario World",
    platform: platforms[1],
  },
];

function ListGames(_, callback) {
  return callback(null, { games });
}

function ListPlatforms(_, callback) {
  return callback(null, { platforms });
}

function Find(id, list) {
  return list.find(item => item.id === id);
}

function FindGame({ request: { id } }, callback) {
  const game = Find(id, games);
  if (!game) return callback(new Error("Not found"), null);
  return callback(null, { game });
}

function FindPlatform({ request: { id } }, callback) {
  const platform = Find(id, platforms);
  if (!platform) return callback(new Error("Not found"), null);
  return callback(null, { platform });
}

const server = new grpc.Server();

server.addService(MainDefinition.PlatformService.service, {
  List: ListPlatforms,
  Find: FindPlatform,
});

server.addService(MainDefinition.GameService.service, {
  List: ListGames,
  Find: FindGame,
});

server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    console.log("Server running at http://127.0.0.1:50051");
    server.start();
  }
);
