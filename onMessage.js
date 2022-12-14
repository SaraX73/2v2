const config = require('./config.json');
const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Client, EmbedBuilder } = Discord;
const lang = (path, args = {}) => require("./lang.js")(path, { ...args, ...require("./emojis.json") });

module.exports = async function(message) {
 try{
 if(
  message.author.bot||
  !message.content.startsWith(config.prefix)
 ) return;
 let args = message.content.toLowerCase().split` `;
 let command = args
  .splice(0,1)[0]
  .replace(config.prefix,"");
 if(command!="2v2") return;
 let cmd = config.prefix+command;
 let subcmd = args.splice(0,1)[0]||null;
 if(!subcmd) {
  let embed = new EmbedBuilder();
  embed.setTitle(lang("title"));
  embed.setDescription(lang(
   "main.description",{cmd}
  ));
  embed.addFields([{
   name: lang("main.fields.0.name"),
   value: lang("main.fields.0.value",{cmd})
  }]);
  message.reply({
   embeds: [embed]
  });
 } else if(subcmd=="rules") {
  let embed = new EmbedBuilder();
  embed.setTitle(lang("title"));
  embed.setDescription(lang(
   "rules.description", { cmd }
  ));
  embed.setFooter({text:"hello",iconURL:"https://www.ifjrhjdhrhdididjevsjsijehehejdioeiwjjjwisjsjeiieiehej.com/"})
  message.reply({
   embeds: [embed]
  });
 } else if (subcmd == "rulesasta") {
  if(!config.devs.includes(message.author.id)) return;
  let embed = new EmbedBuilder();
  embed.setTitle(lang("title"));
  embed.setDescription(lang(
   "rules.descriptionasta", { cmd }
  ));
  message.reply({
   embeds: [embed]
  });
 } else if(subcmd=="create"){
  let embed = getMatchCreateEmbedFromRaw(`c_${message.author.id}_11_0_0_0_0_0_0`);
  message.reply({
   embeds: [embed],
   components: [
    new ActionRowBuilder()
     .addComponents(
      new ButtonBuilder()
       .setCustomId(`show c_${message.author.id}_11_0_0_0_0_0_0`)
       .setLabel('Show menu 🔽')
       .setStyle(ButtonStyle.Success)
      )
   ]
  });
 } else if (subcmd=="elist") {
    if(!config.devs.includes(message.author.id)) return;
  let raw = await message.guild.emojis.fetch();
  let toSend={};
  raw.forEach(e=>toSend[`:${e.name}:`]=e.id);
  message.reply(`\`\`\`json\n${JSON.stringify(toSend,null,1)}\n\`\`\``);
 } else if (subcmd == "recreate") {
    if(!config.devs.includes(message.author.id)) return;
  let embed = getMatchCreateEmbedFromRaw(args[0]);
  message.reply({
   embeds: [embed],
   components: [
     new ActionRowBuilder()
      .addComponents(
     new ButtonBuilder()
     .setCustomId(`show ${args[0]}`)
     .setLabel('Show menu 🔽')
     .setStyle(ButtonStyle.Success)
    )
    ]
  });
 };
}catch(e){console.error(e)};
};



function getMatchCreateEmbedFromRaw(raw) {
 let data = getLobbyData(raw);
 let embed = new EmbedBuilder();

 embed.setTitle(lang("title"));

 embed.setDescription(lang("create.description", {
  hostId: data.host,
  playersCount: data.playersCount,
  wait: data.status == "missing" ? "players to join" : (data.status == "waiting" ? "player to get into thier teams" : "host to start"),
  status: data.status
 }));
 embed.addFields([
  {
   name: lang("create.team1.name", {
    status: data.teams[0].status,
    playersCount: data.teams[0].playersCount
   }),
   value: lang("create.team1.value", {
    player1: data.teams[0].spots[0] ? `<@${data.teams[0].spots[0]}>` : "empty",
    player2: data.teams[0].spots[1] ? `<@${data.teams[0].spots[1]}>` : "empty",
    player3: data.teams[0].spots[2] ? `<@${data.teams[0].spots[2]}>` : "empty"
   }),
   inline: true
    },
  {
   name: lang("create.team2.name", {
    status: data.teams[1].status,
    playersCount: data.teams[1].playersCount
   }),
   value: lang("create.team2.value", {
    player1: data.teams[1].spots[0] ? `<@${data.teams[1].spots[0]}>` : "empty",
    player2: data.teams[1].spots[1] ? `<@${data.teams[1].spots[1]}>` : "empty",
    player3: data.teams[1].spots[2] ? `<@${data.teams[1].spots[2]}>` : "empty"
   }),
   inline: true
    }
   ]);
 return embed;
};

function getLobbyData(d) {
 let data = {
  playersCount: 0,
  players: [],
  teams: [{ spots: [null, null, null], playersCount: 0 }, { spots: [null, null, null], playersCount: 0 }]
 };
 let a = d.split`_`;
 for (let x = 1; x < 8; x = x + 2) {
  let id = a[x];
  let [team, pos] = a[x + 1].split``;
  if (x == 1) data.host = id;
  if (id != 0) {
   data.playersCount++;
   data.players.push({
    id,
    team: `${Number(team)-1}`,
    pos: `${Number(pos)-1}`,
    host: x == 1
   });
   data.teams[Number(team) - 1].spots[Number(pos) - 1] = id;
   data.teams[Number(team) - 1].playersCount++;
  };
 };
 data.status = data.playersCount < 4 ? "missing" : (data.teams[0].spots[0] != null && data.teams[0].spots[1] != null && data.teams[1].spots[0] != null && data.teams[1].spots[1] != null ? "ready" : "waiting");
 data.teams[0].status = data.teams[0].playersCount < 2 ? "missing" : (data.teams[0].spots[2] == null ? "ready" : "waiting");
 data.teams[1].status = data.teams[1].playersCount < 2 ? "missing" : (data.teams[1].spots[2] == null ? "ready" : "waiting");
 return data;
};
