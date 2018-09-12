# reddit crawl

http://pictureddit.com/

#### install
```
npm i -g reddit-crawl
```

#### usage
```
reddit -r earthporn --limit 2 --info
```

##### -r
subreddit name

##### --limit
page limit

##### --info
title, link information is returned with photo

#### install
```
npm i --save reddit-crawl
```

#### usage
```js
const reddit = require('reddit-crawl')

reddit(
  { r: 'food' },
  p => p.then(pictures => {
    console.log(pictures)
  })
)
```
