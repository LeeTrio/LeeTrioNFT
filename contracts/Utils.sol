// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./LeeTrioNFT.sol";
import "./LeeTrioToken.sol";

contract Utils {
    LeeTrioToken private Token;
    LeeTrioNFT private NFT;

    constructor(address TokenAddress, address NFTAddress) {
        Token = LeeTrioToken(TokenAddress);
        NFT = LeeTrioNFT(NFTAddress);
    }

    modifier checkNFT() {
        require(NFT.balanceOf(msg.sender) != 0);
        _;
    }

    event GetNFTResult(uint256 tokenId, address from, address to);

    function getNFTItem(uint256 tokenId, uint256 _cost)
        public
        checkNFT
        returns (bool)
    {
        if (checkbalance(msg.sender) > _cost) {
            address owner = NFT.getOwnerByTokenId(tokenId);
            Token.transferFrom(msg.sender, owner, _cost);
            NFT.getNFTItem(tokenId, msg.sender);
            emit GetNFTResult(tokenId, owner, msg.sender);
            return true;
        }
        return false;
    }

    function checkbalance(address _sender) private view returns (uint256) {
        return Token.balanceOf(_sender);
    }
}
