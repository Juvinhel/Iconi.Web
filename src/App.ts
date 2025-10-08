class App
{
    public static async Start(args?: {
        library?: boolean,
        workbench?: boolean;
    })
    {
        UI.LazyLoad.ErrorImageUrl = "img/icons/not-found.png";
        UI.LazyLoad.LoadingImageUrl = "img/icons/spinner.svg";
        UI.LazyLoad.Start();

        window.addEventListener("mousemove", (event: MouseEvent) => this.pressCTRL(event.ctrlKey), { capture: true, passive: true });
        window.addEventListener("keydown", (event: KeyboardEvent) => this.pressCTRL(event.ctrlKey), { capture: true, passive: true });
        window.addEventListener("keyup", (event: KeyboardEvent) => this.pressCTRL(event.ctrlKey), { capture: true, passive: true });

        const main = Views.Main();
        document.querySelector("main").append(main);
    }

    private static ctrl: boolean = false;
    private static pressCTRL(pressed: boolean)
    {
        if (pressed != this.ctrl)
        {
            this.ctrl = pressed;
            this.multiselect = pressed;
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