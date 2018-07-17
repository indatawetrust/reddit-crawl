#!/usr/bin/env node

const argv = require('yargs').argv;
const request = require('request');
const cheerio = require('cheerio');
const URL = require('url');
const ora = require('ora');

let limit = argv.limit ? argv.limit >= 40 ? 40 : argv.limit : 1;

let r = argv.r || 'skyporn';
let info = argv.info || false;

const promises = [];
const spinner = ora(`Loading /r/${r} 👷`).start();
let images = [];

const crawl = url =>
  request(url, (err, res, body) => {
    const $ = cheerio.load(body);

    images = images.concat(
      $('.expando').toArray().map(el => {
        return info
          ? {
              img: $($.parseHTML($(el).data('cachedhtml')))
                .find('.preview')
                .attr('src'),
              title: $(el).parent().find('.top-matter .title .title').text(),
              link: URL.resolve(
                'https://old.reddit.com',
                $(el).parent().find('.top-matter .title .title').attr('href')
              )
            }
          : $($.parseHTML($(el).data('cachedhtml')))
              .find('.preview')
              .attr('src');
      })
    );

    if (--limit < 0) {
      spinner.stop();
      console.log(JSON.stringify(images.filter(img => img)));
    } else {
      if ($('.next-button a').length) {
        crawl($('.next-button a').attr('href'));
      } else {
        spinner.stop();
        console.log(JSON.stringify(images.filter(img => img)));
      }
    }
  });

crawl(`https://old.reddit.com/r/${r}/`);
