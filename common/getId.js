class GetID {
    addZero(x, n) {
        while (x.toString().length < n) {
            x = "0" + x
        }
        return x
    }
    getId() {
        let d = new Date()
        d = new Date(d.setMinutes(330))
        return [
            "" + this.addZero(d.getDate(), 2),
            "" + this.addZero(d.getMonth() + 1, 2),
            d.getFullYear(),
            this.addZero(d.getHours(), 2),
            this.addZero(d.getMinutes(), 2),
            this.addZero(d.getSeconds(), 2),
            this.addZero(d.getMilliseconds(), 4),
            this.addZero(Math.round(Math.random() * 100000), 5)
        ].join("")
    }
}

module.exports = new GetID()
