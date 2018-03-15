# reddit crawl


#### install
```
npm i -g reddit-crawl
```

#### usage
```
reddit -r earthporn -limit 2
```

##### -r
subreddit name

##### -limit
page limit

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
