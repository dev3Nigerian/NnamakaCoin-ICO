// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.10;

interface IOdigbo {
    /**
  Returns a token ID owned by 'owner' at a given index of its token list.
  * Used along with {balanceOf} to enumerate all of owner's token
   */
    function tokenOfOwnerByIndex(address owner, uint256 index)
        external
        view
        returns (uint256 tokenId);

    /**
  returns number of token in 'owner' account
   */
    function balanceOf(address owner) external view returns (uint256 balance);
}
