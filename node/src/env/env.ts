import * as typenvy from "typenvy"
export const envDefaults = {
    VERBOSE: false as boolean,
    TRUST_ALL_CERTS: false as boolean,

    DNS_SERVER_ADDRESSES: [
        "127.0.0.11",
        "1.0.0.1",
        "8.8.4.4",
        "1.1.1.1",
        "8.8.8.8"
    ] as string[],

    BEHIND_PROXY: true as boolean,
    HTTP_PORT: 8080 as number,
    BIND_ADDRESS: "0.0.0.0" as string,

    EXTERNAL_URL: "null" as string,
    API_URL: "https://localhost:8443" as string,

    EXTERNAL_PORT: 0 as number,
    EXTERNAL_PROTOCOL: "wss" as string,
}

export const envTypes: typenvy.VariablesTypes = {
    VERBOSE: [typenvy.TC_BOOLEAN],
    TRUST_ALL_CERTS: [typenvy.TC_BOOLEAN],

    DNS_SERVER_ADDRESSES: [typenvy.TC_JSON_ARRAY, typenvy.TC_CSV_ARRAY],

    BEHIND_PROXY: [typenvy.TC_BOOLEAN],
    HTTP_PORT: [typenvy.TC_PORT],
    BIND_ADDRESS: [typenvy.TC_STRING],

    EXTERNAL_URL: [typenvy.TC_STRING],
    API_URL: [typenvy.TC_STRING],

    EXTERNAL_PORT: [typenvy.TC_PORT],
    EXTERNAL_PROTOCOL: [typenvy.TC_STRING],
}