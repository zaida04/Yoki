import { Command } from "discord-akairo";
import { TextChannel } from "discord.js";
import { Collection } from "discord.js";
import { Guild } from "discord.js";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";
import { handleMissingSend } from "../../../common/PermissionUtil";

import SuggestionEmbed from "../util/SuggestionEmbed";

export default class suggestionCreate extends Command {
    public constructor() {
        super("suggestion-create", {
            category: "suggestions",
            module: "suggestions",
            description: {
                content: "Create a suggestion",
                usage: "<id>",
                example: ["suggestion create"],
            },
            args: [
                {
                    id: "guild",
                    type: "guild",
                    prompt: {
                        start: () =>
                            new MessageEmbed()
                                .setTitle("Provide the ID of a server")
                                .setDescription("This server must have both me and you in it for this to work."),
                    },
                },
            ],
            userPermissions: ["MANAGE_MESSAGES"],
            clientPermissions: ["EMBED_LINKS"],
            channel: "dm",
        });
    }

    public async exec(message: Message, { guild }: { guild: Guild }) {
        const suggestion_channel = await guild.settings.channel<TextChannel>("suggestionChannel", "text");
        if (!suggestion_channel) return message.channel.send("Sorry, but this isn't enabled on that server!");

        const member = await guild.members.fetch(message.author.id).catch(() => null);
        if (!member) return message.channel.send("Couldn't find you in that server!");

        const suggestion_description = await guild.settings.get("suggestionMessage");
        await message.channel.send(
            new MessageEmbed()
                .setTitle("Say your message! You have 60 seconds")
                .setDescription(
                    `Make sure you follow guidelines regarding using this if your guild has any. ${
                        suggestion_description ? `\n\n${suggestion_description}` : ""
                    }`
                )
        );

        const suggestion_message: Message | undefined = await message.channel
            .awaitMessages((m) => m.author.id === message.author.id, {
                max: 1,
                time: 60000,
                errors: ["time"],
            })
            .then((collected) => collected.first())
            .catch((collected: Collection<string, Message>) => collected.first());

        if (!suggestion_message) return message.channel.send("You didn't provide a proper response in time!");

        const created_suggestion = await this.client.suggestionHandler.create({
            creator_id: message.author.id,
            guild_id: guild.id,
            description: suggestion_message.content,
            channel_id: null,
            message_id: null,
        });

        const sent_message = await suggestion_channel
            .send(new SuggestionEmbed({ opener: message.author, ...created_suggestion }))
            .catch((e) => handleMissingSend(e, suggestion_channel, member.guild));

        await this.client.suggestionHandler.updateForMessage({
            id: created_suggestion.id,
            message_id: sent_message.id,
            channel_id: sent_message.channel.id,
        });

        return message.channel.send("Your message has been recorded and sent in!");
    }
}
