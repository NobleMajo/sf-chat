import { CmdDefinition, ValueFlag } from "cmdy"
import env from "../env/envParser"
import { cmdyFlag } from "typenvy"
import { envData } from "../env/envParser"
import * as express from 'express'
import { createApiMiddleware } from "statefull-api"
import { auth } from "express-openid-connect"
import { Node } from "statefull-api/dist/types"
import { StatefullApiDatabase } from 'statefull-api/dist/types'
import 'statefull-api/dist/routes/browser'
import { JsonDbms } from '../jsondbms';
import { join } from "path"

export const staticFolder: ValueFlag = cmdyFlag(
    {
        name: "static",
        alias: ["html", "path"],
        shorthand: "s",
        types: ["string"],
        description: "Path to the static client files",
    },
    "STATIC_PATH",
    envData,
)

export const httpPort: ValueFlag = cmdyFlag(
    {
        name: "http-port",
        alias: ["http"],
        shorthand: "p",
        types: ["number"],
        description: "Set the http port (default: 80 but disabled if any port is set)",
    },
    "HTTP_PORT",
    envData,
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
    envData,
)

export const apiUrl: ValueFlag = cmdyFlag(
    {
        name: "api-url",
        alias: ["apiurl", "url", "externalurl", "external-url"],
        shorthand: "u",
        types: ["string"],
        description: "Set the external api address",
    },
    "API_URL",
    envData,
)

export interface ExampleDatabase {
    nodes: {
        [key: string]: Node
    },
}

let lastNodeId: number = 0
export const dbms = new JsonDbms<ExampleDatabase>(
    process.cwd() + "/db.json"
)


const dbInterface: StatefullApiDatabase = {
    async unregisterNode(id) {
        const node = dbms.db.nodes["" + id]
        delete dbms.db.nodes["" + id]
        console.info(" * Unregister node:", node)
        return node
    },
    async registerNode(url) {
        const nodeId: number = lastNodeId++
        const node = {
            id: nodeId,
            url: url,
            heartbeat: Date.now(),
        }
        dbms.db.nodes["" + nodeId] = node
        console.info(" * Register node:", node)
        return node
    },
    async tickNode(id) {
        const node = dbms.db.nodes["" + id]
        node.heartbeat = Date.now()
        return node
    },
    async getNodes() {
        return Object.values(dbms.db.nodes)
    },
    async getNodeIds() {
        return Object.values(dbms.db.nodes).map((v) => v.id)
    },
    async getNodeById(id) {
        return dbms.db.nodes["" + id]
    },
    async getNodeByUrl(url) {
        for (const node of Object.values(dbms.db.nodes)) {
            if (node.url === url) {
                return node
            }
        }
        return undefined
    },
}

export function createQueryString(
    query: {
        [key: string]: string | number | boolean,
    }
): string {
    return Object.keys(query).map((key: string) => {
        return encodeURI(key) + "=" + encodeURI("" + query[key])
    }).join("?")
}

const root: CmdDefinition = {
    name: "statefull-ae",
    description: "A example project.",
    details: "This is the 'statefull-api-example' project.",
    flags: [
        staticFolder,
        httpPort,
        bindHostAddress,
        apiUrl,
    ],
    allowUnknownArgs: true,
    cmds: [],
    exe: async (cmd) => {
        env.VERBOSE && console.debug("VERBOSE MODE ENABLED!")
        env.VERBOSE && console.debug("ENV: ", env)

        const idpData = require("../../../idp.json")

        console.info("Statefull API Example starting...")
        await dbms.load()
        if (typeof dbms.db.nodes !== "object") {
            console.info("Statefull init with fresh database!")
            dbms.db.nodes = {}
        }
        await dbms.save()
        dbms.startSaveInterval(1000 * 2)

        const app = express()

        const authPaths: string[] = [
            "/",
            "/index.html",
            "/callback",
            "/login",
            "/logout",
        ]

        const authMiddleware = auth({
            ...idpData,
            attemptSilentLogin: false,
            idpLogout: true,
            authRequired: true,
            authorizationParams: {
                scope: [
                    "openid",
                    "email",
                    "profile"
                ].join(" "),
            },
        })

        app.use((req, res, next) => {
            let rawPath = req.path.toLowerCase()
            while (
                rawPath.startsWith("/") ||
                rawPath.startsWith(" ")
            ) {
                rawPath = rawPath.substring(1)
            }
            while (
                rawPath.endsWith("/") ||
                rawPath.endsWith(" ")
            ) {
                rawPath = rawPath.slice(0, -1)
            }
            rawPath = "/" + rawPath
            if (
                authPaths.includes(rawPath) &&
                !req.path.toLowerCase().startsWith("/browser/")
            ) {
                authMiddleware(req, res, next)
            } else {
                next()
            }
        })

        app.use(createApiMiddleware({
            externalUrl: env.API_URL,
            db: dbInterface,
            allocateNode: async (req, res, settings) => {
                let lastNode: number = req.session.lastNode as number
                if (typeof lastNode !== "number") {
                    lastNode = undefined
                }
                const nodes = await settings.db.getNodes()
                if (nodes.length === 0) {
                    return undefined
                }
                let node: Node
                do {
                    node = nodes[Math.floor(Math.random() * nodes.length)]
                } while (
                    nodes.length !== 1 &&
                    lastNode === node.id
                )
                console.info(" * Allocate for '" + req.socket.remoteAddress + "' node:", node)
                req.session.lastNode = node.id
                return node
            },
            initSession: (req, res, next, settings) => {
                if (
                    !req.oidc ||
                    !req.oidc.user
                ) {
                    res.status(401).send("Can't get google user data")
                    return
                }
                if (
                    !req.oidc.user.given_name ||
                    req.oidc.user.given_name.length === 0 ||
                    !req.oidc.user.email ||
                    req.oidc.user.email.length === 0 ||
                    !req.oidc.user.picture ||
                    req.oidc.user.picture.length === 0
                ) {
                    res.status(401).send("Can't missing google user data")
                    return
                }
                req.session.username = req.oidc.user.given_name
                req.session.email = req.oidc.user.email
                req.session.avatar = req.oidc.user.picture
                next()
            },
            validateSession: (req, res, next, settings) => {
                if (
                    typeof req.session.username !== "string" ||
                    req.session.username.length === 0
                ) {
                    res.status(401).send("Invalid session: username")
                    return
                }
                if (
                    typeof req.session.email !== "string" ||
                    req.session.email.length === 0
                ) {
                    res.status(401).send("Invalid session: email")
                    return
                }
                next()
            },
            nodeTimeout: (node) => {
                console.warn("Node timeout: ", node)
            }
        }))

        let staticPath = join(env.STATIC_PATH)
        if (!staticPath.startsWith("/")) {
            staticPath = join(process.cwd(), "/", env.STATIC_PATH)
        }

        app.use(
            express.static(
                staticPath,
                {
                    index: [
                        "/",
                        "index.html"
                    ],
                }
            )
        )

        app.listen(env.HTTP_PORT, env.BIND_ADDRESS, () => {
            console.info("Statefull API Example started!")
        })
    }
}

export default root
