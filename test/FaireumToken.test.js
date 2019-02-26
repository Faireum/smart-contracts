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

    describe('lock balance', function () {

        beforeEach(async function () {
            await this.token.createTokensVaults();
        });

        describe('lock all of the balance', function () {

            describe('all of the rewardPoolTokensVault tokens can be locked correctly', function () {

                beforeEach(async function () {
                    this.address = await this.token.rewardPoolTokensVault();
                    this.balance = await this.token.balanceOf(this.address);
                    const { logs } = await this.token.lockRewardPoolTokens(sender, this.balance);
                    this.logs = logs;
                });

                it('locked balance correct', async function () {
                    (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(this.balance)
                })

                it('the holder\'s balance correct', async function () {
                    (await this.token.balanceOf(sender)).should.be.bignumber.equal(this.balance)
                })

                it('teamAdvisorsTokensVault balance correct', async function () {
                    (await this.token.balanceOf(this.address)).should.be.bignumber.equal('0')
                })

                // Because of the limited of the truffle cases and service, only can catch one Event with same name in the logs
                it('emits Approval event', async function () {
                    const event = expectEvent.inLogs(this.logs, 'Approval', {
                        owner: this.address,
                        spender: this.token.address,
                    });

                    event.args.value.should.be.bignumber.equal('0');
                });

                it('emits Transfer event', async function () {
                    const event = expectEvent.inLogs(this.logs, 'Transfer', {
                        from: this.address,
                        to: sender,
                    });

                    event.args.value.should.be.bignumber.equal(this.balance);
                });

            })

            describe('all of the foundersTokensVault tokens can be locked correctly', function () {

                beforeEach(async function () {
                    this.address = await this.token.foundersTokensVault();
                    this.balance = await this.token.balanceOf(this.address);
                    const { logs } = await this.token.lockFoundersTokens(sender, this.balance);
                    this.logs = logs;
                });

                it('locked balance correct', async function () {
                    (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(this.balance);
                })

                it('the holder\'s balance correct', async function () {
                    (await this.token.balanceOf(sender)).should.be.bignumber.equal(this.balance);
                })

                it('teamAdvisorsTokensVault balance correct', async function () {
                    (await this.token.balanceOf(this.address)).should.be.bignumber.equal('0')
                })

                it('emits Approval event', async function () {
                    const event = expectEvent.inLogs(this.logs, 'Approval', {
                        owner: this.address,
                        spender: this.token.address,
                    });

                    event.args.value.should.be.bignumber.equal('0');
                });

                it('emits Transfer event', async function () {
                    const event = expectEvent.inLogs(this.logs, 'Transfer', {
                        from: this.address,
                        to: sender,
                    });

                    event.args.value.should.be.bignumber.equal(this.balance);
                });

            })

            describe('all of the teamAdvisorsTokensVault tokens can be locked correctly with a even number', function () {

                beforeEach(async function () {
                    this.address = await this.token.teamAdvisorsTokensVault();
                    this.balance = await this.token.balanceOf(this.address);
                    const { logs } = await this.token.lockTeamTokens(sender, this.balance);
                    this.logs = logs;
                });

                it('locked balance correct', async function () {
                    (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(this.balance)
                })

                it('the holder\'s balance correct', async function () {
                    (await this.token.balanceOf(sender)).should.be.bignumber.equal(this.balance)
                })

                it('teamAdvisorsTokensVault balance correct', async function () {
                    (await this.token.balanceOf(this.address)).should.be.bignumber.equal('0')
                })

                it('emits Approval event of the 1st half part', async function () {
                    const event = expectEvent.inLogs(this.logs, 'Approval', {
                        value: new BN(this.balance.divn(2))
                    })
                });

                it('emits Transfer event of the 1st half part', async function () {
                    expectEvent.inLogs(this.logs, 'Transfer', {
                        from: this.address,
                        to: sender,
                        value: this.balance.divn(2),
                    });
                });
            })


            it('lock teamAdvisorsTokensVault with a odd number', async function () {
                const address = await this.token.teamAdvisorsTokensVault();
                const balance = await this.token.balanceOf(address);
                await shouldFail.reverting(this.token.lockTeamTokens(sender, balance.subn(1)));
            })

        });

        describe('can\'t be locked over balance', function () {

            it('rewardPoolTokensVault', async function () {
                const address = await this.token.rewardPoolTokensVault();
                const balance = await this.token.balanceOf(address);
                await shouldFail.reverting(this.token.lockRewardPoolTokens(sender, balance.addn(1)));
            })

            it('foundersTokensVault', async function () {
                const address = await this.token.foundersTokensVault();
                const balance = await this.token.balanceOf(address);
                await shouldFail.reverting(this.token.lockFoundersTokens(sender, balance.addn(1)));
            })

            it('teamAdvisorsTokensVault', async function () {
                const address = await this.token.teamAdvisorsTokensVault();
                const balance = await this.token.balanceOf(address);
                await shouldFail.reverting(this.token.lockTeamTokens(sender, balance.addn(2)));
            })

        });

        describe('can lock the tokens multi-twice', function () {

            it('rewardPoolTokensVault', async function () {
                const address = await this.token.rewardPoolTokensVault();
                const balance = await this.token.balanceOf(address);
                await this.token.lockRewardPoolTokens(sender, balance.subn(1));
                await this.token.lockRewardPoolTokens(sender, new BN(1));
                (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(balance)
            })


            it('foundersTokensVault', async function () {
                const address = await this.token.foundersTokensVault();
                const balance = await this.token.balanceOf(address);
                await this.token.lockFoundersTokens(sender, balance.subn(1));
                await this.token.lockFoundersTokens(sender, new BN(1));
                (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(balance)
            })

            it('teamAdvisorsTokensVault', async function () {
                const address = await this.token.teamAdvisorsTokensVault();
                const balance = await this.token.balanceOf(address);
                await this.token.lockTeamTokens(sender, balance.subn(2));
                await this.token.lockTeamTokens(sender, new BN(2));
                (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(balance)
            })

        });

    })

    describe('unlock tokens', function () {

        beforeEach(async function () {
            await this.token.createTokensVaults();
        });

        describe('all of the tokens can be approved correctly', function () {

            it('saleTokensVault', async function () {
                const address = await this.token.saleTokensVault();
                const balance = await this.token.balanceOf(address);
                await this.token.approveSaleSpender(sender, balance);
                (await this.token.allowance(address, sender)).should.be.bignumber.equal(balance)
            })

            it('marketingAirdropTokensVault', async function () {
                const address = await this.token.marketingAirdropTokensVault();
                const balance = await this.token.balanceOf(address);
                await this.token.approveMarketingSpender(sender, balance);
                (await this.token.allowance(address, sender)).should.be.bignumber.equal(balance)
            })

        });

        /*describe('all of the tokens can\'t be approved over balance', function () {

            it('saleTokensVault', async function () {
                const address = await this.token.saleTokensVault();
                const balance = await this.token.balanceOf(address);
                await shouldFail.reverting(this.token.approveSaleSpender(sender, balance.addn(1)));
            })

            it('marketingAirdropTokensVault', async function () {
                const address = await this.token.marketingAirdropTokensVault();
                const balance = await this.token.balanceOf(address);
                await shouldFail.reverting(this.token.approveMarketingSpender(sender, balance.addn(1)));
            })

        });*/

        describe('approved holder can transfer from the tokens', function () {

            describe('saleTokensVault balance', function () {
                it('should set to zero', async function () {
                    const address = await this.token.saleTokensVault();
                    const balance = await this.token.balanceOf(address);
                    await this.token.approveSaleSpender(sender, balance);
                    await this.token.transferFrom(address, sender, balance, {from: sender});
                    (await this.token.balanceOf(address)).should.be.bignumber.equal('0');
                })

                it('approved account balance should be transferred', async function () {
                    const address = await this.token.saleTokensVault();
                    const balance = await this.token.balanceOf(address);
                    await this.token.approveSaleSpender(sender, balance);
                    await this.token.transferFrom(address, sender, balance, {from: sender});
                    (await this.token.balanceOf(sender)).should.be.bignumber.equal(balance);
                })
            })


            describe('marketingAirdropTokensVault balance', function () {
                it('marketingAirdropTokensVault balance should set to zero', async function () {
                    const address = await this.token.marketingAirdropTokensVault();
                    const balance = await this.token.balanceOf(address);
                    await this.token.approveMarketingSpender(sender, balance);
                    await this.token.transferFrom(address, sender, balance);
                    (await this.token.balanceOf(address)).should.be.bignumber.equal('0');
                })

                it('marketingAirdropTokensVault approved account balance should be transferred', async function () {
                    const address = await this.token.marketingAirdropTokensVault();
                    const balance = await this.token.balanceOf(address);
                    await this.token.approveMarketingSpender(sender, balance);
                    await this.token.transferFrom(address, sender, balance);
                    (await this.token.balanceOf(sender)).should.be.bignumber.equal(balance);
                })
            })


        });

        describe('others can\'t transfer from the approved tokens', function () {

            it('saleTokensVault', async function () {
                const address = await this.token.saleTokensVault();
                const balance = await this.token.balanceOf(address);
                await this.token.approveSaleSpender(sender, balance);
                await shouldFail.reverting(this.token.transferFrom(address, anotherAccount, new BN(1), {from: anotherAccount}));
            })

            it('marketingAirdropTokensVault', async function () {
                const address = await this.token.marketingAirdropTokensVault();
                const balance = await this.token.balanceOf(address);
                await this.token.approveMarketingSpender(sender, balance);
                await shouldFail.reverting(this.token.transferFrom(address, anotherAccount, new BN(1), {from: anotherAccount}));
            })

        });

    })

    describe('the basic ERC20 testing', function () {

        beforeEach(async function () {
            await this.token.createTokensVaults();

            //allocation of the marketing part
            holderMarketing = accounts;
            const addressMarketing = await this.token.marketingAirdropTokensVault();
            const balanceMarketing = await this.token.balanceOf(addressMarketing);
            await this.token.approveMarketingSpender(holderMarketing, balanceMarketing);
            await this.token.transferFrom(addressMarketing, holderMarketing, balanceMarketing, {from: holderMarketing});
            balanceHolderMarketing = await this.token.balanceOf(holderMarketing);

        });

        describe('transfer', function () {
            describe('when the recipient is not the zero address', function () {

                describe('when the sender does not have enough balance', function () {

                    it('reverts', async function () {
                        const amount = balanceHolderMarketing.addn(1);
                        await shouldFail.reverting(this.token.transfer(receiver, amount, { from: holderMarketing }));
                    });
                });

                describe('when the sender has enough balance', function () {
                    const amount = balanceHolderMarketing;

                    it('transfers the requested amount', async function () {
                        await this.token.transfer(receiver, balanceHolderMarketing, { from: holderMarketing });

                        (await this.token.balanceOf(holderMarketing)).should.be.bignumber.equal('0');

                        (await this.token.balanceOf(receiver)).should.be.bignumber.equal(balanceHolderMarketing);
                    });

                    it('emits a transfer event', async function () {
                        const { logs } = await this.token.transfer(receiver, balanceHolderMarketing, { from: holderMarketing });

                        expectEvent.inLogs(logs, 'Transfer', {
                            from: holderMarketing,
                            to: receiver,
                            value: balanceHolderMarketing,
                        });
                    });
                });
            });

            describe('when the recipient is the zero address', function () {
                const to = ZERO_ADDRESS;

                it('reverts', async function () {
                    await shouldFail.reverting(this.token.transfer(to, balanceHolderMarketing, { from: holderMarketing }));
                });
            });
        });

        describe('approve', function () {
            describe('when the spender is not the zero address', function () {
                const spender = recipient;

                describe('when the sender has enough balance', function () {

                    it('emits an approval event', async function () {
                        const { logs } = await this.token.approve(spender, balanceHolderMarketing, { from: holderMarketing });

                        expectEvent.inLogs(logs, 'Approval', {
                            owner: holderMarketing,
                            spender: spender,
                            value: balanceHolderMarketing,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.approve(spender, balanceHolderMarketing, { from: holderMarketing });

                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal(balanceHolderMarketing);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: holderMarketing });
                        });

                        it('approves the requested amount and replaces the previous one', async function () {
                            await this.token.approve(spender, balanceHolderMarketing, { from: holderMarketing });

                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal(balanceHolderMarketing);
                        });
                    });
                });

                describe('when the sender does not have enough balance', function () {

                    it('emits an approval event', async function () {
                        const { logs } = await this.token.approve(spender, balanceHolderMarketing.addn(1), { from: holderMarketing });

                        expectEvent.inLogs(logs, 'Approval', {
                            owner: holderMarketing,
                            spender: spender,
                            value: balanceHolderMarketing.addn(1),
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.approve(spender, balanceHolderMarketing.addn(1), { from: holderMarketing });

                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal(balanceHolderMarketing.addn(1));
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: holderMarketing });
                        });

                        it('approves the requested amount and replaces the previous one', async function () {
                            await this.token.approve(spender, balanceHolderMarketing.addn(1), { from: holderMarketing });

                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal(balanceHolderMarketing.addn(1));
                        });
                    });
                });
            });

            describe('when the spender is the zero address', function () {
                const spender = ZERO_ADDRESS;

                it('reverts', async function () {
                    await shouldFail.reverting(this.token.approve(spender, balanceHolderMarketing, { from: holderMarketing }));
                });
            });
        });

        describe('transfer from', function () {
            const spender = recipient;

            describe('when the recipient is not the zero address', function () {
                const to = anotherAccount;

                describe('when the spender has enough approved balance', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, balanceHolderMarketing, { from: holderMarketing });
                    });

                    describe('when the initial holder has enough balance', function () {

                        it('transfers the requested amount', async function () {
                            await this.token.transferFrom(holderMarketing, to, balanceHolderMarketing, { from: spender });

                            (await this.token.balanceOf(holderMarketing)).should.be.bignumber.equal('0');

                            (await this.token.balanceOf(to)).should.be.bignumber.equal(balanceHolderMarketing);
                        });

                        it('decreases the spender allowance', async function () {
                            await this.token.transferFrom(holderMarketing, to, balanceHolderMarketing, { from: spender });

                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal('0');
                        });

                        it('emits a transfer event', async function () {
                            const { logs } = await this.token.transferFrom(holderMarketing, to, balanceHolderMarketing, { from: spender });

                            expectEvent.inLogs(logs, 'Transfer', {
                                from: holderMarketing,
                                to: to,
                                value: balanceHolderMarketing,
                            });
                        });

                        it('emits an approval event', async function () {
                            const { logs } = await this.token.transferFrom(holderMarketing, to, balanceHolderMarketing, { from: spender });

                            expectEvent.inLogs(logs, 'Approval', {
                                owner: holderMarketing,
                                spender: spender,
                                value: await this.token.allowance(holderMarketing, spender),
                            });
                        });
                    });

                    describe('when the initial holder does not have enough balance', function () {

                        it('reverts', async function () {
                            await shouldFail.reverting(this.token.transferFrom(holderMarketing, to, balanceHolderMarketing.addn(1), { from: spender }));
                        });
                    });
                });

                describe('when the spender does not have enough approved balance', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, balanceHolderMarketing.subn(1), { from: holderMarketing });
                    });

                    describe('when the initial holder has enough balance', function () {

                        it('reverts', async function () {
                            await shouldFail.reverting(this.token.transferFrom(holderMarketing, to, balanceHolderMarketing, { from: spender }));
                        });
                    });

                    describe('when the initial holder does not have enough balance', function () {

                        it('reverts', async function () {
                            await shouldFail.reverting(this.token.transferFrom(holderMarketing, to, balanceHolderMarketing.addn(1), { from: spender }));
                        });
                    });
                });
            });

            describe('when the recipient is the zero address', function () {
                const to = ZERO_ADDRESS;

                beforeEach(async function () {
                    await this.token.approve(spender, balanceHolderMarketing, { from: holderMarketing });
                });

                it('reverts', async function () {
                    await shouldFail.reverting(this.token.transferFrom(holderMarketing, to, balanceHolderMarketing, { from: spender }));
                });
            });
        });

        describe('decrease allowance', function () {
            describe('when the spender is not the zero address', function () {
                const spender = recipient;

                function shouldDecreaseApproval (amount) {
                    describe('when there was no approved amount before', function () {
                        it('reverts', async function () {
                            await shouldFail.reverting(this.token.decreaseAllowance(spender, amount, { from: holderMarketing }));
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        const approvedAmount = amount;

                        beforeEach(async function () {
                            ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: holderMarketing }));
                        });

                        it('emits an approval event', async function () {
                            const { logs } = await this.token.decreaseAllowance(spender, approvedAmount, { from: holderMarketing });

                            expectEvent.inLogs(logs, 'Approval', {
                                owner: holderMarketing,
                                spender: spender,
                                value: new BN(0),
                            });
                        });

                        it('decreases the spender allowance subtracting the requested amount', async function () {
                            await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: holderMarketing });

                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal('1');
                        });

                        it('sets the allowance to zero when all allowance is removed', async function () {
                            await this.token.decreaseAllowance(spender, approvedAmount, { from: holderMarketing });
                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal('0');
                        });

                        it('reverts when more than the full allowance is removed', async function () {
                            await shouldFail.reverting(
                                this.token.decreaseAllowance(spender, approvedAmount.addn(1), { from: holderMarketing })
                            );
                        });
                    });
                }

                describe('when the sender has enough balance', function () {
                    const amount = balanceHolderMarketing;

                    shouldDecreaseApproval(amount);
                });

                describe('when the sender does not have enough balance', function () {
                    const amount = balanceHolderMarketing.addn(1);

                    shouldDecreaseApproval(amount);
                });
            });

            describe('when the spender is the zero address', function () {
                const amount = balanceHolderMarketing;
                const spender = ZERO_ADDRESS;

                it('reverts', async function () {
                    await shouldFail.reverting(this.token.decreaseAllowance(spender, amount, { from: holderMarketing }));
                });
            });
        });

        describe('increase allowance', function () {
            const amount = balanceHolderMarketing;

            describe('when the spender is not the zero address', function () {
                const spender = recipient;

                describe('when the sender has enough balance', function () {
                    it('emits an approval event', async function () {
                        const { logs } = await this.token.increaseAllowance(spender, amount, { from: holderMarketing });

                        expectEvent.inLogs(logs, 'Approval', {
                            owner: holderMarketing,
                            spender: spender,
                            value: amount,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: holderMarketing });

                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal(amount);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: holderMarketing });
                        });

                        it('increases the spender allowance adding the requested amount', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: holderMarketing });

                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal(amount.addn(1));
                        });
                    });
                });

                describe('when the sender does not have enough balance', function () {
                    const amount = initialSupply.addn(1);

                    it('emits an approval event', async function () {
                        const { logs } = await this.token.increaseAllowance(spender, amount, { from: holderMarketing });

                        expectEvent.inLogs(logs, 'Approval', {
                            owner: holderMarketing,
                            spender: spender,
                            value: amount,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: holderMarketing });

                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal(amount);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: holderMarketing });
                        });

                        it('increases the spender allowance adding the requested amount', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: holderMarketing });

                            (await this.token.allowance(holderMarketing, spender)).should.be.bignumber.equal(amount.addn(1));
                        });
                    });
                });
            });

            describe('when the spender is the zero address', function () {
                const spender = ZERO_ADDRESS;

                it('reverts', async function () {
                    await shouldFail.reverting(this.token.increaseAllowance(spender, amount, { from: holderMarketing }));
                });
            });
        });

        describe('_burn', function () {
            /*it('rejects a null account', async function () {
                await shouldFail.reverting(this.token.burn(new BN(1), {from: ZERO_ADDRESS}));
            });*/

            describe('for a non null account', function () {
                it('rejects burning more than balance', async function () {
                    await shouldFail.reverting(this.token.burn(balanceHolderMarketing.addn(1)), {from: holderMarketing});
                });

                const describeBurn = function (description, amount) {
                    describe(description, function () {
                        beforeEach('burning', async function () {
                            const { logs } = await this.token.burn(amount, {from: holderMarketing});
                            this.logs = logs;
                        });

                        it('decrements totalSupply', async function () {
                            const expectedSupply = initialSupply.sub(amount);
                            (await this.token.totalSupply()).should.be.bignumber.equal(expectedSupply);
                        });

                        it('decrements holderMarketing balance', async function () {
                            const expectedBalance = balanceHolderMarketing.sub(amount);
                            (await this.token.balanceOf(holderMarketing)).should.be.bignumber.equal(expectedBalance);
                        });

                        it('emits Transfer event', async function () {
                            const event = expectEvent.inLogs(this.logs, 'Transfer', {
                                from: holderMarketing,
                                to: ZERO_ADDRESS,
                            });

                            event.args.value.should.be.bignumber.equal(amount);
                        });
                    });
                };

                describeBurn('for entire balance', balanceHolderMarketing);
                describeBurn('for less amount than balance', balanceHolderMarketing.subn(1));
            });
        });

    })


    // - Begin AdminRole test cases -
    // Added at 2019.01.24 - by Eric
    describe('the admin role allocation', function() {

        it('the contract creator is the beginning admin', async function () {
            (await this.token.isAdmin(sender)).should.equal(true);
        })

        it('the others is not a admin', async function () {
            (await this.token.isAdmin(anotherAccount)).should.equal(false);
        })

        it('the admin can add another admin', async function () {
            (await this.token.addAdmin(anotherAccount));
            (await this.token.isAdmin(anotherAccount)).should.equal(true);
        })

        it('only admin can add another admin', async function () {
            await shouldFail.reverting(this.token.addAdmin(anotherAccount, {from: receiver}));
        })

        it('the admin can be renounced by himself', async function () {
            (await this.token.renounceAdmin());
            (await this.token.isAdmin(sender)).should.equal(false);
        })
    })
    // - End AdminRole test cases -

    // - Begin recoverERC20Tokens test cases -
    // Added at 2019.01.24 - by Eric
    describe('recoverERC20Tokens', function() {

        beforeEach(async function () {
            this.erc20 = await FaireumToken.new();

            await this.erc20.createTokensVaults();

            //allocation of the marketing part
            const addressMarketing = await this.erc20.marketingAirdropTokensVault();
            const balanceMarketing = await this.erc20.balanceOf(addressMarketing);
            await this.erc20.approveMarketingSpender(sender, balanceMarketing);
            await this.erc20.transferFrom(addressMarketing, this.token.address, new BN('1'));

        });

        it('the contract holds a correct value of erc20 tokens', async function () {
            (await this.erc20.balanceOf(this.token.address)).should.be.bignumber.equal('1');
        })

        it('the erc20 in the contract can be recovered by admin', async function () {
            (await this.token.recoverERC20Tokens(this.erc20.address));
            (await this.erc20.balanceOf(sender)).should.be.bignumber.equal('1');
        })

        it('the erc20 in the contract can\'t be recovered by non-admin', async function () {
            await shouldFail.reverting(this.token.recoverERC20Tokens(this.erc20.address, {from: anotherAccount}));
        })

    })
    // - End recoverERC20Tokens test cases -

    // - Begin lockable test cases -
    // Added at 2019.01.24 - by Eric
    // use one part of locked balance vault of teamAdvisor is enough for full cases of lock balance testing
    // !! ATTENTION !!
    // !! ATTENTION !!
    // Because of the issues of truffle can't revert the snapshot of blockchain timestamp once "evm_increaseTime" RPC function has been called
    // So we should reopen the Ganache or clear the cache of blockchain before run test cases to ensure the time of blocks are right.
    describe('the locked balance can be transferred time points', function() {

        beforeEach(async function () {
            this.address = await this.token.teamAdvisorsTokensVault();
            this.balance = await this.token.balanceOf(this.address);
            const { logs } = await this.token.lockTeamTokens(sender, this.balance);
            this.logs = logs;
        });

        it('locked balance can\'t be transferred before unlock time point', async function () {
            await shouldFail.reverting(this.token.transfer(anotherAccount, new BN(1)));
        })

        //TODO Please read the annotation for these cases for lockable testing
        it('locked balance can\'t be transferred over a half after 6 months(182 days) later', async function () {

            // await promisify(web3.currentProvider.send)({ jsonrpc: "2.0", method: "evm_snapshot", id: 100 });
            // await time.advanceBlock();

            const now = time.duration.seconds(lockStart).add(time.duration.days(182));
            await time.increaseTo(now);
            await shouldFail.reverting(this.token.transfer(anotherAccount, this.balance.divn(2).addn(1)));

            // await promisify(web3.currentProvider.send)({ jsonrpc: '2.0', method: 'evm_revert' });
            // await time.advanceBlock();
        })

        it('locked balance can be transferred a half after 6 months(182 days) later', async function () {
            // The blockchain timestamp has already be set to 182 days after lockstarts date
            await this.token.transfer(anotherAccount, this.balance.divn(2));
            (await this.token.balanceOf(sender)).should.be.bignumber.equal(this.balance.divn(2));
        })
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
                    await this.token.createTokensVaults({from: sender});
                });

                it('reverts when anyone calls onlyAdmin functions', async function () {
                    await shouldFail.reverting(this.token.createTokensVaults({from: anotherAccount}));
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

            describe('lock balance', function () {

                beforeEach(async function () {
                    await this.token.createTokensVaults();
                });

                describe('lock all of the balance', function () {

                    describe('all of the rewardPoolTokensVault tokens can be locked correctly', function () {

                        beforeEach(async function () {
                            this.address = await this.token.rewardPoolTokensVault();
                            this.balance = await this.token.balanceOf(this.address);
                            const {logs} = await this.token.lockRewardPoolTokens(sender, this.balance);
                            this.logs = logs;
                        });

                        it('locked balance correct', async function () {
                            (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(this.balance)
                        })

                        it('the holder\'s balance correct', async function () {
                            (await this.token.balanceOf(sender)).should.be.bignumber.equal(this.balance)
                        })

                        it('teamAdvisorsTokensVault balance correct', async function () {
                            (await this.token.balanceOf(this.address)).should.be.bignumber.equal('0')
                        })

                        // Because of the limited of the truffle cases and service, only can catch one Event with same name in the logs
                        it('emits Approval event', async function () {
                            const event = expectEvent.inLogs(this.logs, 'Approval', {
                                owner: this.address,
                                spender: this.token.address,
                            });

                            event.args.value.should.be.bignumber.equal('0');
                        });

                        it('emits Transfer event', async function () {
                            const event = expectEvent.inLogs(this.logs, 'Transfer', {
                                from: this.address,
                                to: sender,
                            });

                            event.args.value.should.be.bignumber.equal(this.balance);
                        });

                    })

                    describe('all of the foundersTokensVault tokens can be locked correctly', function () {

                        beforeEach(async function () {
                            this.address = await this.token.foundersTokensVault();
                            this.balance = await this.token.balanceOf(this.address);
                            const {logs} = await this.token.lockFoundersTokens(sender, this.balance);
                            this.logs = logs;
                        });

                        it('locked balance correct', async function () {
                            (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(this.balance);
                        })

                        it('the holder\'s balance correct', async function () {
                            (await this.token.balanceOf(sender)).should.be.bignumber.equal(this.balance);
                        })

                        it('teamAdvisorsTokensVault balance correct', async function () {
                            (await this.token.balanceOf(this.address)).should.be.bignumber.equal('0')
                        })

                        it('emits Approval event', async function () {
                            const event = expectEvent.inLogs(this.logs, 'Approval', {
                                owner: this.address,
                                spender: this.token.address,
                            });

                            event.args.value.should.be.bignumber.equal('0');
                        });

                        it('emits Transfer event', async function () {
                            const event = expectEvent.inLogs(this.logs, 'Transfer', {
                                from: this.address,
                                to: sender,
                            });

                            event.args.value.should.be.bignumber.equal(this.balance);
                        });

                    })

                    describe('all of the teamAdvisorsTokensVault tokens can be locked correctly with a even number', function () {

                        beforeEach(async function () {
                            this.address = await this.token.teamAdvisorsTokensVault();
                            this.balance = await this.token.balanceOf(this.address);
                            const {logs} = await this.token.lockTeamTokens(sender, this.balance);
                            this.logs = logs;
                        });

                        it('locked balance correct', async function () {
                            (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(this.balance)
                        })

                        it('the holder\'s balance correct', async function () {
                            (await this.token.balanceOf(sender)).should.be.bignumber.equal(this.balance)
                        })

                        it('teamAdvisorsTokensVault balance correct', async function () {
                            (await this.token.balanceOf(this.address)).should.be.bignumber.equal('0')
                        })

                        it('emits Approval event of the 1st half part', async function () {
                            const event = expectEvent.inLogs(this.logs, 'Approval', {
                                value: new BN(this.balance.divn(2))
                            })
                        });

                        it('emits Transfer event of the 1st half part', async function () {
                            expectEvent.inLogs(this.logs, 'Transfer', {
                                from: this.address,
                                to: sender,
                                value: this.balance.divn(2),
                            });
                        });
                    })


                    it('lock teamAdvisorsTokensVault with a odd number', async function () {
                        const address = await this.token.teamAdvisorsTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await shouldFail.reverting(this.token.lockTeamTokens(sender, balance.subn(1)));
                    })

                });

                describe('can\'t be locked over balance', function () {

                    it('rewardPoolTokensVault', async function () {
                        const address = await this.token.rewardPoolTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await shouldFail.reverting(this.token.lockRewardPoolTokens(sender, balance.addn(1)));
                    })

                    it('foundersTokensVault', async function () {
                        const address = await this.token.foundersTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await shouldFail.reverting(this.token.lockFoundersTokens(sender, balance.addn(1)));
                    })

                    it('teamAdvisorsTokensVault', async function () {
                        const address = await this.token.teamAdvisorsTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await shouldFail.reverting(this.token.lockTeamTokens(sender, balance.addn(2)));
                    })

                });

                describe('can lock the tokens multi-twice', function () {

                    it('rewardPoolTokensVault', async function () {
                        const address = await this.token.rewardPoolTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await this.token.lockRewardPoolTokens(sender, balance.subn(1));
                        await this.token.lockRewardPoolTokens(sender, new BN(1));
                        (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(balance)
                    })


                    it('foundersTokensVault', async function () {
                        const address = await this.token.foundersTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await this.token.lockFoundersTokens(sender, balance.subn(1));
                        await this.token.lockFoundersTokens(sender, new BN(1));
                        (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(balance)
                    })

                    it('teamAdvisorsTokensVault', async function () {
                        const address = await this.token.teamAdvisorsTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await this.token.lockTeamTokens(sender, balance.subn(2));
                        await this.token.lockTeamTokens(sender, new BN(2));
                        (await this.token.lockedBalanceOf(sender)).should.be.bignumber.equal(balance)
                    })

                });

            })

            describe('unlock tokens', function () {

                beforeEach(async function () {
                    await this.token.createTokensVaults();
                });

                describe('all of the tokens can be approved correctly', function () {

                    it('saleTokensVault', async function () {
                        const address = await this.token.saleTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await this.token.approveSaleSpender(sender, balance);
                        (await this.token.allowance(address, sender)).should.be.bignumber.equal(balance)
                    })

                    it('marketingAirdropTokensVault', async function () {
                        const address = await this.token.marketingAirdropTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await this.token.approveMarketingSpender(sender, balance);
                        (await this.token.allowance(address, sender)).should.be.bignumber.equal(balance)
                    })

                });

                describe('all of the tokens can\'t be approved over balance', function () {

                    it('saleTokensVault', async function () {
                        const address = await this.token.saleTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await shouldFail.reverting(this.token.approveSaleSpender(sender, balance.addn(1)));
                    })

                    it('marketingAirdropTokensVault', async function () {
                        const address = await this.token.marketingAirdropTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await shouldFail.reverting(this.token.approveMarketingSpender(sender, balance.addn(1)));
                    })

                });

                describe('approved holder can transfer from the tokens', function () {

                    describe('saleTokensVault balance', function () {
                        it('should set to zero', async function () {
                            const address = await this.token.saleTokensVault();
                            const balance = await this.token.balanceOf(address);
                            await this.token.approveSaleSpender(sender, balance);
                            await this.token.transferFrom(address, sender, balance, {from: sender});
                            (await this.token.balanceOf(address)).should.be.bignumber.equal('0');
                        })

                        it('approved account balance should be transferred', async function () {
                            const address = await this.token.saleTokensVault();
                            const balance = await this.token.balanceOf(address);
                            await this.token.approveSaleSpender(sender, balance);
                            await this.token.transferFrom(address, sender, balance, {from: sender});
                            (await this.token.balanceOf(sender)).should.be.bignumber.equal(balance);
                        })
                    })


                    describe('marketingAirdropTokensVault balance', function () {
                        it('marketingAirdropTokensVault balance should set to zero', async function () {
                            const address = await this.token.marketingAirdropTokensVault();
                            const balance = await this.token.balanceOf(address);
                            await this.token.approveMarketingSpender(sender, balance);
                            await this.token.transferFrom(address, sender, balance);
                            (await this.token.balanceOf(address)).should.be.bignumber.equal('0');
                        })

                        it('marketingAirdropTokensVault approved account balance should be transferred', async function () {
                            const address = await this.token.marketingAirdropTokensVault();
                            const balance = await this.token.balanceOf(address);
                            await this.token.approveMarketingSpender(sender, balance);
                            await this.token.transferFrom(address, sender, balance);
                            (await this.token.balanceOf(sender)).should.be.bignumber.equal(balance);
                        })
                    })


                });

                describe('others can\'t transfer from the approved tokens', function () {

                    it('saleTokensVault', async function () {
                        const address = await this.token.saleTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await this.token.approveSaleSpender(sender, balance);
                        await shouldFail.reverting(this.token.transferFrom(address, anotherAccount, new BN(1), {from: anotherAccount}));
                    })

                    it('marketingAirdropTokensVault', async function () {
                        const address = await this.token.marketingAirdropTokensVault();
                        const balance = await this.token.balanceOf(address);
                        await this.token.approveMarketingSpender(sender, balance);
                        await shouldFail.reverting(this.token.transferFrom(address, anotherAccount, new BN(1), {from: anotherAccount}));
                    })

                });

            })

        })
    })
    // - End lockable test cases -

});
