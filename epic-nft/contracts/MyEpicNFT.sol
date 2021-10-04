// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;


import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

// We need to import the helper functions from the contract that we copy/pasted.
import { Base64 } from "./libraries/Base64.sol";

/* 
*************** PLEASE READ IF CHANGING THE CODE OF THE SMART CONTRACT *****************
If changing code, need to do 3 things:
1. deploy it again.
2. update the contract address on our frontend.
3. update the abi file on our frontend.
Why do we need to do all this? Well, it's because smart contracts are immutable. 
They can't change. They're permanent. That means changing a contract requires a full redeploy. 
This will also reset all the variables since it'd be treated as a brand new contract. 
That means we'd lose all our NFT data if we wanted to update the contract's code.
****************************************************************************************
*/



contract MyEpicNFT is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  
  //split svg into two parts where it asks for background color
  string svgPartOne = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='";
  string svgPartTwo = "'/><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";
  //create three word arrays
  string[] firstWords = ["Sigma", "Wise", "Shringus", "Splendiferous", "Average", "Beta","Goofy","Devious","Unequivocable","Salacious","Heinous"];
  string[] secondWords = ["Male", "Female", "Femoid", "Goober", "Mongoloid", "Pepe", "Pogchamp"];
  string[] thirdWords = ["Grindset", "Time", "Destination", "Location", "Connoisseur", "Enthusiast", "Hater", "Lover", "Enjoyer"];


  // Declare a bunch of colors.
  string[] colors = ["red", "#08C2A8", "black", "yellow", "blue", "green", "grey", "orange", "purple", "brown"];

  event NewEpicNFTMinted(address sender, uint256 tokenId);


  constructor() ERC721 ("SquareNFT", "SQUARE") {
    console.log("This is my NFT contract. Woah!");
  }

  function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
    rand = rand % firstWords.length;
    return firstWords[rand];
  }

  function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
    rand = rand % secondWords.length;
    return secondWords[rand];
  }

  function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
    rand = rand % thirdWords.length;
    return thirdWords[rand];
  }

  // Same old stuff, pick a random color.
  function pickRandomColor(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("COLOR", Strings.toString(tokenId))));
    rand = rand % colors.length;
    return colors[rand];
  }

  function random(string memory input) internal pure returns (uint256) {
      return uint256(keccak256(abi.encodePacked(input)));
  }

  function makeAnEpicNFT() public {
    uint256 newItemId = _tokenIds.current();

    string memory first = pickRandomFirstWord(newItemId);
    string memory second = pickRandomSecondWord(newItemId);
    string memory third = pickRandomThirdWord(newItemId);
    string memory combinedWord = string(abi.encodePacked(first, second, third));

    string memory randomColor = pickRandomColor(newItemId);

    string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, combinedWord, "</text></svg>"));

    console.log(finalSvg);
    // Get all the JSON metadata in place and base64 encode it.
    string memory pre_encode = 
        string(
            abi.encodePacked(
                '{\n"name": "',
                // We set the title of our NFT as the generated word.
                combinedWord,
                '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                Base64.encode(bytes(finalSvg)),
                '"\n}'
            )
        );

    console.log("pre_encode\n");
    console.log("\n--------------------");
    console.log(pre_encode);
    console.log("--------------------\n");


    string memory json = Base64.encode(bytes(pre_encode));

    // Just like before, we prepend data:application/json;base64, to our data.
    string memory finalTokenUri = string(
        abi.encodePacked("data:application/json;base64,", json)
    );
    console.log("encoded json\n");
    console.log("\n--------------------");
    console.log(json);
    console.log("--------------------\n");

    console.log("\n--------------------");
    console.log(finalTokenUri);
    console.log("--------------------\n");

    _safeMint(msg.sender, newItemId);
    
    // Update URI
    _setTokenURI(newItemId, finalTokenUri);
  
    _tokenIds.increment();
    console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
    emit NewEpicNFTMinted(msg.sender, newItemId);
  }
}