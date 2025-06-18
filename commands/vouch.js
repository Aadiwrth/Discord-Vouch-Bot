const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../data/config.json");
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../data/vouch.db"));

// Create table if not exists
db.prepare(`
    CREATE TABLE IF NOT EXISTS vouches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        stars INTEGER NOT NULL,
        proof TEXT,
        timestamp INTEGER NOT NULL
    )
`).run();

exports.data = new SlashCommandBuilder()
    .setName("vouch")
    .setDescription("Give a vouch with rating, message and optional proof image.")
    .addStringOption(option =>
        option.setName("rate")
            .setDescription("Select your vouch rating.")
            .setRequired(true)
            .addChoices(
                { name: "⭐", value: "1" },
                { name: "⭐⭐", value: "2" },
                { name: "⭐⭐⭐", value: "3" },
                { name: "⭐⭐⭐⭐", value: "4" },
                { name: "⭐⭐⭐⭐⭐", value: "5" }
            )
    )
    .addStringOption(option =>
        option.setName("message")
            .setDescription("Type the vouch message.")
            .setRequired(true)
    )
    .addAttachmentOption(option =>
        option.setName("proof")
            .setDescription("Optional image proof.")
            .setRequired(false)
    );

exports.run = async (bot, interaction) => {
    const allowedChannel = config.channels.vouch;
    const customStar = config.emojis?.star || "⭐";
    const reactEmoji = config.emojis?.react ||"💖";

    if (interaction.channel.id !== allowedChannel) {
        return interaction.reply({
            content: `❌ This command can only be used in <#${allowedChannel}>.`,
            ephemeral: true
        });
    }

    const rate = interaction.options.getString("rate");
    const message = interaction.options.getString("message");
    const proof = interaction.options.getAttachment("proof");
    const starsInEmbed = customStar.repeat(Number(rate));
    const guildIcon = interaction.guild.iconURL({ dynamic: true });
    const timestamp = Math.floor(Date.now() / 1000);

    const embed = new EmbedBuilder()
        .setTitle("New Vouch Created")
        .setThumbnail(guildIcon)
        .addFields(
            { name: "Rating", value: starsInEmbed, inline: true },
            { name: "Vouch", value: message, inline: false },
            { name: "Vouched By", value: `<@${interaction.user.id}>`, inline: true },
            { name: "Vouched At", value: `<t:${timestamp}:F>`, inline: true }
        )
        .setFooter({ text: "By EnvyBoost", iconURL: guildIcon })
        .setColor("Gold")
        .setTimestamp();

    if (proof) embed.setImage(proof.url);

    // Store in DB
    db.prepare(`
        INSERT INTO vouches (user_id, message, stars, proof, timestamp)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        interaction.user.id,
        message,
        Number(rate),
        proof ? proof.url : null,
        timestamp
    );

    await interaction.reply({ content: "✅ Your vouch has been sent!", ephemeral: true });

    const msg = await interaction.channel.send({ embeds: [embed] });

    try {
        await msg.react(reactEmoji);
    } catch (err) {
        console.warn(`Couldn't react with emoji: ${reactEmoji}`, err.message);
    }
};
