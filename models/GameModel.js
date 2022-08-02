import FavoriteModel from "./FavoriteModel"
import axios from "axios"
import moment from "moment"
import _ from "lodash"
// const bodyParser = require("body-parser")
// const KJUR = require("jsrsasign")
// const crypto = require("crypto")
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
                        status: { $in: ["enabled"] }
                        // startTime: { $lte: moment().toDate() }
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
                        // startTime: 1,
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
                        meetingStatus: 1
                    }
                }
            ])
                .sort({ startTime: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            Game.countDocuments({
                status: { $in: ["enabled"] }
                // startTime: { $lte: moment().toDate() }
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
            ScheduleList.aggregate([
                {
                    $match: {
                        status: { $in: ["enabled"] }
                        // startTime: { $gte: moment().toDate() }
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
                        startTime: 1,
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
                .sort({ startTime: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            ScheduleList.countDocuments({
                status: { $in: ["enabled"] },
                startTime: { $gte: moment().toDate() }
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    // getPastGames: async () => {
    //     const limit = 10
    //     const data = await Game.aggregate([
    //         {
    //             $match: {
    //                 status: { $in: ["archived"] },
    //                 startTime: { $lt: moment().toDate() }
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 1,
    //                 name: 1,
    //                 description: 1,
    //                 scoreId: 1,
    //                 updatedAt: 1
    //             }
    //         }
    //     ])
    //         .sort({ updatedAt: -1 })
    //         .limit(limit)
    //         .exec()
    //     return { data }
    // },
    getOne: async (id, userId) => {
        const data = await Game.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(id),
                    status: { $in: ["enabled"] },
                    meetingStatus: true
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
                    username: 1,
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
                    meetings: 1,
                    status: 1,
                    meetingStatus: 1
                }
            }
        ]).exec()
        // for in data[0].meetings
        _.each(data[0].meetings, function (item) {
            if (item.meetingStatus == "active") {
                data[0].meetingNumber = item.meetingNumber
                data[0].password = item.password
                data[0].username = item.username
                data[0].meetings = []
            }
        })
        const signature = await GameModel.validatezoom(data[0].meetingNumber)
        data[0].signature = signature
        data[0].sdkSecret = process.env.ZOOM_MEETING_SDK_SECRET
        data[0].sdkKey = process.env.ZOOM_MEETING_SDK_KEY
        const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(data[0]),
            crypto_key,
            {
                keySize: 128 / 8,
                iv: crypto_key,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        ).toString()
        return encrypted
        // let streams = await Channel.findOne({ ingest: data[0].streamId })
        // let streamArray = []
        // let allStreams = []
        // if (streams) {
        //     streamArray[0] = streams.ingest
        //     streamArray[1] = streams.transcode1
        //     streamArray[2] = streams.transcode2
        //     streamArray[3] = streams.transcode3
        //     await Promise.all(
        //         streamArray.map(async (record) => {
        //             const streamSecurity = await axios.post(
        //                 "https://bintu-splay.nanocosmos.de/secure/token",
        //                 {
        //                     streamname: record,
        //                     tag: "",
        //                     expires: ""
        //                 },
        //                 {
        //                     headers: {
        //                         "Content-Type": "application/json",
        //                         "X-BINTU-APIKEY": process.env.BINTU_API_KEY
        //                     }
        //                 }
        //             )

        //             var encrypted = CryptoJS.AES.encrypt(
        //                 JSON.stringify(streamSecurity.data.h5live.security),
        //                 crypto_key,
        //                 {
        //                     keySize: 128 / 8,
        //                     iv: crypto_key,
        //                     mode: CryptoJS.mode.CBC,
        //                     padding: CryptoJS.pad.Pkcs7
        //                 }
        //             ).toString()
        //             allStreams.push({
        //                 streamname: record,
        //                 security: encrypted
        //             })
        //         })
        //     )
        // }
        // data[0].streams = allStreams
    },

    // updateData: async (id, data) => {
    //     let obj = await Game.findOneAndUpdate({ _id: id }, data)
    //     return obj
    // },
    deleteData: async (id) => {
        let obj = await Game.findOneAndUpdate(
            { _id: id },
            { status: "archived" }
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
                        status: { $in: ["enabled", "disabled"] },
                        name: { $regex: body.searchFilter, $options: "i" }
                    }
                },
                // {
                //     $addFields: {
                //         liveStatus: {
                //             $cond: {
                //                 if: {
                //                     $or: [
                //                         {
                //                             $lte: [
                //                                 "$startTime",
                //                                 moment().toDate()
                //                             ]
                //                         }
                //                     ]
                //                 },
                //                 then: "Live",
                //                 else: "Upcoming"
                //             }
                //         }
                //     }
                // },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        description: 1,
                        meetings: 1,
                        status: {
                            $cond: [
                                { $eq: ["$status", "enabled"] },
                                true,
                                false
                            ]
                        },
                        meetingStatus: 1,
                        liveStatus: 1
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
        console.log(data)
        _.each(data, function (games) {
            _.each(games.meetings, function (item) {
                if (item.meetingStatus == "active") {
                    games.meetingNumber = item.meetingNumber
                    games.username = item.username
                }
            })
        })
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getOneGameForAdmin: async (id) => {
        const data = await Game.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(id)
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    status: {
                        $cond: [{ $eq: ["$status", "enabled"] }, true, false]
                    },
                    meetingStatus: 1,
                    meetings: 1
                }
            }
        ]).exec()
        return data[0]
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
    },
    updateMeetingStatus: async (id, data) => {
        let updateObj = {
            meetingStatus: data.status
        }
        let obj = await Game.findOneAndUpdate({ _id: id }, updateObj)
        return obj
    },
    validatezoom: async (meetingNumber) => {
        const KJUR = require("jsrsasign")
        // https://www.npmjs.com/package/jsrsasign

        const iat = Math.round((new Date().getTime() - 30000) / 1000)
        const exp = iat + 60 * 60 * 2
        const oHeader = { alg: "HS256", typ: "JWT" }

        const oPayload = {
            sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
            mn: meetingNumber,
            role: 0,
            iat: iat,
            exp: exp,
            appKey: process.env.ZOOM_MEETING_SDK_KEY,
            tokenExp: iat + 60 * 60 * 2
        }
        const sHeader = JSON.stringify(oHeader)
        const sPayload = JSON.stringify(oPayload)
        const signature = KJUR.jws.JWS.sign(
            "HS256",
            sHeader,
            sPayload,
            process.env.ZOOM_MEETING_SDK_SECRET
        )
        return signature
    }
}
