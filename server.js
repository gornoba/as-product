const _ = LodashGS.load();

function getKey() {
  const today = Utilities.formatDate(new Date(), "GMT+9", "yyMMdd");
  const property = PropertiesService.getScriptProperties().getProperty(today);
  const key =
    property === null
      ? `${today}-001`
      : `${today}-${(parseInt(property) + 1).toString().padStart(3, "0")}`;
  return { key, initData: initSheetData() };
}

function setKey() {
  const today = Utilities.formatDate(new Date(), "GMT+9", "yyMMdd");
  const property = PropertiesService.getScriptProperties().getProperty(today);
  const value =
    property === null
      ? "001"
      : (parseInt(property) + 1).toString().padStart(3, "0");

  try {
    PropertiesService.getScriptProperties().setProperty(today, value);
    return `${today}-${value}`;
  } catch (e) {
    PropertiesService.getScriptProperties().deleteAllProperties();
    PropertiesService.getScriptProperties().setProperty(today, value);
    return `${today}-${value}`;
  }
}

function initSheetData() {
  const data = dataLoad(db, 0, "select A,B,C offset 1");

  const transform = data.reduce((a, b) => {
    if (!(b[0] in a)) {
      a[b[0]] = [];
    }

    a[b[0]].push([b[1], b[2]]);

    return a;
  }, {});

  const returnData = [];
  for (let key in transform) {
    transform[key].forEach((a, i) => {
      const obj = {};
      obj[key] = {
        name: a[0],
        input: a[1],
        ticketingBox: "",
        ticketingPo: "",
        outBox: "",
        outPo: "",
        check: false,
      };
      if (!returnData[i]) {
        returnData.push(obj);
      } else {
        const assignData = Object.assign(returnData[i], obj);
        returnData.splice(i, 1, assignData);
      }
    });
  }

  return returnData;
}

function insertData(data) {
  const { head, product } = data;
  const productData = dataLoad(db, 0, "select B offset 1").flat();

  try {
    const headData = headerDataSetting(head);

    productData.forEach((a) => {
      const productFilter = product.filter((b) => b.name === a);
      if (productFilter.length > 0) {
        // 불출
        if (productFilter[0].outPo) {
          headData.array_out.push(productFilter[0].outPo);
        }

        // 티케팅
        if (productFilter[0].ticketingPo) {
          headData.array_ticketing.push(productFilter[0].ticketingPo);
        }
      } else {
        headData.array_out.push("");
        headData.array_ticketing.push("");
      }
    });

    insertSheet(headData, head.inputState);
    return true;
  } catch (err) {
    return false;
  }
}

function headerDataSetting(head) {
  let array_out;
  let array_ticketing;
  const key = setKey();
  const time = Utilities.formatDate(
    new Date(Date.now()),
    "GMT+9",
    "yyyy-mm-dd HH:mm:ss"
  );

  if (/불출실/.test(head.inputState)) {
    array_out = [
      key,
      time,
      /\d층$/.exec(head.inputState) === null
        ? head.buttonValue
        : head.buttonValue + " " + /\d층$/.exec(head.inputState)[0],
      head.inputDate,
      head.inputName,
      head.inputPhone,
      head.inputBirth,
      head.inputPerson,
    ];

    array_ticketing = [
      key,
      time,
      head.inputDate,
      head.inputName,
      head.inputPhone,
      head.inputBirth,
    ];
  } else {
    array_out = [
      key,
      time,
      head.buttonValue,
      head.inputDate,
      head.inputName,
      head.inputPhone,
      head.inputBirth,
      head.inputAddress,
      head.inputPerson,
    ];

    array_ticketing = [
      key,
      time,
      head.inputDate,
      head.inputName,
      head.inputPhone,
      head.inputBirth,
      head.inputAddress,
    ];
  }

  return {
    array_out,
    array_ticketing,
  };
}

function insertSheet(data, sort) {
  let sheetNumber = {
    불출실: [1884263734, 829968801],
    택배접수: [1371495869, 491850315],
  };

  if (/불출실/.test(sort)) {
    insertResult(sheetNumber["불출실"], data);
  } else {
    insertResult(sheetNumber["택배접수"], data);
  }
  console.log(data);
}

function insertResult(sheets, data) {
  const sheetId = dataLoad(db, 1775701345, "select * offset 1");
  const testSheet = sheetId[0][1];
  const ss = SpreadsheetApp.openById(testSheet);
  // const sheets = [ 1884263734, 829968801 ]

  ss.getSheets().forEach((z) => {
    const sheetId = z.getSheetId();
    sheets.forEach((a) => {
      if (a === sheetId) {
        const lastRow =
          _.max(
            z
              .getRange(7, 2, z.getLastRow() - 6, 2)
              .getValues()
              .filter((a) => a[1])
              .map((b) => b[0])
          ) === undefined
            ? 7
            : _.max(
                z
                  .getRange(7, 2, z.getLastRow() - 6, 2)
                  .getValues()
                  .filter((a) => a[1])
                  .map((b) => b[0])
              ) + 7;

        if (/불출/.test(z.getSheetName())) {
          z.getRange(lastRow, 3, 1, data.array_out.length).setValues([
            data.array_out,
          ]);
        } else {
          z.getRange(lastRow, 3, 1, data.array_ticketing.length).setValues([
            data.array_ticketing,
          ]);
        }
      }
    });
  });
}
