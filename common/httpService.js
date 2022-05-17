const request = require("request")
class HttpService {
    call(httpMethod, url, body, headers) {
        let deferred = q.defer()
        try {
            let options = {
                method: httpMethod,
                url: url,
                headers: headers,
                json: true
            }
            if (body) {
                options.body = body
            }
            request(options, function (error, response, Responsebody) {
                if (error) {
                    deferred.reject(error)
                } else {
                    deferred.resolve(Responsebody)
                }
            })
        } catch (error) {
            deferred.reject(error)
        }
        return deferred.promise
    }
    callForm(httpMethod, url, form, headers) {
        let deferred = q.defer()
        try {
            let options = {
                method: httpMethod,
                url: url,
                headers: headers,
                json: true
            }
            if (form) {
                options.form = form
            }
            request(options, function (error, response, Responsebody) {
                if (error) {
                    deferred.reject(error)
                } else {
                    deferred.resolve(Responsebody)
                }
            })
        } catch (error) {
            deferred.reject(error)
        }
        return deferred.promise
    }
}
module.exports = new HttpService()
