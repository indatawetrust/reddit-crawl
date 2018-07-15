#!/usr/bin/env node

const argv = require('yargs').argv;
const request = require('request');
const cheerio = require('cheerio');
const url = require('url');
const ora = require('ora');

let limit = argv.limit ? argv.limit >= 40 ? 40 : argv.limit : 1;

let r = argv.r || 'skyporn';

const promises = [];
const spinner = ora(`Loading /r/${r} 👷`).start();
let images = [];

const crawl = url =>
  request(url, (err, res, body) => {
    const $ = cheerio.load(body);

    images = images.concat(
      $('.expando').toArray().map(el => {
        return $($.parseHTML($(el).data('cachedhtml')))
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
