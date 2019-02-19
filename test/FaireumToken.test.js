/**
 *
 * The whole test cases for the FaireumToken.sol smart contract
 *
 * @copyright by Faireum Foundation Limited
 */

const { BN, constants, expectEvent, shouldFail, time } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const { promisify } = require('util');

const FaireumToken = artifacts.require('FaireumToken');
const decimal = '18';
const decimalBN = new BN('10').pow(new BN(decimal));
const initialSupply = new BN("1200000000").mul(decimalBN);
let balanceHolderMarketing = new BN("120000000").mul(decimalBN);
const lockStart = 1552262400;


