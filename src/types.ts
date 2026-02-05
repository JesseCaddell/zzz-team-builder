export type ConditionKind = "faction" | "attribute" | "role" | "tag";

export type Character = {
    id: string;
    name: string;

    // exact filename like "Agent_Billy_Kid_Icon.webp"
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

export type Condition = {
    character_id: string;
    idx: number;
    kind: ConditionKind;
    value: string;
    key: string;
    icon: string | null;
};

export type LoadDataResponse = {
    characters: Character[];
    conditions: Condition[];
};
