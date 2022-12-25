const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
app.use(express.json());

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error is ${error}`);
    process.exit(1);
  }
};
intializeDBAndServer();

//API 1
//Returns a list of all the players in the player table

const convertDBObjectAPI1 = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT * FROM player_details`;
  const getPlayerQueryResponse = await db.all(getPlayerQuery);
  response.send(
    getPlayerQueryResponse.map((eachPlayer) => convertDBObjectAPI1(eachPlayer))
  );
});

//API 2
// Returns a specific player based on the player ID

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerById = `SELECT * FROM player_details
    WHERE player_id = ${playerId}`;
  const getPlayerByIdResponse = await db.get(getPlayerById);
  response.send(convertDBObjectAPI1(getPlayerByIdResponse));
});

//API 3
// Updates the details of a specific player based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `UPDATE player_details
    SET player_name = '${playerName}' WHERE player_id = ${playerId}`;
  const updatePlayerQueryResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 4
//Returns the match details of a specific match

const converDBObjectAPI4 = (objectItem) => {
  return {
    matchId: objectItem.match_id,
    match: objectItem.match,
    year: objectItem.year,
  };
};

app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT * FROM match_details
    WHERE match_id = ${matchId}`;
  const getMatchQueryResponse = await db.get(getMatchQuery);
  response.send(converDBObjectAPI4(getMatchQueryResponse));
});

// API 5
// Returns a list of all the matches of a player

const convertDBObjectAPI5 = (objectItem) => {
  return {
    matchId: objectItem.match_id,
    match: objectItem.match,
    year: objectItem.year,
  };
};

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchByPlayerId = `SELECT * FROM player_match_score
    NATURAL JOIN match_details
    WHERE player_id = ${playerId}`;
  const getMatchByPlayerIdResponse = await db.all(getMatchByPlayerId);
  response.send(
    getMatchByPlayerIdResponse.map((eachMatch) =>
      convertDBObjectAPI5(eachMatch)
    )
  );
});

//API 6
// Returns a list of players of a specific match

const convertDBObjectAPI6 = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
  };
};

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerByMatchId = `SELECT * FROM player_match_score
    NATURAL JOIN player_details WHERE match_id = ${matchId}`;
  const getPlayerByMatchIdResponse = await db.all(getPlayerByMatchId);
  response.send(
    getPlayerByMatchIdResponse.map((eachPlayer) =>
      convertDBObjectAPI6(eachPlayer)
    )
  );
});

//API 7
//Returns the statistics of the total score, fours, sixes of a specific player based on the player ID

const convertDBObjectAPI7 = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    totalScore: objectItem.total_score,
    totalFours: objectItem.total_fours,
    totalSixes: objectItem.total_sixes,
  };
};

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `SELECT
    player_id,player_name,SUM(score) AS total_score,
    SUM(fours) AS total_fours, SUM(sixes) AS total_sixes
    FROM player_match_score NATURAL JOIN player_details
    WHERE player_id = ${playerId}`;
  const getPlayerDetailsResponse = await db.all(getPlayerDetails);
  response.send(
    getPlayerDetailsResponse.map((eachPlayer) =>
      convertDBObjectAPI7(eachPlayer)
    )
  );
});

module.exports = app;
