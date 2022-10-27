// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LeeTrioNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("LeeTrioNFT", "LTNT") {}

    mapping(uint256 => NFTItem) private idToNFTItem;
    mapping(address => bool) private getDefault;

    struct NFTItem {
        uint256 tokenId;
        address owner;
        uint256 price;
        bool getDefault;
        bool sell;
    }

    event NFTItemCreated(
        uint256 indexed tokenId,
        address owner,
        uint256 price,
        bool getDefault,
        bool sell
    );

    function getOwnerByTokenId(uint256 _tokenId) public view returns (address) {
        return idToNFTItem[_tokenId].owner;
    }

    function createNFTItem(
        uint256 _tokenId,
        string memory _tokenURI,
        uint256 _price,
        bool _getDefault,
        bool _sell
    ) private {
        _safeMint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        idToNFTItem[_tokenId] = NFTItem(
            _tokenId,
            payable(msg.sender),
            _price,
            _getDefault,
            _sell
        );
        _approve(msg.sender, _tokenId);
        emit NFTItemCreated(_tokenId, msg.sender, _price, _getDefault, _sell);
    }

    function mintNFT(string memory tokenURI, uint256 price) public {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        if (
            owner() == msg.sender ||
            (isApprovedForAll(owner(), msg.sender) == true &&
                getDefault[msg.sender] == true)
        ) {
            createNFTItem(tokenId, tokenURI, price, false, true);
        } else {
            _setApprovalForAll(owner(), msg.sender, true);
            getDefault[msg.sender] = true;
            createNFTItem(tokenId, tokenURI, price, true, false);
        }
    }

    function getNFTItem(uint256 tokenId, address _buyer) external {
        require(isApprovedForAll(owner(), _buyer) == true);
        require(getApproved(tokenId) != _buyer);
        require(idToNFTItem[tokenId].getDefault != true);

        address owner = idToNFTItem[tokenId].owner;
        require(idToNFTItem[tokenId].sell == true);

        _transfer(owner, _buyer, tokenId);
        _approve(_buyer, tokenId);
        idToNFTItem[tokenId].owner = _buyer;
        idToNFTItem[tokenId].sell = false;
    }

    function sellMyNFTItem(uint256 tokenId, uint256 price) public {
        require(
            isApprovedForAll(owner(), msg.sender) == true ||
                msg.sender == owner()
        );
        require(getApproved(tokenId) == msg.sender);
        require(idToNFTItem[tokenId].getDefault != true);
        if (idToNFTItem[tokenId].sell == false) {
            idToNFTItem[tokenId].price = price;
            idToNFTItem[tokenId].sell = true;
        } else {
            idToNFTItem[tokenId].price = price;
        }
    }

    function myNFTList() public view returns (NFTItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToNFTItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        NFTItem[] memory items = new NFTItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToNFTItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                NFTItem storage currentItem = idToNFTItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function changeSellState(uint256 _tokenId) public returns (bool) {
        require(
            idToNFTItem[_tokenId].owner == msg.sender &&
                idToNFTItem[_tokenId].sell == true
        );
        idToNFTItem[_tokenId].sell = false;
        return true;
    }

    function ownerSellLists() public view returns (NFTItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToNFTItem[i + 1].owner == owner()) {
                itemCount += 1;
            }
        }

        NFTItem[] memory items = new NFTItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToNFTItem[i + 1].owner == owner()) {
                uint256 currentId = i + 1;
                NFTItem storage currentItem = idToNFTItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function sellLists() public view returns (NFTItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToNFTItem[i + 1].sell == true) {
                itemCount += 1;
            }
        }

        NFTItem[] memory items = new NFTItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToNFTItem[i + 1].sell == true) {
                uint256 currentId = i + 1;
                NFTItem storage currentItem = idToNFTItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function totalNFTs() public view returns (uint256) {
        return _tokenIds.current();
    }
}
