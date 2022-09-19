const fs = require("fs");
const { join } = require("path");
const { Client, Routes, Collection, GatewayIntentBits } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { clientId, guildId, token } = require("./config.json");

const rest = new REST({ version: "10" }).setToken(token);

function initClient() {
  // ! 중요
  // ! GatewayIntentBits.GuildVoiceStates를 설정해줘야 음성 재생이 가능함
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

  client.once("ready", () => {
    console.log("봇 준비 완료 !");
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);
    console.log("상호작용 생성: %s", interaction.commandName);

    if (!command) {
      return;
    }

    try {
      await command.run(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "명령 실행 중 오류가 발생하였습니다.", ephemeral: true });
    }
  });

  return client;
}

function initCommands(client) {
  const commands = [];
  const commandsPath = join(__dirname, "commands");
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
  client.commands = new Collection();

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
    console.log("커맨드 등록: %s", command.data.name);
  }

  return commands;
}

async function deployCommands(commands) {
  try {
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log("모든 커맨드가 제거되었습니다.");

    const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log(`${data.length}개의 애플리케이션 커맨드가 생성되었습니다.`);
    console.log(commands.map((x, i) => `${i + 1}. ${x.name} - ${x.description}`).join("\n"));
  } catch (e) {
    console.error(e);
  }
}

(async () => {
  const client = initClient();
  const commands = initCommands(client);
  await deployCommands(commands);
  await client.login(token);
})();
