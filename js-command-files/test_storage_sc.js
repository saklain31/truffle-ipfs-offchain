const Storage = artifacts.require("../contracts/Storage.sol");







module.exports = async function(callback) {
    const storage = await Storage.deployed()
    console.log(await storage.init())
    callback()
}
