const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, "data");
const files = {
    players: path.join(dataDir, "players.json"),
    teams: path.join(dataDir, "teams.json"),
    session: path.join(dataDir, "auction_session.json"),
};

// Ensure data dir & default files exist
fs.ensureDirSync(dataDir);

if (!fs.existsSync(files.players)) fs.writeJsonSync(files.players, []);
if (!fs.existsSync(files.teams)) {
    fs.writeJsonSync(files.teams, [
        { id: 1, name: "Mumbai Warriors", budget: 75000, players: [], color: "bg-blue-600" },
        { id: 2, name: "Delhi Capitals", budget: 75000, players: [], color: "bg-red-600" }
    ]);
}
if (!fs.existsSync(files.session)) {
    fs.writeJsonSync(files.session, {
        currentPlayerIndex: 0,
        auctionActive: false,
        currentBid: 0,
        currentBidder: null,
        timestamp: new Date().toISOString()
    });
}

// ---- Generic file helper ----
const readFile = async (filePath) => fs.readJson(filePath);
const writeFile = async (filePath, data) => fs.writeJson(filePath, data, { spaces: 2 });

// ---- API routes ----

// Players
app.get("/api/players", async (req, res) => {
    res.json(await readFile(files.players));
});

app.post("/api/players", async (req, res) => {
    const players = await readFile(files.players);
    players.push(req.body);
    await writeFile(files.players, players);
    res.json({ message: "Player added", players });
});

app.put("/api/players", async (req, res) => {
    await writeFile(files.players, req.body);
    res.json({ message: "Players updated" });
});

// Teams
app.get("/api/teams", async (req, res) => {
    res.json(await readFile(files.teams));
});

app.put("/api/teams", async (req, res) => {
    await writeFile(files.teams, req.body);
    res.json({ message: "Teams updated" });
});

// Auction session
app.get("/api/session", async (req, res) => {
    res.json(await readFile(files.session));
});

app.put("/api/session", async (req, res) => {
    await writeFile(files.session, req.body);
    res.json({ message: "Session updated" });
});

// Health check
app.get("/", (req, res) => {
    res.send("Auction Backend is running 🚀");
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
