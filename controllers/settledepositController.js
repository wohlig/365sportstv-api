const router = Router()
// create plan
router.post(
    "/create",
    authenticateAdmin,
    ValidateRequest({
        body: {
            type: "object",
            properties: {
                amount: { type: "number" }
            },
            required: ["amount"]
        }
    }),
    async (req, res) => {
        try {
            const data = await SettledepositModel.saveData(req.body)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.post("/search", authenticateAdmin, async (req, res) => {
    try {
        const data = await SettledepositModel.search(req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
export default router
