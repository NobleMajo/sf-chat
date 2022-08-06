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
            if (env.TRUST_ALL_CERTS) {
                process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
            }
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
    envData,
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