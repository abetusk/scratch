colorhunt.co scrape
===

###### 2024-18-06

Discussion
---

Scripts and data for [colorhunt.co](https://colorhunt.co) data.

Though a little ambiguous, I think there's a good case to that
the palettes are in the public domain.
From the [about page](https://colorhunt.co/about):

> The collection is open, and everyone can create and submit their own color combination. ...
> Each palette is a public property and not owned by a specific creator, nor by Color Hunt.

Looking at the traffic, it looks like there are two main API endpoints, both accessed via
POST request:

```
https://colorhunt.co/php/feed.php
https://colorhunt.co/php/single.php
```

The `feed.php` takes in four variables:

* `step` - 0 indexed page index (dependent on sort parameter)
* `sort` - one of `new, popular, random` and maybe `collection` (must be specified or get empty list)
* `tags` - list of tags, `-` delimited (see below for options)
* `timeframe` - number specifying number of days (typically (only?) `30, 365, 4000`)

The `single.php` takes in just one variable, the palette string:

* `single` - unique palette string (e.g. `b8ffd0ecffc1ffe6ccdfbaf7`)

Both return a JSON array of values.
It looks like the `feed.php` returns 40 results.
The `feed.php` returns only the time of creation, in human format, the palette and
likes.
The `single.php` returns the likes, the tag list for the palette and the date, without the code.

So, for example:

```
$ curl -s -X POST -d 'single=b8ffd0ecffc1ffe6ccdfbaf7' https://colorhunt.co/php/single.php
[{"likes":"4675","tags":"mint yellow peach purple light spring neon pastel kids","date":"5 years"}]
```

```
$ curl -s -X POST -d 'step=0&sort=&tags=&timeframe=4000' https://colorhunt.co/php/feed.php 
[{"code":"222831393e4600adb5eeeeee","likes":"73544","date":"8 years"},
{"code":"e3fdfdcbf1f5a6e3e971c9ce","likes":"37336","date":"7 years"},
{"code":"f9f7f7dbe2ef3f72af112d4e","likes":"34260","date":"8 years"},
{"code":"ffc7c7ffe2e2f6f6f68785a2","likes":"33145","date":"6 years"},
{"code":"fff5e4ffe3e1ffd1d1ff9494","likes":"32513","date":"1 year"},
{"code":"ad8b73ceab93e3caa5fffbe9","likes":"31528","date":"2 years"},
{"code":"08d9d6252a34ff2e63eaeaea","likes":"30734","date":"8 years"},
{"code":"f4eeffdcd6f7a6b1e1424874","likes":"30396","date":"4 years"},
{"code":"f9ed69f08a5db83b5e6a2c70","likes":"30359","date":"8 years"},
{"code":"f38181fce38aeaffd095e1d3","likes":"30122","date":"8 years"},
{"code":"1b262c0f4c753282b8bbe1fa","likes":"28326","date":"4 years"},
{"code":"a8d8eaaa96dafcbad3ffffd2","likes":"27550","date":"8 years"},
{"code":"f9f5f6f8e8eefdcedff2bed1","likes":"27437","date":"1 year"},
{"code":"b7c4cfeee3cbd7c0ae967e76","likes":"27305","date":"1 year"},
{"code":"b1b2ffaac4ffd2daffeef1ff","likes":"27143","date":"1 year"},
{"code":"ffb6b9fae3d9bbded661c0bf","likes":"26767","date":"6 years"},
{"code":"6096b493bfcfbdcdd6eee9da","likes":"25810","date":"1 year"},
{"code":"ffeddbedcdbbe3b7a0bf9270","likes":"25305","date":"2 years"},
{"code":"7d5a50b4846ce5b299fcdec0","likes":"24905","date":"3 years"},
{"code":"364f6b3fc1c9f5f5f5fc5185","likes":"24763","date":"8 years"},
{"code":"8d7b68a4907cc8b6a6f1dec9","likes":"24592","date":"1 year"},
{"code":"defcf9cadefcc3bef0cca8e9","likes":"24243","date":"7 years"},
{"code":"f8ede3bdd2b6a2b29f798777","likes":"24159","date":"3 years"},
{"code":"fcd1d1ece2e1d3e0dcaee1e1","likes":"24156","date":"3 years"},
{"code":"27374d526d829db2bfdde6ed","likes":"23920","date":"1 year"},
{"code":"fff8ea9e7676815b5b594545","likes":"23708","date":"1 year"},
{"code":"f5efe6e8dfcaaebdca7895b2","likes":"23526","date":"1 year"},
{"code":"ffe6e6f2d1d1daeaf1c6dce4","likes":"22281","date":"2 years"},
{"code":"f67280c06c846c5b7b355c7d","likes":"22259","date":"6 years"},
{"code":"2c36393f4e4fa27b5cdcd7c9","likes":"22098","date":"1 year"},
{"code":"fefcf3f5ebe0f0dbdbdba39a","likes":"22049","date":"1 year"},
{"code":"fcd8d4fdf6f0f8e2cff5c6aa","likes":"21779","date":"2 years"},
{"code":"edf1d69dc08b60996640513b","likes":"21676","date":"1 year"},
{"code":"2b2e4ae8454590374953354a","likes":"21549","date":"8 years"},
{"code":"e4f9f530e3ca11999e40514e","likes":"21316","date":"8 years"},
{"code":"f7fbfcd6e6f2b9d7ea769fcd","likes":"21179","date":"7 years"},
{"code":"2121213232320d737714ffec","likes":"21126","date":"7 years"},
{"code":"f8ede3dfd3c3d0b8a87d6e83","likes":"21078","date":"1 year"},
{"code":"867070d5b4b4e4d0d0f5ebeb","likes":"20766","date":"1 year"},
{"code":"fdefeff4dfd0dad0c2cdbba7","likes":"20476","date":"2 years"}]
```

(note I've formatted the above to make it look pretty)

Tags
---

simple frequency:

```
$ jq -r '.[].tags' colorhunt.json | \
  sed 's/  *$//' | \
  tr ' ' '\n' | \
  sort | \
  uniq -c | \
  sort -n
```

Looks like there's some extraneous space after `teal` which is why the trim is there.

| Tag | Freq | Tag | Freq | Tag | Freq | Tag | Freq |
|---|---|---|---|---|---|---|---|
| Christmas | 1 | Halloween | 1 | Neon | 1 | Skin | 1 | Sunset | 1 | Winter | 1 | Warm | 3 | Pastel | 4 |
| Spring | 4 | Vintage | 4 | Dark | 6 | Summer | 6 | Cold | 7 | Retro | 8 | Wedding | 12 | Gold | 14 |
| Black | 34 | Pink | 40 | Red | 42 | Brown | 44 | Grey | 44 | christmas | 62 | Green | 64 | Purple | 72 |
| Orange | 80 | Blue | 82 | sky | 98 | Yellow | 117 | halloween | 118 | sunset | 132 | coffee | 145 | rainbow | 157 |
| sage | 172 | gold | 177 | fall | 184 | dark | 197 | mint | 198 | earth | 202 | sea | 218 | cream | 221 |
| spring | 227 | neon | 241 | skin | 245 | food | 248 | night | 251 | brown | 286 | space | 290 | winter | 302 |
| nature | 328 | wedding | 331 | white | 339 | summer | 344 | retro | 353 | maroon | 354 | gradient | 384 | cold | 395 |
| pastel | 400 | warm | 403 | black | 442 | happy | 477 | light | 479 | vintage | 484 | peach | 505 | pink | 542 |
| grey | 564 | green | 646 | red | 670 | purple | 691 | kids | 703 | navy | 721 | beige | 739 | orange | 798 |
| teal | 861 | blue | 864 | yellow | 1036 |  |  |  |  |  |


Data
---

The scripts provided are half assed attempt at creating a command line tool for the colorhunt.co API.
It does no real command line argument processing, checks and displays no help screen.
Maybe if I get a burst of energy I'll try and extend it.

For right now, the other scripts do an automated scrape and get the data into a more usable form,
colating the tags and code together for ease of use.
The data was then modified further by me to make it valid JSON.
All data is put into the `data/` directory, with `data/colorhunt.json` probably what you want.

As of this writing there are 3423 palettes and 75 tags (max 86 step).

LICENSE
---

Insofar as it's possible, everything here is CC0.
