# els-intl-addon
Ember Language Server intl addon

How to use?

Install this addon as `dev-dependency` inside your ember project
or download it and specify addon path in UELS settings.

### NPM
`npm install els-intl-addon --save-dev`

### Yarn
`yarn add els-intl-addon --dev`

### VSCode

Install: [Unstable Ember Language Server](https://marketplace.visualstudio.com/items?itemName=lifeart.vscode-ember-unstable).

* Restart `VSCode`.

## Usage 
Try autocomplete for `{{t 'tanslation..'}}` inside templates.
Try autocompleta for `this.intl.t("translation..')` inside scripts.

* You can write translation result and it will be replaced to path.
```js
'some.translation.path': 'Translation result'
```

```hbs
{{t 'Translati..'}} -> {{t 'some.translation.path'}}
```
