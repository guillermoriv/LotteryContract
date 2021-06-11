const { upgrades, ethers } = require('hardhat');

let accounts;
let randomNumber;
let VRFcoordinator;
let LINKtoken;
let lottery;
let alarmClock;

const LINK = '0x514910771AF9Ca656af840dff83E8264EcF986CA';

describe('Testing: Lottery Contract', async () => {
  before(async () => {
    // - Getting the factories for the contracts:
    const VRFCoordinator = await ethers.getContractFactory(
      'VRFCoordinatorMock'
    );
    const RandomNumber = await ethers.getContractFactory(
      'RandomNumberConsumer'
    );
    const Lottery = await ethers.getContractFactory('Lottery');
    const MockOracle = await ethers.getContractFactory('MockOracle');

    // - Getting the accounts on ethers:
    accounts = await ethers.getSigners();

    // - VRFCoordinatorMock:
    VRFcoordinator = await VRFCoordinator.deploy(
      '0x514910771af9ca656af840dff83e8264ecf986ca'
    );
    await VRFcoordinator.deployed();

    // - RandomNumberConsumer:
    randomNumber = await RandomNumber.deploy(
      VRFcoordinator.address,
      LINK,
      '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
    );
    await randomNumber.deployed();

    // - IERC20 of LINK:
    LINKtoken = await ethers.getContractAt('IERC20', LINK);

    await LINKtoken.transfer(
      randomNumber.address,
      ethers.utils.parseEther('5')
    );

    // - MockOracle for the AlarmClock:
    alarmClock = await MockOracle.deploy(LINK);
    await alarmClock.deployed();

    // - Lottery:
    lottery = await upgrades.deployProxy(Lottery, [
      2,
      accounts[0].address,
      500,
      randomNumber.address,
      alarmClock.address,
      45665,
    ]);
    await lottery.deployed();
  });

  it('should get the randomResult number from the contract consumer', async () => {
    const tx = await lottery.sendTokensToPool();
    const receipt = await tx.wait();

    console.log(receipt);
    // const requestId = receipt.events[3].args.requestId;
    // const random = Math.floor(Math.random() * 100000);

    // /*
    //   This is the VRFCoordinator that simulates the
    //   node calling the callback function.
    // */
    // await VRFcoordinator.callBackWithRandomness(
    //   requestId,
    //   ethers.utils.parseUnits(String(random), 18),
    //   randomNumber.address
    // );

    // await lottery._setRandomNumber();

    // console.log(
    //   'Random Number: >> ',
    //   (await lottery.getRandomNumber()).toString()
    // );
  });

  // it ('should shot a determinate function when the clock is done', async () => {

  // });
});
