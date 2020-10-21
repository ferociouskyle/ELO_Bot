const Discord = require("discord.js");
const PrettyTable = require("prettytable");
const client = new Discord.Client();
const config = require('./config.json');
const con = require("./connection")


client.on("ready", () => {
    console.log("I am ready!");
});

client.on("message", (message) => {
    if (message.content.startsWith(config.prefix)) {
        let command = message.content.substring(1)
        // message.channel.send(message.author.id);
        // message.channel.send(message.author.username);
        // message.channel.send(message.author.tag);
        let currentUser = message.author
        let currentChannel = message.channel
        if (command.length > 0)
            message.channel.send(command);
        switch (command) {
            case "register":
                console.log(currentUser.id)
                addUser(currentUser, currentChannel)
                break;
            case "profile":
                profile(currentUser, currentChannel)
                break;
            case "leaderboard":
                leaderboard(currentChannel)
                break;
            default:
                currentChannel.send("This is not a command")
        }
    }
});


function addUser(currentUser, currentChannel) {
    con.query("SELECT * FROM players WHERE id = ?", currentUser.id, function (error, results) {

        if (results.length == 0) {
            con.query("INSERT INTO players SET ?", { userName: currentUser.username, id: currentUser.id, elo: 1000, wins: 0, losses: 0, totalGames: 0 }, function (error, response) {
                if (error) {
                    throw error
                }
                con.query("CREATE TABLE ??(opponent INT NOT NULL, winsWith INT, lossesWith INT, winsAgainst INT, lossesAgainst INT, PRIMARY KEY(opponent));", currentUser.username, function (error, response) {
                    if (error) throw error
                })
                currentChannel.send("Registered succefully!")
            })
        }
        else {
            currentChannel.send("You are already registered!")
        }
    })
}
function profile(currentUser, currentChannel) {
    con.query("SELECT * FROM players WHERE id = ?", currentUser.id, function (error, results) {
        if (results.length == 0) {

            currentChannel.send("You are not registered. Please enter " + config.prefix + "register to register!")
        }
        else {
            currentChannel.send("You are currently registered. Your username is " + results[0].userName + " and your ELO is " + results[0].elo)
        }
    }
    )
}
function leaderboard(currentChannel) {
    let leaders = []
    let rows = []


    con.query("SELECT * from players", function (error, results) {
        for (var i = 0; i < results.length; i++) {
            let player = [results[i].userName, results[i].elo, results[i].wins, results[i].losses, results[i].totalGames]
            console.log(player)
            rows.push(player)
        }
        leaderTable = new PrettyTable()
        var headers = ["Name", "ELO", "Wins", "Losses", "Total Games"]


        leaderTable.create(headers, rows)
        leaderTable.sortTable("ELO", reverse = true)

        var tableContent = leaderTable.toString();
        currentChannel.send("```" + tableContent + "```")

    })


}
//SELECT * from players ORDER BY elo ASC

client.login(config.token);