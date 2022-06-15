const router = Router()
// create plan
// router.post(
//     "/create",
//     authenticateUser,
//     ValidateRequest({
//         body: {
//             type: "object",
//             properties: {
//                 plan: { type: "string" },
//                 amount: { type: "number" },
//                 status: {
//                     type: "string",
//                     enum: ["initiated", "completed", "cancelled"],
//                     default: "initiated"
//                 }
//             },
//             required: ["plan", "amount"]
//         }
//     }),
//     async (req, res) => {
//         try {
//             const data = await TransactionModel.saveData(req.body, req.user)
//             if (data.value) {
//                 res.status(200).json(data.data)
//             } else {
//                 res.status(500).json(data.data)
//             }
//         } catch (error) {
//             console.error(error)
//             res.status(500).json(error)
//         }
//     }
// )
router.get(
    "/getTransaction/:id",
    authenticateUser,
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
            const data = await TransactionModel.getOne(req.params.id)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.get(
    "/getTransactionForAdmin/:id",
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
            const data = await TransactionModel.getOneForAdmin(req.params.id)
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.put(
    "/:id",
    authenticateUser,
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
            const data = await TransactionModel.updateData(
                req.params.id,
                req.body
            )
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
router.get(
    "/create",
    require("../app/api/paymentGatewayService").initiatePayment
)
// router.post(
//     "/create",
//     authenticateUser,
//     require("../app/api/paymentGatewayService").initiatePayment
// )
router.post("/apexpay/redirecturl", async (req, res) => {
    try {
        console.log("apexpay post")
        console.log("req.body query", req.query)
        console.log("req.body", req.body)
        let one = req.query.p.split("?")
        let payid = one[0]
        console.log("payid ", payid)
        if (payid) {
            require("../app/api/paymentGatewayService").verifyApexpay(payid)
        }
        res.send(
            "<head><script>window.close()</script></head><body>Thank You</body>"
        )
    } catch (err) {
        res.send(
            "<head><script>window.close()</script></head><body>Thank You</body>"
        )
    }
})
router.post(
    "/getAllTransactionsForAdmin",
    authenticateAdmin,
    async (req, res) => {
        try {
            const data = await TransactionModel.getAllTransactionsForAdmin(
                req.body
            )
            res.json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json(error)
        }
    }
)
router.get("/getTotalDepositsForAdmin", authenticateAdmin, async (req, res) => {
    try {
        const data = await TransactionModel.getTotalDepositsForAdmin()
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})

export default router
