const request = require('request')
const cheerio = require('cheerio')
const url = require('url')

module.exports = (opts, callback) => {

  if (!callback || typeof callback != 'function') throw new Error('where is the callback?')

  opts = opts || {}

  let limit = opts.limit ? (opts.limit >= 40 ? opts.limit : 40) : 1
  const total = limit
  const r = opts.r || 'skyporn'
  const getPage = opts.getPage || false
  const url = opts.url

  const promises = []

  const crawl = url => {

    request(url, (err, res, body) => {

      const $ = cheerio.load(body)

      if (getPage) {

        promises.push(new Promise(resolve => {
          resolve({
            url: $('.next-button a').attr('href'),
            page: total-limit+1
          })
        }))

      } else {

        $('.thing').each((ind, el) => {

          promises.push(new Promise(resolve => {

            const url = ($(el).find('a.title').attr('href'))

            if (url.match(/\/r/)) {

              request(`https://www.reddit.com${url}`, (err, res, body) => {

                if (body) {
                  const $$ = cheerio.load(body)

                  resolve($$('.preview').attr('src'))
                } else {
                  resolve(null)
                }

              })

            } else {
              resolve(null)
            }

          }))

        })

      }

      if (url) {
        callback(Promise.all(promises).then(data => data.filter(img => img)))
      } else {
        if (--limit < 1) {
          if (getPage) callback(Promise.all(promises).then(data => data.filter(({url}) => url)))
          else callback(Promise.all(promises).then(data => data.filter(img => img)))
        } else {
          if (!$('.next-button a').length)
            if (getPage) callback(Promise.all(promises).then(data => data.filter(({url}) => url)))
            else callback(Promise.all(promises).then(data => data.filter(img => img)))
          else
           crawl($('.next-button a').attr('href'))
        }
      }

    })

  }

  if (url) crawl(url)
  else crawl(`https://www.reddit.com/r/${r}/`)

}
