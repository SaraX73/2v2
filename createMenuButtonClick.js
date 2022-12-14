const config = require('./config.json');
const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = Discord;
const lang = (path, args = {}) => require("./lang.js")(path, { ...args, ...require("./emojis.json") });
const {convertPlayersDataToMatch, getMatchMessageFromData} = require("./matchStuff.js")


module.exports = async function(int) {
 if (int.customId.startsWith("show")) return await showMenuButtonClick(int);
 else if (int.customId.startsWith("create.menu.refresh")) return await refreshMenuButtonClick(int, "Refreshed");
 else if (int.customId.startsWith("create.menu.end")) return await endLobbyButtonClick(int);
 else if (int.customId.startsWith("create.menu.join")) return await joinTeamButtonClick(int);
 else if (int.customId.startsWith("create.menu.leave")) return await leaveLobbyButtonClick(int);
 else if (int.customId.startsWith("create.menu.switch")) return await switchTeamButtonClick(int);
 else if (int.customId.startsWith("create.menu.spot")) return await changeSpotButtonClick(int);
 else if (int.customId.startsWith("create.menu.start")) return await startMatchButtonClick(int);
 else return null;
};

function emote(e) {
 return lang("emoji",{e}).split`:`[2].slice(0,-1)
};

async function startMatchButtonClick(int) {


  if (!int.isRepliable()) return;
  await int.deferUpdate();
  let message;
  try {
   message = await int.message.channel.messages.fetch(int.customId.split` ` [1]);
  } catch (e) {};
  if (!message) return await int.editReply({
   content: "**Lobby Buttons**\n```Lobby Not Found\n```",
   ephemeral: true,
   components: []
  });

  let rawData = message.components[0].components[0].customId.split` ` [1];
  if(!rawData.startsWith("c_")) return;
  let data = getLobbyData(rawData);


  if (data.status!="ready") {
   return await refreshMenuButtonClick(int, "The lobby is not ready to start a match", message);
  };

  let matchData = convertPlayersDataToMatch(data.players);
  
  let msgData = getMatchMessageFromData(matchData);
  
  
  await message.edit(msgData);
  
  await int.deleteReply();
  
};

async function changeSpotButtonClick(int) {
 
 
 if (!int.isRepliable()) return;
 await int.deferUpdate();
 let message;
 try {
  message = await int.message.channel.messages.fetch(int.customId.split` ` [1]);
 } catch (e) {};
 if (!message) return await int.editReply({
  content: "**Lobby Buttons**\n```Lobby Not Found\n```",
  ephemeral: true,
  components: []
 });
 
 let rawData = message.components[0].components[0].customId.split` `[1];
 if(!rawData.startsWith("c_")) return;
 let s = Number(int.customId.split` `[0].split`.`[3]);
 let data = getLobbyData(rawData);

 
 if(!data.players.some(p=>p.id==int.user.id)) {
  return await refreshMenuButtonClick(int, "You're not in that lobby", message);
 };
 
 let p=data.players.find(e=>e.id==int.user.id);
 if(data.teams[p.team].spots[s]==p.id) {
  return await refreshMenuButtonClick(int, "You're already in this spot", message);
 };
 if (data.teams[p.team].spots[s]!=null) {
  return await refreshMenuButtonClick(int, "this spot is taken", message);
 };
 p.pos=s;
 let newRaw = playersDataToRaw([
  ...data.players.filter(e=>e.id!=p.id),
  p
  ]);
  let newEmbed = getMatchCreateEmbedFromRaw(newRaw);
 
 
 let newMessage = await message.edit({
  embeds: [newEmbed],
  components: [
  new ActionRowBuilder()
   .addComponents(
    new ButtonBuilder()
    .setCustomId(`show ${newRaw}`)
    .setLabel('Show menu 🔽')
    .setStyle(ButtonStyle.Success)
   )
 ]
 });
 
 return await refreshMenuButtonClick(int,"Moved",newMessage);

 
};

async function switchTeamButtonClick(int,message=null) {
 
 if (!(int.isRepliable() || int.deferred)) return;
 if (!int.deferred) await int.deferUpdate();
 try {
  if (!message) message = await int.message.channel.messages.fetch(int.customId.split` `[1]);
 } catch (e) {};
 if (!message) return await int.editReply({
  content: "**Lobby Buttons**\n```Lobby Not Found\n```",
  ephemeral: true,
  components: []
 });
 
 let rawData = message.components[0].components[0].customId.split` `[1];
 if(!rawData.startsWith("c_")) return;
 let otn = Number(int.customId.split` `[0].split`.`[3]);
 let data = getLobbyData(rawData);
 

 if(data.teams[otn].playersCount>2) return await refreshMenuButtonClick(int,"This team is full",message);
 
 if(!data.players.some(p=>p.id==int.user.id)){
  return await refreshMenuButtonClick(int, "You're not in this lobby", message);
 };
 let p=data.players.find(p=>p.id==int.user.id);
 p.team=otn;
 p.pos=data.teams[otn].spots.indexOf(null);
 let newRaw = playersDataToRaw([
  ...data.players.filter(p=>p.id!=int.user.id),
   p
  ]);
  
  let newEmbed = getMatchCreateEmbedFromRaw(newRaw);
 
 
 let newMessage = await message.edit({
  embeds: [newEmbed],
  components: [
  new ActionRowBuilder()
       .addComponents(
    new ButtonBuilder()
    .setCustomId(`show ${newRaw}`)
    .setLabel('Show menu 🔽')
    .setStyle(ButtonStyle.Success)
   )
 ]
 });
 
 return await refreshMenuButtonClick(int,"Switched",newMessage);

 
};

async function leaveLobbyButtonClick(int) {


 if (!int.isRepliable()) return;
 await int.deferUpdate();
 let message;
 try {
  message = await int.message.channel.messages.fetch(int.customId.split` ` [1]);
 } catch (e) {};
 if (!message) return await int.editReply({
  content: "**Lobby Buttons**\n```Lobby Not Found\n```",
  ephemeral: true,
  components: []
 });
 
 let rawData = message.components[0].components[0].customId.split` `[1];
 if(!rawData.startsWith("c_")) return;
 let data = getLobbyData(rawData);
 
 if(!data.players.some(p=>p.id==int.user.id)) return await refreshMenuButtonClick(int,"You're not in this lobby",message);
 
 
 let newRaw = playersDataToRaw(data.players.filter(p=>p.id!=int.user.id));
  
 let newEmbed = getMatchCreateEmbedFromRaw(newRaw);
 
 
 let newMessage = await message.edit({
  embeds: [newEmbed],
  components: [
  new ActionRowBuilder()
       .addComponents(
    new ButtonBuilder()
    .setCustomId(`show ${newRaw}`)
    .setLabel('Show menu 🔽')
    .setStyle(ButtonStyle.Success)
   )
 ]
 });
 
 return await refreshMenuButtonClick(int,"Left",newMessage);


};

function playersDataToRaw(players) {
 let rawA = "c_0_0_0_0_0_0_0_0".split`_`;
 let host = players.find(p => p.host);
 let others = players.filter(p => !p.host);
 rawA[1] = host.id;
 rawA[2] = `${Number(host.team)+1}${Number(host.pos)+1}`;
 for (let x of [0, 1, 2]) {
  if (others[x]) {
   rawA[x * 2 + 3] = others[x].id;
   rawA[x * 2 + 4] = `${Number(others[x].team)+1}${Number(others[x].pos)+1}`;
  };
 };
 return rawA.join("_")
};

function getMatchCreateEmbedFromRaw(raw){
 let data=getLobbyData(raw);
 let embed = new EmbedBuilder();
 
 embed.setTitle(lang("title"));
 
 embed.setDescription(lang("create.description", {
  hostId: data.host,
  playersCount: data.playersCount,
  wait: data.status=="missing"?"players to join":(data.status=="waiting"?"player to get into thier teams":"host to start"),
  status: data.status
 }));
 embed.addFields([
  {
   name: lang("create.team1.name", {
    status: data.teams[0].status,
    playersCount: data.teams[0].playersCount
   }),
   value: lang("create.team1.value", {
    player1: data.teams[0].spots[0]?`<@${data.teams[0].spots[0]}>`:"empty",
    player2: data.teams[0].spots[1]?`<@${data.teams[0].spots[1]}>`:"empty",
    player3: data.teams[0].spots[2]?`<@${data.teams[0].spots[2]}>`:"empty"
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

async function joinTeamButtonClick(int) {
 if (!int.isRepliable()) return;
 await int.deferUpdate();
 let message;
 try {
  message = await int.message.channel.messages.fetch(int.customId.split` ` [1]);
 } catch (e) {};
 if (!message) return await int.editReply({
  content: "**Lobby Buttons**\n```Lobby Not Found\n```",
  ephemeral: true,
  components: []
 });
 
 let rawData = message.components[0].components[0].customId.split` `[1];
 if(!rawData.startsWith("c_")) return;
 let t = Number(int.customId.split` `[0].split`.`[3]);
 let data = getLobbyData(rawData);
 
 if(data.playersCount>3) return await refreshMenuButtonClick(int,"This lobby is full",message);

 if(data.teams[t].playersCount>2) return await refreshMenuButtonClick(int,"This team is full",message);
 
 if(data.players.some(p=>p.id==int.user.id)) {
  let p=data.players.find(e=>e.id==int.user.id);
  if(p.team==t) return await refreshMenuButtonClick(int,"You're already in that team",message);
  else return await switchTeamButtonClick(int,message);
 };
 
 let newRaw = playersDataToRaw([
  ...data.players,
  {
   id: int.user.id,
   team: t,
   pos: data.teams[t].spots.indexOf(null),
   host: false
  }
  ]);
  
  let newEmbed = getMatchCreateEmbedFromRaw(newRaw);
 
 
 let newMessage = await message.edit({
  embeds: [newEmbed],
  components: [
  new ActionRowBuilder()
       .addComponents(
    new ButtonBuilder()
    .setCustomId(`show ${newRaw}`)
    .setLabel('Show menu 🔽')
    .setStyle(ButtonStyle.Success)
   )
 ]
 });
 
 return await refreshMenuButtonClick(int,"Joined",newMessage);
};

async function endLobbyButtonClick(int) {
   if (!int.isRepliable()) return;
   await int.deferUpdate();
   let message;
   try {
    message=await int.message.channel.messages.fetch(int.customId.split` ` [1]);
   } catch (e) {};
   if (!message) return await int.editReply({
    content: "**Lobby Buttons**\n```Lobby Not Found\n```",
    ephemeral: true,
    components: []
   });
   let rawData = message.components[0].components[0].customId.split` ` [1];
   if (!rawData.startsWith("c_")) return;
   await message.delete();
   await int.editReply({
    content: `**Lobby Buttons**\n\`\`\`\nLobby Ended\`\`\``,
    ephemeral: true,
    components: []
   });
};

async function refreshMenuButtonClick(int,m,message=null) {
 if(!(int.isRepliable()||int.deferred)) return;
 if(!int.deferred) await int.deferUpdate();
 try{
  if(!message) message = await int.message.channel.messages.fetch(int.customId.split` `[1]);
 } catch(e) {};
 if(!message) return await int.editReply({
  content: "**Lobby Buttons**\n```Lobby Not Found\n```",
  ephemeral: true,
  components: []
 });
 let rawData = message.components[0].components[0].customId.split` ` [1];
 if (!rawData.startsWith("c_")) return;
 let components = loadMenuComponents(
  int,
  message,
  rawData
 );
 await int.editReply({
  content: `**Lobby Buttons**\n\`\`\`\n${m}\`\`\``,
  ephemeral: true,
  components
 });
};

async function showMenuButtonClick(int) {
  if(!int.isRepliable()) return;
  await int.deferReply({ephemeral:true});
  let components = loadMenuComponents(
   int,
   int.message,
   int.customId.split` `[1]
  );
  await int.followUp({
   content: "**Lobby Buttons**\n```\nWaiting for actions```",
   ephemeral: true,
   components
  });
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
 data.teams[0].status = data.teams[0].playersCount <2 ? "missing" : (data.teams[0].spots[2] == null ? "ready" : "waiting");
 data.teams[1].status = data.teams[1].playersCount < 2 ? "missing" : (data.teams[1].spots[2] == null ? "ready" : "waiting");
 return data;
};

function loadMenuComponents(int,message,rawData) {
 
 let lobbyData=getLobbyData(rawData);
  
  let mainRow = new ActionRowBuilder()
   if(lobbyData.host==int.user.id) {
    mainRow.addComponents(
     new ButtonBuilder()
      .setCustomId(`create.menu.start ${message.id}`)
      .setLabel("Start match")
      .setStyle(ButtonStyle.Success)
      .setDisabled(lobbyData.status!="ready"),
     new ButtonBuilder()
      .setCustomId(`create.menu.end ${message.id}`)
      .setLabel("End lobby")
      .setStyle(ButtonStyle.Danger)
    );
   };
   
   mainRow.addComponents(
    new ButtonBuilder()
    .setCustomId(`create.menu.refresh ${message.id}`)
    .setLabel("🔄")
    .setStyle(ButtonStyle.Secondary)
   );
   
   let teamRow = new ActionRowBuilder();
   let spotsRow = null;
   
   if(!lobbyData.players.some(p=>p.id==int.user.id)) {
    teamRow.addComponents(
     new ButtonBuilder()
      .setCustomId(`create.menu.join.0 ${message.id}`)
      .setLabel("Join Team xy")
      .setStyle(ButtonStyle.Success)
      .setDisabled(lobbyData.teams[0].playersCount>2||lobbyData.playersCount>3)
      .setEmoji(emote("rb_b")),
      new ButtonBuilder()
      .setCustomId(`create.menu.join.1 ${message.id}`)
      .setLabel("Join Team 45°")
      .setStyle(ButtonStyle.Success)
      .setDisabled(!lobbyData.teams[1].playersCount>2||lobbyData.playersCount>3)
       .setEmoji(emote("gy_y"))
    );
   } else {
    let otn=lobbyData.players.find(p=>p.id==int.user.id).team==0?1:0;
    teamRow.addComponents(
      new ButtonBuilder()
      .setCustomId(`create.menu.switch.${otn} ${message.id}`)
      .setLabel(`Switch to Team ${otn?"45°":"xy"}`)
      .setStyle(ButtonStyle.Success)
      .setDisabled(lobbyData.teams[otn].playersCount>2)
      .setEmoji(emote(otn?"gy_y":"rb_b")),
      new ButtonBuilder()
      .setCustomId(`create.menu.leave ${message.id}`)
      .setLabel("Leave lobby")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(lobbyData.host==int.user.id)
     );
     let t = otn==0?1:0;
     let i = [
      !t?"r_r":"g_g",
      !t?"b_b":"y_y"
     ];
     for(let x of[0,1,2]) {
      let s=lobbyData.teams[t].spots[x]
      i.push(s?(s==int.user.id?"Success":"Danger"):"Primary");
     };
     spotsRow = new ActionRowBuilder()
      .addComponents(
       new ButtonBuilder()
        .setLabel("1")
        .setEmoji(emote(i[0]))
        .setStyle(ButtonStyle[i[2]])
        .setDisabled(i[2]!="Primary")
        .setCustomId(`create.menu.spot.0 ${message.id}`),
       new ButtonBuilder()
        .setLabel("2")
        .setEmoji(emote(i[1]))
        .setStyle(ButtonStyle[i[3]])
        .setDisabled(i[3] != "Primary")
        .setCustomId(`create.menu.spot.1 ${message.id}`),
       new ButtonBuilder()
        .setLabel("Switch 3")
        .setStyle(ButtonStyle[i[4]])
        .setDisabled(i[4] != "Primary")
        .setCustomId(`create.menu.spot.2 ${message.id}`),
      )
   };
   
   let components = [mainRow, teamRow];
   if(spotsRow) components.push(spotsRow);
   
   return components;
};
