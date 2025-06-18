const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../data/config.json");
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../data/vouch.db"));

exports.data = new SlashCommandBuilder()
    .setName("vouches")
    .setDescription("📊 View vouch stats for this server");

exports.run = async (bot, interaction) => {
    const guild = interaction.guild;
    const rows = db.prepare("SELECT * FROM vouches ORDER BY timestamp ASC").all();

    const totalVouches = rows.length;
    const firstVouch = rows[0]?.timestamp || null;
    const lastVouch = rows[rows.length - 1]?.timestamp || null;

    const embed = new EmbedBuilder()
        .setTitle(`📈 Vouch Stats`)
        .setColor(config.guild.embedColour || "#FFD700")
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
            { name: "🪪 Server", value: `${guild.name}`, inline: true },
            { name: "🔢 Total Vouches", value: `**${totalVouches}**`, inline: true },
            { name: "📅 Started At", value: firstVouch ? `<t:${firstVouch}:F>` : "No vouches yet", inline: false },
            { name: "📌 Last Vouch", value: lastVouch ? `<t:${lastVouch}:F>` : "N/A", inline: false }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
};
