# unhandler

Creates bug reports for uncaught exceptions and unhandled rejections. Works like a DYI Sentry client for NodeJS. Can publish bug reports on different trackers simultaneously. Not suited to be used on browsers as it would need to expose your APIs' access secrets to the public.

<p>
  <img src="https://img.shields.io/npm/v/@tuplo/unhandler">
  <a href="https://codeclimate.com/github/tuplo/unhandler/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/b460b35ffc1d540fb7d9/maintainability" />
  </a>
  <a href="https://codeclimate.com/github/tuplo/unhandler/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/b460b35ffc1d540fb7d9/test_coverage" />
  </a>
</p>

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

## API

### unhandler(options)

#### options

##### appName: string

The name of the application triggering the error.

##### onBeforeSubmitError: string?

An optional function to be called just before submitting the error.

##### providers: Provider[]

##### GitHub

| name  | type   | description                                                                     |
| ----- | ------ | ------------------------------------------------------------------------------- |
| user  | string | The user or organization, owner of the repository where issues will be created. |
| repo  | string | The name of the repository where issues will be created.                        |
| token | string | GitHub's personal access token with a `repo` scope.                             |

## Install

```bash
$ npm install @tuplo/unhandler

# or with yarn
$ yarn add @tuplo/unhandler
```

### Contribute

Contributions are always welcome!

### License

> The MIT License (MIT)
>
> Copyright (c) 2020 - 2021 Tuplo.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
