require("dotenv").config();//?

const config = require('./config.json');
const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Client, EmbedBuilder } = Discord;
const lang=(path, args={})=>require("./lang.js")(path,{...args,...require("./emojis.json")});
const createMenuButtonClick = require("./createMenuButtonClick.js")
const onMessage = require('./onMessage.js');
const onTileClick = require("./onTileClick.js");

const client = new Discord.Client({ 
 intents: Object.values(Discord.GatewayIntentBits),
 partials: Object.values(Discord.Partials),
 restRequestTimeout: 100000,
 closeTimeout: 100000,
 restSweepInterval: 600,
 rest: { timeout: 100000 }
});

client.on("messageCreate",onMessage);

client.on("messageCreate",async(message)=>{
 if(message.content=="-2v2 demo") {
  return await message.reply({
   embeds: []
  })
 };
});


client.on(Events.InteractionCreate,async(int)=>{try{
 if (int.isButton()) {
  if(int.customId.startsWith("match.play")) {
   return await onTileClick(int)
  } else if(int.customId.startsWith("match.after.")) {
   
  } else if(int.customId.startsWith("create.") || int.customId.startsWith("show")) {
   return await createMenuButtonClick(int);
  };
 };
}catch(e){console.error(e)};});

client.on("ready",()=>console.log(client.user.tag));
client.login(config.token);

