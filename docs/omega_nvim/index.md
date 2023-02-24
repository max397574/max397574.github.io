---
sidebar_position: 1
---
# Omega-nvim
This is a rewrite of my neovim config [omega-nvim](https://github.com/max397574/omega-nvim)
This config is usable and extendable for everyone.

You can place your own plugins or disable plugins inside the `lua/omega/custom/modules` folder.
You can overwrite lazy options inside the `lua/omega/custom/config/lazy.lua` file.
For example to set dev options you could do this:
```lua title="lua/omega/custom/config/lazy.lua"
return {
    dev = {
        path = "~/neovim_plugins/",
        fallback = true,
        patterns = { "max397574" },
    },
}
```

Atm this only has onedark colorscheme and you can't also install plugins for other ones because a specific style of themes is needed so all the highlights can be changed.

## Credits
- Nvchad: The original concept of how the themes are done now and some code for the tabline
