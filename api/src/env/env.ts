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

    HTTP_PORT: 30008 as number,
    BIND_ADDRESS: "0.0.0.0" as string,
    STATIC_PATH: "../client/dist" as string,

    API_URL: "https://localhost:30004" as string,
}

export const envTypes: typenvy.VariablesTypes = {
    VERBOSE: [typenvy.TC_BOOLEAN],
    TRUST_ALL_CERTS: [typenvy.TC_BOOLEAN],

    DNS_SERVER_ADDRESSES: [typenvy.TC_JSON_ARRAY, typenvy.TC_CSV_ARRAY],

    HTTP_PORT: [typenvy.TC_PORT],
    BIND_ADDRESS: [typenvy.TC_STRING],
    STATIC_PATH: [typenvy.TC_STRING],

    API_URL: [typenvy.TC_STRING],
}