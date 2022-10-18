/** Raw Endorsements data */
export interface IEndorsements {
    /** When the information was last updated */
    updated_at: string;

    /** A list of every day the mod has received at least one Endorsement and how many it received */
    endorsements: {
        [date: string]: number|undefined;
    }
}

/** Raw Download & Page View data */
export interface IDLsAndViews {
    /** When the information was last updated */
    last_updated: string;

    /** How many total downloads the mod has */
    total_downloads: number

    /** A list of every day the mod has received at least one Page View and how many it received */
    mod_page_views: {
        [date: string]: number|undefined;
    }

    /** A list of every day the mod has received at least one "Total" Download and how many it received */
    mod_daily_counts: {
        [date: string]: number|undefined;
    }
}

/** Raw File Uploads data */
interface IFileUploads {
    /** Not sure what this is */
    status: boolean;

    /** A list of every file ever uploaded for this mod */
    message: {
        releases: ISingleUpload[];
    };
}

/** A single file upload
    Used in IFileUploads
*/
interface ISingleUpload {
    date: number;
    id: number;
    name: string;
}

/** Raw Mod Info
    Fetched from the Nexus Mods API
*/
export interface IMod {
    name: string;
    summary: string;
    description: string;
    picture_url: string;
    mod_downloads: number;
    mod_unique_downloads: number;
    uid: number;
    mod_id: number;
    game_id: number;
    allow_rating: boolean;
    domain_name: string;
    category_id: number;
    version: string;
    endorsement_count: number;
    created_timestamp: number;
    created_time: string;
    updated_timestamp: number;
    updated_time: string;
    author: string;
    uploaded_by: string;
    uploaded_users_profile_url: string;
    contains_adult_content: boolean;
    status: "published" | string;
    available: boolean;
    user: IUser;
    endorsement: IEndorsement;
}

/** A single Nexus Mods user.
    Used in dada fetched from the Nexus Mods API
*/
export interface IUser {
    member_id: number
    member_group_id: number
    name: string
}

/** When the user last endorsed a mod.
    Used in dada fetched from the Nexus Mods API
*/
export interface IEndorsement {
    /** The current status of the endorsement */
    endorse_status: "Endorsed" | "Abstained" | "Not Endorsed" | string

    /** When this data was last changed */
    timestamp: number

    /** The version of the mod when the user endorsed the mod, perhaps? */
    version: string|null
}

export interface IFile {
    /** The IDs of the file
        [FileID, GameID]
    */
    id: [
        number,
        number
    ],

    /** The Unique ID of the file */
    uid: number

    /** The File ID of the file */
    file_id: number

    /** The public-facing name of the file */
    name: string

    /** The version of the file */
    version: string
    /** Version of the mod at the time of upload, presumably */
    mod_version: string

    /** The category of the file */
    category_id: number

    /** A more human-readable version of `category_id` */
    category_name: "MAIN" | "UPDATE" | "OLD_VERSION" | "ARCHIVED" | string

    /** Whether or not this is the "primary" file (used to determine what file to download) */
    is_primary: false

    /** Friendly unit for size */
    size: number
    /** Size of the mod in kibibytes (KiB) */
    size_kb: number
    /** Size of the mod in bytes (B) */
    size_in_bytes: number

    /** Name of the file that would be downloaded */
    file_name: string

    /** UNIX timestamp of when the file was uploaded */
    uploaded_timestamp: number
    /** String representation of when the file was uploaded */
    uploaded_time: string

    /** VirusTotal report for the file */
    external_virus_scan_url: string

    /** Description of the file */
    description: string
    /** Changelog, formatted as HTML */
    changelog_html: string

    /** Link to preview the file's contents */
    content_preview_link: string
}

export interface IUpdate {
    /** ID of the old file */
    old_file_id: number
    /** File Name of the old file */
    old_file_name: string

    /** ID of the new file */
    new_file_id: number
    /** File Name of the new file */
    new_file_name: string

    /** UNIX timestamp of when the update was uploaded */
    uploaded_timestamp: number
    /** String representation of when the update was uploaded */
    uploaded_time: string
}

export interface IFileList {
    files: IFile[]
    file_updates: IUpdate[]
}
