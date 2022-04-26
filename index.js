const flat = require("flat");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

function isLocalizationHelperTranslataionName(focusPath, type) {
  let p = focusPath.parent;
  if (!p) {
    return false;
  }
  if (type === "script" && focusPath.node.type === "StringLiteral") {
    let isMemberExp = p.type === 'CallExpression' && p.callee && p.callee.type === "MemberExpression";
    let hasValidCallee = isMemberExp && p.callee.property && p.callee.property.type === 'Identifier' && p.callee.property.name === "t";
    return hasValidCallee && p.arguments.indexOf(focusPath.node) === 0;
  }
  return type === "template" && (
    focusPath.node.type === "StringLiteral" &&
    (p.type === "MustacheStatement" ||
      p.type === "SubExpression") &&
    p.path.original === "t"
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
  if ([".yaml", ".yml"].includes(ext)) {
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

function recursiveIntlTranslationsSearch(hashMap, startPath) {
  const localizations = fs.readdirSync(startPath);
  localizations.forEach((fileName) => {
    const extName = path.extname(fileName);
    const localization = path.basename(fileName, extName);
    const filePath = path.join(startPath, fileName);
    try {
      if (fs.lstatSync(filePath).isDirectory()) {
        recursiveIntlTranslationsSearch(hashMap, filePath);
      } else {
        const file = objFromFile(filePath);
        addToHashMap(hashMap, file, localization);
      }
    } catch (e) {
      console.log("e", e);
    }
  });
}

function getTranslations(root) {
  const hashMap = {};
  const intlEntry = path.join(root, "translations");
  const i18nEntry = path.join(root, "app", "locales");
  if (fs.existsSync(intlEntry)) {
    recursiveIntlTranslationsSearch(hashMap, intlEntry);
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
  if (isLocalizationHelperTranslataionName(focusPath, type)) {
    const items = getTranslations(_);
    const PLACEHOLDER = 'ELSCompletionDummy';

    let indexOfPlaceholder = focusPath.node.value.indexOf(PLACEHOLDER);

    if (
      indexOfPlaceholder === -1 &&
      focusPath.parent &&
      focusPath.parent.callee &&
      focusPath.parent.callee.property
    ) {
      // in js call
      indexOfPlaceholder =
        position.character -
        focusPath.parent.callee.property.loc.start.column -
        3; // column start of `t` call + `t("` (3 symbols)
    }

    const key = focusPath.node.value.slice(0, indexOfPlaceholder);
    const startPosition = {
      character: position.character - key.length,
      line: position.line,
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
