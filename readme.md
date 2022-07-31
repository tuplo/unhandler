<br />
<div align="center">
  <img src="logo.png" alt="Logo" width="120" height="120">
  <h1 align="center">unhandler</h3>
  <p align="center">Creates bug reports for uncaught exceptions and unhandled rejections</p>
  <p align="center">
    <img src="https://img.shields.io/npm/v/@tuplo/unhandler">
    <img src="https://img.shields.io/bundlephobia/minzip/@tuplo/unhandler">
  	 <a href="https://codeclimate.com/github/tuplo/unhandler/test_coverage">
      <img src="https://api.codeclimate.com/v1/badges/b460b35ffc1d540fb7d9/test_coverage" /></a>
  	 <img src="https://github.com/tuplo/unhandler/actions/workflows/build.yml/badge.svg">
  </p>
</div>

## Why

Creates bug reports for uncaught exceptions and unhandled rejections. Works like a DYI Sentry client for NodeJS. Can publish bug reports on different trackers simultaneously. Not suited to be used on browsers as it would need to expose your APIs' access secrets to the public.

## Install

```bash
$ npm install @tuplo/unhandler

# or with yarn
$ yarn add @tuplo/unhandler
```

## Usage

```ts
import { unhandler } from '@tuplo/unhandler';
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

**Registers an event handler `onBeforeSubmitError`**

```ts
import { submitError } from '@tuplo/unhandler';

const error = new Error('buggy bug');

await submitError(error, {
  appName: 'my-app-1',
  onBeforeSubmitError: (error) => console.error(error),
  providers: {
    github: {
      user: 'tuplo',
      repo: 'unhandler',
      token: 'secret-token-xxxxxxx',
    },
  },
});

// will output the error before submitting
```

## Error tracking providers

- [x] GitHub Issues
- [ ] Trello
- [ ] JIRA

## Options


### appName

> `string` 

The name of the application triggering the error.

### onBeforeSubmitError

> `(error) => Promise<void>` | optional

An optional function to be called just before submitting the error.

### providers

> `Provider[]`

##### GitHub

| name  | type   | description                                                                     |
| ----- | ------ | ------------------------------------------------------------------------------- |
| user  | `string` | The user or organization, owner of the repository where issues will be created. |
| repo  | `string` | The name of the repository where issues will be created.                        |
| token | `string` | GitHub's personal access token with a `repo` scope.                             |

### License

MIT
