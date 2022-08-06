import { BoolFlag, CmdDefinition, ValueFlag } from "cmdy"
import env from "../env/envParser"
import { cmdyFlag } from "typenvy"
import { envData } from "../env/envParser"
import { StatefullNode, Node } from "statefull"
import fetch from "node-fetch"

export const httpPort: ValueFlag = cmdyFlag(
    {
        name: "http-port",
        alias: ["http"],
        shorthand: "p",
        types: ["number"],
        description: "Set the http port (default: 80 but disabled if any port is set)",
    },
    "HTTP_PORT",
    envData
)

export const bindHostAddress: ValueFlag = cmdyFlag(
    {
        name: "bind-host-address",
        alias: ["b-h-a", "bha", "bind-host-address"],
        shorthand: "b",
        types: ["string"],
        description: "Set the host where the server pind the ports",
    },
    "BIND_ADDRESS",
    envData
)

export const externalUrl: ValueFlag = cmdyFlag(
    {
        name: "external-url",
        types: ["string"],
        description: "External url where the node is reachable",
    },
    "EXTERNAL_URL",
    envData
)

export const externalPort: ValueFlag = cmdyFlag(
    {
        name: "external-port",
        types: ["string"],
        description: "If external URL is not set the used port to detect it",
    },
    "EXTERNAL_PORT",
    envData
)

export const externalProtocol: ValueFlag = cmdyFlag(
    {
        name: "external-protocol",
        types: ["string"],
        description: "If external URL is not set the used protocol to detect it",
    },
    "EXTERNAL_PROTOCOL",
    envData
)


export const behindProxy: BoolFlag = cmdyFlag(
    {
        name: "behind-proxy",
        description: "If external URL is not set the used protocol to detect it",
    },
    "BEHIND_PROXY",
    envData
)

export const apiUrl: ValueFlag = cmdyFlag(
    {
        name: "api-url",
        types: ["string"],
        description: "Apu url where the node is reachable",
    },
    "API_URL",
    envData
)

export interface BaseEvent {
    action: string,
    time: number,
    issuer: string,
}

export interface MessageEvent extends BaseEvent {
    action: "msg",
    msg: string,
}

export interface InitEvent extends BaseEvent {
    action: "init",
    node: Node,
    users: UserJoinEvent[],
    user: UserJoinEvent
}

export interface UserJoinEvent extends BaseEvent {
    action: "user.join",
    avatar: string,
}

export interface UserLeaveEvent extends BaseEvent {
    action: "user.leave",
}

export type AnyEvent = MessageEvent | UserJoinEvent | UserLeaveEvent

export interface InitData {
    node: Node
    users: UserJoinEvent[],
    user: UserJoinEvent,
}

export const root: CmdDefinition = {
    name: "statefull-ae",
    description: "A example project.",
    details: "This is the 'statefull-api-example' project.",
    flags: [
        httpPort,
        bindHostAddress,
        externalUrl,
        apiUrl,
        externalPort,
        externalProtocol,
        behindProxy,
    ],
    allowUnknownArgs: true,
    cmds: [],
    exe: async (cmd) => {
        env.VERBOSE && console.debug("VERBOSE MODE ENABLED!")
        env.VERBOSE && console.debug("ENV: ", env)
        console.info("Statefull Node Example starting...")

        if (env.EXTERNAL_URL === "null") {
            console.info("External URL is not set. Try to detect it...")
            if (env.EXTERNAL_PORT === 0) {
                env.EXTERNAL_PORT = env.HTTP_PORT
            }

            const resp = await fetch("https://api.ipify.org")
            const externalIpAddress = "" + (
                await resp.text()
            )
            if (
                typeof externalIpAddress !== "string" ||
                externalIpAddress.length === 0
            ) {
                throw new Error("Can't get external ip address")
            }

            env.EXTERNAL_URL = env.EXTERNAL_PROTOCOL + "://" + externalIpAddress + ":" + env.EXTERNAL_PORT
        }

        env.VERBOSE && console.info("Init-data:", {
            externalUrl: env.EXTERNAL_URL,
            apiUrl: env.API_URL,
            bindPort: env.HTTP_PORT,
            bindAddress: env.BIND_ADDRESS,
        })

        let users: UserJoinEvent[] = []
        const node: StatefullNode = new StatefullNode({
            apiUrl: env.API_URL,
            externalUrl: env.EXTERNAL_URL,
            wsOptions: {
                port: env.HTTP_PORT,
                verifyClient: () => { return true },
            },
            behindProxy: env.BEHIND_PROXY,
            onInit: (node, sfws) => {
                console.info(
                    "onInit(): " + sfws.ep.nid + " " +
                    sfws.ep.address + ":" + sfws.ep.port,
                    sfws.session
                )
                const userJoinEvent: UserJoinEvent = {
                    action: "user.join",
                    time: Date.now(),
                    issuer: "" + sfws.session.username,
                    avatar: "" + sfws.session.avatar,
                }
                const joinData: InitEvent = {
                    action: "init",
                    node: node.node,
                    time: Date.now(),
                    issuer: "" + sfws.session.username,
                    users: users,
                    user: userJoinEvent,
                }
                users.push(userJoinEvent)
                node.broadcast(
                    sfws,
                    userJoinEvent as any,
                )
                return joinData as any
            },
            onData: (node, sfws, data) => {
                if (typeof data.msg !== "string") {
                    sfws.protocolErrorClose("'msg' not set in received data")
                    return
                }
                let msg: string = data.msg
                if (msg.length > 512) {
                    sfws.close()
                    return
                }
                while (
                    msg.startsWith(" ") ||
                    msg.startsWith("\n")
                ) {
                    msg = msg.substring(1)
                }
                while (
                    msg.endsWith(" ") ||
                    msg.endsWith("\n")
                ) {
                    msg = msg.slice(0, -1)
                }
                if (msg.length === 0) {
                    sfws.protocolErrorClose("'msg' is empty")
                    return
                }
                console.info(
                    "onData(): " + sfws.ep.nid + "/'" +
                    sfws.session.username + "':",
                    data
                )
                node.broadcast(
                    sfws,
                    {
                        action: "msg",
                        time: Date.now(),
                        issuer: "" + sfws.session.username,
                        msg: data.msg,
                    }
                )
            },
            onLeave: (node, sfws) => {
                node.broadcast(
                    sfws,
                    {
                        action: "user.leave",
                        time: Date.now(),
                        issuer: "" + sfws.session.username,
                    }
                )
                users = users.filter(
                    (v) => v.issuer !== ("" + sfws.session.username)
                )
                console.info(
                    "onLeave(): " + sfws.ep.nid + " " +
                    sfws.ep.address + ":" + sfws.ep.port,
                )
            },

        })

        await node.open()

        console.log("Statefull Node Example started!")
    }
}
export default root
