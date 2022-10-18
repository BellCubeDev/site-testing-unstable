import type * as rawInfo from './nexusModsInfo';
import { getInputValue } from '../../universal.js';


declare global {interface Window {
    statsScraper: {
        scrapeStats: () => void;
        setIDsFromURL: () => void;
    }
}}

window.statsScraper = {
    scrapeStats,
    setIDsFromURL
};

// Create debug directories and save environment


let cachedApiKey:null|string = null;
let willClearCache = false;
function getApiKey() : string|null {
    if (cachedApiKey) return cachedApiKey;

    cachedApiKey = getInputValue(document.getElementById('statsScraper_apiKey') as HTMLInputElement) || null;

    if (!willClearCache){
        willClearCache = true;
        requestAnimationFrame(()=>requestAnimationFrame(() =>{
            willClearCache = false;
            cachedApiKey = null;
        }));
    }

    return cachedApiKey;
}

function getApiRequestInit(apiKey?: string|null, method: string = 'get') : RequestInit {
    if (!apiKey) apiKey = getApiKey();
    if (!apiKey) throw new Error('No API key provided!');

    const headers = new Headers();
    headers.append('apikey', apiKey);
    headers.append('accept', 'application/json');
    headers.append('user-agent', 'BellCubeDev/NexusMods-Mod-Stats-Scraper');

    const requestInit:RequestInit = {headers, mode:'no-cors', cache:'no-cache', method, referrerPolicy: 'unsafe-url', credentials: 'omit'};

    console.log('Returning request init:', requestInit);

    return requestInit;
}

async function setIDsFromURL(url?: string) {
    if (!url) url = getInputValue(document.getElementById('statsScraper_extractURL') as HTMLInputElement);

    const urlMatch = url.match(/.*?\bnexusmods\.com\/(\w+)\/mods\/(?:.*?\/)*?(\d+)\/?(\?.*|#.*|[^\w]*)$/);
    if (!urlMatch) throw new Error('Invalid URL');

    const modIDElem = document.getElementById('statsScraper_modID') as HTMLInputElement;
    const gameIDElem = document.getElementById('statsScraper_gameID') as HTMLInputElement;
    if (!modIDElem || !gameIDElem) throw new Error('Could not find modID or gameID input elements');

    const modID = parseInt(urlMatch[2] ?? '');

    const gameDomain = urlMatch[1] ?? '';
    const gameID = await fetch(`https://api.nexusmods.com/v1/games/${gameDomain}.json`, getApiRequestInit())
        .then(r => r.json() as Promise<{game_id: number}>)
        .then(r => r.game_id);

    modIDElem.value = modID.toString();
    gameIDElem.value = gameID.toString();
}

async function scrapeStats() {
    const stats = parseStats(await fetchStats());

}


/** Parsed date data */
interface IDateData {
    dateObj?: Date;
    pageViews?: number;
    downloads?: number;
    endorsements?: number;
    daysSinceLastUpload?: number | null;
}

/***
 *
 *
 *    $$$$$$$$\             $$\               $$\
 *    $$  _____|            $$ |              $$ |
 *    $$ |       $$$$$$\  $$$$$$\    $$$$$$$\ $$$$$$$\   $$$$$$\   $$$$$$$\
 *    $$$$$\    $$  __$$\ \_$$  _|  $$  _____|$$  __$$\ $$  __$$\ $$  _____|
 *    $$  __|   $$$$$$$$ |  $$ |    $$ /      $$ |  $$ |$$$$$$$$ |\$$$$$$\
 *    $$ |      $$   ____|  $$ |$$\ $$ |      $$ |  $$ |$$   ____| \____$$\
 *    $$ |      \$$$$$$$\   \$$$$  |\$$$$$$$\ $$ |  $$ |\$$$$$$$\ $$$$$$$  |
 *    \__|       \_______|   \____/  \_______|\__|  \__| \_______|\_______/
 *
 */

interface statsItems {
    topLevel: rawInfo.IMod
    endorsements: rawInfo.IEndorsements
    dlAndViews: rawInfo.IDLsAndViews
    fileUploads: rawInfo.IFileUploads
}

async function fetchStats():Promise<statsItems> {
    const modID = parseInt(getInputValue(document.getElementById('statsScraper_modID') as HTMLInputElement));
    const gameID = parseInt(getInputValue(document.getElementById('statsScraper_gameID') as HTMLInputElement));

    const topLevel = await fetch(`https://api.nexusmods.com/v1/games/${gameID}/mods/${modID}.json`, getApiRequestInit())
                                .then(r => r.json()) as rawInfo.IMod;

    // Get Endorsements, Downloads, Page Views, and Uploads data all in one go thanks to the power of Promise.all
    const endorsements_ = fetch(`hhttps://nexus-stats.fra1.cdn.digitaloceanspaces.com/mods/${topLevel.uid}/daily-endorsements.json`, getApiRequestInit())
                            .then(r => r.json() as Promise<rawInfo.IEndorsements>);
    const dlAndViews_   = fetch(`https://staticstats.nexusmods.com/mod_monthly_stats/${topLevel.game_id}/${modID}.json`, getApiRequestInit())
                            .then(r => r.json()  as Promise<rawInfo.IDLsAndViews>);
    const fileUploads_  = fetch(`https://www.nexusmods.com/Core/Libs/Common/Widgets/Graph?GetModReleases&game_id=${topLevel.game_id}&mod_id=${modID}&startdate=0&enddate=${Date.now()}`, getApiRequestInit())
                            .then(r => r.json() as Promise<rawInfo.IFileUploads>);

    const [endorsements, dlAndViews, fileUploads] = await Promise.all([endorsements_, dlAndViews_, fileUploads_]);

    console.debug('Fetched stats: ', {topLevel, endorsements, dlAndViews, fileUploads});
    return {topLevel, endorsements, dlAndViews, fileUploads};
}


/*
 *
 *
 *    $$$$$$$\                                $$\
 *    $$  __$$\                               \__|
 *    $$ |  $$ | $$$$$$\   $$$$$$\   $$$$$$$\ $$\ $$$$$$$\   $$$$$$\
 *    $$$$$$$  | \____$$\ $$  __$$\ $$  _____|$$ |$$  __$$\ $$  __$$\
 *    $$  ____/  $$$$$$$ |$$ |  \__|\$$$$$$\  $$ |$$ |  $$ |$$ /  $$ |
 *    $$ |      $$  __$$ |$$ |       \____$$\ $$ |$$ |  $$ |$$ |  $$ |
 *    $$ |      \$$$$$$$ |$$ |      $$$$$$$  |$$ |$$ |  $$ |\$$$$$$$ |
 *    \__|       \_______|\__|      \_______/ \__|\__|  \__| \____$$ |
 *                                                          $$\   $$ |
 *                                                          \$$$$$$  |
 *                                                           \______/
 */

type IModStats = Record<number, IDateData>

function parseStats(stats:statsItems):IDateData[] {

    /** Returns the passed-in, distilled down to the day */
    function parseDate(str:number|string|Date):Date {
        const firstTempDate = new Date(str);
        return new Date(firstTempDate.getFullYear(), firstTempDate.getMonth(), firstTempDate.getDate());
    }

    const mappedDateToData: Record<number, IDateData> = {};

    for (const [date, endorsementCount] of Object.entries(stats.endorsements.endorsements)) {
        const __thisDate = parseDate(date);
        const thisDate = __thisDate.getTime();

        if (!mappedDateToData[thisDate]) mappedDateToData[thisDate] = {};

        mappedDateToData[thisDate]!.endorsements = endorsementCount;
        mappedDateToData[thisDate]!.dateObj = __thisDate;
    }

    for (const [date, dlCount] of Object.entries(stats.dlAndViews.mod_daily_counts)) {
        const __thisDate = parseDate(date);
        const thisDate = __thisDate.getTime();

        if (!mappedDateToData[thisDate]) mappedDateToData[thisDate] = {};

        mappedDateToData[thisDate]!.downloads = dlCount;
        mappedDateToData[thisDate]!.dateObj = __thisDate;
    }

    for (const [date, viewCount] of Object.entries(stats.dlAndViews.mod_page_views)) {
        const __thisDate = parseDate(date);
        const thisDate = __thisDate.getTime();

        if (!mappedDateToData[thisDate]) mappedDateToData[thisDate] = {};

        mappedDateToData[thisDate]!.pageViews = viewCount;
        mappedDateToData[thisDate]!.dateObj = __thisDate;
    }

    const releases: Record<number, rawInfo.ISingleUpload[]> = {};
    for (const release of stats.fileUploads.message.releases) {
        const thisDate = parseDate(release.date * 1000).getTime();

        if (!releases[thisDate]) releases[thisDate] = [];

        release.date = thisDate;
        releases[thisDate]!.push(release);
    }
    Object.fromEntries(Object.entries(releases).sort());

    console.debug('Fetched releases:', releases);

    for (const [date] of Object.entries(mappedDateToData)) {

        const thisDate = parseInt(date);

        const lastReleaseDate = parseInt(
                                Object.keys(releases)
                                .filter(releaseDate => parseInt(releaseDate) <= thisDate).sort().pop()
                            ?? '-1' );

        const diffDays = lastReleaseDate === -1 ? null : Math.round((thisDate - lastReleaseDate) / (1000 * 60 * 60 * 24));

        mappedDateToData[thisDate]!.daysSinceLastUpload = diffDays;
    }

    return Object.values(mappedDateToData);
}

/*
 *    $$$$$$$$\ $$\ $$\                 $$$$$$$$\
 *    $$  _____|\__|$$ |                \__$$  __|
 *    $$ |      $$\ $$ | $$$$$$\           $$ |    $$$$$$\   $$$$$$\   $$$$$$\   $$$$$$$\
 *    $$$$$\    $$ |$$ |$$  __$$\          $$ |   $$  __$$\ $$  __$$\ $$  __$$\ $$  _____|
 *    $$  __|   $$ |$$ |$$$$$$$$ |         $$ |   $$ |  \__|$$$$$$$$ |$$$$$$$$ |\$$$$$$\
 *    $$ |      $$ |$$ |$$   ____|         $$ |   $$ |      $$   ____|$$   ____| \____$$\
 *    $$ |      $$ |$$ |\$$$$$$$\          $$ |   $$ |      \$$$$$$$\ \$$$$$$$\ $$$$$$$  |
 *    \__|      \__|\__| \_______|         \__|   \__|       \_______| \_______|\_______/
 *
 *
 *
 */


interface IUpdatedFile {
    fileInfo: rawInfo.IFile;
    oldFile: IUpdatedFile|null;
}

interface IFileTrees {
    fileTrees: IUpdatedFile[];
    fileTreesByID: Record<number, IUpdatedFile>;
}

async function createFileTrees(topLevel: rawInfo.IMod, files: rawInfo.IFile[]) {
    let hasFinishedFiles = false;

    const fileTrees:IUpdatedFile[] = [];
    const fileTreesByID:Record<string, IUpdatedFile> = {};
    let filesById: Record<string, rawInfo.IFile>;

    const fileIDs = files.map(file => file.id[0]);

    const filesFetched:Record<number, boolean> = {};
    fileIDs.forEach(id=> filesFetched[id] = false );


    // List of raw files
    const hiddenFiles: rawInfo.IFile[] = [];

    // Get the files available to the API directly:
    const canonicalFiles = await (await fetch(`https://api.nexusmods.com/v1/games/${topLevel.domain_name}/mods/${topLevel.mod_id}/files.json`, getApiRequestInit())).json() as rawInfo.IFileList;
    canonicalFiles.files.forEach(file => filesById[file.id[0]] = file);

    console.debug('Fetched files from API:', canonicalFiles);

    // Get files that have been hidden from the API:
    for (const fileID of fileIDs) {
        if (filesFetched[fileID]) continue;

        console.debug(`Fetching file ${fileID} separately...`);

        fetch(`https://api.nexusmods.com/v1/games/${topLevel.domain_name}/mods/${topLevel.mod_id}/files/${fileID}.json`, getApiRequestInit())
            .then(async (fileData) => {

            hiddenFiles.push(await fileData.json());
            filesFetched[fileID] = true;

            finishFiles();

        });
    }

    finishFiles();

    async function finishFiles(){

        if (hasFinishedFiles || Object.values(filesFetched).includes(false)) return;
        hasFinishedFiles = true;

        console.debug('Finished fetching files');
        console.debug('Files: ', [...canonicalFiles.files, ...hiddenFiles]);
        console.debug('Updates: ', canonicalFiles.file_updates);

        processFiles([...canonicalFiles.files, ...hiddenFiles], canonicalFiles.file_updates);
    }

    function processFiles(files: rawInfo.IFile[], updates: rawInfo.IUpdate[]): void {
        filesById = Object.fromEntries(files.map(file => [file.file_id, file]));

        for (const update of updates) {
            addUpdate(update);
        }

        console.debug('File Trees:', fileTrees);
        console.debug('File Trees by ID:', fileTreesByID);
    }

    function addUpdate(update: rawInfo.IUpdate) {
        const oldFile = filesById[update.old_file_id];
        if (!oldFile) throw new Error(`Could not find OLD file ${update.old_file_id} for update\n${JSON.stringify(update, undefined, 4)}`);

        const newFile = filesById[update.new_file_id];
        if (!newFile) throw new Error(`Could not find NEW file ${update.new_file_id} for update\n${JSON.stringify(update, undefined, 4)}`);

        const oldFileTree = fileTreesByID[oldFile.file_id] ?? {fileInfo: oldFile, oldFile: null};
        removeOldFileTree(update);

        const newFileTree = {fileInfo: newFile, oldFile: oldFileTree};
        fileTrees.push(newFileTree);

        // Update file tree by ID
        fileTreesByID[newFile.file_id] = newFileTree;

        //i += 1;
        //afs.writeFile(`output/fileTrees${i}.json`, JSON.stringify(fileTrees, undefined, 4), {encoding: 'utf-8'});
        //afs.writeFile(`output/fileTrees_byID${i}.json`, JSON.stringify(fileTreesByID, undefined, 4), {encoding: 'utf-8'});
    }

    function removeOldFileTree(update: rawInfo.IUpdate){
        const oldFile = filesById[update.old_file_id];
        if (!oldFile) throw new Error(`Could not find OLD file ${update.old_file_id} for update\n${JSON.stringify(update, undefined, 4)}`);

        const oldFileTree = fileTreesByID[oldFile.file_id] ?? {fileInfo: oldFile, oldFile: null};

        const oldFileTreeIndex = fileTrees.indexOf(oldFileTree);
        console.log(oldFileTreeIndex);

        if (oldFileTreeIndex < 0) return;

        // Replace old file tree
        fileTrees.splice(oldFileTreeIndex, 1);
        removeOldFileTree(update);
    }
}




/*
 *    $$$$$$$$\                                           $$\
 *    $$  _____|                                          $$ |
 *    $$ |      $$\   $$\  $$$$$$\   $$$$$$\   $$$$$$\  $$$$$$\    $$$$$$$\
 *    $$$$$\    \$$\ $$  |$$  __$$\ $$  __$$\ $$  __$$\ \_$$  _|  $$  _____|
 *    $$  __|    \$$$$  / $$ /  $$ |$$ /  $$ |$$ |  \__|  $$ |    \$$$$$$\
 *    $$ |       $$  $$<  $$ |  $$ |$$ |  $$ |$$ |        $$ |$$\  \____$$\
 *    $$$$$$$$\ $$  /\$$\ $$$$$$$  |\$$$$$$  |$$ |        \$$$$  |$$$$$$$  |
 *    \________|\__/  \__|$$  ____/  \______/ \__|         \____/ \_______/
 *                        $$ |
 *                        $$ |
 *                        \__|
 */

/** Top row of the CSV */
// eslint-disable-next-line i18n-text/no-en
const csvHeader = 'Date\tDownloads\tPage Views\tEndorsements\tDays Since Last Upload';

function getArrayOfDataData(mappedDateToData: IModStats): Map<string, IDateData> {
    return new Map(
        Object.entries(mappedDateToData).sort((a, b) =>
            - ( (a[1]?.dateObj?.getTime() ?? 0) - (b[1]?.dateObj?.getTime() ?? 0) )
        )
    );
}

function getCSV(mappedDateToData: IModStats) : string[] {

    const dataSortedByDescendingDate = getArrayOfDataData(mappedDateToData);

    /** dataSortedByDescendingDate in the form of CSV data strings */
    const csvData = [...dataSortedByDescendingDate]
        // Map to CSV string
        .map(([, thisDateData]) =>                                                        // eslint-disable-next-line i18n-text/no-en
            `${thisDateData.dateObj?.toLocaleDateString()}\t${thisDateData.downloads ?? 0}\t${thisDateData.pageViews ?? 0}\t${thisDateData.endorsements ?? 0}\t${thisDateData.daysSinceLastUpload ?? 'No Upload Yet'}`
        );

    console.debug('CSV data:', csvData);
    return csvData;

}
