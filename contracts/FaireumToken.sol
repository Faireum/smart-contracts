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

contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;

  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  modifier whenPaused() {
    require(paused);
    _;
  }

  function pause() onlyOwner whenNotPaused public {
    paused = true;
    emit Pause();
  }

  function unpause() onlyOwner whenPaused public {
    paused = false;
    emit Unpause();
  }
}

contract ERC20 {
  string public name;
  string public symbol;
  uint8 public decimals;
  uint256 public totalSupply;
  function balanceOf(address who) public view returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
  function allowance(address owner, address spender) public view returns (uint256);
  function transferFrom(address from, address to, uint256 value) public returns (bool);
  function approve(address spender, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract FaireumToken is Pausable,ERC20 {
  using SafeMath for uint256;

  mapping(address => uint256) balances;
  mapping(address => mapping (address => uint256)) internal allowed;

  event Burn(address indexed burner, uint256 value);

  string constant public symbol = "FAIRC";
  string constant public name = "Faireum Token";
  uint8  constant public decimals = 18;
  uint256 public totalSupply = 1200000000 * 10 ** uint(decimals);

  address privateCrowdsale = ;
  address publicCrowdsale = ;
  address beneficiary = ;
  address marketing = ;
  address company = ;
  address bounty = ;
  address game = ;
  address team = ;

  uint256 constant privateCrowdsaleTokens = ;
  uint256 constant publicCrowdsaleTokens = ;
  uint256 constant marketingTokens = ;
  uint256 constant teamTokens = ;
  uint256 constant bountyTokens = ;
  uint256 constant gameTokens = ;
  uint256 constant companyTokens = ;

  constructor() public {
    preSale(privateCrowdsale, privateCrowdsaleTokens);
    preSale(publicCrowdsale, publicCrowdsaleTokens);
    preSale(marketing, marketingTokens);
    preSale(team, teamTokens);
    preSale(bounty, bountyTokens);
    preSale(game, gameTokens);
    preSale(company, companyTokens);
  }

  function preSale(address _address, uint256 _amount) internal returns (bool) {
    balances[_address] = _amount;
    emit Transfer(address(0x0), _address, _amount);
  }

  function () public payable {
    beneficiary.transfer(msg.value);
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint256 balance) {
    return balances[_owner];
  }

  /**
  * @dev Transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) whenNotPaused public returns (bool) {
    require(_to != address(0x0), "0x0 invalid.");
    require(_value > 0, "Amount invalid.");
    require(_value <= balances[msg.sender], "Amount overflow.");

    // SafeMath.sub will throw if there is not enough balance.
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _value) whenNotPaused public returns (bool) {
    require(_to != address(0x0), "0x0 invalid.");
    require(_value > 0, "Amount invalid.");
    require(_value <= balances[_from], "Amount overflow.");
    require(_value <= allowed[_from][msg.sender], "Allowed amount overflow.");

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }

}