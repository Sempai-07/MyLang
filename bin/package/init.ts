import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

function packageInt(options: { yes?: boolean }): void {
  const filePath = path.join(process.cwd(), "mylang.json");

  if (options.yes) {
    const project = `{
  "name": "${path.parse(process.cwd()).base}",
  "version": "1.0.0",
  "description": "Your package 📦",
  "main": "index.ml",
  "scripts": {
    "run": "mylang run index.ml"
  },
  "dependencies": {}
}`;
    if (fs.existsSync(filePath)) {
      console.error('Error: "mylang.json" already exists.');
      process.exit(1);
    }
    fs.writeFileSync(filePath, project);
    console.info("Project initialized successfully with default settings!");
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const questions = [
    {
      key: "name",
      question: "Project name: ",
      default: path.parse(process.cwd()).base,
    },
    { key: "version", question: "Version: ", default: "1.0.0" },
    {
      key: "description",
      question: "Description: ",
      default: "Your package 📦",
    },
    { key: "main", question: "Main file: ", default: "index.ml" },
  ];

  const answers: Record<string, any> = {};

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
      } else {
        const project = JSON.stringify(
          {
            ...answers,
            scripts: {
              run: `mylang run ${answers.main}`,
            },
            dependencies: {},
          },
          null,
          2,
        );

        if (fs.existsSync(filePath)) {
          rl.question(
            'File "mylang.json" already exists. Overwrite? (y/n) ',
            (response) => {
              if (response.toLowerCase() === "y") {
                fs.writeFileSync(filePath, project);
                console.info('File "mylang.json" successfully overwritten!');
              } else {
                console.log("Operation cancelled.");
              }
              rl.close();
            },
          );
        } else {
          fs.writeFileSync(filePath, project);
          console.info('File "mylang.json" successfully created!');
          rl.close();
        }
      }
    });
  };

  askQuestion();
}

export { packageInt };
