const router = Router()
// create plan
router.post(
    "/create",
    authenticateAdmin,
    ValidateRequest({
        body: {
            type: "object",
            properties: {
                logs: { type: "string" },
                amount: { type: "number" }
            },
            required: ["amount"]
        }
    }),
    async (req, res) => {
        try {
            // const data = await GameModel.saveData(req.body, req.user._id)
            const data = await SettleDepositsModel.saveData(req.body)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)

export default router
