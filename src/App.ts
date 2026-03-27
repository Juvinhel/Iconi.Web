class App
{
    public static async Start()
    {
        this.config = await ConfigHelper.load("config.json", Data.defaultConfig);

        UI.LazyLoad.ErrorImageUrl = "img/icons/not-found.png";
        UI.LazyLoad.LoadingImageUrl = "img/icons/spinner.svg";
        UI.LazyLoad.Start();

        window.addEventListener("mousemove", (event: MouseEvent) => this.pressCTRL(event.ctrlKey), { capture: true, passive: true });
        window.addEventListener("keydown", (event: KeyboardEvent) => this.pressCTRL(event.ctrlKey), { capture: true, passive: true });
        window.addEventListener("keyup", (event: KeyboardEvent) => this.pressCTRL(event.ctrlKey), { capture: true, passive: true });
        window.addEventListener("keydown", this.keyDown.bind(this), { capture: true, passive: true });

        document.querySelector("main").append(new Views.MainElement());
    }

    public static config: Data.Config;

    private static ctrl: boolean = false;
    private static pressCTRL(pressed: boolean)
    {
        if (pressed != this.ctrl)
        {
            this.ctrl = pressed;
            this.multiselect = pressed;
        }
    }

    private static keyDown(event: KeyboardEvent)
    {
        let simplePaging: HTMLSimplePaging;
        switch (event.key)
        {
            case "ArrowRight":
                simplePaging = document.querySelector("simple-paging") as HTMLSimplePaging;
                simplePaging.navigateNext();
                break;
            case "ArrowLeft":
                simplePaging = document.querySelector("simple-paging") as HTMLSimplePaging;
                simplePaging.navigatePrevious();
                break;
        }
    }

    private static internal_multiselect: boolean = false;
    public static get multiselect(): boolean { return this.internal_multiselect; }
    public static set multiselect(value: boolean)
    {
        this.internal_multiselect = value;
        for (const element of document.querySelectorAll(".multi-select"))
            element.classList.toggle("marked", value);
    }
}