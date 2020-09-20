const discord = require("discord.js");
const qdb = require("quick.db");
const db = new qdb.table("ayarlar");
const cdb = new qdb.table("cezalar");
module.exports = (oldUser, newUser) => {
  if(oldUser.username == newUser.username || oldUser.bot || newUser.bot) return;
  let ayarlar = db.get(`ayar`) || {};
  if(!ayarlar.tag) return;
  let client = oldUser.client;
  let guild = client.guilds.get(global.conf.sunucuId);
  if(!guild) return console.error(`${__filename} Sunucu bulunamadı!`);
  let user = guild.members.get(oldUser.id);
  if(!user) return;
  const embed = new discord.MessageEmbed().setAuthor(user.displayName, user.user.avatarURL({dynamic: true})).setFooter("YASHINU ❤️ ALOSHA").setColor(client.randomColor()).setTimestamp();
  let log = client.channels.get(ayarlar.ekipLogKanali);
  let yasakTaglilar = db.get('yasakTaglilar') || [];

  if ((ayarlar.yasakTaglar && ayarlar.yasakTaglar.some(tag => newUser.username.includes(tag))) && (ayarlar.jailRolu && !user.roles.has(ayarlar.jailRolu))) {
    user.roles.set(user.roles.has(ayarlar.boosterRolu) ? [ayarlar.boosterRolu, ayarlar.jailRolu] : [ayarlar.jailRolu]).catch();
    if(user.manageable) user.setNickname(newUser.username).catch();
    user.send(`**${user.guild.name}** sunucumuzun yasaklı taglarından birini kullanıcı adına aldığın için jaile atıldın! Tagı geri bıraktığında jailden çıkacaksın.`).catch();
    if(!yasakTaglilar.some(x => x.includes(newUser.id))) cdb.push('yasakTaglilar', `y${newUser.id}`);
    return;
  };
  if ((ayarlar.yasakTaglar && !ayarlar.yasakTaglar.some(tag => newUser.username.includes(tag))) && (ayarlar.jailRolu && user.roles.has(ayarlar.jailRolu)) && yasakTaglilar.some(x => x.includes(newUser.id))) {
    if (ayarlar.teyitsizRolleri) user.roles.set(ayarlar.teyitsizRolleri).catch();
    user.send(`**${user.guild.name}** sunucumuzun yasaklı taglarından birine sahip olduğun için jaildeydin ve şimdi bu yasaklı tagı çıkardığın için jailden çıkarıldın!`).catch();
    if (ayarlar.teyitKanali && client.channels.has(ayarlar.teyitKanali)) client.channels.get(ayarlar.teyitKanali).send(`\|\| ${user} \|\|`, { embed: embed.setDescription("Yasaklı tagı bıraktığın için teşekkür ederiz! Ses kanallarından birine gelerek kayıt olabilirsin.") }).catch();
    cdb.set('yasakTaglilar', yasakTaglilar.filter(x => !x.includes(newUser.id)));
    return;
  };
  
  if(newUser.username.includes(ayarlar.tag) && !user.roles.has(ayarlar.ekipRolu)){
      if ((ayarlar.teyitsizRolleri && ayarlar.teyitsizRolleri.some(rol => user.roles.has(rol))) || (ayarlar.jailRolu && user.roles.has(ayarlar.jailRolu))) return;
      if(user.manageable && ayarlar.ikinciTag) user.setNickname(user.displayName.replace(ayarlar.ikinciTag, ayarlar.tag)).catch();
      if(ayarlar.ekipRolu) user.roles.add(ayarlar.ekipRolu).catch();
      if(ayarlar.ekipLogKanali && log) log.send(embed.setDescription(`${user} kişisi ismine \`${ayarlar.tag}\` sembolünü alarak <@&${ayarlar.ekipRolu}> ekibimize katıldı!`).setColor("#32FF00")).catch();
  } else if(!newUser.username.includes(ayarlar.tag) && user.roles.has(ayarlar.ekipRolu)){
      if(user.manageable && ayarlar.ikinciTag) user.setNickname(user.displayName.replace(ayarlar.tag, ayarlar.ikinciTag)).catch();
      if(ayarlar.ekipRolu){
        let ekipRol = guild.roles.get(ayarlar.ekipRolu);
        user.roles.remove(user.roles.filter(rol => ekipRol.position <= rol.position)).catch();
      }
      if(ayarlar.ekipLogKanali && log) log.send(embed.setDescription(`${user} kişisi isminden \`${ayarlar.tag}\` sembolünü çıkararak <@&${ayarlar.ekipRolu}> ekibimizden ayrıldı!`).setColor("#B20000")).catch();
  }
}

module.exports.configuration = {
  name: "userUpdate"
}