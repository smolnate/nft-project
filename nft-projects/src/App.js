import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const GITHUB_LINK = `https://github.com/smolnate`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
//change this every time we redeploy the smart contract onto the blockchain
const CONTRACT_ADDRESS = "0xaF7f964Fdc0D96707dEeD6EBe9e2f1122F325F96";

const App = () => {

  //state variable to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");


  /*
    in order for our website to talk to the blockchain, we need to somehow connect our wallet to it. once we connect our wallet to our website, our website will have permission to call smart contracts on our behalf
  */
  const checkIfWalletIsConnected = async () => {
    /*make sure we have access to window.ethereum. if logged into
    metamask, it will automatically inject an object called 
    'ethereum' into the window
    */ 
    const { ethereum } = window; 
    if (!ethereum) {
      console.log("Make sure you have MetaMask installed");
      return;
    } 
    else {
      console.log("We have the ethereum object: ", ethereum);
    }

    //check if we have wallet authorization
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    //grab first authorized account
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
      //set up the listener- in case user comes to our site
      //and already had wallet connected + authorized
      setupEventListener()
    }
    else {
      console.log("No authorized account found");
    }
  }

  //log in to the wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("GET METAMASK STOP BEING LAZY!");
        return;
      }

      //request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      //print out public address once metamask is authorized
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      //set up listener- in case user comes to our site
      //and connected wallet for first time
      setupEventListener()

    } catch (error) {
      console.log(error);
    }
  }

  //Set up the listener in this function
  const setupEventListener = async () => {
  // Most of this looks the same as askContractToMintNft
  try {
    const { ethereum } = window;

    if (ethereum) {
      // Same stuff again
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      // THIS IS THE MAGIC SAUCE.
      // This will essentially "capture" our event when our contract throws it.
      // very similar to webhooks
      connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        alert(`Hey! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
      });

      console.log("Setup event listener!")

    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  }
}
  //call makeAnEpicNFT inside smart contract from the web app
  const askContractToMintNFT = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        //create provider to talk to ethereum nodes
        const provider = new ethers.providers.Web3Provider(ethereum);
        //signer is abstraction of ethereum account
        //used to sign msgs and txns and send signed txns to eth network to
        //execute state operations
        // this line creates the connection to our contract
        // need 3 things to communicate to contract:
        // contract address, abi file, signer
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        //call contract
        console.log("popping wallet to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        //wait for it to be mined
        alert("Hey! We are currently mining your NFT which may take 10-15 seconds. Please be patient!");
        console.log("Mining... please wait");
        await nftTxn.wait();
        //link etherscan url
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      }
      else {
        console.log("ethereum object does not exist!");
      }
    } catch (error) {
        console.log(error)
    }
     
  }

  //run function when page loads
  useEffect(() => {
    checkIfWalletIsConnected(); 
  }, [])

  // Render Methods

  //simple onClick
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  //make button disappear once wallet is connected
  const renderMintUI = () => (
    <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button"> Mint NFT </button>
  )

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={GITHUB_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by Nathan Yu`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
