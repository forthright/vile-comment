# vile-comment

A [vile](http://vile.io) plugin for punishing comments.

## Supported Checks

Various comment grammars are reported.

- `TODO`
- `HACK`
- `NOTE`
- `FIXME`
- `BUG`

## Requirements

- [nodejs](http://nodejs.org)
- [npm](http://npmjs.org)

## Installation

    npm i vile-comment

## Architecture

- `src` is es6+ syntax compiled with [babel](https://babeljs.io)
- `lib` generated js library

## Hacking

    cd vile-comment
    npm install
    npm run dev
    npm test
