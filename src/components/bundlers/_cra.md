Assuming you have already run `create-react-app` and your working directory is
the project.

```bash
yarn add craco craco-wasm
```

Modify `package.json` to use `craco` for scripts. In `package.json` the
`scripts` section will look like this:

```json
  "scripts": {
    "start": "create-react-app start",
    "build": "create-react-app build",
    "test": "create-react-app test",
    "eject": "create-react-app eject"
  },
```

Replace that section with:

```json
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test",
    "eject": "craco eject"
  },
```

In the root of the project add the following contents to `craco.config.js`

```javascript
const cracoWasm = require("craco-wasm");

module.exports = {
  plugins: [cracoWasm()],
};
```
