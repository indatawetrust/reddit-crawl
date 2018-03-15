#!/usr/bin/env node

const argv = require('yargs').argv
const request = require('request')
const cheerio = require('cheerio')
const url = require('url')
const ora = require('ora');

let limit = argv.limit || 1
let r = argv.r || 'skyporn'

const promises = []
const spinner = ora(`Loading /r/${r} 👷`).start();

const crawl = url => request(url, (err, res, body) => {
  
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
    Promise.all(promises).then(data => data.filter(img => img)).then(pictures => {
      
      spinner.stop()
      console.log(JSON.stringify(pictures))

    })
  } else {
    if ($('.next-button a').length) {
      crawl($('.next-button a').attr('href'))
    } else { 
      Promise.all(promises).then(data => data.filter(img => img)).then(pictures => {
        
        spinner.stop()
        console.log(JSON.stringify(pictures))

      })
    }
  }

})

crawl(`https://www.reddit.com/r/${r}/`)
