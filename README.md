# Background+

Set a custom background for your VS Code editor!

## How to use?

1. Install this extension.
2. Run `Background+: Add` command.
3. Select either `Local Image` or `HTTP Image` for the kind of image to use.
   - If `Local Image` is selected, a file select dialog will be show to pick a image.
4. Enter a name for this image, the CSS will be installed and the window will reload, you should see your custom background.

Enjoy!

## Frequency Asked Questions

**Q: How does this differ from existing extensions?** \
A: Other extensions do set the background but as a user I've had issues where one does not work or I cannot figure out how they work. So I designed this to be as easy to use as possible, no unexpected behavior.

**Q: How does the install/uninstall work?** \
A: The extension does not automatically install anything, it is a tool to help with configuring the background. This means you control when it install the custom CSS. Using the commands `Add`, `Select`, `Global Opacity`, `Selected Opacity` will reinstall the CSS when you use the commands. `Uninstall` will remove the custom CSS, it will only be installed when you use the above commands or `Install`.

**Q: I edited the `settings.json` but the background did not update!** \
A: By design you have to run the `Install` command, this gives you complete control to finish editing what you need.

**Q: How does I set CSS specifically for the selected image?** \
A: In your `setting.json`, look for your specific image in the configuration array `background-plus.images`. Add or edit the `style` object with the properties you need.

## Commands

- `Background+ Add`:

> Add a background image with a identifier and either a local file or a HTTP image.

- `Background+ Install`:

> Install the custom CSS into VS Code.

- `Background+: Uninstall`:

> Uninstall any custom CSS previously installed from Background+.
>
> Note: Before uninstalling the extension please run this command.

- `Background+ Select`:

> Select an image from the list to use, this overrides the carousel.

- `Background+ Global Opacity`:

> Sets the opacity for the global style. Selected image style takes priority over the global style.

- `Background+ Selected Opacity`:

> Set the opacity for the currently selected image only. This has priority over global opacity.

## Styles

The extension uses a specific order for the styles, each style will be overwritten by the next, the selected CSS will always overwrite any properties found in the previous styles.

First the [default CSS](https://github.com/Solaris9/vscode-background-plus/blob/main/src/background.ts#L14-L19) is applied, secondly the extension's global CSS in the settings.json is applied, and finally the current background image's is applied last.

You can see how it works [here](https://github.com/Solaris9/vscode-background-plus/blob/main/src/background.ts#L31).

## Roadmap

- [ ] Add carousel (more like fix tbh)
- [ ] Each editor has it's own background image
