import { Command } from "discord-akairo";
import { GuildMember } from "discord.js";
import { MessageEmbed } from "discord.js";

import { Message } from "discord.js";
import { hasAnyPermission } from "../../../../common/PermissionUtil";
import { ActionDatabaseData } from "../../typings/Action";

export default class CaseHistory extends Command {
    private readonly caseTypes = ["kick", "ban", "mute", "warn", "softban"];
    public constructor() {
        super("case-history", {
            aliases: ["history"],
            module: "moderation",
            category: "moderation",
            description: {
                content: "Get a user's history",
                usage: "<member>",
                example: ["case history @ociN#3727", "history Nico"],
            },
            args: [
                {
                    id: "member",
                    type: "member",
                    prompt: {
                        start: "Who's history do you wish to get? (Please provide a valid member of this server)",
                    },
                },
            ],
            userPermissions: (message) =>
                hasAnyPermission(message.member!, ["MANAGE_GUILD", "KICK_MEMBERS", "BAN_MEMBERS"]),
            channel: "guild",
        });
    }

    public async exec(message: Message, { member }: { member?: GuildMember }) {
        if (!member)
            return message.channel.send(
                new this.client.Embeds.ErrorEmbed(
                    "Please provide a person!",
                    "Please ensure they are a member of this server",
                ),
            );

        const actions: ActionDatabaseData[] = await this.client.db.api("actions").where({
            guild: message.guild!.id,
            target_id: member.user.id,
        });

        if (!actions.length) return message.channel.send("Squeaky clean history!");

        return message.channel.send(
            new MessageEmbed()
                .setTitle(`${member.user.tag}'s History`)
                .setDescription(
                    `
                    Case IDs against this person:

                    ${actions.map((x) => `\`ID: #${x.id} TYPE: ${x.type} REASON: ${x.reason}\``)}
                `,
                )
                .setTimestamp(),
        );
    }
}
