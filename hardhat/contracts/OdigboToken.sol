// SPDX-License-Identifier: Apache
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IOdigbo.sol";

contract OdigboToken is ERC20, Ownable {
    // Price of one Odigbo token
    uint256 public constant tokenPrice = 0.002 ether;
    // Amount of token each user receives per NFT
    uint256 public constant tokensPerNFT = 10 * 10**18;
    // Total max supply for Odigbo token
    uint256 public constant maxTotalSupply = 10000 * 10**18;
    // OdigboNFT contract instance
    IOdigbo OdigboNFT;
    // mapping to keep track of which tokenIds have been claimed
    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _odigboContract) ERC20("Odigbo Token", "ODT") {
        OdigboNFT = IOdigbo(_odigboContract);
    }

    function mint(uint256 amount) public payable {
        // ether value should be >= than tokenPrice * amount
        uint256 _requiredAmount = tokenPrice * amount;
        require(msg.value >= _requiredAmount, "Ether sent is not correct");
        // total tokens + amount <= 10,000 otherwise revert
        uint256 amountWithDecimals = amount * 10**18;
        require(
            (totalSupply() + amountWithDecimals) <= maxTotalSupply,
            "Exceeds the max total supply available."
        );

        _mint(msg.sender, amountWithDecimals);
    }

    function claim() public {
        address sender = msg.sender;
        // gets number of OdigboNFT held by a single address
        uint256 balance = OdigboNFT.balanceOf(sender);
        require(balance > 0, "You dont own any OdigboNFT");

        // amount keeps track of number of unclaimed tokenIds
        uint256 amount = 0;
        // loop over balance and get token ID owned by sender at index
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = OdigboNFT.tokenOfOwnerByIndex(sender, i);
            if (!tokenIdsClaimed[tokenId]) {
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }

        require(amount > 0, "You have claimed all the tokens");
        _mint(msg.sender, amount * tokensPerNFT);
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {}

    fallback() external payable {}
}
