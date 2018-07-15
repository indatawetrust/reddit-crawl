const request = require('request');
const cheerio = require('cheerio');
const url = require('url');

let images = [];

const notNull = item => item;

module.exports = (opts, callback) => {
  if (!callback || typeof callback != 'function')
    throw new Error('where is the callback?');

  opts = opts || {};

  let limit = (opts.limit >= 40 ? 40 : opts.limit) || 1;
  const total = limit;
  const r = opts.r || 'skyporn';
  const getPage = opts.getPage || false;
  const pageUrl = opts.pageUrl;

  const promises = [];

  const crawl = url => {
    request(url, (err, res, body) => {
      const $ = cheerio.load(body);

      if (getPage) {
        promises.push(
          new Promise(resolve => {
            resolve({
              url: $('.next-button a').attr('href'),
              page: total - limit + 1,
            });
          })
        );
      } else {
        promises.push(
          Promise.resolve(
            $('.expando').toArray().map(el => {
              return $($.parseHTML($(el).data('cachedhtml')))
                .find('.preview')
                .attr('src');
            })
          )
        );
      }

      if (pageUrl) {
        callback(
          Promise.all(promises).then(data =>
            data.reduce((prev, next) =>
              prev.filter(notNull).concat(next.filter(notNull))
            )
          )
        );
      } else {
        if (--limit < 1) {
          if (getPage)
            callback(
              Promise.all(promises).then(data => data.filter(({url}) => url))
            );
          else
            callback(
              Promise.all(promises).then(data =>
                data.reduce((prev, next) =>
                  prev.filter(notNull).concat(next.filter(notNull))
                )
              )
            );
        } else {
          if (!$('.next-button a').length)
            if (getPage)
              callback(
                Promise.all(promises).then(data => data.filter(({url}) => url))
              );
            else
              callback(
                Promise.all(promises).then(data =>
                  data.reduce((prev, next) =>
                    prev.filter(notNull).concat(next.filter(notNull))
                  )
                )
              );
          else crawl($('.next-button a').attr('href'));
        }
      }
    });
  };

  if (pageUrl) crawl(pageUrl);
  else crawl(`https://old.reddit.com/r/${r}/`);
};
