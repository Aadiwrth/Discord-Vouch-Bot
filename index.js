"use strict";

// 📦 Libraries
const { Client, GatewayIntentBits, Partials, REST, Routes, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const path = require("path");

// 📁 config
const config = require("./data/config.json");

// 🤖 Bot setup
const bot = new Client({
    partials: [Partials.Channel],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
});

// 🧠 Command Loading (Flat structure only)
const commands = [];
bot.commands = new Collection();

const commandFiles = readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if ("data" in command && "run" in command) {
        bot.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`[+] Loaded command: ${command.data.name}`);
    } else {
        console.warn(`[!] Skipped ${file}: Missing "data" or "run" export`);
    }
}

// 🧾 Slash Command Registration
const rest = new REST({ version: "10" }).setToken(config.bot.token);

(async () => {
    try {
        console.log("[/] Registering slash commands...");
        await rest.put(
            Routes.applicationCommands(config.bot.clientId),
            { body: commands }
        );
        console.log("[✓] Slash commands registered!");
    } catch (error) {
        console.error("[X] Failed to register commands:", error);
    }
})();

// ✅ Bot Ready
bot.on("ready", () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});

// 🚀 Handle Slash Commands
bot.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = bot.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.run(bot, interaction);
    } catch (err) {
        console.error(`[X] Error running command ${interaction.commandName}:`, err);
        await interaction.reply({
            content: "❌ There was an error executing this command.",
            flags: 64
        });
    }
});

// 🔑 Login
bot.login(config.bot.token);

module.exports = { config, bot };
