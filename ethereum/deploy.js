const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledVoting = require("./build/Voting.json");

const provider = new HDWalletProvider(
  "cereal test flower pelican gym squeeze pride sustain load water easy glad",
	"https://sepolia.infura.io/v3/0c0fb5ae7d3b40ed83fa9e49c829e00f"
);
const web3 = new Web3(provider);

const deploy = async () => {

  accounts = await web3.eth.getAccounts();

  result = await new web3.eth.Contract(compiledVoting.abi)
    .deploy({
      data: compiledVoting.evm.bytecode.object,
      arguments: [["Candidate 1", "Candidate 2"], 60], 
    })
    .send({ from: accounts[0], gas: "1400000" });
  console.log("Contract deployed to", result.options.address);
  provider.engine.stop();
};
deploy();
