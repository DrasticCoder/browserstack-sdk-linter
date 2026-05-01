import * as vscode from 'vscode';
import axios from 'axios';

//---CODELENS PROVIDER---
class BrowserStackCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const lenses: vscode.CodeLens[] = [];
    const text = document.getText();
    const regex = /userName:/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const line = document.lineAt(document.positionAt(match.index).line);
      const range = new vscode.Range(line.lineNumber, 0, line.lineNumber, 0);

      const command: vscode.Command = {
        title: '$(shield-check) ⚠️ Verify BrowserStack Credentials ⚠️',
        command: 'browserstack.verifyCredentials',
        arguments: [document],
      };
      lenses.push(new vscode.CodeLens(range, command));
    }
    return lenses;
  }
}

//---CODEACTION PROVIDER---
class BrowserStackActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
  ): vscode.CodeAction[] {
    const line = document.lineAt(range.start.line);
    if (line.text.includes('userName') || line.text.includes('accessKey')) {
      const action = new vscode.CodeAction(
        '⚠️ CLICK TO VERIFY CREDENTIALS ⚠️',
        vscode.CodeActionKind.QuickFix,
      );
      action.command = {
        command: 'browserstack.verifyCredentials',
        title: '⚠️ CLICK TO VERIFY CREDENTIALS ⚠️',
        arguments: [document],
      };
      return [action];
    }
    return [];
  }
}

//---VALIDATION LOGIC---
async function runCredentialCheck(document: vscode.TextDocument) {
  const text = document.getText();
  const userMatch = text.match(/userName:\s*["']?([^"'\s]+)["']?/);
  const keyMatch = text.match(/accessKey:\s*["']?([^"'\s]+)["']?/);

  if (!userMatch || !keyMatch) {
    vscode.window.showErrorMessage(
      'SDK-Linter Error: Could not find credentials in file.',
    );
    return;
  }

  const user = userMatch[1];
  const key = keyMatch[1];

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'SDK-Linter: Contacting BrowserStack API...',
      cancellable: false,
    },
    async () => {
      try {
        await axios.get('https://api.browserstack.com/automate/plan.json', {
          auth: { username: user, password: key },
        });
        vscode.window.showInformationMessage(
          '✅ Success: BrowserStack credentials are valid!',
        );
      } catch (error: any) {
        if (error.response?.status === 401) {
          vscode.window.showErrorMessage(
            '❌ Access Denied: Invalid Username or Access Key.',
          );
        } else {
          vscode.window.showErrorMessage(
            '⚠️ Connection Failed: Check your network/proxy.',
          );
        }
      }
    },
  );
}

// --- 4. ACTIVATION ---
export function activate(context: vscode.ExtensionContext) {
  console.log('testing ---------------->');

  const docSelector = [
    { language: 'yaml' },
    { language: 'yml' },
  ];

  //Register CodeLens
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      docSelector,
      new BrowserStackCodeLensProvider(),
    ),
  );

  // Register CodeAction
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      docSelector,
      new BrowserStackActionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
      },
    ),
  );

  // Register the Verification Command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'browserstack.verifyCredentials',
      async (doc) => {
        const activeDoc = doc || vscode.window.activeTextEditor?.document;
        if (activeDoc) {
          await runCredentialCheck(activeDoc);
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'browserstack-sdk-linter.helloWorld',
      () => {
        vscode.window.showInformationMessage('SDK-Linter Linter is active!');
      },
    ),
  );
}

export function deactivate() {}
