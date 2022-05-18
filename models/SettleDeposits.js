export default {
    //create plan
    saveData: async (data) => {
        let obj = new SettleDeposit(data)
        await obj.save()
        return obj
    }
}
