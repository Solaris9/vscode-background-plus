# Background+

Set a custom background for your VS Code editor!

## Commands

- `Background+ Add`:

> Add a background image using an image URL and identifier.

- `Background+ Install`:

> Install the custom CSS into VS Code.

- `Background+: Uninstall`:

> Uninstall any custom CSS previously install from Background+.
> Note: Before uninstalling the extension please run this command.

- `Background+ Select`:

> Select an image from the list to use, this overrides the carousel.

- `Background+ Opacity`:

> Sets the opacity for the currently selected image if previously set before, else defaults to global css style.

- `Background+ Selected Opacity`:

> Set the opacity for the currently selected image only. This has priority over global opacity.

## Styles

The extension uses a specific order for the styles, each style will be overwritten by the next, the background CSS will always overwrite any properties found in the previous styles.

First the [default CSS](https://github.com/Solaris9/vscode-backgound-plus/blob/main/src/background.ts#L14-19) is applied, secondly the extension's global CSS in the settings.json is applied, and finally the current background image's is applied last.

You can see how it works [here](https://github.com/Solaris9/vscode-backgound-plus/blob/main/src/background.ts#L35).
