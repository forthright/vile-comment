# vile-comment

A [Vile](http://vile.io) plugin for keeping track of TODO/HACK style comments in your code.

## Requirements

- [Node.js](http://nodejs.org)

## Supported Checks

- `TODO`
- `HACK`
- `NOTE`

## Installation

    npm i -D vile vile-comment

## Ignore

`vile.ignore` is used as the base ignore, but you can add onto it:

```yaml
comment:
  ignore: [ "a/**", "b" ]
```

## Versioning

This project uses [Semver](http://semver.org).

## Licensing

This project is licensed under the [MPL-2.0](LICENSE) license.

Any contributions made to this project are made under the current license.

## Contributions

Current list of [Contributors](https://github.com/forthright/vile-comment/graphs/contributors).

Any contributions are welcome and appreciated!

All you need to do is submit a [Pull Request](https://github.com/forthright/vile-comment/pulls).

1. Please consider tests and code quality before submitting.
2. Please try to keep commits clean, atomic and well explained (for others).

### Issues

Current issue tracker is on [GitHub](https://github.com/forthright/vile-comment/issues).

Even if you are uncomfortable with code, an issue or question is welcome.

### Code Of Conduct

By participating in this project you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

### Maintainers

- Brent Lintner - [@brentlintner](http://github.com/brentlintner)

## Architecture

- `src` is es6+ syntax compiled with [Babel](https://babeljs.io)
- `lib` generated js library

## Developing

    cd vile-comment
    npm install
    npm run dev
    npm test
