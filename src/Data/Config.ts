namespace Data
{
    export interface Config
    {
        "library"?: LibraryConfig;
    }

    export interface LibraryConfig
    {
        "url"?: string;
        "folder-exclusions"?: (string | RegExp)[];
        "tag-exclusions"?: (string | RegExp)[];
    };

    const defaultConfig: Config = {
        "library": {
            "url": "library",
            "folder-exclusions": ["svg"],
            "tag-exclusions": [/^[0-9]{5,}$/],
        }
    };

    export async function loadConfig(): Promise<Config>
    {
        try
        {
            const response = await fetch("config.json");
            const text = await response.text();
            return JSON.parse(text, function (this: any, key: string, value: any)
            {
                if (Array.isArray(this) && typeof value === "string" && value.startsWith("/"))
                {
                    const [expression, flags] = value.substring(1).splitLast("/");
                    return new RegExp(expression, flags);
                }
                return value;
            });
        }
        catch
        {
            return defaultConfig;
        }
    }
}