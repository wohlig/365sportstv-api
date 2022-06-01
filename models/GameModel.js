import FavoriteModel from "./FavoriteModel"
import axios from "axios"
import moment from "moment"
export default {
    //create game
    saveData: async (data) => {
        let obj = new Game(data)
        await obj.save()
        return obj
    },
    getLiveGamesLight: async (body) => {
        const pageNo = body.page
        const skip = (pageNo - 1) * global.paginationLimit
        const limit = global.paginationLimit
        const [data, count] = await Promise.all([
            Game.aggregate([
                {
                    $match: {
                        status: { $in: ["enabled"] },
                        startTime: { $lte: moment().toDate() }
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
                                    userId: mongoose.Types.ObjectId(body.user)
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
                    $project: {
                        _id: 1,
                        name: 1,
                        description: 1,
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
                }
            ])
                .sort({ startTime: 1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            Game.countDocuments({
                status: { $in: ["enabled"] },
                startTime: { $lte: moment().toDate() }
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getUpcomingGamesLight: async (body) => {
        const pageNo = body.page
        const skip = (pageNo - 1) * global.paginationLimit
        const limit = global.paginationLimit
        const [data, count] = await Promise.all([
            Game.aggregate([
                {
                    $match: {
                        status: { $in: ["enabled"] },
                        startTime: { $gte: moment().toDate() }
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
                                    userId: mongoose.Types.ObjectId(body.user)
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
                    $project: {
                        _id: 1,
                        name: 1,
                        description: 1,
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
                }
            ])
                .sort({ startTime: 1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            Game.countDocuments({
                status: { $in: ["enabled"] },
                startTime: { $gte: moment().toDate() }
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getPastGames: async (body) => {
        const pageNo = body.page
        const skip = (pageNo - 1) * global.paginationLimit
        const limit = global.paginationLimit
        const [data, count] = await Promise.all([
            Game.aggregate([
                {
                    $match: {
                        status: { $in: ["disabled"] },
                        startTime: { $lt: moment().toDate() }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        description: 1,
                        scoreId: 1
                    }
                }
            ])
                .sort({ startTime: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            Game.countDocuments({
                status: { $in: ["disabled"] },
                startTime: { $lt: moment().toDate() }
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getOne: async (id, userId) => {
        const data = await Game.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(id),
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
                                userId: mongoose.Types.ObjectId(userId)
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
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
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
                    },
                    streamId: 1,
                    scoreId: 1
                }
            }
        ]).exec()
        let streams = await Channel.findOne({ ingest: data[0].streamId })
        let streamArray = []
        let allStreams = []
        if (streams) {
            streamArray[0] = streams.ingest
            streamArray[1] = streams.transcode1
            streamArray[2] = streams.transcode2
            streamArray[3] = streams.transcode3
            await Promise.all(
                streamArray.map(async (record) => {
                    const streamSecurity = await axios.post(
                        "https://bintu-splay.nanocosmos.de/secure/token",
                        {
                            streamname: record,
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
                    allStreams.push({
                        streamname: record,
                        security: encrypted
                    })
                })
            )
        }
        data[0].streams = allStreams
        return data[0]
    },

    updateData: async (id, data) => {
        let obj = await Game.findOneAndUpdate({ _id: id }, data)
        return obj
    },
    deleteData: async (id) => {
        let obj = await Game.findOneAndUpdate(
            { _id: id },
            { status: "archived" },
            {
                new: true
            }
        )
        return obj
    },
    searchAllGamesForAdmin: async (body) => {
        let _ = require("lodash")
        if (_.isEmpty(body.sortBy)) {
            body.sortBy = ["startTime"]
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
                    $addFields: {
                        liveStatus: {
                            $cond: {
                                if: {
                                    $or: [
                                        {
                                            $lte: [
                                                "$startTime",
                                                moment().toDate()
                                            ]
                                        }
                                    ]
                                },
                                then: "Live",
                                else: "Upcoming"
                            }
                        }
                    }
                }
            ])
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            Game.countDocuments({
                name: { $regex: body.searchFilter, $options: "i" },
                status: { $in: ["enabled", "disabled"] }
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getOneGameForAdmin: async (id) => {
        return await Game.findOne({
            _id: id
        }).exec()
    },
    updateOneGameForAdmin: async (id, data) => {
        let obj = await Game.findOneAndUpdate({ _id: id }, data)
        return obj
    },
    updateGameAndFavoriteStatus: async (id, data) => {
        let updateObj = {
            status: data.status
        }
        let obj = await Game.findOneAndUpdate({ _id: id }, updateObj)
        await Favorite.findOneAndUpdate({ gameId: id }, updateObj)
        return obj
    }
}
