const express = require("express");
const fs = require("fs");
const https = require("https");
const path = require("path");
const theblockchainapi = require('theblockchainapi');
const app = express();
const fetch = require('node-fetch');

app.use(express.static(path.join(__dirname, "../frontend")));
const argon2 = require("argon2");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const users = require("./users.json");

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const hashedPassword = await argon2.hash(password);

  const newUser = {
    id: Date.now(),
    email,
    password: hashedPassword,
    loginCount: 0,
    lastLogin: null,
  };

  users.push(newUser);

  fs.writeFileSync("./users.json", JSON.stringify(users));

  res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const users = JSON.parse(fs.readFileSync("./users.json"));

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  let validPassword = false;
  try {
    validPassword = await argon2.verify(user.password, password);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error verifying password" });
  }

  if (!validPassword) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // increment loginCount and update lastLogin
  user.loginCount += 1;
  user.lastLogin = new Date().toISOString();

  fs.writeFileSync("./users.json", JSON.stringify(users));

  res.status(200).json({ message: "Logged in successfully" });
});

let defaultClient = theblockchainapi.ApiClient.instance;
let APIKeyID = defaultClient.authentications['APIKeyID'];
let APISecretKey = defaultClient.authentications['APISecretKey'];

APIKeyID.apiKey = '6ALqqyGmGooE6Oj';
APISecretKey.apiKey = 'PPI3Cjw8YycOiEu';

let apiInstance = new theblockchainapi.SolanaNFTApi();

app.post("/getNFTMetadata", async (req, res) => {
  const { mintAddress, network } = req.body;

  const result = await apiInstance.solanaGetNFT(network, mintAddress).catch((error) => {
    console.error(error);
    return res.status(500).json({ message: "Error fetching NFT metadata" });
  });

  const metadataResponse = await fetch(result.data.uri).catch((error) => {
    console.error(error);
    return res.status(500).json({ message: "Error fetching NFT metadata from URI" });
  });

  const metadata = await metadataResponse.json().catch((error) => {
    console.error(error);
    return res.status(500).json({ message: "Error parsing NFT metadata from URI" });
  });

  res.json(metadata);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/home.html"));
});

const options = {
  key: fs.readFileSync("/home/ubuntu/Auth101/AuthenticationNFT/TLS/key.pem"),
  cert: fs.readFileSync("/home/ubuntu/Auth101/AuthenticationNFT/TLS/cert.pem"),
};

https.createServer(options, app).listen(3000, () => {
  console.log("Server listening on port 3000");
});

