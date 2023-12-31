const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

//__dirname is the current working directory , i.e ethereum
const buildPath = path.resolve(__dirname, "build");
//here we remove the the build folder
fs.removeSync(buildPath);

//here we read the Campaign.sol file
const campaignPath = path.resolve(__dirname, "contracts", "Voting.sol");
const source = fs.readFileSync(campaignPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Voting.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  "Voting.sol"
];

fs.ensureDirSync(buildPath);

for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(":", "") + ".json"),
    output[contract]
  );
}
