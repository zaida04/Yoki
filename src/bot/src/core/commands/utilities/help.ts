import { Category } from "discord-akairo";
import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { stripIndents } from "common-tags";
import { MessageEmbed } from "discord.js";
import SubCommand from "../../../common/SubCommand";
import { YokiColors } from "../../../common/YokiColors";
import YokiCommand from "../../../common/YokiCommand";
const ignoredCategories = ["owner", "default"];

export default class Help extends Command {
    public constructor() {
        super("help", {
            aliases: ["help", "h"],
            args: [
                {
                    id: "command",
                    type: "commandAlias",
                    default: null,
                },
            ],
            category: "util",
            description: {
                content: "Displays information about a command",
                usage: "[command]",
                example: ["help ban"],
            },
        });
    }

    public async exec(message: Message, { command }: { command?: YokiCommand }) {
        const prefix = (await message.guild?.settings.get<string>("prefix")) ?? this.client.config.defaultPrefix;
        const embed = new MessageEmbed().setColor(YokiColors.LIGHT_ORANGE);

        if (command) {
            embed.addField("❯ Description", command.description.content || "No Description provided");

            if (command instanceof SubCommand) {
                const extracted_sub_commands = [];
                for (const extracted_command of command.subCommands) {
                    extracted_sub_commands.push(
                        this.client.commandHandler.modules.find((x) => x.id === extracted_command[0]),
                    );
                }

                embed.addField(
                    "❯ Commands",
                    extracted_sub_commands
                        .filter((x) => x !== undefined)
                        .map(
                            (x) =>
                                `\`${command.aliases[0]} ${x!.id.split("-")[1]} ${x!.description.usage}\` - ${
                                    x!.description.content
                                }`,
                        )
                        .join("\n"),
                );
            } else {
                if (command.description.usage) {
                    embed.addField(
                        "❯ Usage",
                        `\`${prefix}${command.aliases[0]}${
                            command.description.usage ? ` ${command.description.usage}` : ""
                        }\``,
                    );
                }

                if (command.description.example.length > 0)
                    embed.addField(
                        "❯ Examples",
                        command.description.example.map((x: string[]) => `\`${prefix}${x}\``).join("\n"),
                    );

                if (command.aliases.filter((x: string) => x !== command.id).length > 1) {
                    embed.addField(
                        "❯ Aliases",
                        `\`${command.aliases.filter((x: string) => x !== command.id).join("`, `")}\``,
                    );
                }

                if (command.userPermissions && Array.isArray(command.userPermissions)) {
                    embed.addField("❯ Permissions Needed (from user)", `\`${command.userPermissions.join("`, `")}\``);
                }

                if (command.clientPermissions && Array.isArray(command.clientPermissions)) {
                    embed.addField("❯ Permissions Needed (from me)", `\`${command.clientPermissions.join("`, `")}\``);
                }
            }
            return message.channel.send(embed);
        }
        embed.setTitle("Commands").setDescription(
            stripIndents`
					A list of available commands.
                    For additional info on a command, type \`${prefix}help [command]\`
                    
                    **Legend:**
                    \`<arg>\` - required.
                    \`[arg]\` - optional.
                    
                    Commands marked with * are sub commands, with the main command being the name of the category.
                    For example: "tags create"
					`,
        );

        for (const cat of this.client.commandHandler.categories
            .filter((x: Category<string, Command>) => !ignoredCategories.includes(x.id))
            .sort(
                (a, b) =>
                    Number(b.reduce((acc: number, val) => acc + val.aliases.length)) -
                    Number(a.reduce((acc: number, val) => acc + val.aliases.length)),
            )
            .values()) {
            const isModule = Boolean(cat.filter((cmd) => cmd.aliases.length > 0).size === 1);
            const filteredCommands = cat.filter((cmd) => cmd.aliases.length > 0);
            if (isModule) {
                const category_name = filteredCommands.first()!.aliases[0];
                embed.addField(
                    `❯ ${category_name.charAt(0).toUpperCase() + category_name.slice(1)}*`,
                    cat
                        .filter((x) => x instanceof SubCommand)
                        .first()!
                        .subCommands!.map((subCommand) => `\`${subCommand[1]}\``)
                        .join(" "),
                    true,
                );
            } else {
                embed.addField(
                    `❯ ${cat.id.replace(/(\b\w)/gi, (lc) => lc.toUpperCase())}`,
                    `${filteredCommands.map((cmd) => `\`${cmd.aliases[0]}\``).join(" ")}`,
                    cat.filter((cmd) => cmd.aliases.length > 0).map((cmd) => `\`${cmd.aliases[0]}\``).length < 3,
                );
            }
            /* if (cat.filter((cmd) => cmd.aliases.length > 0).size === 1)
                modules.push(cat.filter((cmd) => cmd.aliases.length > 0).first()!.aliases[0]);
            else {
                embed.addField(
                    `❯ ${cat.id.replace(/(\b\w)/gi, (lc) => lc.toUpperCase())}`,
                    `${cat
                        .filter((cmd) => cmd.aliases.length > 0)
                        .map((cmd) => `\`${cmd.aliases[0]}\``)
                        .join(" ")}`,
                    cat.filter((cmd) => cmd.aliases.length > 0).map((cmd) => `\`${cmd.aliases[0]}\``).length < 3
                );
            } */
        }
        // if (modules.length) embed.addField("❯ Modules", modules.map((x) => `\`${x}\``).join(" "));

        return message.channel.send(embed);
    }
}
