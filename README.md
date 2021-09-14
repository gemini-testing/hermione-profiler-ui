# hermione-profiler-ui

UI works with results of [hermione-plugins-profiler](https://github.com/gemini-testing/hermione-plugins-profiler).

## Using

Installation:

```sh
npm i -S hermione-profiler-ui
```

### API

It's possible to use it through API:

```ts
import { generateReport } from "hermione-profiler-ui";

//...
const pathsToProfileResults = [
  "http://host.com/file1.json", // It can be url and server has to be able to serve with CORS
  "/file2.json", // Or file can be located near to the report folder
];
const targetDir = "./ui-report";

await generateReport(pathsToProfileResults, targetDir);
```

### CLI

```sh
npx hermione-profiler-ui generate -output "./ui-report" --plugin-profiles "http://host.com/file1.json" "/file2.json"
```

## Development

### Dev-server

To run dev-server with fixtures:

```sh
npm run start
```

### Tests

To run unit:

```sh
npm run test:unit
```

To run unit in watch-mode:

```sh
npm run test:unit -- --watchAll
```

### Linters

To run linters:

```sh
npm run lint
```

To fix problems:
To run linters:

```sh
npm run fix
```

## Release

### commit

To commit changes use above commands:

```sh
git add .
npm run commit # to commit changes in interactive mode
```

### release

```sh
npm run release
```

And follow instructions.
