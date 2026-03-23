const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

let cache = [];

// ---- Regex patterns ----
const patterns = [
	/export\s+const\s+(\w+)/g,
	/export\s+default\s+function\s+(\w+)/g,
	/export\s+default\s+(\w+)/g,
	/export\s*{\s*([^}]+)\s*}/g
];

function pushResult(results, name, content, filePath, index) {
	const before = content.slice(0, index);
	const line = before.split("\n").length - 1;

	results.push({
		name,
		file: filePath,
		line
	});
}

// ---- Scan workspace ----
async function scanWorkspace() {
	const files = await vscode.workspace.findFiles(
		"**/*.{js,jsx,ts,tsx}",
		"**/node_modules/**"
	);

	const results = [];

	for (const file of files) {
		let content = "";

		try {
			content = fs.readFileSync(file.fsPath, "utf-8");
		} catch {
			continue;
		}

		// ---- MATCHES ----
		const matches = [
			...content.matchAll(/export\s+function\s+(\w+)\s*\(/g),
			...content.matchAll(/export\s+const\s+(\w+)\s*=\s*\(?.*?\)?\s*=>/gs),
			...content.matchAll(/export\s+default\s+function\s+(\w+)\s*\(/g),
			...content.matchAll(/export\s+const\s+(\w+)\s*=\s*function\s*\(/g),
			...content.matchAll(/export\s+const\s+(\w+)/g),
			...content.matchAll(/export\s+default\s+function\s+(\w+)/g),
			...content.matchAll(/export\s+default\s+(\w+)/g)
		];

		matches.forEach((match) => {
			if (match[1].includes(",")) {
				// export { A, B }
				match[1].split(",").forEach((name) => {
					pushResult(results, name.trim(), content, file.fsPath, match.index);
				});
			} else {
				pushResult(results, match[1], content, file.fsPath, match.index);
			}
		});
	}

	return results;
}

// ---- Fuzzy match ----
function fuzzyMatch(query, target) {
	query = query.toLowerCase();
	target = target.toLowerCase();

	let qi = 0;
	for (let i = 0; i < target.length; i++) {
		if (target[i] === query[qi]) qi++;
		if (qi === query.length) return true;
	}
	return false;
}

// ---- Open file ----
async function openItem(item) {
	const doc = await vscode.workspace.openTextDocument(item.file);
	const editor = await vscode.window.showTextDocument(doc);

	const pos = new vscode.Position(item.line, 0);
	editor.selection = new vscode.Selection(pos, pos);
	editor.revealRange(new vscode.Range(pos, pos));
}

// ---- Main Command ----
async function searchExported() {
	if (!cache.length) {
		vscode.window.showInformationMessage("Indexing workspace...");
		cache = await scanWorkspace();
	}

	const quickPick = vscode.window.createQuickPick();

	quickPick.placeholder = "Search exported component...";
	quickPick.matchOnDescription = true;

	quickPick.onDidChangeValue((value) => {
		const filtered = cache
			.filter((item) => fuzzyMatch(value, item.name))
			.slice(0, 50);

		quickPick.items = filtered.map((item) => ({
			label: item.name,
			description: path.relative(
				vscode.workspace.rootPath,
				item.file
			),
			detail: `Line ${item.line + 1}`,
			item
		}));
	});

	quickPick.onDidAccept(() => {
		const selected = quickPick.selectedItems[0];
		if (selected) openItem(selected.item);
		quickPick.hide();
	});

	quickPick.show();
}

// ---- Activate ----
function activate(context) {
	const disposable = vscode.commands.registerCommand(
		"functionsearch.search",
		searchExported
	);

	context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
};