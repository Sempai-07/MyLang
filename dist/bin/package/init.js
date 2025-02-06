"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageInt = packageInt;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const node_readline_1 = tslib_1.__importDefault(require("node:readline"));
function packageInt(options) {
    const filePath = node_path_1.default.join(process.cwd(), "mylang.json");
    if (options.yes) {
        const project = `{
  "name": "${node_path_1.default.parse(process.cwd()).base}",
  "version": "1.0.0",
  "description": "Your package 📦",
  "main": "index.ml",
  "scripts": {
    "run": "mylang run index.ml"
  },
  "dependencies": {}
}`;
        if (node_fs_1.default.existsSync(filePath)) {
            console.error('Error: "mylang.json" already exists.');
            process.exit(1);
        }
        node_fs_1.default.writeFileSync(filePath, project);
        console.info("Project initialized successfully with default settings!");
        return;
    }
    const rl = node_readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const questions = [
        {
            key: "name",
            question: "Project name: ",
            default: node_path_1.default.parse(process.cwd()).base,
        },
        { key: "version", question: "Version: ", default: "1.0.0" },
        {
            key: "description",
            question: "Description: ",
            default: "Your package 📦",
        },
        { key: "main", question: "Main file: ", default: "index.ml" },
    ];
    const answers = {};
    const askQuestion = (index = 0) => {
        const question = questions[index];
        if (!question) {
            rl.close();
            return;
        }
        const { key, question: questionText, default: defaultValue } = question;
        rl.question(`${questionText} (${defaultValue}) `, (answer) => {
            answers[key] = answer.trim() || defaultValue;
            if (index + 1 < questions.length) {
                askQuestion(index + 1);
            }
            else {
                const project = JSON.stringify({
                    ...answers,
                    scripts: {
                        run: `mylang run ${answers.main}`,
                    },
                    dependencies: {},
                }, null, 2);
                if (node_fs_1.default.existsSync(filePath)) {
                    rl.question('File "mylang.json" already exists. Overwrite? (y/n) ', (response) => {
                        if (response.toLowerCase() === "y") {
                            node_fs_1.default.writeFileSync(filePath, project);
                            console.info('File "mylang.json" successfully overwritten!');
                        }
                        else {
                            console.log("Operation cancelled.");
                        }
                        rl.close();
                    });
                }
                else {
                    node_fs_1.default.writeFileSync(filePath, project);
                    console.info('File "mylang.json" successfully created!');
                    rl.close();
                }
            }
        });
    };
    askQuestion();
}
