namespace Views.ListView
{
    export function ListView()
    {
        return <div class="list-view">
            <div class="search"></div>
            <div class="tiles-grid" />
        </div>;
    }

    export function showFiles(files: Data.File[])
    {
        const tilesGrid = document.querySelector(".tiles-grid");
        tilesGrid.clearChildren();
        tilesGrid.append(...files.map(file => <img src={ file.url } />));
    }
}