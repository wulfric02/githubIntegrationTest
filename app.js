const express = require('express')
  , bodyParser = require('body-parser')

var app = express()
var request = require('request')

app.use(bodyParser.json({limit: '50mb'}))
app.set('port', process.env.PORT || 4000)
var server =  app.listen(app.get('port'), function(){}) 
var code
var aT

app.get('/github/login', function (req, res, next){
  var url = 'https://github.com/login/oauth/authorize?client_id='+process.env.clientId+'&scope=repo user'
  res.redirect(url)
})

app.get('/github/callback', function (req, res, next) {
  code = req.query.code
  request({
    method: 'POST',
    url: "https://github.com/login/oauth/access_token",
    headers: {
      'content-type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      'client_id': process.env.clientId,
      'client_secret': process.env.clientSecret,
      'code': code
    })  
  }, function (error, response, body) {
    console.log(body)
    aT = JSON.parse(body).access_token
    console.log(aT)
    request({
      method: 'GET',
      headers: {
        'User-Agent': 'test' 
      },
      url: "https://api.github.com/user?access_token=" + aT
    }, function (error1, response1, body1) {
      res.send(body1)
    })

    
  })

})

app.get('/github/repo', function (req, res, next) {
  request({
    method: 'GET',
    headers: {
      'User-Agent': 'test',
      'content-type': 'application/json',
      'Authorization': 'token '+aT 
    },
    url: "https://api.github.com/user/repos"
  }, function (rErr, response, body) {
    console.log(body)
    res.send(body)
  })
})

app.get('/hook', function (req, res, next) {
  request({
    method: 'POST',
    headers: {
      'User-Agent': 'test',
      'content-type': 'application/json',
      'Authorization': 'token '+aT 
    },
    url: "https://api.github.com/repos/wulfric02/web/hooks",
    body: JSON.stringify({
      name: 'web',
      "events": [
        "push",
        "pull_request"
      ],
      config: {
        "url": "http://localhost:4000/subhook",
        "content_type": 'json'
      },
      active: true
    })
  }, function (rErr, response, body) {
    console.log(response)
    res.send(body)
  })
})

app.get('/subhook', function (req, res, next) {
  console.log(req)
})
//var GithubApi = require('github')
//var github = new GithubApi()


