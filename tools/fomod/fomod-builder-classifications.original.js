import * as main from "./fomod-builder.js";
import * as bindingsGeneric from './fomod-builder-bindings.js';
import * as bindings1stParty from './fomod-builder-steps-1st-party.js';
export class XMLElement {
    instanceElement;
    objectsToUpdate = [];
    updateObjects() {
        this.objectsToUpdate.forEach((obj) => obj.update());
        if (window.FOMODBuilder.storage.settings.autoSaveAfterChange)
            main.save();
    }
    update() { this.updateObjects(); }
    constructor(instanceElement = undefined) {
        this.instanceElement = instanceElement;
    }
}
export class dependency extends XMLElement {
    constructor(instanceElement = undefined) {
        super(instanceElement);
    }
}
export class DependencyBaseVersionCheck extends dependency {
    _version = '';
    set version(value) { this._version = value; this.updateObjects(); }
    get version() { return this._version; }
}
export const flags = {};
export class Flag {
    name = '';
    values = new Set();
    getters = [];
    setters = [];
    constructor(name = '', value = '') {
        this.name = name;
        this.values.add(value);
        flags[name] = this;
    }
    removeValue(value) {
        return this.values.delete(value);
    }
}
export function setNewFlagValue(name, value) {
    if (!flags[name])
        flags[name] = new Flag(name, value);
    return flags[name];
}
export class DependencyGroup extends dependency {
    _operator = 'And';
    set operator(value) { this._operator = value; this.updateObjects(); }
    get operator() { return this._operator; }
    _children = [];
    set children(value) { this._children = value; this.updateObjects(); }
    get children() { return this._children; }
    constructor(instanceElement = undefined, operator = "And", parseChildren = false) {
        super(instanceElement);
        this.operator = operator;
        if (instanceElement) {
            this._operator =
                instanceElement.getAttribute("operator") || operator;
        }
        if (!parseChildren || !instanceElement)
            return;
        for (const child of instanceElement.children) {
            this.children.push(parseDependency(child));
        }
    }
    asModuleXML(document, nodeName = "dependencies") {
        if (!this.instanceElement)
            this.instanceElement = document.createElement(nodeName);
        if (this.instanceElement && this.instanceElement.tagName !== nodeName) {
            this.instanceElement.remove();
            this.instanceElement = document.createElement(nodeName);
            for (const child of this.children) {
                if (child.instanceElement)
                    this.instanceElement.appendChild(child.instanceElement);
            }
        }
        this.instanceElement.setAttribute("operator", this.operator);
        for (const child of this.children) {
            this.instanceElement.appendChild(child.asModuleXML(document));
        }
        return this.instanceElement;
    }
}
export class DependencyFlag extends dependency {
    _flag = '';
    set flag(value) { this._flag = value; this.updateObjects(); }
    get flag() { return this._flag; }
    _value = '';
    set value(value) { this._value = value; this.updateObjects(); }
    get value() { return this._value; }
    asModuleXML(document) {
        const thisElement = document.createElement("flagDependency");
        thisElement.setAttribute("flag", this.flag);
        thisElement.setAttribute("value", this.value);
        return thisElement;
    }
}
export class DependencyFile extends dependency {
    _file = '';
    set file(value) { this._file = value; this.updateObjects(); }
    get file() { return this._file; }
    _state = "Active";
    set state(value) { this._state = value; this.updateObjects(); }
    get state() { return this._state; }
    asModuleXML(document) {
        const thisElement = document.createElement("fileDependency");
        thisElement.setAttribute("file", this.file);
        thisElement.setAttribute("state", this.state);
        return thisElement;
    }
}
export class DependencyScriptExtender extends DependencyBaseVersionCheck {
    asModuleXML(document) {
        const thisElement = document.createElement("foseDependency");
        thisElement.setAttribute("version", this.version);
        return thisElement;
    }
}
export class DependencyGameVersion extends DependencyBaseVersionCheck {
    asModuleXML(document) {
        const thisElement = document.createElement("gameDependency");
        thisElement.setAttribute("version", this.version);
        return thisElement;
    }
}
export class DependencyModManager extends DependencyBaseVersionCheck {
    asModuleXML(document) {
        const thisElement = document.createElement("fommDependency");
        thisElement.setAttribute("version", this.version);
        return thisElement;
    }
}
function parseDependency(dependency) {
    const type = dependency.tagName;
    switch (type) {
        case "dependencies":
            return new DependencyGroup(dependency, undefined, true);
        case "fileDependency":
            return new DependencyFile(dependency);
        case "flagDependency":
            return new DependencyFlag(dependency);
        case "foseDependency":
            return new DependencyScriptExtender(dependency);
        case "gameDependency":
            return new DependencyGameVersion(dependency);
        case "fommDependency":
            return new DependencyModManager(dependency);
        default:
            throw new TypeError(`Unknown dependency type: ${type}`);
    }
}
export class OptionTypeDescriptor extends XMLElement {
    _default = "Optional";
    set default(value) { this._default = value; this.updateObjects(); }
    get default() { return this._default; }
    _dependencies = [];
    set dependencies(value) { this._dependencies = value; this.updateObjects(); }
    get dependencies() { return this._dependencies; }
    _basicElement = undefined;
    set basicElement(value) { this._basicElement = value; this.updateObjects(); }
    get basicElement() { return this._basicElement; }
    _complexElement = undefined;
    set complexElement(value) { this._complexElement = value; this.updateObjects(); }
    get complexElement() { return this._complexElement; }
    _complexTypeElement = undefined;
    set complexTypeElement(value) { this._complexTypeElement = value; this.updateObjects(); }
    get complexTypeElement() { return this._complexTypeElement; }
    _complexPatternElement = undefined;
    set complexPatternElement(value) { this._complexPatternElement = value; this.updateObjects(); }
    get complexPatternElement() { return this._complexPatternElement; }
    constructor(element, defaultType = "Optional", dependencies = []) {
        super(element);
        this.default = defaultType;
        this.dependencies = dependencies;
    }
    asModuleXML(document) {
        this.instanceElement =
            this.instanceElement ?? document.createElement("typeDescriptor");
        if (this.dependencies.length === 0) {
            this.complexElement?.remove();
            this.complexElement = undefined;
            this.basicElement =
                this.basicElement ??
                    this.instanceElement.appendChild(document.createElement("type"));
            this.basicElement.setAttribute("default", this.default);
            return this.instanceElement;
        }
        this.complexElement =
            this.complexElement ??
                this.instanceElement.appendChild(document.createElement("dependencyType"));
        this.complexTypeElement =
            this.complexTypeElement ??
                this.complexElement.appendChild(document.createElement("defaultType"));
        this.complexTypeElement.setAttribute("name", this.default);
        this.complexPatternElement =
            this.complexPatternElement ??
                this.complexElement.appendChild(document.createElement("patterns"));
        for (const dependency of this.dependencies) {
            this.complexPatternElement.appendChild(dependency.asModuleXML(document));
        }
        return this.instanceElement;
    }
}
export class OptionTypeDescriptorWithDependency extends XMLElement {
    _type = "Optional";
    set type(value) { this._type = value; this.updateObjects(); }
    get type() { return this._type; }
    _typeElement = undefined;
    set typeElement(value) { this._typeElement = value; this.updateObjects(); }
    get typeElement() { return this._typeElement; }
    _dependency;
    set dependency(value) { this._dependency = value; this.updateObjects(); }
    get dependency() { return this._dependency; }
    constructor(dependency, type = "Optional") {
        super();
        this.dependency = dependency;
        this.type = type;
    }
    asModuleXML(document) {
        this.instanceElement =
            this.instanceElement ?? document.createElement("pattern");
        this.typeElement = this.typeElement
            ?? this.instanceElement.appendChild(document.createElement("type"));
        this.typeElement.setAttribute("name", this.type);
        this.instanceElement.appendChild(this.dependency.asModuleXML(document));
        return this.instanceElement;
    }
}
export class Install extends XMLElement {
    static paths = [];
    _path;
    set path(value) { this._path = value; this.updateObjects(); }
    get path() { return this._path; }
    async updateFile(pathOrFile) {
        if (typeof pathOrFile === "string") {
            const filePath = pathOrFile.split("/");
            Install.paths.push(filePath);
            this.path = filePath;
        }
        else if (pathOrFile instanceof FileSystemHandle) {
            pathOrFile = await window.FOMODBuilder.directory?.handle.resolve(pathOrFile) ?? '';
        }
        if (pathOrFile instanceof Array) {
            Install.paths.push(pathOrFile);
            this.path = pathOrFile;
            return;
        }
        throw new Error("Could not resolve path - most likely outside of the root directory");
    }
    constructor(element, file = ['']) {
        super(element);
        this.updateFile(file);
    }
    asModuleXML(document) {
        this.instanceElement =
            this.instanceElement ?? document.createElement("install");
        const path = this.path.join("/");
        const isFolder = this.path[this.path.length - 1] === '';
        this.instanceElement.appendChild(document.createElement(isFolder ? 'folder' : 'file')).textContent = isFolder ? path.slice(0, -1) : path;
        return this.instanceElement;
    }
}
export class Step extends XMLElement {
    name = '';
    order = "Explicit";
    groups = [];
    asModuleXML(document) {
        this.instanceElement =
            this.instanceElement ?? document.createElement("installStep");
        this.instanceElement.setAttribute("name", this.name);
        const optionalFileGroups = this.instanceElement.appendChild(document.createElement("optionalFileGroups"));
        optionalFileGroups.setAttribute("order", this.order);
        for (const group of this.groups)
            optionalFileGroups.appendChild(group.asModuleXML(document));
        return this.instanceElement;
    }
}
export class Group extends XMLElement {
    _name = '';
    set name(value) { this._name = value; this.updateObjects(); }
    get name() { return this._name; }
    _type = "SelectAny";
    set type(value) { this._type = value; this.updateObjects(); }
    get type() { return this._type; }
    _sortOrder = "Explicit";
    set sortOrder(value) { this._sortOrder = value; this.updateObjects(); }
    get sortOrder() { return this._sortOrder; }
    _options = [];
    set options(value) { this._options = value; this.updateObjects(); }
    get options() { return this._options; }
    asModuleXML(document) {
        this.instanceElement = this.instanceElement ?? document.createElement("group");
        this.instanceElement.setAttribute("name", this.name);
        this.instanceElement.setAttribute("type", this.type);
        const options = this.instanceElement.appendChild(document.getOrCreateChild("plugins"));
        options.setAttribute("order", this.sortOrder);
        for (const option of this.options)
            options.appendChild(option.asModuleXML(document));
        return this.instanceElement;
    }
}
export class Option extends XMLElement {
    _name = '';
    set name(value) { this._name = value; this.updateObjects(); }
    get name() { return this._name; }
    _description;
    set description(value) { this._description = value; this.updateObjects(); }
    get description() { return this._description; }
    _image;
    set image(value) { this._image = value; this.updateObjects(); }
    get image() { return this._image; }
    _conditionFlags = [];
    set conditionFlags(value) { this._conditionFlags = value; this.updateObjects(); }
    get conditionFlags() { return this._conditionFlags; }
    _conditionFlagsContainer;
    set conditionFlagsContainer(value) { this._conditionFlagsContainer = value; this.updateObjects(); }
    get conditionFlagsContainer() { return this._conditionFlagsContainer; }
    _files = [];
    set files(value) { this._files = value; this.updateObjects(); }
    get files() { return this._files; }
    _filesContainer;
    set filesContainer(value) { this._filesContainer = value; this.updateObjects(); }
    get filesContainer() { return this._filesContainer; }
    _typeDescriptor;
    set typeDescriptor(value) { this._typeDescriptor = value; this.updateObjects(); }
    get typeDescriptor() { return this._typeDescriptor; }
    constructor(element, name = '', description = '', image = [], conditionFlags = [], files = [], typeDescriptor = new OptionTypeDescriptor()) {
        super(element);
        this.name = name;
        this.description =
            description instanceof OptionDescription
                ? description
                : new OptionDescription(undefined, description);
        this.description.objectsToUpdate.push(this);
        this.image = image instanceof OptionImage
            ? image
            : new OptionImage(undefined, image);
        this.image.objectsToUpdate.push(this);
        this.conditionFlags = conditionFlags;
        this.conditionFlags.forEach(flag => flag.objectsToUpdate.push(this));
        this.files = files;
        this.files.forEach(file => file.objectsToUpdate.push(this));
        this.typeDescriptor = typeDescriptor;
        this.typeDescriptor.objectsToUpdate.push(this);
    }
    asModuleXML(document) {
        this.instanceElement =
            this.instanceElement ?? document.createElement("option");
        this.instanceElement.setAttribute("name", this.name);
        this.instanceElement.appendChild(this.description.asModuleXML(document));
        this.instanceElement.appendChild(this.image.asModuleXML(document));
        for (const conditionFlag of this.conditionFlags) {
            this.instanceElement.appendChild(conditionFlag.asModuleXML(document));
        }
        for (const file of this.files) {
            this.instanceElement.appendChild(file.asModuleXML(document));
        }
        this.instanceElement.appendChild(this.typeDescriptor.asModuleXML(document));
        return this.instanceElement;
    }
}
export class OptionDescription extends XMLElement {
    _description = '';
    set description(value) { this._description = value; this.updateObjects(); }
    get description() { return this._description; }
    constructor(element, description = '') {
        super(element);
        this.description = description;
    }
    asModuleXML(document) {
        this.instanceElement =
            this.instanceElement ?? document.createElement("description");
        this.instanceElement.textContent = this.description;
        return this.instanceElement;
    }
}
export class OptionImage extends XMLElement {
    _image = [];
    set image(value) { this._image = value; this.updateObjects(); }
    get image() { return this._image; }
    constructor(element, image = []) {
        super(element);
        var tempImg = image;
        if (!(tempImg instanceof Array))
            window.FOMODBuilder.directory
                ?.handle.resolve(tempImg)
                .then((path) => (this.image = path ?? []));
        else
            this.image = tempImg;
    }
    asModuleXML(document) {
        this.instanceElement =
            this.instanceElement ?? document.createElement("image");
        this.instanceElement.setAttribute("path", this.image.join("\\"));
        return this.instanceElement;
    }
}
export class Fomod extends XMLElement {
    _metaName = '';
    set metaName(value) { this._metaName = value; this.updateObjects(); }
    get metaName() { return this._metaName || this._moduleName; }
    _moduleName = '';
    set moduleName(value) { this._moduleName = value; this.updateObjects(); }
    get moduleName() { return this._moduleName || this._metaName; }
    _metaImage = '';
    set metaImage(value) { this._metaImage = value; this.updateObjects(); }
    get metaImage() { return this._metaImage; }
    _metaAuthor = '';
    set metaAuthor(value) { this._metaAuthor = value; this.updateObjects(); }
    get metaAuthor() { return this._metaAuthor; }
    _metaVersion = '';
    set metaVersion(value) { this._metaVersion = value; this.updateObjects(); }
    get metaVersion() { return this._metaVersion; }
    _metaId = 0;
    set metaId(value) { this._metaId = value; this.updateObjects(); }
    get metaId() { return this._metaId; }
    _infoInstanceElement;
    set infoInstanceElement(value) { this._infoInstanceElement = value; this.updateObjects(); }
    get infoInstanceElement() { return this._infoInstanceElement; }
    _metaUrl = '';
    get metaUrl() { return this._metaUrl; }
    set metaUrl(url) {
        if (url instanceof URL)
            this._metaUrl = url;
        else {
            try {
                this._metaUrl = new URL(url);
            }
            catch (e) {
                this._metaUrl = url;
                this.updateObjects();
                console.warn(`Invalid URL: "${url}"`);
            }
        }
    }
    getURLAsString() {
        return this.metaUrl instanceof URL ?
            this.metaUrl.toString()
            : this.metaUrl;
    }
    installs;
    conditions;
    steps;
    sortingOrder = 'Explicit';
    constructor(instanceElement, infoInstanceElement, metaName = '', metaImage = '', metaAuthor = '', metaVersion = '', metaId = 0, metaUrl = '', installs = [], steps = [], conditions) {
        super(instanceElement);
        this.infoInstanceElement = infoInstanceElement;
        this.metaName = metaName ?? infoInstanceElement?.getElementsByTagName("Name")[0]?.textContent ?? '';
        this.moduleName = instanceElement?.getElementsByTagName("moduleName")[0]?.textContent ?? '';
        this.metaImage = metaImage ?? instanceElement?.getElementsByTagName("moduleImage")[0]?.getAttribute("path");
        this.metaAuthor = metaAuthor ?? infoInstanceElement?.getElementsByTagName("Author")[0]?.textContent ?? '';
        this.metaVersion = metaVersion ?? infoInstanceElement?.getElementsByTagName("Version")[0]?.textContent ?? '';
        this.metaId = metaId ?? infoInstanceElement?.getElementsByTagName("Id")[0]?.textContent ?? 0;
        this.metaUrl = metaUrl ?? infoInstanceElement?.getElementsByTagName("Url")[0]?.textContent ?? '';
        this.installs = installs;
        this.conditions = conditions;
        this.steps = steps;
        this.objectsToUpdate.push(new bindingsGeneric.modMetadata(this), new bindings1stParty.Fomod(this));
    }
    asModuleXML(document) {
        if (document.documentElement !== this.instanceElement) {
            document.removeChild(document.documentElement);
            this.instanceElement = document.getOrCreateChild("config");
        }
        this.instanceElement.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        this.instanceElement.setAttribute("xsi:noNamespaceSchemaLocation", "http://qconsulting.ca/fo3/ModConfig5.0.xsd");
        this.instanceElement.getOrCreateChild("moduleName").textContent = this.metaName;
        this.instanceElement.getOrCreateChild("moduleImage").setAttribute('path', this.metaImage);
        for (const install of this.installs) {
            this.instanceElement.appendChild(install.asModuleXML(document));
        }
        if (this.conditions)
            this.instanceElement.appendChild(this.conditions.asModuleXML(document));
        for (const step of this.steps) {
            this.instanceElement.appendChild(step.asModuleXML(document));
        }
        return this.instanceElement;
    }
    asInfoXML(document) {
        if (document.documentElement !== this.infoInstanceElement) {
            document.removeChild(document.documentElement);
            this.infoInstanceElement = document.getOrCreateChild("fomod");
        }
        this.infoInstanceElement.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        if (window.FOMODBuilder.storage.settings.includeInfoSchema)
            this.infoInstanceElement.setAttribute("xsi:noNamespaceSchemaLocation", "https://bellcubedev.github.io/site-testing/assets/site/misc/Info.xsd");
        else if (this.infoInstanceElement.getAttribute("xsi:noNamespaceSchemaLocation") === "https://bellcubedev.github.io/site-testing/assets/site/misc/Info.xsd")
            this.infoInstanceElement.removeAttribute("xsi:noNamespaceSchemaLocation");
        const url = this.getURLAsString();
        if (this.metaName)
            this.infoInstanceElement.getOrCreateChild("Name").textContent = this.metaName;
        if (this.metaAuthor)
            this.infoInstanceElement.getOrCreateChild("Author").textContent = this.metaAuthor;
        if (this.metaId)
            this.infoInstanceElement.getOrCreateChild("Id").textContent = this.metaId.toString();
        if (url)
            this.infoInstanceElement.getOrCreateChild("Website").textContent = url;
        if (this.metaVersion)
            this.infoInstanceElement.getOrCreateChild("Version").textContent = this.metaVersion;
        return this.infoInstanceElement;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9tb2QtYnVpbGRlci1jbGFzc2lmaWNhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JlbGxDdWJlRGV2L3NpdGUtdGVzdGluZy9kZXBsb3ltZW50LyIsInNvdXJjZXMiOlsidG9vbHMvZm9tb2QvZm9tb2QtYnVpbGRlci1jbGFzc2lmaWNhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLElBQUksTUFBTSxvQkFBb0IsQ0FBQztBQUczQyxPQUFPLEtBQUssZUFBZSxNQUFNLDZCQUE2QixDQUFDO0FBQy9ELE9BQU8sS0FBSyxnQkFBZ0IsTUFBTSxvQ0FBb0MsQ0FBQztBQXNCdkUsTUFBTSxPQUFnQixVQUFVO0lBQzVCLGVBQWUsQ0FBc0I7SUFFckMsZUFBZSxHQUEyQixFQUFFLENBQUM7SUFFN0MsYUFBYTtRQUNULElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUcsQ0FBQztRQUN4RCxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUI7WUFBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0UsQ0FBQztJQUVELE1BQU0sS0FBSyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWxDLFlBQVksa0JBQXVDLFNBQVM7UUFDeEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7SUFDM0MsQ0FBQztDQUlKO0FBSUQsTUFBTSxPQUFnQixVQUFXLFNBQVEsVUFBVTtJQUMvQyxZQUFZLGtCQUF1QyxTQUFTO1FBQ3hELEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMzQixDQUFDO0NBR0o7QUFJRCxNQUFNLE9BQWdCLDBCQUEyQixTQUFRLFVBQVU7SUFDdkQsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUN0QixJQUFJ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QUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFHOUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ2xDLElBQUksSUFBSSxDQUFDLFFBQVE7WUFBSyxJQUFJLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxHQUFNLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdkcsSUFBSSxJQUFJLENBQUMsVUFBVTtZQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEdBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN6RyxJQUFJLElBQUksQ0FBQyxNQUFNO1lBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsR0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hILElBQUksR0FBRztZQUFnQixJQUFJLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztRQUM5RixJQUFJLElBQUksQ0FBQyxXQUFXO1lBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBRTFHLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ3BDLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG1haW4gZnJvbSBcIi4vZm9tb2QtYnVpbGRlci5qc1wiOyAvLyBCcmluZ3MgaW4gZ2xvYmFsIHRoaW5nc1xuaW1wb3J0IHsgb2JqT2YgfSBmcm9tICcuLi8uLi91bml2ZXJzYWwuanMnO1xuXG5pbXBvcnQgKiBhcyBiaW5kaW5nc0dlbmVyaWMgZnJvbSAnLi9mb21vZC1idWlsZGVyLWJpbmRpbmdzLmpzJztcbmltcG9ydCAqIGFzIGJpbmRpbmdzMXN0UGFydHkgZnJvbSAnLi9mb21vZC1idWlsZGVyLXN0ZXBzLTFzdC1wYXJ0eS5qcyc7XG5pbXBvcnQgKiBhcyBiaW5kaW5nc1ZvcnRleCBmcm9tICcuL2ZvbW9kLWJ1aWxkZXItc3RlcHMtdm9ydGV4LmpzJztcbmltcG9ydCAqIGFzIGJpbmRpbmdzTU8yIGZyb20gJy4vZm9tb2QtYnVpbGRlci1zdGVwcy1tbzIuanMnO1xuXG5cbi8qeCBlc2xpbnQtZGlzYWJsZSBpMThuLXRleHQvbm8tZW4gKi8vLyBGT01PRHMgYXJlIFhNTCBmaWxlcyB3aXRoIGEgc2NoZW1hIHdyaXR0ZW4gaW4gRW5nbGlzaCwgc28gZGlzYWxsb3dpbmcgRW5nbGlzaCBtYWtlcyBsaXR0bGUgc2Vuc2UuXG5cbi8qXG4gICAgVGhhbmtzIHRvIFBhdHJpY2sgR2lsbGVzcGllIGZvciB0aGUgZ3JlYXQgQVNDSUkgYXJ0IGdlbmVyYXRvciFcbiAgICBodHRwczovL3BhdG9yamsuY29tL3NvZnR3YXJlL3RhYWcvI3A9ZGlzcGxheSZoPTAmdj0wJmY9QmlnJTIwTW9uZXktbndcbiAgICAuLi5tYWtlcyB0aGlzIGNvZGUgKnNvKiBtdWNoIGVhc2llciB0byBtYWludGFpbi4uLiB5b3Uga25vdywgJ2N1eiBJIGNhbiBmaW5kIG15IGZ1bmN0aW9ucyBpbiBWU0NvZGUncyBNaW5pbWFwXG4qL1xuXG4gLyokJCQkXFwgICQkXFwgICAgICAgICAgICAgICAgICAgJCRcXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJFxcXG4kJCAgX18kJFxcICQkIHwgICAgICAgICAgICAgICAgICAkJCB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuJCQgLyAgJCQgfCQkJCQkJCRcXCAgICQkJCQkJCRcXCAkJCQkJCRcXCAgICAkJCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkJFxcICQkJCQkJFxcICAgICQkJCQkJCRcXFxuJCQkJCQkJCQgfCQkICBfXyQkXFwgJCQgIF9fX19ffFxcXyQkICBffCAgJCQgIF9fJCRcXCAgXFxfX19fJCRcXCAkJCAgX19fX198XFxfJCQgIF98ICAkJCAgX19fX198XG4kJCAgX18kJCB8JCQgfCAgJCQgfFxcJCQkJCQkXFwgICAgJCQgfCAgICAkJCB8ICBcXF9ffCAkJCQkJCQkIHwkJCAvICAgICAgICAkJCB8ICAgIFxcJCQkJCQkXFxcbiQkIHwgICQkIHwkJCB8ICAkJCB8IFxcX19fXyQkXFwgICAkJCB8JCRcXCAkJCB8ICAgICAgJCQgIF9fJCQgfCQkIHwgICAgICAgICQkIHwkJFxcICBcXF9fX18kJFxcXG4kJCB8ICAkJCB8JCQkJCQkJCAgfCQkJCQkJCQgIHwgIFxcJCQkJCAgfCQkIHwgICAgICBcXCQkJCQkJCQgfFxcJCQkJCQkJFxcICAgXFwkJCQkICB8JCQkJCQkJCAgfFxuXFxfX3wgIFxcX198XFxfX19fX19fLyBcXF9fX19fX18vICAgIFxcX19fXy8gXFxfX3wgICAgICAgXFxfX19fX19ffCBcXF9fX19fX198ICAgXFxfX19fLyBcXF9fX19fXyovXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBYTUxFbGVtZW50IGltcGxlbWVudHMgbWFpbi51cGRhdGFibGVPYmplY3Qge1xuICAgIGluc3RhbmNlRWxlbWVudDogRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICAgIG9iamVjdHNUb1VwZGF0ZTogbWFpbi51cGRhdGFibGVPYmplY3RbXSA9IFtdO1xuXG4gICAgdXBkYXRlT2JqZWN0cygpIHtcbiAgICAgICAgdGhpcy5vYmplY3RzVG9VcGRhdGUuZm9yRWFjaCggIChvYmopID0+IG9iai51cGRhdGUoKSAgKTtcbiAgICAgICAgaWYgKHdpbmRvdy5GT01PREJ1aWxkZXIuc3RvcmFnZS5zZXR0aW5ncy5hdXRvU2F2ZUFmdGVyQ2hhbmdlKSAgbWFpbi5zYXZlKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkgeyB0aGlzLnVwZGF0ZU9iamVjdHMoKTsgfVxuXG4gICAgY29uc3RydWN0b3IoaW5zdGFuY2VFbGVtZW50OiBFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50ID0gaW5zdGFuY2VFbGVtZW50O1xuICAgIH1cblxuICAgIGFzTW9kdWxlWE1MPyhkb2N1bWVudDogWE1MRG9jdW1lbnQpOiBFbGVtZW50O1xuICAgIGFzSW5mb1hNTD8oZG9jdW1lbnQ6IFhNTERvY3VtZW50KTogRWxlbWVudDtcbn1cblxuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBkZXBlbmRlbmN5IGV4dGVuZHMgWE1MRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoaW5zdGFuY2VFbGVtZW50OiBFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN1cGVyKGluc3RhbmNlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgYWJzdHJhY3Qgb3ZlcnJpZGUgYXNNb2R1bGVYTUwoZG9jdW1lbnQ6IFhNTERvY3VtZW50KTogRWxlbWVudDtcbn1cblxuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEZXBlbmRlbmN5QmFzZVZlcnNpb25DaGVjayBleHRlbmRzIGRlcGVuZGVuY3kge1xuICAgIHByaXZhdGUgX3ZlcnNpb24gPSAnJztcbiAgICBzZXQgdmVyc2lvbih2YWx1ZTogc3RyaW5nKSB7IHRoaXMuX3ZlcnNpb24gPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IHZlcnNpb24oKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX3ZlcnNpb247IH1cbn1cblxuXG5cbi8qJCQkJCRcXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJFxcICQkXFwgICAkJFxcICAgICAkJFxcXG4kJCAgX18kJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxcX198ICAkJCB8ICAgIFxcX198XG4kJCAvICBcXF9ffCAkJCQkJCRcXCAgJCQkJCQkJFxcICAgJCQkJCQkJCB8JCRcXCAkJCQkJCRcXCAgICQkXFwgICQkJCQkJFxcICAkJCQkJCQkXFwgICAkJCQkJCQkXFxcbiQkIHwgICAgICAkJCAgX18kJFxcICQkICBfXyQkXFwgJCQgIF9fJCQgfCQkIHxcXF8kJCAgX3wgICQkIHwkJCAgX18kJFxcICQkICBfXyQkXFwgJCQgIF9fX19ffFxuJCQgfCAgICAgICQkIC8gICQkIHwkJCB8ICAkJCB8JCQgLyAgJCQgfCQkIHwgICQkIHwgICAgJCQgfCQkIC8gICQkIHwkJCB8ICAkJCB8XFwkJCQkJCRcXFxuJCQgfCAgJCRcXCAkJCB8ICAkJCB8JCQgfCAgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8JCRcXCAkJCB8JCQgfCAgJCQgfCQkIHwgICQkIHwgXFxfX19fJCRcXFxuXFwkJCQkJCQgIHxcXCQkJCQkJCAgfCQkIHwgICQkIHxcXCQkJCQkJCQgfCQkIHwgIFxcJCQkJCAgfCQkIHxcXCQkJCQkJCAgfCQkIHwgICQkIHwkJCQkJCQkICB8XG4gXFxfX19fX18vICBcXF9fX19fXy8gXFxfX3wgIFxcX198IFxcX19fX19fX3xcXF9ffCAgIFxcX19fXy8gXFxfX3wgXFxfX19fX18vIFxcX198ICBcXF9ffFxcX19fX19fKi9cblxuZXhwb3J0IGNvbnN0IGZsYWdzOm9iak9mPEZsYWc+ID0ge307XG5cbmV4cG9ydCBjbGFzcyBGbGFnIHtcbiAgICBuYW1lID0gJyc7XG4gICAgdmFsdWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZ2V0dGVyczp1bmtub3duW10gPSBbXTtcbiAgICBzZXR0ZXJzOnVua25vd25bXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IobmFtZSA9ICcnLCB2YWx1ZSA9ICcnKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMudmFsdWVzLmFkZCh2YWx1ZSk7XG5cbiAgICAgICAgZmxhZ3NbbmFtZV0gPSB0aGlzO1xuICAgIH1cblxuICAgIC8qKiBAcmV0dXJucyB3aGV0aGVyIG9yIG5vdCBhIHZhbGUgd2FzIHJlbW92ZWQgZnJvbSB0aGUgYHZhbHVlc2AgU2V0ICovXG4gICAgcmVtb3ZlVmFsdWUodmFsdWU6c3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5kZWxldGUodmFsdWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE5ld0ZsYWdWYWx1ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBGbGFnIHtcbiAgICBpZiAoIWZsYWdzW25hbWVdKSBmbGFnc1tuYW1lXSA9IG5ldyBGbGFnKG5hbWUsIHZhbHVlKTtcbiAgICByZXR1cm4gZmxhZ3NbbmFtZV0hO1xufVxuXG5leHBvcnQgdHlwZSBEZXBlbmRlbmN5RmlsZVN0YXRlID0gXCJBY3RpdmVcIiB8IFwiSW5hY3RpdmVcIiB8IFwiTWlzc2luZ1wiO1xuZXhwb3J0IHR5cGUgRGVwZW5kZW5jeUdyb3VwT3BlcmF0b3IgPSBcIkFuZFwiIHwgXCJPclwiO1xuZXhwb3J0IGNsYXNzIERlcGVuZGVuY3lHcm91cCBleHRlbmRzIGRlcGVuZGVuY3kge1xuICAgIHByaXZhdGUgX29wZXJhdG9yOiBEZXBlbmRlbmN5R3JvdXBPcGVyYXRvciA9ICdBbmQnO1xuICAgIHNldCBvcGVyYXRvcih2YWx1ZTogRGVwZW5kZW5jeUdyb3VwT3BlcmF0b3IpIHsgdGhpcy5fb3BlcmF0b3IgPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IG9wZXJhdG9yKCk6IERlcGVuZGVuY3lHcm91cE9wZXJhdG9yIHsgcmV0dXJuIHRoaXMuX29wZXJhdG9yOyB9XG5cbiAgICBwcml2YXRlIF9jaGlsZHJlbjogZGVwZW5kZW5jeVtdID0gW107XG4gICAgc2V0IGNoaWxkcmVuKHZhbHVlOiBkZXBlbmRlbmN5W10pIHsgdGhpcy5fY2hpbGRyZW4gPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IGNoaWxkcmVuKCk6IGRlcGVuZGVuY3lbXSB7IHJldHVybiB0aGlzLl9jaGlsZHJlbjsgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluc3RhbmNlRWxlbWVudDogRWxlbWVudCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbiAgICAgICAgb3BlcmF0b3I6IERlcGVuZGVuY3lHcm91cE9wZXJhdG9yID0gXCJBbmRcIixcbiAgICAgICAgcGFyc2VDaGlsZHJlbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluc3RhbmNlRWxlbWVudCk7XG4gICAgICAgIHRoaXMub3BlcmF0b3IgPSBvcGVyYXRvcjtcbiAgICAgICAgaWYgKGluc3RhbmNlRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5fb3BlcmF0b3IgPVxuICAgICAgICAgICAgICAgIChpbnN0YW5jZUVsZW1lbnQuZ2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICBcIm9wZXJhdG9yXCJcbiAgICAgICAgICAgICAgICApIGFzIERlcGVuZGVuY3lHcm91cE9wZXJhdG9yKSB8fCBvcGVyYXRvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFyc2VDaGlsZHJlbiB8fCAhaW5zdGFuY2VFbGVtZW50KSByZXR1cm47XG5cbiAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBpbnN0YW5jZUVsZW1lbnQuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChwYXJzZURlcGVuZGVuY3koY2hpbGQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIDxtb2R1bGVEZXBlbmRlbmNpZXMgb3BlcmF0b3I9XCJBbmRcIj5cbiAgICBvdmVycmlkZSBhc01vZHVsZVhNTChkb2N1bWVudDogWE1MRG9jdW1lbnQsIG5vZGVOYW1lID0gXCJkZXBlbmRlbmNpZXNcIik6IEVsZW1lbnQge1xuICAgICAgICBpZiAoIXRoaXMuaW5zdGFuY2VFbGVtZW50KVxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVOYW1lKTtcblxuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZUVsZW1lbnQgJiYgdGhpcy5pbnN0YW5jZUVsZW1lbnQudGFnTmFtZSAhPT0gbm9kZU5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVOYW1lKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5pbnN0YW5jZUVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50LmFwcGVuZENoaWxkKGNoaWxkLmluc3RhbmNlRWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJvcGVyYXRvclwiLCB0aGlzLm9wZXJhdG9yKTtcbiAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZC5hc01vZHVsZVhNTChkb2N1bWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlRWxlbWVudDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeUZsYWcgZXh0ZW5kcyBkZXBlbmRlbmN5IHtcbiAgICBwcml2YXRlIF9mbGFnID0gJyc7XG4gICAgc2V0IGZsYWcodmFsdWU6IHN0cmluZykgeyB0aGlzLl9mbGFnID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCBmbGFnKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9mbGFnOyB9XG5cbiAgICBwcml2YXRlIF92YWx1ZSA9ICcnO1xuICAgIHNldCB2YWx1ZSh2YWx1ZTogc3RyaW5nKSB7IHRoaXMuX3ZhbHVlID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCB2YWx1ZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fdmFsdWU7IH1cblxuICAgIC8vIDxmbGFnRGVwZW5kZW5jeSBmbGFnPScnIHZhbHVlPScnIC8+XG4gICAgb3ZlcnJpZGUgYXNNb2R1bGVYTUwoZG9jdW1lbnQ6IFhNTERvY3VtZW50KTogRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IHRoaXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImZsYWdEZXBlbmRlbmN5XCIpO1xuICAgICAgICB0aGlzRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJmbGFnXCIsIHRoaXMuZmxhZyk7XG4gICAgICAgIHRoaXNFbGVtZW50LnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHRoaXMudmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpc0VsZW1lbnQ7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIERlcGVuZGVuY3lGaWxlIGV4dGVuZHMgZGVwZW5kZW5jeSB7XG4gICAgcHJpdmF0ZSBfZmlsZSA9ICcnO1xuICAgIHNldCBmaWxlKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5fZmlsZSA9IHZhbHVlOyB0aGlzLnVwZGF0ZU9iamVjdHMoKTsgfSBnZXQgZmlsZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fZmlsZTsgfVxuXG4gICAgcHJpdmF0ZSBfc3RhdGU6IERlcGVuZGVuY3lGaWxlU3RhdGUgPSBcIkFjdGl2ZVwiO1xuICAgIHNldCBzdGF0ZSh2YWx1ZTogRGVwZW5kZW5jeUZpbGVTdGF0ZSkgeyB0aGlzLl9zdGF0ZSA9IHZhbHVlOyB0aGlzLnVwZGF0ZU9iamVjdHMoKTsgfSBnZXQgc3RhdGUoKTogRGVwZW5kZW5jeUZpbGVTdGF0ZSB7IHJldHVybiB0aGlzLl9zdGF0ZTsgfVxuXG4gICAgLy8gPGZpbGVEZXBlbmRlbmN5IGZpbGU9XCIyXCIgc3RhdGU9XCJBY3RpdmVcIiAvPlxuICAgIG92ZXJyaWRlIGFzTW9kdWxlWE1MKGRvY3VtZW50OiBYTUxEb2N1bWVudCk6IEVsZW1lbnQge1xuICAgICAgICBjb25zdCB0aGlzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJmaWxlRGVwZW5kZW5jeVwiKTtcbiAgICAgICAgdGhpc0VsZW1lbnQuc2V0QXR0cmlidXRlKFwiZmlsZVwiLCB0aGlzLmZpbGUpO1xuICAgICAgICB0aGlzRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJzdGF0ZVwiLCB0aGlzLnN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHRoaXNFbGVtZW50O1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeVNjcmlwdEV4dGVuZGVyIGV4dGVuZHMgRGVwZW5kZW5jeUJhc2VWZXJzaW9uQ2hlY2sge1xuICAgIC8vIDxmb3NlRGVwZW5kZW5jeSB2ZXJzaW9uPScnIC8+XG4gICAgb3ZlcnJpZGUgYXNNb2R1bGVYTUwoZG9jdW1lbnQ6IFhNTERvY3VtZW50KTogRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IHRoaXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImZvc2VEZXBlbmRlbmN5XCIpO1xuICAgICAgICB0aGlzRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ2ZXJzaW9uXCIsIHRoaXMudmVyc2lvbik7XG4gICAgICAgIHJldHVybiB0aGlzRWxlbWVudDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeUdhbWVWZXJzaW9uIGV4dGVuZHMgRGVwZW5kZW5jeUJhc2VWZXJzaW9uQ2hlY2sge1xuICAgIC8vIDxnYW1lRGVwZW5kZW5jeSB2ZXJzaW9uPScnIC8+XG4gICAgb3ZlcnJpZGUgYXNNb2R1bGVYTUwoZG9jdW1lbnQ6IFhNTERvY3VtZW50KTogRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IHRoaXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImdhbWVEZXBlbmRlbmN5XCIpO1xuICAgICAgICB0aGlzRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ2ZXJzaW9uXCIsIHRoaXMudmVyc2lvbik7XG4gICAgICAgIHJldHVybiB0aGlzRWxlbWVudDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeU1vZE1hbmFnZXIgZXh0ZW5kcyBEZXBlbmRlbmN5QmFzZVZlcnNpb25DaGVjayB7XG4gICAgLy8gPGZvbW1EZXBlbmRlbmN5IHZlcnNpb249XCIxXCIgLz5cbiAgICBvdmVycmlkZSBhc01vZHVsZVhNTChkb2N1bWVudDogWE1MRG9jdW1lbnQpOiBFbGVtZW50IHtcbiAgICAgICAgY29uc3QgdGhpc0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZm9tbURlcGVuZGVuY3lcIik7XG4gICAgICAgIHRoaXNFbGVtZW50LnNldEF0dHJpYnV0ZShcInZlcnNpb25cIiwgdGhpcy52ZXJzaW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXNFbGVtZW50O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VEZXBlbmRlbmN5KGRlcGVuZGVuY3k6IEVsZW1lbnQpOiBkZXBlbmRlbmN5IHtcbiAgICBjb25zdCB0eXBlID0gZGVwZW5kZW5jeS50YWdOYW1lO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFwiZGVwZW5kZW5jaWVzXCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IERlcGVuZGVuY3lHcm91cChkZXBlbmRlbmN5LCB1bmRlZmluZWQsIHRydWUpO1xuICAgICAgICBjYXNlIFwiZmlsZURlcGVuZGVuY3lcIjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGVwZW5kZW5jeUZpbGUoZGVwZW5kZW5jeSk7XG4gICAgICAgIGNhc2UgXCJmbGFnRGVwZW5kZW5jeVwiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEZXBlbmRlbmN5RmxhZyhkZXBlbmRlbmN5KTtcbiAgICAgICAgY2FzZSBcImZvc2VEZXBlbmRlbmN5XCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IERlcGVuZGVuY3lTY3JpcHRFeHRlbmRlcihkZXBlbmRlbmN5KTtcbiAgICAgICAgY2FzZSBcImdhbWVEZXBlbmRlbmN5XCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IERlcGVuZGVuY3lHYW1lVmVyc2lvbihkZXBlbmRlbmN5KTtcbiAgICAgICAgY2FzZSBcImZvbW1EZXBlbmRlbmN5XCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IERlcGVuZGVuY3lNb2RNYW5hZ2VyKGRlcGVuZGVuY3kpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgVW5rbm93biBkZXBlbmRlbmN5IHR5cGU6ICR7dHlwZX1gKTtcbiAgICB9XG59XG5cbmV4cG9ydCB0eXBlIE9wdGlvblR5cGUgPVxuICAgIHwgXCJPcHRpb25hbFwiICAgICAgICAvLyBVbmNoZWNrZWQgYnV0IGNoZWNrYWJsZVxuICAgIHwgXCJSZWNvbW1lbmRlZFwiICAgICAvLyBDaGVja2VkIGJ1dCB1bmNoZWNrYWJsZVxuICAgIHwgXCJDb3VsZEJlVXNlYWJsZVwiICAvLyBUT0RPOiBDaGVjayBpZiB0aGlzIGhhcyBhIHVzZVxuICAgIHwgXCJSZXF1aXJlZFwiICAgICAgICAvLyBQZXJtYW5lbnRseSBjaGVja2VkXG4gICAgfCBcIk5vdFVzZWFibGVcIjsgICAgIC8vIFBlcm1hbmVudGx5IHVuY2hlY2tlZFxuZXhwb3J0IGNsYXNzIE9wdGlvblR5cGVEZXNjcmlwdG9yIGV4dGVuZHMgWE1MRWxlbWVudCB7XG4gICAgcHJpdmF0ZSBfZGVmYXVsdDogT3B0aW9uVHlwZSA9IFwiT3B0aW9uYWxcIjtcbiAgICBzZXQgZGVmYXVsdCh2YWx1ZTogT3B0aW9uVHlwZSkgeyB0aGlzLl9kZWZhdWx0ID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCBkZWZhdWx0KCk6IE9wdGlvblR5cGUgeyByZXR1cm4gdGhpcy5fZGVmYXVsdDsgfVxuXG4gICAgcHJpdmF0ZSBfZGVwZW5kZW5jaWVzOiBPcHRpb25UeXBlRGVzY3JpcHRvcldpdGhEZXBlbmRlbmN5W10gPSBbXTtcbiAgICBzZXQgZGVwZW5kZW5jaWVzKHZhbHVlOiBPcHRpb25UeXBlRGVzY3JpcHRvcldpdGhEZXBlbmRlbmN5W10pIHsgdGhpcy5fZGVwZW5kZW5jaWVzID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCBkZXBlbmRlbmNpZXMoKTogT3B0aW9uVHlwZURlc2NyaXB0b3JXaXRoRGVwZW5kZW5jeVtdIHsgcmV0dXJuIHRoaXMuX2RlcGVuZGVuY2llczsgfVxuXG5cbiAgICBwcml2YXRlIF9iYXNpY0VsZW1lbnQ6IEVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgc2V0IGJhc2ljRWxlbWVudCh2YWx1ZTogRWxlbWVudCB8IHVuZGVmaW5lZCkgeyB0aGlzLl9iYXNpY0VsZW1lbnQgPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IGJhc2ljRWxlbWVudCgpOiBFbGVtZW50IHwgdW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMuX2Jhc2ljRWxlbWVudDsgfVxuXG4gICAgcHJpdmF0ZSBfY29tcGxleEVsZW1lbnQ6IEVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgc2V0IGNvbXBsZXhFbGVtZW50KHZhbHVlOiBFbGVtZW50IHwgdW5kZWZpbmVkKSB7IHRoaXMuX2NvbXBsZXhFbGVtZW50ID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCBjb21wbGV4RWxlbWVudCgpOiBFbGVtZW50IHwgdW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMuX2NvbXBsZXhFbGVtZW50OyB9XG5cbiAgICBwcml2YXRlIF9jb21wbGV4VHlwZUVsZW1lbnQ6IEVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgc2V0IGNvbXBsZXhUeXBlRWxlbWVudCh2YWx1ZTogRWxlbWVudCB8IHVuZGVmaW5lZCkgeyB0aGlzLl9jb21wbGV4VHlwZUVsZW1lbnQgPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IGNvbXBsZXhUeXBlRWxlbWVudCgpOiBFbGVtZW50IHwgdW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMuX2NvbXBsZXhUeXBlRWxlbWVudDsgfVxuXG4gICAgcHJpdmF0ZSBfY29tcGxleFBhdHRlcm5FbGVtZW50OiBFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIHNldCBjb21wbGV4UGF0dGVybkVsZW1lbnQodmFsdWU6IEVsZW1lbnQgfCB1bmRlZmluZWQpIHsgdGhpcy5fY29tcGxleFBhdHRlcm5FbGVtZW50ID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCBjb21wbGV4UGF0dGVybkVsZW1lbnQoKTogRWxlbWVudCB8IHVuZGVmaW5lZCB7IHJldHVybiB0aGlzLl9jb21wbGV4UGF0dGVybkVsZW1lbnQ7IH1cblxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGVsZW1lbnQ/OiBFbGVtZW50LFxuICAgICAgICBkZWZhdWx0VHlwZTogT3B0aW9uVHlwZSA9IFwiT3B0aW9uYWxcIixcbiAgICAgICAgZGVwZW5kZW5jaWVzOiBPcHRpb25UeXBlRGVzY3JpcHRvcldpdGhEZXBlbmRlbmN5W10gPSBbXVxuICAgICkge1xuICAgICAgICBzdXBlcihlbGVtZW50KTtcbiAgICAgICAgdGhpcy5kZWZhdWx0ID0gZGVmYXVsdFR5cGU7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5kZW5jaWVzO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIGFzTW9kdWxlWE1MKGRvY3VtZW50OiBYTUxEb2N1bWVudCk6IEVsZW1lbnQge1xuICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudCA9XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudCA/PyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHlwZURlc2NyaXB0b3JcIik7XG5cbiAgICAgICAgaWYgKHRoaXMuZGVwZW5kZW5jaWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5jb21wbGV4RWxlbWVudD8ucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLmNvbXBsZXhFbGVtZW50ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0aGlzLmJhc2ljRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgdGhpcy5iYXNpY0VsZW1lbnQgPz9cbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHlwZVwiKSk7XG4gICAgICAgICAgICB0aGlzLmJhc2ljRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkZWZhdWx0XCIsIHRoaXMuZGVmYXVsdCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlRWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29tcGxleEVsZW1lbnQgPVxuICAgICAgICAgICAgdGhpcy5jb21wbGV4RWxlbWVudCA/P1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRlcGVuZGVuY3lUeXBlXCIpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuY29tcGxleFR5cGVFbGVtZW50ID1cbiAgICAgICAgICAgIHRoaXMuY29tcGxleFR5cGVFbGVtZW50ID8/XG4gICAgICAgICAgICB0aGlzLmNvbXBsZXhFbGVtZW50LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkZWZhdWx0VHlwZVwiKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgdGhpcy5jb21wbGV4VHlwZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibmFtZVwiLCB0aGlzLmRlZmF1bHQpO1xuXG4gICAgICAgIHRoaXMuY29tcGxleFBhdHRlcm5FbGVtZW50ID1cbiAgICAgICAgICAgIHRoaXMuY29tcGxleFBhdHRlcm5FbGVtZW50ID8/XG4gICAgICAgICAgICB0aGlzLmNvbXBsZXhFbGVtZW50LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwYXR0ZXJuc1wiKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgZm9yIChjb25zdCBkZXBlbmRlbmN5IG9mIHRoaXMuZGVwZW5kZW5jaWVzKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXBsZXhQYXR0ZXJuRWxlbWVudC5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5LmFzTW9kdWxlWE1MKGRvY3VtZW50KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlRWxlbWVudDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPcHRpb25UeXBlRGVzY3JpcHRvcldpdGhEZXBlbmRlbmN5IGV4dGVuZHMgWE1MRWxlbWVudCB7XG4gICAgcHJpdmF0ZSBfdHlwZTogT3B0aW9uVHlwZSA9IFwiT3B0aW9uYWxcIjtcbiAgICBzZXQgdHlwZSh2YWx1ZTogT3B0aW9uVHlwZSkgeyB0aGlzLl90eXBlID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCB0eXBlKCk6IE9wdGlvblR5cGUgeyByZXR1cm4gdGhpcy5fdHlwZTsgfVxuXG4gICAgcHJpdmF0ZSBfdHlwZUVsZW1lbnQ6IEVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgc2V0IHR5cGVFbGVtZW50KHZhbHVlOiBFbGVtZW50IHwgdW5kZWZpbmVkKSB7IHRoaXMuX3R5cGVFbGVtZW50ID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCB0eXBlRWxlbWVudCgpOiBFbGVtZW50IHwgdW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMuX3R5cGVFbGVtZW50OyB9XG5cbiAgICBwcml2YXRlIF9kZXBlbmRlbmN5ITogRGVwZW5kZW5jeUdyb3VwO1xuICAgIHNldCBkZXBlbmRlbmN5KHZhbHVlOiBEZXBlbmRlbmN5R3JvdXApIHsgdGhpcy5fZGVwZW5kZW5jeSA9IHZhbHVlOyB0aGlzLnVwZGF0ZU9iamVjdHMoKTsgfSBnZXQgZGVwZW5kZW5jeSgpOiBEZXBlbmRlbmN5R3JvdXAgeyByZXR1cm4gdGhpcy5fZGVwZW5kZW5jeTsgfVxuXG4gICAgY29uc3RydWN0b3IoZGVwZW5kZW5jeTogRGVwZW5kZW5jeUdyb3VwLCB0eXBlOiBPcHRpb25UeXBlID0gXCJPcHRpb25hbFwiKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jeSA9IGRlcGVuZGVuY3k7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgYXNNb2R1bGVYTUwoZG9jdW1lbnQ6IFhNTERvY3VtZW50KTogRWxlbWVudCB7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50ID1cbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50ID8/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwYXR0ZXJuXCIpO1xuXG4gICAgICAgIHRoaXMudHlwZUVsZW1lbnQgPSB0aGlzLnR5cGVFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/PyB0aGlzLmluc3RhbmNlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHlwZVwiKSk7XG4gICAgICAgIHRoaXMudHlwZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibmFtZVwiLCB0aGlzLnR5cGUpO1xuXG4gICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZGVwZW5kZW5jeS5hc01vZHVsZVhNTChkb2N1bWVudCkpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlRWxlbWVudDtcbiAgICB9XG59XG5cbi8qJCQkJCRcXCAgICAgICAgICAgICAgICAgICAgICAgJCRcXCAgICAgICAgICAgICAgICQkXFwgJCRcXFxuXFwtJCQkICoqfCAgICAgICAgICAgICAgICAgICAgICAkJCB8ICAgICAgICAgICAgICAkJCB8JCQgfFxuICAgJCQgfCAgJCQkJCQkJFxcICAgJCQkJCQkJFxcICQkJCQkJFxcICAgICQkJCQkJFxcICAkJCB8JCQgfCAkJCQkJCQkXFxcbiAgICQkIHwgICQkICBfXyQkXFwgJCQgIF9fX19ffFxcXyQkICBffCAgIFxcX19fXyQkXFwgJCQgfCQkIHwkJCAgX19fX198XG4gICAkJCB8ICAkJCB8ICAkJCB8XFwkJCQkJCRcXCAgICAkJCB8ICAgICAkJCQkJCQkIHwkJCB8JCQgfFxcJCQkJCQkXFxcbiAgICQkIHwgICQkIHwgICQkIHwgXFxfX19fJCRcXCAgICQkIHwkJFxcICQkICBfXyQkIHwkJCB8JCQgfCBcXF9fX18kJFxcXG4tJCQkJCQkXFwgJCQgfCAgJCQgfCQkJCQkJCQgIHwgIFxcJCQkJCAgfFxcJCQkJCQkJCB8JCQgfCQkIHwkJCQkJCQkICB8XG5cXF9fX19fX198XFxfX3wgIFxcX198XFxfX19fX19fLyAgICBcXF9fX18vICBcXF9fX19fX198XFxfX3xcXF9ffFxcX19fX19fKi9cblxuXG5cbmV4cG9ydCBjbGFzcyBJbnN0YWxsIGV4dGVuZHMgWE1MRWxlbWVudCB7XG4gICAgc3RhdGljIHBhdGhzOiBzdHJpbmdbXVtdID0gW107XG5cbiAgICBwcml2YXRlIF9wYXRoITogc3RyaW5nW107XG4gICAgc2V0IHBhdGgodmFsdWU6IHN0cmluZ1tdKSB7IHRoaXMuX3BhdGggPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gdGhpcy5fcGF0aDsgfVxuXG4gICAgYXN5bmMgdXBkYXRlRmlsZShwYXRoT3JGaWxlOiBzdHJpbmd8c3RyaW5nW10gfCBGaWxlU3lzdGVtSGFuZGxlKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXRoT3JGaWxlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aDogc3RyaW5nW10gPSBwYXRoT3JGaWxlLnNwbGl0KFwiL1wiKTtcbiAgICAgICAgICAgIEluc3RhbGwucGF0aHMucHVzaChmaWxlUGF0aCk7XG4gICAgICAgICAgICB0aGlzLnBhdGggPSBmaWxlUGF0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2UgaWYgKHBhdGhPckZpbGUgaW5zdGFuY2VvZiBGaWxlU3lzdGVtSGFuZGxlKSB7XG4gICAgICAgICAgICBwYXRoT3JGaWxlID0gYXdhaXQgd2luZG93LkZPTU9EQnVpbGRlci5kaXJlY3Rvcnk/LmhhbmRsZS5yZXNvbHZlKHBhdGhPckZpbGUpID8/ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhdGhPckZpbGUgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgSW5zdGFsbC5wYXRocy5wdXNoKHBhdGhPckZpbGUpO1xuICAgICAgICAgICAgdGhpcy5wYXRoID0gcGF0aE9yRmlsZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCByZXNvbHZlIHBhdGggLSBtb3N0IGxpa2VseSBvdXRzaWRlIG9mIHRoZSByb290IGRpcmVjdG9yeVwiKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZWxlbWVudDogRWxlbWVudCxcbiAgICAgICAgZmlsZTogc3RyaW5nIHwgc3RyaW5nW10gfCBGaWxlU3lzdGVtRmlsZUhhbmRsZSA9IFsnJ11cbiAgICApIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCk7XG4gICAgICAgIHRoaXMudXBkYXRlRmlsZShmaWxlKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSBhc01vZHVsZVhNTChkb2N1bWVudDogWE1MRG9jdW1lbnQpOiBFbGVtZW50IHtcbiAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQgPVxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQgPz8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImluc3RhbGxcIik7XG5cbiAgICAgICAgY29uc3QgcGF0aCA9IHRoaXMucGF0aC5qb2luKFwiL1wiKTtcbiAgICAgICAgY29uc3QgaXNGb2xkZXIgPSB0aGlzLnBhdGhbdGhpcy5wYXRoLmxlbmd0aCAtIDFdID09PSAnJztcblxuICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXNGb2xkZXIgPyAnZm9sZGVyJyA6ICdmaWxlJylcbiAgICAgICAgKS50ZXh0Q29udGVudCA9IGlzRm9sZGVyID8gcGF0aC5zbGljZSgwLCAtMSkgOiBwYXRoO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlRWxlbWVudDtcbiAgICB9XG59XG5cblxuXG4vKiQkJCQkXFwgICAgICAgICAgICAgICQkXFwgICAgICQkXFxcbiQkICBfXyQkXFwgICAgICAgICAgICAgJCQgfCAgICBcXF9ffFxuJCQgLyAgJCQgfCAkJCQkJCRcXCAgJCQkJCQkXFwgICAkJFxcICAkJCQkJCRcXCAgJCQkJCQkJFxcICAgJCQkJCQkJFxcXG4kJCB8ICAkJCB8JCQgIF9fJCRcXCBcXF8kJCAgX3wgICQkIHwkJCAgX18kJFxcICQkICBfXyQkXFwgJCQgIF9fX19ffFxuJCQgfCAgJCQgfCQkIC8gICQkIHwgICQkIHwgICAgJCQgfCQkIC8gICQkIHwkJCB8ICAkJCB8XFwkJCQkJCRcXFxuJCQgfCAgJCQgfCQkIHwgICQkIHwgICQkIHwkJFxcICQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfCBcXF9fX18kJFxcXG4gJCQkJCQkICB8JCQkJCQkJCAgfCAgXFwkJCQkICB8JCQgfFxcJCQkJCQkICB8JCQgfCAgJCQgfCQkJCQkJCQgIHxcbiBcXF9fX19fXy8gJCQgIF9fX18vICAgIFxcX19fXy8gXFxfX3wgXFxfX19fX18vIFxcX198ICBcXF9ffFxcX19fX19fXy9cbiAgICAgICAgICAkJCB8XG4gICAgICAgICAgJCQgfFxuICAgICAgICAgIFxcXyovXG5cbmV4cG9ydCB0eXBlIFNvcnRPcmRlciA9XG4gICAgfCBcIkFzY2VuZGluZ1wiICAvLyBBbHBoYWJldGljYWxcbiAgICB8IFwiRGVzY2VuZGluZ1wiIC8vIFJldmVyc2UgQWxwaGFiZXRpY2FsXG4gICAgfCBcIkV4cGxpY2l0XCI7ICAvLyBFeHBsaWNpdCBvcmRlclxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RlcCBleHRlbmRzIFhNTEVsZW1lbnQge1xuICAgIG5hbWUgPSAnJztcbiAgICBvcmRlcjogU29ydE9yZGVyID0gXCJFeHBsaWNpdFwiO1xuICAgIGdyb3VwczogR3JvdXBbXSA9IFtdO1xuXG4gICAgLy8gPGluc3RhbGxTdGVwIG5hbWU9XCJUSEUgRklSU1QgT0YgTUFOWSBTVEVQU1wiPlxuICAgIC8vIDxvcHRpb25hbEZpbGVHcm91cHMgb3JkZXI9XCJFeHBsaWNpdFwiPlxuXG4gICAgb3ZlcnJpZGUgYXNNb2R1bGVYTUwoZG9jdW1lbnQ6IFhNTERvY3VtZW50KTogRWxlbWVudCB7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50ID1cbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50ID8/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnN0YWxsU3RlcFwiKTtcblxuICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsIHRoaXMubmFtZSk7XG5cbiAgICAgICAgY29uc3Qgb3B0aW9uYWxGaWxlR3JvdXBzID0gdGhpcy5pbnN0YW5jZUVsZW1lbnQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uYWxGaWxlR3JvdXBzXCIpXG4gICAgICAgICk7XG4gICAgICAgIG9wdGlvbmFsRmlsZUdyb3Vwcy5zZXRBdHRyaWJ1dGUoXCJvcmRlclwiLCB0aGlzLm9yZGVyKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGdyb3VwIG9mIHRoaXMuZ3JvdXBzKSBvcHRpb25hbEZpbGVHcm91cHMuYXBwZW5kQ2hpbGQoZ3JvdXAuYXNNb2R1bGVYTUwoZG9jdW1lbnQpKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZUVsZW1lbnQ7XG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBncm91cFNlbGVjdFR5cGUgPVxuICAgIHwgXCJTZWxlY3RBbGxcIiAgICAgICAgICAgLy8gRm9yY2Utc2VsZWN0cyBhbGwgb3B0aW9uc1xuICAgIHwgXCJTZWxlY3RBbnlcIiAgICAgICAgICAgLy8gQWxsb3dzIHVzZXJzIHRvIHNlbGVjdCBhbnkgbnVtYmVyIG9mIG9wdGlvbnNcbiAgICB8IFwiU2VsZWN0QXRNb3N0T25lXCIgICAgIC8vIFJlcXVpcmVzIHVzZXJzIHRvIHNlbGVjdCBvbmUgb3Igbm8gb3B0aW9uc1xuICAgIHwgXCJTZWxlY3RBdExlYXN0T25lXCIgICAgLy8gUmVxdWlyZXMgdXNlcnMgdG8gc2VsZWN0IGF0IGxlYXN0IG9uZSBvcHRpb25cbiAgICB8IFwiU2VsZWN0RXhhY3RseU9uZVwiOyAgIC8vIFJlcXVpcmVzIHVzZXJzIHRvIHNlbGVjdCBleGFjdGx5IG9uZSBvcHRpb25cbmV4cG9ydCBjbGFzcyBHcm91cCBleHRlbmRzIFhNTEVsZW1lbnQge1xuICAgIHByaXZhdGUgX25hbWUgPSAnJztcbiAgICBzZXQgbmFtZSh2YWx1ZTogc3RyaW5nKSB7IHRoaXMuX25hbWUgPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IG5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX25hbWU7IH1cblxuICAgIHByaXZhdGUgX3R5cGU6IGdyb3VwU2VsZWN0VHlwZSA9IFwiU2VsZWN0QW55XCI7XG4gICAgc2V0IHR5cGUodmFsdWU6IGdyb3VwU2VsZWN0VHlwZSkgeyB0aGlzLl90eXBlID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCB0eXBlKCk6IGdyb3VwU2VsZWN0VHlwZSB7IHJldHVybiB0aGlzLl90eXBlOyB9XG5cbiAgICBwcml2YXRlIF9zb3J0T3JkZXI6IFNvcnRPcmRlciA9IFwiRXhwbGljaXRcIjtcbiAgICBzZXQgc29ydE9yZGVyKHZhbHVlOiBTb3J0T3JkZXIpIHsgdGhpcy5fc29ydE9yZGVyID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCBzb3J0T3JkZXIoKTogU29ydE9yZGVyIHsgcmV0dXJuIHRoaXMuX3NvcnRPcmRlcjsgfVxuXG4gICAgcHJpdmF0ZSBfb3B0aW9uczogT3B0aW9uW10gPSBbXTtcbiAgICBzZXQgb3B0aW9ucyh2YWx1ZTogT3B0aW9uW10pIHsgdGhpcy5fb3B0aW9ucyA9IHZhbHVlOyB0aGlzLnVwZGF0ZU9iamVjdHMoKTsgfSBnZXQgb3B0aW9ucygpOiBPcHRpb25bXSB7IHJldHVybiB0aGlzLl9vcHRpb25zOyB9XG5cblxuICAgIC8vIDxncm91cCBuYW1lPVwiQmFuYW5hIFR5cGVzXCIgdHlwZT1cIlNlbGVjdEFueVwiPlxuICAgIC8vIDxwbHVnaW5zIG9yZGVyPVwiRXhwbGljaXRcIj5cblxuICAgIG92ZXJyaWRlIGFzTW9kdWxlWE1MKGRvY3VtZW50OiBYTUxEb2N1bWVudCk6IEVsZW1lbnQge1xuICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudCA9IHRoaXMuaW5zdGFuY2VFbGVtZW50ID8/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJncm91cFwiKTtcblxuICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsIHRoaXMubmFtZSk7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgdGhpcy50eXBlKTtcblxuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5pbnN0YW5jZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuZ2V0T3JDcmVhdGVDaGlsZChcInBsdWdpbnNcIikpO1xuICAgICAgICBvcHRpb25zLnNldEF0dHJpYnV0ZShcIm9yZGVyXCIsIHRoaXMuc29ydE9yZGVyKTtcblxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiB0aGlzLm9wdGlvbnMpIG9wdGlvbnMuYXBwZW5kQ2hpbGQob3B0aW9uLmFzTW9kdWxlWE1MKGRvY3VtZW50KSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VFbGVtZW50O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9wdGlvbiBleHRlbmRzIFhNTEVsZW1lbnQge1xuICAgIC8vIEFjdHVhbCBPcHRpb24gTmFtZVxuICAgIHByaXZhdGUgX25hbWUgPSAnJztcbiAgICBzZXQgbmFtZSh2YWx1ZTogc3RyaW5nKSB7IHRoaXMuX25hbWUgPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IG5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX25hbWU7IH1cblxuICAgIC8vIERlc2NyaXB0aW9uXG4gICAgcHJpdmF0ZSBfZGVzY3JpcHRpb24hOiBPcHRpb25EZXNjcmlwdGlvbjtcbiAgICBzZXQgZGVzY3JpcHRpb24odmFsdWU6IE9wdGlvbkRlc2NyaXB0aW9uKSB7IHRoaXMuX2Rlc2NyaXB0aW9uID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCBkZXNjcmlwdGlvbigpOiBPcHRpb25EZXNjcmlwdGlvbiB7IHJldHVybiB0aGlzLl9kZXNjcmlwdGlvbjsgfVxuXG5cbiAgICAvLyBJbWFnZVxuICAgIHByaXZhdGUgX2ltYWdlITogT3B0aW9uSW1hZ2U7XG4gICAgc2V0IGltYWdlKHZhbHVlOiBPcHRpb25JbWFnZSkgeyB0aGlzLl9pbWFnZSA9IHZhbHVlOyB0aGlzLnVwZGF0ZU9iamVjdHMoKTsgfSBnZXQgaW1hZ2UoKTogT3B0aW9uSW1hZ2UgeyByZXR1cm4gdGhpcy5faW1hZ2U7IH1cblxuICAgIC8vIEZsYWdzXG4gICAgcHJpdmF0ZSBfY29uZGl0aW9uRmxhZ3M6IERlcGVuZGVuY3lGbGFnW10gPSBbXTtcbiAgICBzZXQgY29uZGl0aW9uRmxhZ3ModmFsdWU6IERlcGVuZGVuY3lGbGFnW10pIHsgdGhpcy5fY29uZGl0aW9uRmxhZ3MgPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IGNvbmRpdGlvbkZsYWdzKCk6IERlcGVuZGVuY3lGbGFnW10geyByZXR1cm4gdGhpcy5fY29uZGl0aW9uRmxhZ3M7IH1cblxuICAgIHByaXZhdGUgX2NvbmRpdGlvbkZsYWdzQ29udGFpbmVyOiBFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIHNldCBjb25kaXRpb25GbGFnc0NvbnRhaW5lcih2YWx1ZTogRWxlbWVudCB8IHVuZGVmaW5lZCkgeyB0aGlzLl9jb25kaXRpb25GbGFnc0NvbnRhaW5lciA9IHZhbHVlOyB0aGlzLnVwZGF0ZU9iamVjdHMoKTsgfSBnZXQgY29uZGl0aW9uRmxhZ3NDb250YWluZXIoKTogRWxlbWVudCB8IHVuZGVmaW5lZCB7IHJldHVybiB0aGlzLl9jb25kaXRpb25GbGFnc0NvbnRhaW5lcjsgfVxuXG5cbiAgICAvLyBGaWxlc1xuICAgIHByaXZhdGUgX2ZpbGVzOiBEZXBlbmRlbmN5RmlsZVtdID0gW107XG4gICAgc2V0IGZpbGVzKHZhbHVlOiBEZXBlbmRlbmN5RmlsZVtdKSB7IHRoaXMuX2ZpbGVzID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCBmaWxlcygpOiBEZXBlbmRlbmN5RmlsZVtdIHsgcmV0dXJuIHRoaXMuX2ZpbGVzOyB9XG5cbiAgICBwcml2YXRlIF9maWxlc0NvbnRhaW5lcjogRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICBzZXQgZmlsZXNDb250YWluZXIodmFsdWU6IEVsZW1lbnQgfCB1bmRlZmluZWQpIHsgdGhpcy5fZmlsZXNDb250YWluZXIgPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IGZpbGVzQ29udGFpbmVyKCk6IEVsZW1lbnQgfCB1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5fZmlsZXNDb250YWluZXI7IH1cblxuXG4gICAgLy8gVHlwZSBEZXNjcmlwdG9yXG4gICAgcHJpdmF0ZSBfdHlwZURlc2NyaXB0b3IhOiBPcHRpb25UeXBlRGVzY3JpcHRvcjtcbiAgICBzZXQgdHlwZURlc2NyaXB0b3IodmFsdWU6IE9wdGlvblR5cGVEZXNjcmlwdG9yKSB7IHRoaXMuX3R5cGVEZXNjcmlwdG9yID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCB0eXBlRGVzY3JpcHRvcigpOiBPcHRpb25UeXBlRGVzY3JpcHRvciB7IHJldHVybiB0aGlzLl90eXBlRGVzY3JpcHRvcjsgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGVsZW1lbnQ/OiBFbGVtZW50LFxuICAgICAgICBuYW1lID0gJycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBPcHRpb25EZXNjcmlwdGlvbiB8IHN0cmluZyA9ICcnLFxuICAgICAgICBpbWFnZTogT3B0aW9uSW1hZ2UgfCBzdHJpbmdbXSB8IEZpbGVTeXN0ZW1GaWxlSGFuZGxlID0gW10sXG4gICAgICAgIGNvbmRpdGlvbkZsYWdzOiBEZXBlbmRlbmN5RmxhZ1tdID0gW10sXG4gICAgICAgIGZpbGVzOiBEZXBlbmRlbmN5RmlsZVtdID0gW10sXG4gICAgICAgIHR5cGVEZXNjcmlwdG9yOiBPcHRpb25UeXBlRGVzY3JpcHRvciA9IG5ldyBPcHRpb25UeXBlRGVzY3JpcHRvcigpXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lOyAvLyBTdG9yZWQgYXMgYW4gYXR0cmlidXRlXG5cbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiBpbnN0YW5jZW9mIE9wdGlvbkRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgPyBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIDogbmV3IE9wdGlvbkRlc2NyaXB0aW9uKHVuZGVmaW5lZCwgZGVzY3JpcHRpb24pOyAgIHRoaXMuZGVzY3JpcHRpb24ub2JqZWN0c1RvVXBkYXRlLnB1c2godGhpcyk7XG5cblxuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2UgaW5zdGFuY2VvZiBPcHRpb25JbWFnZVxuICAgICAgICAgICAgICAgICAgICA/IGltYWdlXG4gICAgICAgICAgICAgICAgICAgIDogbmV3IE9wdGlvbkltYWdlKHVuZGVmaW5lZCwgaW1hZ2UpOyAgICAgICAgICAgdGhpcy5pbWFnZS5vYmplY3RzVG9VcGRhdGUucHVzaCh0aGlzKTtcblxuXG5cbiAgICAgICAgdGhpcy5jb25kaXRpb25GbGFncyA9IGNvbmRpdGlvbkZsYWdzOyAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25kaXRpb25GbGFncy5mb3JFYWNoKGZsYWcgPT4gZmxhZy5vYmplY3RzVG9VcGRhdGUucHVzaCh0aGlzKSk7XG4gICAgICAgIHRoaXMuZmlsZXMgPSBmaWxlczsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZXMuZm9yRWFjaChmaWxlID0+IGZpbGUub2JqZWN0c1RvVXBkYXRlLnB1c2godGhpcykpO1xuXG4gICAgICAgIHRoaXMudHlwZURlc2NyaXB0b3IgPSB0eXBlRGVzY3JpcHRvcjsgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZURlc2NyaXB0b3Iub2JqZWN0c1RvVXBkYXRlLnB1c2godGhpcyk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgYXNNb2R1bGVYTUwoZG9jdW1lbnQ6IFhNTERvY3VtZW50KTogRWxlbWVudCB7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50ID1cbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50ID8/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG5cbiAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibmFtZVwiLCB0aGlzLm5hbWUpO1xuXG4gICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZGVzY3JpcHRpb24uYXNNb2R1bGVYTUwoZG9jdW1lbnQpKTtcbiAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5pbWFnZS5hc01vZHVsZVhNTChkb2N1bWVudCkpO1xuXG4gICAgICAgIGZvciAoY29uc3QgY29uZGl0aW9uRmxhZyBvZiB0aGlzLmNvbmRpdGlvbkZsYWdzKSB7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5hcHBlbmRDaGlsZChjb25kaXRpb25GbGFnLmFzTW9kdWxlWE1MKGRvY3VtZW50KSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgdGhpcy5maWxlcykge1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZmlsZS5hc01vZHVsZVhNTChkb2N1bWVudCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy50eXBlRGVzY3JpcHRvci5hc01vZHVsZVhNTChkb2N1bWVudCkpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlRWxlbWVudDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPcHRpb25EZXNjcmlwdGlvbiBleHRlbmRzIFhNTEVsZW1lbnQge1xuICAgIHByaXZhdGUgX2Rlc2NyaXB0aW9uID0gJyc7XG4gICAgc2V0IGRlc2NyaXB0aW9uKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5fZGVzY3JpcHRpb24gPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IGRlc2NyaXB0aW9uKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9kZXNjcmlwdGlvbjsgfVxuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudD86IEVsZW1lbnQsIGRlc2NyaXB0aW9uID0gJycpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCk7XG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICBvdmVycmlkZSBhc01vZHVsZVhNTChkb2N1bWVudDogWE1MRG9jdW1lbnQpOiBFbGVtZW50IHtcbiAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQgPVxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQgPz8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRlc2NyaXB0aW9uXCIpO1xuICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuZGVzY3JpcHRpb247XG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlRWxlbWVudDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPcHRpb25JbWFnZSBleHRlbmRzIFhNTEVsZW1lbnQge1xuICAgIHByaXZhdGUgX2ltYWdlOiBzdHJpbmdbXSA9IFtdO1xuICAgIHNldCBpbWFnZSh2YWx1ZTogc3RyaW5nW10pIHsgdGhpcy5faW1hZ2UgPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IGltYWdlKCk6IHN0cmluZ1tdIHsgcmV0dXJuIHRoaXMuX2ltYWdlOyB9XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50PzogRWxlbWVudCwgaW1hZ2U6IHN0cmluZ1tdIHwgRmlsZVN5c3RlbUZpbGVIYW5kbGUgPSBbXSkge1xuICAgICAgICBzdXBlcihlbGVtZW50KTtcblxuICAgICAgICB2YXIgdGVtcEltZzogc3RyaW5nW10gfCBGaWxlU3lzdGVtRmlsZUhhbmRsZSA9IGltYWdlO1xuXG4gICAgICAgIGlmICghKHRlbXBJbWcgaW5zdGFuY2VvZiBBcnJheSkpXG4gICAgICAgICAgICB3aW5kb3cuRk9NT0RCdWlsZGVyLmRpcmVjdG9yeVxuICAgICAgICAgICAgICAgID8uaGFuZGxlLnJlc29sdmUodGVtcEltZylcbiAgICAgICAgICAgICAgICAudGhlbigocGF0aCkgPT4gKHRoaXMuaW1hZ2UgPSBwYXRoID8/IFtdKSk7XG4gICAgICAgIGVsc2UgdGhpcy5pbWFnZSA9IHRlbXBJbWc7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgYXNNb2R1bGVYTUwoZG9jdW1lbnQ6IFhNTERvY3VtZW50KTogRWxlbWVudCB7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50ID1cbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50ID8/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWFnZVwiKTtcblxuICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICBcInBhdGhcIixcbiAgICAgICAgICAgICh0aGlzLmltYWdlIGFzIHN0cmluZ1tdKS5qb2luKFwiXFxcXFwiKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlRWxlbWVudDtcbiAgICB9XG59XG5cblxuXG5cbmV4cG9ydCBjbGFzcyBGb21vZCBleHRlbmRzIFhNTEVsZW1lbnQge1xuICAgIHByaXZhdGUgX21ldGFOYW1lOiBzdHJpbmcgPSAnJztcbiAgICBzZXQgbWV0YU5hbWUodmFsdWU6IHN0cmluZykgeyB0aGlzLl9tZXRhTmFtZSA9IHZhbHVlOyB0aGlzLnVwZGF0ZU9iamVjdHMoKTsgfSBnZXQgbWV0YU5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX21ldGFOYW1lIHx8IHRoaXMuX21vZHVsZU5hbWU7IH1cblxuICAgIHByaXZhdGUgX21vZHVsZU5hbWU6IHN0cmluZyA9ICcnO1xuICAgIHNldCBtb2R1bGVOYW1lKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5fbW9kdWxlTmFtZSA9IHZhbHVlOyB0aGlzLnVwZGF0ZU9iamVjdHMoKTsgfSBnZXQgbW9kdWxlTmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fbW9kdWxlTmFtZSB8fCB0aGlzLl9tZXRhTmFtZTsgfVxuXG4gICAgcHJpdmF0ZSBfbWV0YUltYWdlOiBzdHJpbmcgPSAnJztcbiAgICBzZXQgbWV0YUltYWdlKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5fbWV0YUltYWdlID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCBtZXRhSW1hZ2UoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX21ldGFJbWFnZTsgfVxuXG4gICAgcHJpdmF0ZSBfbWV0YUF1dGhvcjogc3RyaW5nID0gJyc7XG4gICAgc2V0IG1ldGFBdXRob3IodmFsdWU6IHN0cmluZykgeyB0aGlzLl9tZXRhQXV0aG9yID0gdmFsdWU7IHRoaXMudXBkYXRlT2JqZWN0cygpOyB9IGdldCBtZXRhQXV0aG9yKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9tZXRhQXV0aG9yOyB9XG5cbiAgICBwcml2YXRlIF9tZXRhVmVyc2lvbjogc3RyaW5nID0gJyc7XG4gICAgLyoqIFRoZSBtZXRhZGF0YSB2ZXJzaW9uIG9mIHRoaXMgbW9kICovXG4gICAgc2V0IG1ldGFWZXJzaW9uKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5fbWV0YVZlcnNpb24gPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IG1ldGFWZXJzaW9uKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9tZXRhVmVyc2lvbjsgfVxuXG4gICAgcHJpdmF0ZSBfbWV0YUlkOiBudW1iZXIgPSAwO1xuICAgIHNldCBtZXRhSWQodmFsdWU6IG51bWJlcikgeyB0aGlzLl9tZXRhSWQgPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IG1ldGFJZCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbWV0YUlkOyB9XG5cbiAgICBwcml2YXRlIF9pbmZvSW5zdGFuY2VFbGVtZW50OiBFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIHNldCBpbmZvSW5zdGFuY2VFbGVtZW50KHZhbHVlOiBFbGVtZW50IHwgdW5kZWZpbmVkKSB7IHRoaXMuX2luZm9JbnN0YW5jZUVsZW1lbnQgPSB2YWx1ZTsgdGhpcy51cGRhdGVPYmplY3RzKCk7IH0gZ2V0IGluZm9JbnN0YW5jZUVsZW1lbnQoKTogRWxlbWVudCB8IHVuZGVmaW5lZCB7IHJldHVybiB0aGlzLl9pbmZvSW5zdGFuY2VFbGVtZW50OyB9XG5cbiAgICBfbWV0YVVybDpVUkx8c3RyaW5nID0gJyc7XG4gICAgZ2V0IG1ldGFVcmwoKTpVUkx8c3RyaW5nIHsgcmV0dXJuIHRoaXMuX21ldGFVcmw7IH0gc2V0IG1ldGFVcmwodXJsOlVSTHxzdHJpbmcpIHtcbiAgICAgICAgaWYgKHVybCBpbnN0YW5jZW9mIFVSTCkgdGhpcy5fbWV0YVVybCA9IHVybDtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuX21ldGFVcmwgPSBuZXcgVVJMKHVybCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWV0YVVybCA9IHVybDtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZU9iamVjdHMoKTtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgSW52YWxpZCBVUkw6IFwiJHt1cmx9XCJgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFVSTEFzU3RyaW5nKCk6c3RyaW5ne1xuICAgICAgICByZXR1cm4gdGhpcy5tZXRhVXJsIGluc3RhbmNlb2YgVVJMID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1ldGFVcmwudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMubWV0YVVybDtcbiAgICB9XG5cblxuICAgIGluc3RhbGxzOiBJbnN0YWxsW107XG5cbiAgICBjb25kaXRpb25zOiBEZXBlbmRlbmN5R3JvdXAgfCB1bmRlZmluZWQ7XG4gICAgc3RlcHM6IFN0ZXBbXTtcbiAgICBzb3J0aW5nT3JkZXI6IFNvcnRPcmRlciA9ICdFeHBsaWNpdCc7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5zdGFuY2VFbGVtZW50PzogRWxlbWVudCxcbiAgICAgICAgaW5mb0luc3RhbmNlRWxlbWVudD86IEVsZW1lbnQsXG4gICAgICAgIG1ldGFOYW1lOiBzdHJpbmcgPSAnJyxcbiAgICAgICAgbWV0YUltYWdlOiBzdHJpbmcgPSAnJyxcbiAgICAgICAgbWV0YUF1dGhvcjogc3RyaW5nID0gJycsXG4gICAgICAgIG1ldGFWZXJzaW9uOiBzdHJpbmcgPSAnJyxcbiAgICAgICAgbWV0YUlkOiBudW1iZXIgPSAwLFxuICAgICAgICBtZXRhVXJsOiBzdHJpbmcgPSAnJyxcbiAgICAgICAgaW5zdGFsbHM6IEluc3RhbGxbXSA9IFtdLFxuICAgICAgICBzdGVwczogU3RlcFtdID0gW10sXG4gICAgICAgIGNvbmRpdGlvbnM/OiBEZXBlbmRlbmN5R3JvdXBcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5zdGFuY2VFbGVtZW50KTtcbiAgICAgICAgdGhpcy5pbmZvSW5zdGFuY2VFbGVtZW50ID0gaW5mb0luc3RhbmNlRWxlbWVudDtcbiAgICAgICAgdGhpcy5tZXRhTmFtZSA9IG1ldGFOYW1lID8/IGluZm9JbnN0YW5jZUVsZW1lbnQ/LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiTmFtZVwiKVswXT8udGV4dENvbnRlbnQgPz8gJyc7XG4gICAgICAgIHRoaXMubW9kdWxlTmFtZSA9IGluc3RhbmNlRWxlbWVudD8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJtb2R1bGVOYW1lXCIpWzBdPy50ZXh0Q29udGVudCA/PyAnJztcbiAgICAgICAgdGhpcy5tZXRhSW1hZ2UgPSBtZXRhSW1hZ2UgPz8gaW5zdGFuY2VFbGVtZW50Py5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm1vZHVsZUltYWdlXCIpWzBdPy5nZXRBdHRyaWJ1dGUoXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLm1ldGFBdXRob3IgPSBtZXRhQXV0aG9yID8/IGluZm9JbnN0YW5jZUVsZW1lbnQ/LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiQXV0aG9yXCIpWzBdPy50ZXh0Q29udGVudCA/PyAnJztcbiAgICAgICAgdGhpcy5tZXRhVmVyc2lvbiA9IG1ldGFWZXJzaW9uID8/IGluZm9JbnN0YW5jZUVsZW1lbnQ/LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiVmVyc2lvblwiKVswXT8udGV4dENvbnRlbnQgPz8gJyc7XG4gICAgICAgIHRoaXMubWV0YUlkID0gbWV0YUlkID8/IGluZm9JbnN0YW5jZUVsZW1lbnQ/LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiSWRcIilbMF0/LnRleHRDb250ZW50ID8/IDA7XG4gICAgICAgIHRoaXMubWV0YVVybCA9IG1ldGFVcmwgPz8gaW5mb0luc3RhbmNlRWxlbWVudD8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJVcmxcIilbMF0/LnRleHRDb250ZW50ID8/ICcnO1xuICAgICAgICB0aGlzLmluc3RhbGxzID0gaW5zdGFsbHM7XG4gICAgICAgIHRoaXMuY29uZGl0aW9ucyA9IGNvbmRpdGlvbnM7XG4gICAgICAgIHRoaXMuc3RlcHMgPSBzdGVwcztcblxuXG4gICAgICAgIHRoaXMub2JqZWN0c1RvVXBkYXRlLnB1c2goXG4gICAgICAgICAgICBuZXcgYmluZGluZ3NHZW5lcmljLm1vZE1ldGFkYXRhKHRoaXMpLFxuICAgICAgICAgICAgbmV3IGJpbmRpbmdzMXN0UGFydHkuRm9tb2QodGhpcyksXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgYXNNb2R1bGVYTUwoZG9jdW1lbnQ6IFhNTERvY3VtZW50KTogRWxlbWVudCB7XG4gICAgICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgIT09IHRoaXMuaW5zdGFuY2VFbGVtZW50KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVDaGlsZChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRPckNyZWF0ZUNoaWxkKFwiY29uZmlnXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50LnNldEF0dHJpYnV0ZShcInhtbG5zOnhzaVwiLCBcImh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlXCIpO1xuICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ4c2k6bm9OYW1lc3BhY2VTY2hlbWFMb2NhdGlvblwiLCBcImh0dHA6Ly9xY29uc3VsdGluZy5jYS9mbzMvTW9kQ29uZmlnNS4wLnhzZFwiKTtcblxuICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5nZXRPckNyZWF0ZUNoaWxkKFwibW9kdWxlTmFtZVwiKS50ZXh0Q29udGVudCA9IHRoaXMubWV0YU5hbWU7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50LmdldE9yQ3JlYXRlQ2hpbGQoXCJtb2R1bGVJbWFnZVwiKS5zZXRBdHRyaWJ1dGUoJ3BhdGgnLCB0aGlzLm1ldGFJbWFnZSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBpbnN0YWxsIG9mIHRoaXMuaW5zdGFsbHMpIHtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VFbGVtZW50LmFwcGVuZENoaWxkKGluc3RhbGwuYXNNb2R1bGVYTUwoZG9jdW1lbnQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvbnMpXG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmNvbmRpdGlvbnMuYXNNb2R1bGVYTUwoZG9jdW1lbnQpKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2YgdGhpcy5zdGVwcykge1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUVsZW1lbnQuYXBwZW5kQ2hpbGQoc3RlcC5hc01vZHVsZVhNTChkb2N1bWVudCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VFbGVtZW50O1xuICAgIH1cblxuICAgIG92ZXJyaWRlIGFzSW5mb1hNTChkb2N1bWVudDogWE1MRG9jdW1lbnQpOiBFbGVtZW50IHtcbiAgICAgICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAhPT0gdGhpcy5pbmZvSW5zdGFuY2VFbGVtZW50KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVDaGlsZChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5pbmZvSW5zdGFuY2VFbGVtZW50ID0gZG9jdW1lbnQuZ2V0T3JDcmVhdGVDaGlsZChcImZvbW9kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHNjaGVtYSBpbmZvXG4gICAgICAgIHRoaXMuaW5mb0luc3RhbmNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ4bWxuczp4c2lcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZVwiKTtcbiAgICAgICAgaWYgKHdpbmRvdy5GT01PREJ1aWxkZXIuc3RvcmFnZS5zZXR0aW5ncy5pbmNsdWRlSW5mb1NjaGVtYSlcbiAgICAgICAgICAgIHRoaXMuaW5mb0luc3RhbmNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ4c2k6bm9OYW1lc3BhY2VTY2hlbWFMb2NhdGlvblwiLCBcImh0dHBzOi8vYmVsbGN1YmVkZXYuZ2l0aHViLmlvL3NpdGUtdGVzdGluZy9hc3NldHMvc2l0ZS9taXNjL0luZm8ueHNkXCIpO1xuICAgICAgICBlbHNlIGlmICh0aGlzLmluZm9JbnN0YW5jZUVsZW1lbnQuZ2V0QXR0cmlidXRlKFwieHNpOm5vTmFtZXNwYWNlU2NoZW1hTG9jYXRpb25cIikgPT09IFwiaHR0cHM6Ly9iZWxsY3ViZWRldi5naXRodWIuaW8vc2l0ZS10ZXN0aW5nL2Fzc2V0cy9zaXRlL21pc2MvSW5mby54c2RcIilcbiAgICAgICAgICAgIHRoaXMuaW5mb0luc3RhbmNlRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJ4c2k6bm9OYW1lc3BhY2VTY2hlbWFMb2NhdGlvblwiKTtcblxuICAgICAgICAvLyBTZXQgYWN0dWFsIGRhdGFcbiAgICAgICAgY29uc3QgdXJsID0gdGhpcy5nZXRVUkxBc1N0cmluZygpO1xuICAgICAgICBpZiAodGhpcy5tZXRhTmFtZSkgICAgdGhpcy5pbmZvSW5zdGFuY2VFbGVtZW50LmdldE9yQ3JlYXRlQ2hpbGQoXCJOYW1lXCIpLnRleHRDb250ZW50ICAgID0gdGhpcy5tZXRhTmFtZTtcbiAgICAgICAgaWYgKHRoaXMubWV0YUF1dGhvcikgIHRoaXMuaW5mb0luc3RhbmNlRWxlbWVudC5nZXRPckNyZWF0ZUNoaWxkKFwiQXV0aG9yXCIpLnRleHRDb250ZW50ICA9IHRoaXMubWV0YUF1dGhvcjtcbiAgICAgICAgaWYgKHRoaXMubWV0YUlkKSAgICAgIHRoaXMuaW5mb0luc3RhbmNlRWxlbWVudC5nZXRPckNyZWF0ZUNoaWxkKFwiSWRcIikudGV4dENvbnRlbnQgICAgICA9IHRoaXMubWV0YUlkLnRvU3RyaW5nKCk7XG4gICAgICAgIGlmICh1cmwpICAgICAgICAgICAgICAgdGhpcy5pbmZvSW5zdGFuY2VFbGVtZW50LmdldE9yQ3JlYXRlQ2hpbGQoXCJXZWJzaXRlXCIpLnRleHRDb250ZW50ID0gdXJsO1xuICAgICAgICBpZiAodGhpcy5tZXRhVmVyc2lvbikgdGhpcy5pbmZvSW5zdGFuY2VFbGVtZW50LmdldE9yQ3JlYXRlQ2hpbGQoXCJWZXJzaW9uXCIpLnRleHRDb250ZW50ID0gdGhpcy5tZXRhVmVyc2lvbjtcblxuICAgICAgICByZXR1cm4gdGhpcy5pbmZvSW5zdGFuY2VFbGVtZW50O1xuICAgIH1cbn1cbiJdfQ==