import axios from "axios"
export default {
    //create or update favorites
    saveData: async (data) => {
        if (data.status === "enabled") {
            let count = await Favorite.countDocuments({
                userId: data.userId,
                status: "enabled"
            })
            if (count >= 4) {
                return "You can't add more than 4 favorites"
            }
        }
        let obj = await Favorite.findOneAndUpdate(
            { userId: data.userId, gameId: data.gameId },
            data,
            {
                new: true
            }
        )
        if (obj === null) {
            obj = new Favorite(data)
            await obj.save()
        }
        return obj
    },
    getFavoritesForUser: async (body) => {
        const data = await Game.aggregate([
            {
                $match: {
                    status: { $in: ["enabled"] }
                }
            },
            {
                $lookup: {
                    from: "favorites",
                    as: "favorite",
                    let: { game_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                userId: mongoose.Types.ObjectId(body._id)
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$gameId", "$$game_id"]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$favorite",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "favorite.status": { $in: ["enabled"] }
                }
            },
            {
                $project: {
                    _id: 1,
                    streamId: 1,
                    favorite: {
                        $cond: {
                            if: { $eq: ["$favorite", null] },
                            then: false,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: ["$favorite.status", "enabled"]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    favorite: true
                }
            }
        ])
        await Promise.all(
            data.map(async (record) => {
                const streamSecurity = await axios.post(
                    "https://bintu-splay.nanocosmos.de/secure/token",
                    {
                        streamname: record.streamId,
                        tag: "",
                        expires: ""
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "X-BINTU-APIKEY": process.env.BINTU_API_KEY
                        }
                    }
                )

                var encrypted = CryptoJS.AES.encrypt(
                    JSON.stringify(streamSecurity.data.h5live.security),
                    crypto_key,
                    {
                        keySize: 128 / 8,
                        iv: crypto_key,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    }
                ).toString()
                record.security = encrypted
            })
        )
        return data
    },
    getFavoritesForUserInBackend: async (body) => {
        let _ = require("lodash")
        if (_.isEmpty(body.sortBy)) {
            body.sortBy = ["updatedAt"]
        }
        if (_.isEmpty(body.sortDesc)) {
            body.sortDesc = [-1]
        } else {
            if (body.sortDesc[0] === false) {
                body.sortDesc[0] = -1
            }
            if (body.sortDesc[0] === true) {
                body.sortDesc[0] = 1
            }
        }
        var sort = {}
        sort[body.sortBy[0]] = body.sortDesc[0]
        var startDate = new Date(body.startDate)
        var endDate = new Date(body.endDate)
        endDate.setDate(endDate.getDate() + 1)
        const pageNo = body.page
        const skip = (pageNo - 1) * body.itemsPerPage
        const limit = body.itemsPerPage
        const [data, count] = await Promise.all([
            Game.aggregate([
                {
                    $match: {
                        status: { $in: ["enabled", "disabled"] }
                    }
                },
                {
                    $lookup: {
                        from: "favorites",
                        as: "favorite",
                        let: { game_id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    userId: mongoose.Types.ObjectId(body._id)
                                }
                            },
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ["$gameId", "$$game_id"]
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$favorite",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        "favorite.status": { $in: ["enabled", "archived"] }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        streamId: 1,
                        favorite: {
                            $cond: {
                                if: { $eq: ["$favorite", null] },
                                then: false,
                                else: {
                                    $cond: {
                                        if: {
                                            $eq: ["$favorite.status", "enabled"]
                                        },
                                        then: true,
                                        else: false
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        favorite: true
                    }
                }
            ])
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            Game.aggregate([
                {
                    $match: {
                        status: { $in: ["enabled", "disabled"] }
                    }
                },
                {
                    $lookup: {
                        from: "favorites",
                        as: "favorite",
                        let: { game_id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    userId: mongoose.Types.ObjectId(body._id)
                                }
                            },
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ["$gameId", "$$game_id"]
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$favorite",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        "favorite.status": { $in: ["enabled", "archived"] }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        streamId: 1,
                        favorite: {
                            $cond: {
                                if: { $eq: ["$favorite", null] },
                                then: false,
                                else: {
                                    $cond: {
                                        if: {
                                            $eq: ["$favorite.status", "enabled"]
                                        },
                                        then: true,
                                        else: false
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        favorite: true
                    }
                }
            ])
        ])
        const maxPage = Math.ceil(count.length / limit)
        return { data, count, maxPage }
    },
    deleteData: async (gameId) => {
        let obj = await Favorite.findOneAndUpdate(
            { gameId: gameId },
            { status: "archived" }
        )
        return obj
    }
}
