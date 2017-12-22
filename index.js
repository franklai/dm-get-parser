const Sites = require('./lib/sites');

module.exports = async (url) => {
  const sites = new Sites();
  const site = sites.find(url);
  if (!site) {
    return false;
  }
  const obj = await site.get();
  return obj;
};
