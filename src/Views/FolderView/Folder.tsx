namespace Views.FolderView
{
    export function insertFolder(folderView: HTMLElement, folder: Data.Folder)
    {
        if (folder.parent)
        {
            for (const parentFolderElement of folderView.querySelectorAll(".folder"))
                if (parentFolderElement["folder"] == folder.parent)
                {
                    insertFolderIntoParent(parentFolderElement as HTMLElement, folder);
                    return;
                }
        }
        else
        {
            const foldersElement = folderView.querySelector(".folders");
            foldersElement.append(folderElement(folder));
        }
    }

    function insertFolderIntoParent(parentFolderElement: HTMLElement, folder: Data.Folder)
    {
        const subfoldersElement = parentFolderElement.querySelector(".subfolders");
        subfoldersElement.append(folderElement(folder));
        parentFolderElement.classList.toggle("has-subfolders", true);

        let parent = parentFolderElement;
        do
        {
            if (parent.classList.contains("folder"))
            {
                const fileCountElement = parent.querySelector(".file-count") as HTMLSpanElement;
                const currentCount = fileCountElement.textContent ? parseInt(fileCountElement.textContent) : 0;
                const newCount = currentCount + folder.files.length;
                fileCountElement.title = fileCountElement.textContent = newCount.toFixed(0);
            }
        } while (parent = parent.parentElement);
    }

    function folderElement(folder: Data.Folder)
    {
        return <div class="folder" folder={ folder } path={ folder.path }>
            <a class="expander" onclick={ expanderClick } />
            <span class="title" title={ folder.name } onclick={ titleXORClick }>{ folder.name }</span>
            <span class="file-count" title={ folder.files.length ? folder.files.length : "no files" }>{ folder.files.length ? folder.files.length : "" }</span>
            <div class="subfolders"></div>
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