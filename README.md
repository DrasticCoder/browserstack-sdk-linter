# BrowserStack SDK Linter

A simple VS Code extension for BrowserStack SDK configuration files.

It helps you work with `browserstack.yml` by providing:

- Linting for BrowserStack SDK config
- Autocompletion and suggestions
- Validation for supported capabilities
- Credential checks for `userName` and `accessKey`
- BrowserStack plan verification using the Automate plan API

## Usage

Open a `browserstack.yml` file in VS Code.

The extension will automatically provide validation and suggestions. To verify credentials, use one of these options:

- Click **Verify BrowserStack Credentials** in the editor
- Run **Verify BrowserStack Credentials** from the Command Palette

## Example

```yaml
userName: YOUR_BROWSERSTACK_USERNAME
accessKey: YOUR_BROWSERSTACK_ACCESS_KEY

platforms:
  - os: Windows
    osVersion: 11
    browserName: Chrome
    browserVersion: latest
```

## Credential Check

The extension checks credentials using:

```text
https://api.browserstack.com/automate/plan.json
```

Credentials are only used for this verification request and are not stored.

## Development

```bash
npm install
npm run compile
```

## Repository

[github.com/DrasticCoder/browserstack-sdk-linter](https://github.com/DrasticCoder/browserstack-sdk-linter)
