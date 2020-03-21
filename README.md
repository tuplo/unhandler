# unhandler

<p>
  <a href="https://github.com/tuplo/unhandler/actions">
    <img src="https://github.com/tuplo/unhandler/workflows/Build/badge.svg" alt="Build">
  </a>
  <a href="https://npmjs.org/package/@tuplo/unhandler">
    <img src="https://img.shields.io/npm/v/@tuplo/unhandler.svg" alt="NPM Version">
  </a>
  <img src="https://david-dm.org/tuplo/unhandler.svg">
  <a href="http://commitizen.github.io/cz-cli/">
      <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly">
  </a>
  <a href="https://github.com/semantic-release/semantic-release">
    <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="semantic-release">
  </a>
</p>

Creates bug reports for uncaught exceptions and unhandled rejections. Works like a DYI Sentry client. Can publish bug reports on different trackers simultaneously.

## Install

```bash
$ npm install @tuplo/unhandler

# or with yarn
$ yarn add @tuplo/unhandler
```

## Usage

```ts
import unhandler from '@tuplo/unhandler';
```

**Registers event handlers for `uncaughtException` and `unhandledRejection`**

```ts
unhandler({
  appName: 'my-app-1',
  providers: {
    github: {
      user: 'tuplo',
      repo: 'unhandler',
      token: 'secret-token-xxxxxxx',
    },
  },
});

throw new Error('buggy bug');

// will create a GitHub issue with title "[my-app-1] buggy bug"
```

**Creates bug reports directly with `submitError`**

```ts
import { submitError } from '@tuplo/unhandler';

const error = new Error('buggy bug');

await submitError(error, {
  appName: 'my-app-1',
  providers: {
    github: {
      user: 'tuplo',
      repo: 'unhandler',
      token: 'secret-token-xxxxxxx',
    },
  },
});

// will create a GitHub issue with title "[my-app-1] buggy bug"
```

## Error tracking providers

- [x] GitHub Issues
- [ ] Trello
- [ ] JIRA

## API

### unhandler(options)

#### options

##### appName: string

The name of the application triggering the error.

##### providers: Provider[]

##### GitHub

| name  | type   | description                                                                     |
| ----- | ------ | ------------------------------------------------------------------------------- |
| user  | string | The user or organization, owner of the repository where issues will be created. |
| repo  | string | The name of the repository where issues will be created.                        |
| token | string | GitHub's personal access token with a `repo` scope.                             |

## Contribute

Contributions are always welcome!

## License

MIT
