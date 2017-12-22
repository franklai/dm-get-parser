const fs = require('fs');
const path = require('path');

const sitesDirCache = {};

module.exports = (sitesDirPara, cwd) => {
  let sitesDir;

  if (!sitesDirPara) {
    sitesDir = path.join(__dirname, 'sites');
  } else {
    sitesDir = path.resolve(cwd, sitesDirPara);
  }

  if (sitesDirCache[sitesDir]) {
    return sitesDirCache[sitesDir];
  }

  const sites = Object.create(null);

  fs.readdirSync(sitesDir).forEach((file) => {
    if (path.extname(file) !== '.js') {
      return;
    }
    sites[file.slice(0, -3)] = path.join(sitesDir, file);
  });

  sitesDirCache[sitesDir] = sites;

  return sites;
};
