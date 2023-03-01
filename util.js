function dataLoad(id, tabid, query) {
  const dateTransform = (dateValue) => {
    var reg = dateValue.match(/Date\((\d{4}),(\d{1,2}),(\d{1,2})\)/);
    var date = `${reg[1]}-${(Number(reg[2])+1).toString().padStart(2,"0")}-${reg[3].padStart(2,"0")}`
    return date
  }
  
  SpreadsheetApp.openById(id)
  var sql = encodeURIComponent(query);
  var url = "https://docs.google.com/spreadsheets/d/" + id + "/gviz/tq?gid=" + tabid + "&tq=" + sql;
  var res = UrlFetchApp.fetch(url, {headers: {Authorization: "Bearer " + ScriptApp.getOAuthToken()}, muteHttpExceptions: true}).getContentText();
  var parsedText = JSON.parse(res.slice(res.indexOf("{"), res.lastIndexOf("}")+1));
  var value = parsedText.table ? parsedText.table.rows.map(a => {
    return a.c.map(b => {
      if (b) {
        if (b.f) {
          return b.f ? b.f : "";
        } else {
          if (/^Date\(/.test(b.v)) {
            return dateTransform(b.v)
          } else {
            return b.v ? b.v : "";
          }
        }
      } else {
        return "";
      }
    })
  }) : [];

  return value
}
