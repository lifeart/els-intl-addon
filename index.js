const flat = require("flat");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

function isLocalizationHelperTranslataionName(focusPath) {
  return (
    focusPath.node.type === "StringLiteral" &&
    (focusPath.parent.type === "MustacheStatement" ||
      focusPath.parent.type === "SubExpression") &&
    focusPath.parent.path.original === "t"
  );
}

function addToHashMap(hash, obj, locale) {
  const items = flat(obj);
  Object.keys(items).forEach(p => {
    if (!(p in hash)) {
      hash[p] = [];
    }
    hash[p].push([locale, items[p]]);
  });
}

function objFromFile(filePath) {
  const ext = path.extname(filePath);
  if (ext === ".yaml") {
    return yaml.safeLoad(fs.readFileSync(filePath, "utf8"));
  } else if (ext === ".json") {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } else if (ext === ".js") {
    try {
      return require(filePath);
    } catch (e) {
      let content = fs
        .readFileSync(filePath, "utf8")
        .replace("export ", "")
        .replace("default ", "")
        .trim();
      if (content.endsWith(";")) {
        content = content.slice(0, content.lastIndexOf(";"));
      }
      return eval("[" + content + "]")[0];
    }
  }
}

function getTranslations(root) {
  const hashMap = {};
  const intlEntry = path.join(root, "translations");
  const i18nEntry = path.join(root, "app", "locales");
  if (fs.existsSync(intlEntry)) {
    const localizations = fs.readdirSync(intlEntry);
    localizations.forEach(fileName => {
      const extName = path.extname(fileName);
      const localization = path.basename(fileName, extName);
      const filePath = path.join(intlEntry, fileName);
      try {
        const file = objFromFile(filePath);
        addToHashMap(hashMap, file, localization);
      } catch (e) {
        console.log("e", e);
      }
    });
  } else if (fs.existsSync(i18nEntry)) {
    const localizations = fs.readdirSync(i18nEntry);
    localizations.forEach(locale => {
      let possibleFilePath = path.join(i18nEntry, locale, "translations.js");
      if (!fs.existsSync(possibleFilePath)) {
        possibleFilePath = path.join(i18nEntry, locale, "translations.json");
      }
      if (fs.existsSync(possibleFilePath)) {
        try {
          const file = objFromFile(possibleFilePath);
          addToHashMap(hashMap, file, locale);
        } catch (e) {
          console.log("e", e);
        }
      }
    });
  }
  return hashMap;
}

module.exports.onComplete = function(
  _,
  { focusPath, position, results, type }
) {
  if (type !== "template") {
    return results;
  }
  if (isLocalizationHelperTranslataionName(focusPath)) {
    const items = getTranslations(_);
    const val = focusPath.node.value.indexOf("ELSCompletionDummy");
    const key = focusPath.node.value.slice(0, val);
    const startPosition = {
      character: position.character - key.length,
      line: position.line
    };
    Object.keys(items).forEach(tr => {
      const keystr = tr + items[tr].map(([_, txt]) => txt);
      const detail = items[tr].map(([_, txt]) => `${_} : ${txt}`).join("\n");
      if (!keystr.toLowerCase().includes(key.toLowerCase())) {
        return;
      }
      const endPosition = {
        character: startPosition.character,
        line: position.line
      };
      if (tr.includes(key)) {
        results.push({
          label: tr,
          kind: 0,
          textEdit: {
            newText: tr,
            range: {
              start: startPosition,
              end: endPosition
            }
          },
          detail: detail
        });
      }
      items[tr].forEach(([lang, text]) => {
        if (!text.toLowerCase().includes(key.toLowerCase())) {
          return;
        }
        results.push({
          label: text,
          kind: 0,
          textEdit: {
            newText: tr,
            range: {
              start: startPosition,
              end: endPosition
            }
          },
          filterText: text + " " + lang,
          detail: detail
        });
      });
    });
  } else {
    // console.log(JSON.stringify(focusPath.node), JSON.stringify(focusPath.parent));
  }

  return results;
};
