const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { resolve } = require("path");

module.exports = {
  data: new SlashCommandBuilder().setName("play").setDescription("음성을 재생합니다."),
  run: async (interaction) => {
    if (!interaction.member.voice.channelId) {
      return await interaction.reply({ content: "음성 채널에 들어가있지 않습니다.", ephemeral: true });
    }

    const player = createAudioPlayer();

    joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    }).subscribe(player);

    // 파일명만
    const file = "nice.mp3";
    const resource = createAudioResource(resolve(__dirname, `../mp3/${file}`));
    console.log("재생", file);

    player.play(resource);

    return await interaction.reply({ content: "반가워요~", ephemeral: true });
  },
};
