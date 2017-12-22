const got = require('got');
const striptags = require('striptags');

class Site {
  constructor(url) {
    this.url = url;
    this.site = 'skm';
    this.site_name = '新光三越';
  }

  parseTitle(html) {
    const prefix = '<h2';
    const suffix = '</h2>';

    let title = Site.findString(html, prefix, suffix);
    if (!title) {
      return false;
    }

    title = striptags(title);

    this.title = title;

    return true;
  }

  /* eslint-disable class-methods-use-this */
  async downloadBook(id) {
    const url = `https://d.calameo.com/3.0.0/book.php?callback=prefix&bkcode=${id}`;
    const resp = await got(url);
    if (resp.body.length < 10) {
      return false;
    }
    const rawJson = resp.body.substr(7, resp.body.length - 7 - 1);
    try {
      return JSON.parse(rawJson);
    } catch (err) {
      return false;
    }
  }
  /* eslint-enable class-methods-use-this */

  async parseLinks(html) {
    const pattern = /<iframe .* src="http.*?([0-9a-z]+)".*?><\/iframe>/;
    const result = pattern.exec(html);

    if (!result) {
      return false;
    }

    const bookId = result[1];
    const bookJson = await this.downloadBook(bookId);
    if (!bookJson) {
      return false;
    }

    const total = bookJson.content.document.pages;
    const imageDomain = bookJson.content.domains.image;
    const contentKey = bookJson.content.key;

    const links = Array.from(
      { length: total },
      (v, i) => `${imageDomain}${contentKey}/p${i + 1}.svgz`,
    );

    this.links = links;
    return true;
  }

  async parse() {
    const resp = await got(this.url);

    this.parseTitle(resp.body);
    await this.parseLinks(resp.body);

    return true;
  }

  static findString(input, prefix, suffix, including = true) {
    const start = input.indexOf(prefix);
    if (start === -1) {
      return false;
    }

    const end = input.indexOf(suffix, start + prefix.length);
    if (end === -1) {
      return false;
    }

    if (including === true) {
      return input.substr(start, (end - start) + suffix.length);
    }
    return input.substr(start + prefix.length, (end - start) - prefix.length);
  }

  async get() {
    await this.parse();

    return {
      links: this.links,
      title: this.title,
      site: this.site,
      site_name: this.site_name,
    };
  }
}

/*
https://www.skm.com.tw/DM/DMContent?UUID=9cda888a-6307-4c22-b710-664e6fd02e1e
  https://d.calameo.com/3.0.0/book.php?callback=_jsonBook&bkcode=004421504baf657279a36
  https://p.calameoassets.com/171220153919-278b7172cfbf9de550210071cee85543/p7.svgz
  https://p.calameoassets.com/171220153919-278b7172cfbf9de550210071cee85543/p8.svgz
  https://p.calameoassets.com/171220153919-278b7172cfbf9de550210071cee85543/p8.svgz

  https://p.calameoassets.com/171220153919-278b7172cfbf9de550210071cee85543/p8.svgz

  title = content.name
  content.id

  n = pages, 1~n

  content.document.pages
  content.domains.image

  `domainImage id /`

  http://www.calameo.com/accounts/4421504
*/

if (require.main === module) {
  (async () => {
    const url = 'https://www.skm.com.tw/DM/DMContent?UUID=9cda888a-6307-4c22-b710-664e6fd02e1e';
    const site = new Site(url);
    const obj = await site.get();
    console.log(obj.links);
  })();
}

module.exports = Site;
