import Database from "better-sqlite3";
import path from "node:path";
import { app } from "electron";
import fs from "node:fs";

export type CharacterRow = {
    id: string;
    name: string;
    portrait: string;
    rating: string | null;
    rating_icon: string | null;
    faction: string | null;
    faction_icon: string | null;
    attribute: string | null;
    attribute_icon: string | null;
    role: string | null;
    role_icon: string | null;
    assists: string | null;
};

export type ConditionRow = {
    character_id: string;
    idx: number;
    kind: "faction" | "attribute" | "role" | "tag";
    value: string;
    key: string;
    icon: string | null;
};

function resolveDbPath() {
    // Packaged app: process.resourcesPath/resources/zzz.sqlite
    // Dev: <projectRoot>/resources/zzz.sqlite
    const base = app.isPackaged ? process.resourcesPath : app.getAppPath();
    const dbPath = path.join(base, "resources", "zzz.sqlite");

    console.log("Looking for database at:", dbPath);
    console.log("File exists:", fs.existsSync(dbPath));

    if (!fs.existsSync(dbPath)) {
        throw new Error(`Database not found at: ${dbPath}`);
    }

    return dbPath;
}

export function loadDataFromDb(): { characters: CharacterRow[]; conditions: ConditionRow[] } {
    try {
        const dbPath = resolveDbPath();
        console.log("Opening database:", dbPath);

        const db = new Database(dbPath, { readonly: true });

        const characters = db
            .prepare(
                `
                SELECT
                    id,
                    name,
                    portrait,
                    rating,
                    rating_icon,
                    faction,
                    faction_icon,
                    attribute,
                    attribute_icon,
                    role,
                    role_icon,
                    assists
                FROM characters
                ORDER BY
                    CASE rating
                        WHEN 'S' THEN 2
                        WHEN 'A' THEN 1
                        ELSE 0
                        END DESC,
                    name ASC
            `
            )
            .all() as CharacterRow[];

        const conditions = db
            .prepare(
                `
      SELECT
        character_id,
        idx,
        kind,
        value,
        key,
        icon
      FROM character_conditions
      ORDER BY character_id ASC, idx ASC
      `
            )
            .all() as ConditionRow[];

        db.close();

        console.log(`Loaded ${characters.length} characters, ${conditions.length} conditions`);

        return { characters, conditions };
    } catch (error) {
        console.error("Error loading database:", error);
        throw error;
    }
}
