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

    describe('onlyAdmin', function () {

        it('allows the admin account to call onlyAdmin functions', async function () {
            await this.token.createTokensVaults({ from: sender });
        });

        it('reverts when anyone calls onlyAdmin functions', async function () {
            await shouldFail.reverting(this.token.createTokensVaults({ from: anotherAccount }));
        });
    })

    describe('token vaults', function () {

        describe('the TokensVaults before the createTokensVaults called', function () {

            it('teamAdvisorsTokensVault should not be 0x', async function () {
                (await this.token.teamAdvisorsTokensVault()).should.equal(ZERO_ADDRESS);
            });

            it('rewardPoolTokensVault should not be 0x', async function () {
                (await this.token.rewardPoolTokensVault()).should.equal(ZERO_ADDRESS);
            });

            it('foundersTokensVault should not be 0x', async function () {
                (await this.token.foundersTokensVault()).should.equal(ZERO_ADDRESS);
            });

            it('marketingAirdropTokensVault should not be 0x', async function () {
                (await this.token.marketingAirdropTokensVault()).should.equal(ZERO_ADDRESS);
            });

            it('saleTokensVault should not be 0x', async function () {
                (await this.token.saleTokensVault()).should.equal(ZERO_ADDRESS);
            });
        })


        describe('the TokensVaults after the createTokensVaults function called', function () {

            beforeEach(async function () {
                await this.token.createTokensVaults();
            });

            it('teamAdvisorsTokensVault should be 0x', async function () {
                (await this.token.teamAdvisorsTokensVault()).should.not.equal(ZERO_ADDRESS);
            });

            it('rewardPoolTokensVault should be 0x', async function () {
                (await this.token.rewardPoolTokensVault()).should.not.equal(ZERO_ADDRESS);
            });

            it('foundersTokensVault should be 0x', async function () {
                (await this.token.foundersTokensVault()).should.not.equal(ZERO_ADDRESS);
            });

            it('marketingAirdropTokensVault should be 0x', async function () {
                (await this.token.marketingAirdropTokensVault()).should.not.equal(ZERO_ADDRESS);
            });

            it('saleTokensVault should be 0x', async function () {
                (await this.token.saleTokensVault()).should.not.equal(ZERO_ADDRESS);
            });
        })

        describe('the initial TokensVaults balance after the createTokensVaults function called', function () {

            beforeEach(async function () {
                await this.token.createTokensVaults();
            });

            it('createTokensVaults function cant be called twice', async function () {
                await shouldFail.reverting(this.token.createTokensVaults());
            });

            it('teamAdvisorsTokensVault initial balance is correct', async function () {
                (await this.token.balanceOf(await this.token.teamAdvisorsTokensVault())).should.be.bignumber.equal(new BN(120000000).mul(decimalBN));
            });

            it('rewardPoolTokensVault initial balance is correct', async function () {
                (await this.token.balanceOf(await this.token.rewardPoolTokensVault())).should.be.bignumber.equal(new BN(240000000).mul(decimalBN));
            });

            it('foundersTokensVault initial balance is correct', async function () {
                (await this.token.balanceOf(await this.token.foundersTokensVault())).should.be.bignumber.equal(new BN(60000000).mul(decimalBN));
            });

            it('marketingAirdropTokensVault initial balance is correct', async function () {
                (await this.token.balanceOf(await this.token.marketingAirdropTokensVault())).should.be.bignumber.equal(new BN(120000000).mul(decimalBN));
            });

            it('saleTokensVault initial balance is correct', async function () {
                (await this.token.balanceOf(await this.token.saleTokensVault())).should.be.bignumber.equal(new BN(660000000).mul(decimalBN));
            });
        })

    });

    describe('balanceOf', function () {

        describe('the contract creator account should no tokens at the beginning', function () {
            it('returns zero', async function () {
                (await this.token.balanceOf(sender)).should.be.bignumber.equal('0');
            });
        });

        describe('the contract creator account should no tokens after createTokensVaults function called', function () {

            beforeEach(async function () {
                await this.token.createTokensVaults();
            });

            it('returns zero', async function () {
                (await this.token.balanceOf(sender)).should.be.bignumber.equal('0');
            });
        });
    });



});
