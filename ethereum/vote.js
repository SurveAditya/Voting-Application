import web3 from "./web3";
import Voting from "./build/Voting.json";

const instance = new web3.eth.Contract(
  Voting.abi,
  "0x138C0D0F6FEBe7947E992a1BD3A94A153FfB5807"
);

export default instance;
