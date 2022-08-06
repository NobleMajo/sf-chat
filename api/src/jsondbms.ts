import { JsonObject } from "typenvy";
import { promises as fs } from "fs"

export async function getFileType(
    path: string,
): Promise<"file" | "dir" | "none"> {
    try {
        const state = await fs.stat(path)
        if (state.isDirectory()) {
            return "dir"
        } else if (state.isFile()) {
            return "file"
        } else {
            return "none"
        }
    } catch (err) {
        return "none"
    }
}

export class JsonDbms<D> {
    db: D & JsonObject
    saveInterval: NodeJS.Timer | undefined = undefined

    constructor(
        public path: string,
    ) { }

    async load(
        errorIfNotExist: boolean = false,
    ): Promise<void> {
        const type = await getFileType(this.path)
        if (type === "dir") {
            throw new Error("Selected database path '" + this.path + "' is a folder")
        } else if (type !== "file") {
            if (errorIfNotExist) {
                throw new Error("Path '" + this.path + "' not exists")
            }
            this.db = {} as any
            return
        }
        const content = await fs.readFile(this.path, {
            encoding: "utf8",
        })
        const data = JSON.parse(content)
        if (
            typeof data !== "object" ||
            data === null ||
            Array.isArray(data)
        ) {
            throw new Error(
                "Loaded content of '" + this.path +
                "' is not a json object:\n" + content
            )
        }
        this.db = data
    }

    async save(
        pretty: boolean = false
    ): Promise<void> {
        const content = pretty ?
            JSON.stringify(this.db, null, 4) :
            JSON.stringify(this.db)
        await fs.writeFile(
            this.path,
            content,
            {
                encoding: "utf8",
            }
        )
    }

    startSaveInterval(
        saveInterval: number = 1000 * 5
    ): void {
        if (this.saveInterval !== undefined) {
            clearInterval(this.saveInterval)
        }
        this.saveInterval = setInterval(
            async () => await this.save(),
            saveInterval
        )
    }

    stopSaveInterval(): void {
        if (this.saveInterval !== undefined) {
            clearInterval(this.saveInterval)
            this.saveInterval = undefined
        }
    }


}