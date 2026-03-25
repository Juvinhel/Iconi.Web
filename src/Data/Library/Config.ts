namespace Data.Library
{
    export interface Config
    {
        "url"?: string;
        "folder-exclusions"?: (string | RegExp)[];
        "tag-exclusions"?: (string | RegExp)[];
        "max-depth"?: number;
        "common-tags"?: string[];
    };
}