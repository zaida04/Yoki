import { Command, Listener } from "discord-akairo";

export default class commandLoadListener extends Listener {
    public constructor() {
        super("commandLoad", {
            emitter: "commandHandler",
            event: "load",
            category: "commandHandler",
        });
    }

    public exec(command: Command) {
        return command;
    }
}
