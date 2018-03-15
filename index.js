const request = require('request')
const cheerio = require('cheerio')
const url = require('url')

module.exports = (opts, callback) => {
  
  if (!callback || typeof callback != 'function') throw new Error('where is the callback?')

  opts = opts || {}

  let limit = opts.limit || 1
  const r = opts.r || 'skyporn'

  const promises = []

  const crawl = url => {
    
    request(url, (err, res, body) => {

      const $ = cheerio.load(body)

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

      if (--limit < 0) {
        callback(Promise.all(promises).then(data => data.filter(img => img)))
      } else {
        crawl($('.next-button a').attr('href'))
      }

    })

  }

  crawl(`https://www.reddit.com/r/${r}/`)

}
