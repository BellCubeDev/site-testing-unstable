import * as bcdFS from '../../filesystem-interface.js';
import * as fomodUI from './fomod-builder-ui.js';
import * as fomodClasses from './fomod-builder-classifications.js';
type importedZipJS = typeof import("../../included_node_modules/@zip.js/zip.js/lib/zip-no-worker");
declare global {
    interface Window {
        zip?: importedZipJS | Promise<importedZipJS>;
        domParser: DOMParser;
        FOMODBuilder: {
            ui: fomodUI.windowUI;
            directory?: bcdFS.writeableFolder;
            storage: builderStorage;
            fomodClass: typeof fomodClasses.Fomod;
            trackedFomod: null | {
                obj: fomodClasses.Fomod;
                infoDoc: XMLDocument;
                moduleDoc: XMLDocument;
            };
        };
    }
}
export interface builderStorage {
    storageRevision: number;
    settings: {
        autoSaveAfterChange: boolean;
        alwaysCleanSave: boolean;
        includeInfoSchema: boolean;
        optimizationUsingFlags: boolean;
        saveConfigInXML: boolean;
        brandingComment: boolean;
        defaultGroupSortingOrder: fomodClasses.SortOrder;
        defaultGroupSelectType: fomodClasses.groupSelectType;
        formatXML: boolean;
    };
    preferences: {
        stepsBuilder: fomodUI.bcdBuilderType;
    };
}
export declare const save: typeof fomodUI.save;
export declare abstract class updatableObject {
    abstract update(): any;
}
export {};
//# sourceMappingURL=fomod-builder.d.ts.map