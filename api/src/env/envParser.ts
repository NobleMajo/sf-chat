import { parseEnv } from "typenvy"
import { envTypes, envDefaults } from "./env"

export const envData = parseEnv(
    envDefaults,
    envTypes,
)
    .setProcessEnv()
    .errExit()

export const env = envData.env
export default env

if (env.TRUST_ALL_CERTS === true) {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
}
