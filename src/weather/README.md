US Weather.gov Services
---

* [Weather.gov](https://www.weather.gov)
* [Weather.gov GitHub page](https://github.com/weather-gov/api/blob/master/assets/openapi.yaml)
* [Weather.gov API documentation](https://www.weather.gov/documentation/services-web-api) (see `Specification`)
* [Weather.gov openapi.json](https://api.weather.gov/openapi.json)


Quick Start
---

### Converting from Lat/Long to Grid

The Weather.gov API uses "grid points" as location points for queries.

To find your grid point, you can do a Latitude/Longitude lookup via:

```
$ curl 'https://api.weather.gov/points/42.44,-76.5'  | jq '.properties | [ .gridId, .gridX, .gridY ]'
[
  "BGM",
  43,
  69
]
```

### Getting Current Temperature

Now you can use the `wfo` (forecast office ID/gridId), `X` and `Y` to make subsequent queries:

```
$ curl 'https://api.weather.gov/gridpoints/BGM/43,69' | jq '.properties.temperature | [ .uom, .values[0].validTime, .values[0].value  ]'
[
  "wmoUnit:degC",
  "2021-10-28T04:00:00+00:00/PT1H",
  5
]
```

Note temperature is in Celsius.
Some other API calls will give it in Fahrenheit, so watch out for it.

The `.values[]` has multiple entries, so it might need to be iterated over to find the current time.

### Getting Hourly Forecast

```
$ curl 'https://api.weather.gov/gridpoints/BGM/43,69/forecast/hourly' | \
  jq -c '.properties.periods[] | [ .startTime, .endTime, .temperature, .temperatureUnit, .windSpeed, .windDirection, .shortForecast ]'
["2021-10-28T08:00:00-04:00","2021-10-28T09:00:00-04:00",40,"F","1 mph","E","Patchy Fog"]
["2021-10-28T09:00:00-04:00","2021-10-28T10:00:00-04:00",43,"F","1 mph","E","Mostly Sunny"]
["2021-10-28T10:00:00-04:00","2021-10-28T11:00:00-04:00",48,"F","2 mph","S","Sunny"]
["2021-10-28T11:00:00-04:00","2021-10-28T12:00:00-04:00",53,"F","2 mph","SE","Sunny"]
...
```

### Getting Week Forecast

```
$ curl 'https://api.weather.gov/gridpoints/BGM/43,69/forecast' | \
  jq -c '.properties.periods[] | [ .startTime, .endTime, .temperature, .temperatureUnit, .windSpeed, .windDirection, .shortForecast ]' 
["2021-10-25T20:00:00-04:00","2021-10-26T06:00:00-04:00",53,"F","2 mph","E","Showers And Thunderstorms Likely"]
["2021-10-26T06:00:00-04:00","2021-10-26T18:00:00-04:00",57,"F","2 to 10 mph","N","Patchy Fog"]
["2021-10-26T18:00:00-04:00","2021-10-27T06:00:00-04:00",47,"F","9 mph","NW","Rain Showers"]
["2021-10-27T06:00:00-04:00","2021-10-27T18:00:00-04:00",59,"F","10 mph","NW","Slight Chance Rain Showers then Partly Sunny"]
["2021-10-27T18:00:00-04:00","2021-10-28T06:00:00-04:00",38,"F","0 to 7 mph","N","Mostly Clear"]
["2021-10-28T06:00:00-04:00","2021-10-28T18:00:00-04:00",62,"F","0 to 3 mph","E","Mostly Sunny"]
["2021-10-28T18:00:00-04:00","2021-10-29T06:00:00-04:00",44,"F","2 to 9 mph","SE","Mostly Cloudy then Slight Chance Rain Showers"]
["2021-10-29T06:00:00-04:00","2021-10-29T18:00:00-04:00",56,"F","12 mph","SE","Rain Showers"]
["2021-10-29T18:00:00-04:00","2021-10-30T06:00:00-04:00",46,"F","6 to 9 mph","E","Rain Showers"]
["2021-10-30T06:00:00-04:00","2021-10-30T18:00:00-04:00",59,"F","6 mph","NE","Rain Showers Likely"]
["2021-10-30T18:00:00-04:00","2021-10-31T06:00:00-04:00",48,"F","6 mph","NW","Rain Showers Likely"]
["2021-10-31T06:00:00-04:00","2021-10-31T18:00:00-04:00",59,"F","6 to 9 mph","NW","Chance Rain Showers"]
["2021-10-31T18:00:00-04:00","2021-11-01T06:00:00-04:00",43,"F","8 mph","W","Chance Rain Showers"]
["2021-11-01T06:00:00-04:00","2021-11-01T18:00:00-04:00",57,"F","7 to 10 mph","W","Slight Chance Rain Showers"]
```



