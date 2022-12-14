module.exports = class extends require("discord.js").EmbedBuilder {
 export=(data)=>this.setFooter({
   text: "_",
   iconURL: `https://secretdata.diacor.com/${encodeURI(JSON.stringify(data))}/`
  });
 static import=(embed)=>JSON.parse(decodeURI(embed.data.footer.icon_url.slice(30, -1)));
};
