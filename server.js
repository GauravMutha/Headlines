import express from 'express';
import path from 'path';
import bodyparser from 'body-parser';
import https from 'https';
import { fileURLToPath } from 'url';
import { countryToAlpha2 } from 'country-to-iso';
import apiKey from './Secret.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(bodyparser.urlencoded({ extended: true }));
const port = 3000;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

app.post('/', function (req, res) {
    const topic = req.body.category.toLowerCase();
    const region = countryToAlpha2(req.body.nation).toLowerCase();
    const userAgent = req.get('User-Agent');
    const options = {
        host: 'newsapi.org',
        path: "/v2/top-headlines?country=" + region + "&category=" + topic + "&apiKey=" + apiKey,
        headers: {
            'User-Agent': userAgent
        }
    }
        https.get(options, function (response) {
            var newsItems = '';
            response.on("data", function (data) {
                newsItems += data;
            });
            response.on("end", function () {
                const answer = JSON.parse(newsItems);
                const newsArray = answer.articles;
                res.writeHead(200, {"Content-Type": "text/html; charset=UTF-8"})
                res.write("<h1>Top "+topic+" headlines in "+req.body.nation+" are</h1>");
                newsArray.forEach(function(news){
                    res.write("<a href='"+news.url+"'>"+news.title+"</a><br>");
                })
                res.send();
            })
        })
    })

app.listen(port, function () {
    console.log("server is listening on port 3000");
})
