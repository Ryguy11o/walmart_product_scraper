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

let instance = axios.create({
  headers: {
    common: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
    }
  }
})

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hello, world!').end();
});

app.get('/walmart/:search', async (req, res) => {
  const url = `https://www.walmart.com/search/?query=${req.params.search}`;
  try {
    const { data } = await instance(url);
    const $ = cheerio.load(data);
    const products = [];
    $('.search-result-gridview-item').each(function (index) {
      const product = {}
      product.image = $(this).find('[data-image-src]').attr('data-image-src');
      product.title = $(this).find('.product-title-link').text();
      product.price = $(this).find('.price-main').text();
      product.rating = $(this).find('.review-wrapper').find('[aria-label]').attr('aria-label');
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
