import { Message, MessageEmbed, EmbedFieldData } from "discord.js";
import { YokiColors } from "../../../common/YokiColors";

export default class SuccessEmbed extends MessageEmbed {
    public constructor(title: string | null, description: string | null, message: Message, fields?: EmbedFieldData[]) {
        super();
        if (title) super.setTitle(title);
        super.setDescription(description);
        if (fields && fields.length > 0) {
            super.addFields(fields);
        }
        super.setColor(YokiColors.GREEN);
        super.setAuthor(message.author.tag, message.author.displayAvatarURL());
        super.setTimestamp();
    }
}
