# Vipman

Verion, interlink and publication manager of the TiniJS project.

## Install

Clone the repository to the same folder as other TiniJS packages: `git clone https://github.com/tinijs/vipman.git`.

Then, install the dependencies: `cd vipman && npm i`.

## Usage

Here is the build and deployment procedure:

### I - Sync versions

Set a base version `npm version <number> && git push origin v<number> && git push origin`

### II - Build and publish packages

Packages depend on each other, so they are built and published one by one:

- **Step 1**: `npm run build:<id>:<name>`
- **Step 2**: `npm run publish:<id>:<name>`

Note that the [@tinijs/icons](https://github.com/tinijs/icons/blob/main/package.json) package is built and published separately (depends on **@tinijs/cli**, **@tinijs/core**). Please refer to the respective repo for more detail.

## License

**@tinijs/vipman** is released under the [MIT](https://github.com/tinijs/vipman/blob/master/LICENSE) license.
