const loadSites = require('./load-sites');

class Sites {
  constructor() {
    this.sites = Object.create(null);

    this.load();
  }

  load(sitesDir, cwd) {
    const newSites = loadSites(sitesDir, cwd);

    Object.keys(newSites).forEach((siteId) => {
      this.sites[siteId] = newSites[siteId];
    });
  }

  find(url) {
    const siteKey = Object.keys(this.sites).find(key => (url.indexOf(key) > 0));
    if (!siteKey) {
      return false;
    }
    const Site = this.import(siteKey);
    return new Site(url);
  }

  import(key) {
    if (!this.sites[key]) {
      return null;
    }
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(this.sites[key]);
  }
}

module.exports = Sites;
