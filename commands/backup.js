const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require("discord.js");
const config = require("../data/config.json");
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../data/vouch.db"));

exports.data = new SlashCommandBuilder()
    .setName("backup")
    .setDescription("Backup vouch embeds to a different channel.")
    .addChannelOption(option =>
        option.setName("channel")
            .setDescription("The channel to send the backup embeds to.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
    );

exports.run = async (bot, interaction) => {
    const owners = config.bot.owners;

    // 🛡️ Permission check
    if (!owners.includes(interaction.user.id)) {
        return interaction.reply({
            content: "❌ Only bot owners can use this command.",
            flags: 64
        });
    }

    const channel = interaction.options.getChannel("channel");
    const customStar = config.emojis?.star || "⭐";
    const guildIcon = interaction.guild.iconURL({ dynamic: true });

    const rows = db.prepare("SELECT * FROM vouches ORDER BY id ASC").all();

    if (!rows.length) {
        return interaction.reply({ content: "❌ No vouches found in the database!", flags: 64 });
    }

    await interaction.reply({ content: `📤 Starting backup of ${rows.length} vouches to <#${channel.id}>...`, flags: 64 });

    for (const vouch of rows) {
        const embed = new EmbedBuilder()
            .setTitle("Vouch Backup")
            .setThumbnail(guildIcon)
            .addFields(
                { name: "Rating", value: customStar.repeat(vouch.stars), inline: true },
                { name: "Vouch", value: vouch.message, inline: false },
                { name: "Vouched By", value: `<@${vouch.user_id}>`, inline: true },
                { name: "Vouched At", value: `<t:${vouch.timestamp}:F>`, inline: true }
            )
            .setFooter({ text: "Backup by EnvyBoost", iconURL: guildIcon })
            .setColor("DarkGold")
            .setTimestamp(new Date(vouch.timestamp * 1000));

        if (vouch.proof) embed.setImage(vouch.proof);

        await channel.send({ embeds: [embed] });
    }

    await interaction.followUp({ content: "✅ Backup complete!", flags: 64 });
};
