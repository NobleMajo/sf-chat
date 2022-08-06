import { parseCmd, BoolFlag, ValueFlag } from "cmdy"
import root from "./cmd/root"
import * as dns from "dns"
import { cmdyFlag } from "typenvy"
import { envData, env } from "./env/envParser"

export const verbose: BoolFlag = cmdyFlag(
    {
        name: "verbose",
        shorthand: "v",
        description: "Show basic flag adn target informations",
    },
    "VERBOSE",
    envData,
)

export const trustAllCerts: BoolFlag = cmdyFlag(
    {
        name: "trust-all-certs",
        alias: ["t-a-c", "tac"],
        shorthand: "t",
        description: "Trust all certificates on proxy",
        exe: () => {
            const trustAll: boolean = env.TRUST_ALL_CERTS === true
            env.VERBOSE && console.debug("Trust all certificates: ", trustAll)
            const trustAllValue: "0" | "1" = trustAll ? "0" : "1"
            env.VERBOSE && console.debug("Set NODE_TLS_REJECT_UNAUTHORIZED environment variable to: ", trustAllValue)
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = trustAllValue
        }
    },
    "TRUST_ALL_CERTS",
    envData,
)

export const dnsServerAddress: ValueFlag = cmdyFlag(
    {
        name: "dns-server-address",
        alias: ["dns-server", "dnsserveraddress", "dns-address", "dns"],
        types: ["string"],
        description: "Add a dns address to the existing dns addresses",
        multiValues: true,
        exe: () => {
            env.VERBOSE && console.debug("Set DNS Server addresses to:", env.DNS_SERVER_ADDRESSES)
            dns.setServers(env.DNS_SERVER_ADDRESSES)
        }
    },
    "DNS_SERVER_ADDRESSES",
    envData
)

export default parseCmd({
    cmd: root,
    globalFlags: [
        verbose,
        trustAllCerts,
        dnsServerAddress,
    ],
    globalHelpMsg: "This is the'statefull-api-example' project! Dont forget to start the 'statefull-example' after this app.",
})
    .exe()
    .catch((err: Error | any) => console.error(
        "# Command Error #\n", err
    ))