const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');
const path = require('path');
const fs = require('fs');

const map = libCoverage.createCoverageMap();
const summary = libCoverage.createCoverageSummary();

// add other packages here!
const packages = ['backend', 'core', 'frontend'];

// merge all coverage reports from the defined packages
packages.forEach((package) => {
  const filePath = path.join(process.cwd(), '..', package, 'coverage', 'coverage-final.json');
  const content = fs.readFileSync(filePath).toString();
  const json = JSON.parse(content);
  const jsonCoverageMap = libCoverage.createCoverageMap(json);
  map.merge(jsonCoverageMap);
});

// inspect and summarize all file coverage objects in the map
map.files().forEach((f) => {
  const fc = map.fileCoverageFor(f);
  const s = fc.toSummary();
  summary.merge(s);
});

const context = libReport.createContext({
  dir: path.join(process.cwd(), 'coverage'),
  defaultSummarizer: 'nested',
  coverageMap: map,
});

const htmlReport = reports.create('html');
htmlReport.execute(context);

const textReport = reports.create('text');
textReport.execute(context);
