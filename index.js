let pattern = [];
let [scoreHuman, scoreAI, chosenByHuman, chosenByAI] = new Array(4).fill(0);
let winner = "";
const patternLength = 25;
const [rock, paper, scissors] = [1,2,3];

const network = new require("neataptic").architect.Perceptron(
	3, //input
	Math.floor(patternLength / 2), //hidden
	3, //output
	{ activation: "softmax" } //opts
);
const rl = require("readline").createInterface({input: process.stdin,output: process.stdout}); 

function parse(input) {
	switch (input) {
	// to OneHot
	case rock:
		return [1, 0, 0];
	case paper:
		return [0, 1, 0];``
	case scissors:
		return [0, 0, 1];
	// from OneHot
	case [1, 0, 0]:
		return rock;
	case [0, 1, 0]:
		return paper;
	case [0, 0, 1]:
		return scissors;
	// from HumanInput
	case "rock":
	case "r":
		return 1;
	case "paper":
	case "p":
		return 2;
	case "scissors":
	case "s":
		return 3;
	}
}

function parseToString(input) {
	switch (input) {
		case rock: 
			return "rock";
		case paper: 
			return "paper";
		case scissors: 
			return "scissors";
	}
}

function saveAI() {
	rl.question("What is your ID?", (id) => {
		require("fs").writeFile(`ids/${id}.json`, JSON.stringify(network.toJSON()), function (err) {
			if (err) throw err;
			console.log("Saved!");
			rl.close();
			exit;
		});
	})
}

function loadAI() {
	rl.question("What is your ID?", (id) => {
		require("fs").readFile(`ids/${id}.json`, (err, data) => {
			if (err) throw err;
			network.fromJSON(JSON.parse(data));
			console.log("Loaded!");
			rl.close();
			exit;
		});
	})
}
function game() {
	// Make empty data array for first run
	if (pattern.length < 1) {
		for (let index = 0; index < patternLength; index++) {
			pattern.push(Math.floor(Math.random() * 3) + 1);
		}
	}

	rl.question("r / p / s / save / load: ", (answer) => {
		if (answer === "rock" || answer === "paper" || answer === "scissors" || answer === "r" || answer === "p" || answer === "s") {

			chosenByHuman = parse(answer)


			// Collect data from past games
			let trainingData = [];
			

			pattern.shift();
			pattern.push(chosenByHuman);

			// Loop through training data
			for(let i = 0; i < patternLength - 1; i++) {
				trainingData.push({ input: parse(pattern[i]), output: parse(pattern[i+1]) });
			}
			// Train AI on collected data
			network.train(trainingData, { iterations: 10e3, log: true, error: 10e-3, rate: 0.8 });
			
			
			const humanWillChoose = network.activate(parse(chosenByHuman));
			const roundedHumanWillChoose = humanWillChoose.indexOf(Math.max(...humanWillChoose)) + 1;
			switch (roundedHumanWillChoose) {
				case 1:
					chosenByAI = 2;
					break;
				case 2:
					chosenByAI = 3;
					break;
				case 3:
					chosenByAI = 1;
					break;
			}

			console.log(humanWillChoose);
			console.log("human will most likely chose: " + parseToString(roundedHumanWillChoose));
			console.log("AI will chose: " + parseToString(chosenByAI));

			if (chosenByHuman === chosenByAI) {
				winner = "draw";
			} else if (
				(chosenByHuman === rock && chosenByAI === scissors) ||
				(chosenByHuman === scissors && chosenByAI === paper) ||
				(chosenByHuman === paper && chosenByAI === rock)
			) {
				winner = "human";
				scoreHuman++;
			} else {
				winner = "AI";
				scoreAI++;
			}
			console.log(`Winner is ${winner} (Human chose ${parseToString(chosenByHuman)} and AI chose ${[parseToString(chosenByAI)]})\nHuman: ${scoreHuman}\nAI: ${scoreAI}`);

			
			game();

		} else if (answer == "save") {
			saveAI();
		} else if (answer == "load") {
			loadAI();
		}
		else {
			console.error("Invalid input, please choose rock, paper, or scissors.");
			game();
		}
	});
}

game();