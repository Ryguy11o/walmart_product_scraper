// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { inspect } = require('util');
const path = require('path');

let instance = axios.create({
  headers: {
    // common: {
    //   "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9", 
    //   "Accept-Encoding": "gzip, deflate, br", 
    //   "Accept-Language": "en-US,en;q=0.9", 
    //   "Referer": "https://www.google.com", 
    //   "Sec-Fetch-Dest": "document", 
    //   "Sec-Fetch-Mode": "navigate", 
    //   "Sec-Fetch-Site": "cross-site", 
    //   "Sec-Fetch-User": "?1", 
    //   "Upgrade-Insecure-Requests": "1", 
    //   "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36", 
    // }
  }
})

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/walmart', async (req, res) => {
  const url = `https://www.walmart.com/search/?query=${req.query.search}`;
  try {
    const { data } = await instance(url);
    const $ = cheerio.load(data);
    const products = [];
    $('.search-result-gridview-item').each(function (index) {
      const product = {}
      product.supplier = 'walmart';
      product.image = $(this).find('[data-image-src]').attr('data-image-src');
      product.title = $(this).find('.product-title-link').text();
      product.price = $(this).find('.price-main').contents(":not(:empty)").first().text();
      product.rating = $(this).find('.review-wrapper').find('[aria-label]').attr('aria-label');
      products.push(product);
    });
    res.send(products).end();
  } catch (e) {
    console.error(e);
  }
});

app.get('/amazon', async (req, res) => {
  const url = `https://www.amazon.com/s?k=${req.query.search}&ref=nb_sb_noss_2`;
  try {
    const { data } = await instance(url);
    const $ = cheerio.load(data);
    const products = [];
    $('.sg-col-inner').each(function (index) {
      if (index !== 0 && index !== 1 & index !== 2) {
        const product = {}
        product.supplier = 'Amazon';
        product.image = $(this).find('.s-image').attr('src');
        product.title = $(this).find('.a-size-base-plus').text();        
        product.price = $(this).find('.a-price').contents(":not(:empty)").first().text();
        // product.rating = $(this).find('.review-wrapper').find('[aria-label]').attr('aria-label');
        if (product.image !== '' && product.title !== '' & product.price !== '') {
          products.push(product);
        }
      }
    });
    res.send(products).end();
  } catch (e) {
    console.error(e);
  }
});

app.get('/target', async (req, res) => {
  const url = `https://www.target.com/s?searchTerm=${req.query.search}`;
  try {
    const { data } = await instance(url);
    const $ = cheerio.load(data);
    const products = [];
    $('[data-test]').each(function (index) {
        const product = {}
        product.test = this;
        product.supplier = 'Target';
        product.image = $(this).find('source').first().attr('srcset');
        // product.title = $(this).find('.a-size-base-plus').text();        
        // product.price = $(this).find('.a-price').contents(":not(:empty)").first().text();
        // product.rating = $(this).find('.review-wrapper').find('[aria-label]').attr('aria-label');
          products.push(product);
    });
    res.send(products).end();
  } catch (e) {
    console.error(e);
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
