namespace Data
{
    export interface Config
    {
        "library": Library.Config;
    }

    export const defaultConfig: Config = {
        "library": {
            "url": "library",
            "folder-exclusions": ["svg"],
            "tag-exclusions": [/^[0-9]{5,}$/],
            "max-depth": 2,
        }
    };
}