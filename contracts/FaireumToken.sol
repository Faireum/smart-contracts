pragma solidity ^0.4.22;

library SafeMath {

  /**
  * @dev Multiplies overflow validation.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Divisions overflow validation.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a / b;
    return c;
  }

  /**
  * @dev Substracts overflow validation.
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds overflow validation.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract Ownable {
  address public owner;

  event OwnershipTransferred(address indexed owner, address indexed newOwner);

  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Only allows called by the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner, "Owner is necessary.");
    _;
  }

  /**
   * @dev Transfer ownership of the contract to a newOwner.
   * @param newOwner The address of new ownership.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0x0), "0x0 invalid.");
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

