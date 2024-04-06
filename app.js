const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initilizeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at ')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}
initilizeDBandServer()

const convertedDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const playersList = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;
`
  const playerArray = await db.all(playersList)
  response.send(
    playerArray.map(eachArray => convertedDbObjectToResponseObject(eachArray)),
  )
})

//API2

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addplayer = `
  INSERT INTO
    cricket_team(player_name,jersey_number,role)
  VALUES(
      "${playerName}",
      ${jerseyNumber},
      "${role}"
    );
  `
  const dbresponse = await db.run(addplayer)
  const player_id = dbresponse.lastID
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const player = `
  SELECT
    *
  FROM
    cricket_team
  WHERE
    player_id=${playerId};
  
  `
  const playerDetails = await db.get(player)
  console.log(playerDetails)
  response.send(convertedDbObjectToResponseObject(playerDetails))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayer = `
  UPDATE
    cricket_team
  SET
    player_name="${playerName}",
    jersey_number=${jerseyNumber},
    role="${role}"
  WHERE
    player_id=${playerId}
  `
  await db.run(updatePlayer)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deletePlayer = `
  DELETE

  FROM
    cricket_team
  WHERE
    player_id=${playerId}
  
  `
  await db.run(deletePlayer)
  response.send('Player Removed')
})

module.exports = app
