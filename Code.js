function doGet() {
  var tmp = HtmlService.createTemplateFromFile('main')
  return tmp.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function loadpage(page) {
  var tmp = HtmlService.createTemplateFromFile(page);
  return tmp.evaluate().getContent();
}