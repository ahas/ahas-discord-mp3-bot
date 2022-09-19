const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { resolve } = require("path");

module.exports = {
  data: new SlashCommandBuilder().setName("play").setDescription("play the sound"),
  run: async (interaction) => {
    if (!interaction.member.voice.channelId) {
      return await interaction.reply({ content: "통화방에 들어가 있지 않습니다.", ephemeral: true });
    }

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    // 파일명만
    const file = "nice.mp3";
    const player = createAudioPlayer();
    const resource = createAudioResource(resolve(__dirname, `../mp3/${file}`));
    console.log("play", file);

    connection.subscribe(player);

    player.play(resource);

    return await interaction.reply({ content: "반가워요~", ephemeral: true });
  },
};
