import path from "node:path";
import { fileURLToPath } from "node:url";

export function getDirname(metaUrl: string) {
    const filename = fileURLToPath(metaUrl);
    return path.dirname(filename);
}
