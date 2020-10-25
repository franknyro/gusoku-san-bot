"use strict"
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

const TOKEN = config.TOKEN;
const CLIENT_ID = config.CLIENT_ID;

const  TURF = "🇳";
const ZONES = "🇦";
const TOWER = "🇾";
const  RAIN = "🇭";
const  CLAM = "🇨";
const   WIN = "😄";
const  LOSE = "😭";
const    OK = "🆗";
const   YES = "🇾";
const    NO = "🇳";

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async msg => {
    if (msg.content === "!ranked") {
        let playing = true;
        let timedOut = false;

        while (playing) {
            let sent, filter;

            sent = await msg.channel.send("ルールを教えてください");
            await sent.react(TURF);
            await sent.react(ZONES);
            await sent.react(TOWER);
            await sent.react(RAIN);
            await sent.react(CLAM);
            await sent.react(OK);
            filter = (reaction) => reaction.emoji.name === OK;
            await sent.awaitReactions(filter, {max: 1, time: 60000, errors: ["time"]})
                .then(() => {
                    let max_count = 0;
                    let mode;
                    sent.reactions.cache.forEach(reaction => {
                        // ゲームモードの情報をリアクションの数から取得
                        if (max_count < reaction.count) {
                            max_count = reaction.count;
                            mode = reaction.emoji.name;
                        }
                    });
                    console.log("mode is " + mode);
                })
                .catch(() => timedOut = true);
            if (timedOut) break;

            sent = await msg.channel.send("勝敗を教えてください");
            await sent.react(WIN);
            await sent.react(LOSE);
            await sent.react(OK);
            await sent.awaitReactions(filter, {max: 1, time: 60000, errors: ["time"]})
                .then(() => {
                    sent.reactions.cache.forEach(reaction => {
                        reaction.users.cache.forEach(user => {
                            // リアクションをつけたユーザー（Bot 以外）の ID を
                            // リアクションの種類別（OK 以外）で取得
                            if (user.id !== CLIENT_ID && reaction.emoji.name !== OK) {
                                console.log(reaction.emoji.name + ": " + user.id + " (" + user.username + ")");
                            }
                        });
                    });
                })
                .catch(() => timedOut = true);
            if (timedOut) break;

            sent = await msg.channel.send("続けますか？");
            await sent.react(YES);
            await sent.react(NO);
            filter = (reaction) => reaction.emoji.name === YES || NO;
            await sent.awaitReactions(filter, {max: 1, time: 60000, errors: ["time"]})
                .then((collected) => {
                    const reaction = collected.first();
                    if (reaction.emoji.name === NO) {
                        playing = false;
                    }
                })
                .catch(() => timedOut = true);
            if (timedOut) break;
        }
        if (timedOut) {
            msg.channel.send("タイムアウトしました");
            console.log("timed out!");
        }
        else {
            msg.channel.send("お疲れ様でした");
            console.log("gg");
        }
    }
});

client.login(TOKEN);