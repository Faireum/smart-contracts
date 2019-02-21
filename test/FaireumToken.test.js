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


contract('FaireumToken', ([sender, receiver, accounts, anotherAccount, recipient]) => {

    let holderMarketing;

    beforeEach(async function () {
        this.token = await FaireumToken.new();
        this.value = new BN(1);
    });

    it('has a name', async function () {
        (await this.token.name()).should.equal('Faireum Token');
    });

    it('has a symbol', async function () {
        (await this.token.symbol()).should.equal('FAIRC');
    });

    it('has 18 decimals', async function () {
        (await this.token.decimals()).should.be.bignumber.equal(decimal);
    });

    it('lock start time is Mon Mar 11 2019 00:00:00 GMT+0000', async function () {
        (await this.token.locksStartDate()).sub(time.duration.seconds(lockStart)).should.be.bignumber.equal('0')
    });

    describe('total supply', function () {

        it('the initial total supply should be zero', async function () {
            (await this.token.totalSupply()).should.be.bignumber.equal('0');
        });

        it('the default const of total supply should be (1200000000 * 10**18)', async function () {
            (await this.token.INITIAL_SUPPLY()).should.be.bignumber.equal(initialSupply);
        });

        it('the total supply after createTokensVaults should be (1200000000 * 10**18)', async function () {
            await this.token.createTokensVaults();
            (await this.token.totalSupply()).should.be.bignumber.equal(initialSupply);
        });
    });



});
