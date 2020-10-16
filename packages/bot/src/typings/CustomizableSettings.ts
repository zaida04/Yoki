export type CustomizableSettings = "prefix" | "log-channel" | "mute-role" | "welcome-channel";
export const CustomizableSettingsArr = {
    prefix: {
        mappedName: "prefix",
        type: "string",
    },
    "log-channel": {
        mappedName: "logChannel",
        type: "textchannel",
    },
    "mute-role": {
        mappedName: "muteRole",
        type: "role",
    },
    "welcome-channel": {
        mappedName: "welcomeChannel",
        type: "textchanel",
    },
};