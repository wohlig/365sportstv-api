const router = Router()
// create plan
router.post(
    "/create",
    authenticateAdmin,
    ValidateRequest({
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                price: { type: "number" },
                duration: { type: "number" }
            },
            required: ["name", "price", "duration"]
        }
    }),
    async (req, res) => {
        try {
            // const data = await GameModel.saveData(req.body, req.user._id)
            const data = await PlanModel.saveData(req.body)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.post("/searchPlanForUser", async (req, res) => {
    try {
        const data = await PlanModel.search(req.body)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})
router.put(
    "/:id",
    authenticateAdmin,
    ValidateRequest({
        params: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    format: "objectId"
                }
            },
            required: ["id"]
        }
    }),
    async (req, res) => {
        try {
            const data = await planModel.updateData(req.params.id, req.body)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.delete(
    "/:id",
    authenticateAdmin,
    ValidateRequest({
        params: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    format: "objectId"
                }
            },
            required: ["id"]
        }
    }),
    async (req, res) => {
        try {
            const data = await gameModel.deleteData(req.params.id)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
export default router
