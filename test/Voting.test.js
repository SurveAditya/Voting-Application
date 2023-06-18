const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledVoting = require("../ethereum/build/Voting.json");

let accounts;
let voting;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  voting = await new web3.eth.Contract(compiledVoting.abi)
    .deploy({
      data: compiledVoting.evm.bytecode.object,
      arguments: [["Candidate 1", "Candidate 2"], 60], 
    })
    .send({ from: accounts[0], gas: "1400000" });
});

describe("Voting", () => {
  it("deploys a Voting contract", () => {
    assert.ok(voting.options.address);
  });

  it("marks caller as the manager", async () => {
    const manager = await voting.methods.owner().call();
    assert.strictEqual(manager, accounts[0]);
  });

  it("allows people to vote", async () => {

    const initialVoteCount = await voting.methods.candidates(0).call().voteCount;

    await voting.methods.vote(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    const finalVoteCount = await voting.methods.candidates(0).call().voteCount;

    assert.strictEqual(parseInt(finalVoteCount), parseInt(initialVoteCount) + 1);
    
  }
  );

  it("prevents a candidate from voting again", async () => {
    // Set up the candidate's account
    const candidateAccount = accounts[0];

    // Perform the initial vote as the candidate
    await voting.methods.vote(0).send({ from: candidateAccount });

    // Attempt to vote again as the candidate
    try {
      await voting.methods.vote(1).send({ from: candidateAccount });
      assert.fail("Expected an exception but none was thrown.");
    } catch (error) {
      assert.ok(error.message.includes("You have already voted."));
    }
  });

  it("adds a new candidate", async () => {
    const newCandidateName = "New Candidate";

    // Get the initial candidate count by retrieving all candidates
    const initialCandidates = await voting.methods.getAllVotesOfCandiates().call();
    const initialCandidateCount = initialCandidates.length;

    // Add a new candidate
    await voting.methods.addCandidate(newCandidateName).send({ from: accounts[0] });

    // Get the updated candidate count by retrieving all candidates
    const updatedCandidates = await voting.methods.getAllVotesOfCandiates().call();
    const updatedCandidateCount = updatedCandidates.length;

    // Verify that the number of candidates has increased by 1
    assert.strictEqual(updatedCandidateCount - initialCandidateCount, 1);

    // Get the details of the newly added candidate
    const newCandidate = updatedCandidates[updatedCandidateCount - 1];

    // Verify that the name of the new candidate matches the added name
    assert.strictEqual(newCandidate.name, newCandidateName);
    // Verify that the vote count of the new candidate is initialized to 0
    assert.strictEqual(newCandidate.voteCount, "0");
  });


  it("sets the votingEnd timestamp correctly", async () => {
    // Set the duration of the voting period in minutes
    const durationInMinutes = 60;

    // Get the voting start and end timestamps
    const votingStart = await voting.methods.votingStart().call();
    const votingEnd = await voting.methods.votingEnd().call();

    // Calculate the expected voting end timestamp based on the voting start timestamp and the duration
    const expectedVotingEnd = parseInt(votingStart) + (durationInMinutes * 60);

    // Verify that the votingEnd timestamp is set correctly
    assert.strictEqual(parseInt(votingEnd), expectedVotingEnd);
  });

});




