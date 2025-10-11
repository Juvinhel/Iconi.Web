namespace Views.FolderView
{
    export function loadFolders(container: HTMLElement, folders: Data.Folder[])
    {
        for (const folder of folders)
            container.append(folderElement(folder));
    }

    function folderElement(folder: Data.Folder)
    {
        return <div class={ ["folder", folder.folders.length > 0 ? "has-subfolders" : null] } folder={ folder }>
            <a class="expander" onclick={ expanderClick } />
            <span class="title" title={ folder.name } onclick={ titleXORClick }>{ folder.name }</span>
            <span class="file-count" title={ folder.files.length ? folder.files.length : "no files" }>{ folder.files.length }</span>
            <div class="subfolders">
                { folder.folders.map(f => folderElement(f)) }
            </div>
        </div>;
    }

    function titleXORClick(e: Event)
    {
        const sender = e.currentTarget as HTMLElement;

        //@ts-ignore
        switch (e.detail)
        {
            case 1:
                titleClick(sender);
                break;
            case 2:
                titleDblClick(sender);
                break;
        }
    }

    function titleClick(sender: HTMLElement)
    {
        const folderElement = sender.closest(".folder");
        const selected = folderElement.classList.toggle("selected");

        if (!App.multiselect)
            for (const otherFolderElement of document.querySelectorAll(".folder.selected"))
                if (otherFolderElement != folderElement)
                    otherFolderElement.classList.toggle("selected", false);

        const selectfolderEvent = new CustomEvent("selectfolder", { bubbles: true, detail: { folder: selected ? folderElement["folder"] : null } });
        folderElement.dispatchEvent(selectfolderEvent);
    }

    function titleDblClick(sender: HTMLElement)
    {
        const folderElement = sender.closest(".folder");
        const expanded = folderElement.classList.toggle("expanded");

        if (expanded)
        {
            let parent = folderElement.parentElement;
            do
            {
                if (folderElement.classList.contains("folder"))
                    folderElement.classList.toggle("expanded", true);
            } while (parent = parent.parentElement);
        }
    }

    function expanderClick(e: Event)
    {
        const sender = e.currentTarget as HTMLElement;
        const folderElement = sender.closest(".folder");
        const expanded = folderElement.classList.toggle("expanded");

        if (expanded)
        {
            let parent = folderElement.parentElement;
            do
            {
                if (parent.classList.contains("folder"))
                    parent.classList.toggle("expanded", true);
            } while (parent = parent.parentElement);
        }
    }
}