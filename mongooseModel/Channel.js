var schema = new Schema({
    ingest: { type: String },
    transcode1: { type: String },
    transcode2: {
        type: String
    },
    transcode3: {
        type: String
    }
})
export default mongoose.model("Channel", schema)
