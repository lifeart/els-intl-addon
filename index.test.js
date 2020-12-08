const { onComplete } = require("./index");

describe("empty autocomplete", () => {
  it("should not autocomplete if no data", () => {
    expect(
      onComplete("", {
        results: [],
        type: "template",
        position: {
          character: 1,
          line: 1,
        },
        focusPath: {
          node: {
            type: "StringLiteral",
            value: "",
          },
          parent: {
            type: "MustacheStatement",
            path: {
              original: "t",
            },
          },
        },
      })
    ).toMatchSnapshot();
  });

  describe("Itnl translations", () => {
    it("should autocomplete root translation", () => {
      expect(
        onComplete("./test-fixtures", {
          results: [],
          type: "template",
          position: {
            character: 1,
            line: 1,
          },
          focusPath: {
            node: {
              type: "StringLiteral",
              value: "rootFileTransla",
            },
            parent: {
              type: "MustacheStatement",
              path: {
                original: "t",
              },
            },
          },
        })
      ).toEqual([
        {
          detail: "en-us : text 1",
          kind: 0,
          label: "rootFileTranslation",
          textEdit: {
            newText: "rootFileTranslation",
            range: {
              end: {
                character: -13,
                line: 1,
              },
              start: {
                character: -13,
                line: 1,
              },
            },
          },
        },
      ]);
    })
    
    it("should autocomplete sub folder translation", () => {
      expect(
        onComplete("./test-fixtures", {
          results: [],
          type: "template",
          position: {
            character: 1,
            line: 1,
          },
          focusPath: {
            node: {
              type: "StringLiteral",
              value: "subFolderTranslat",
            },
            parent: {
              type: "MustacheStatement",
              path: {
                original: "t",
              },
            },
          },
        })
      ).toEqual([
        {
          detail: "en-us : text 2",
          kind: 0,
          label: "subFolderTranslation.subTranslation",
          textEdit: {
            newText: "subFolderTranslation.subTranslation",
            range: {
              end: {
                character: -15,
                line: 1,
              },
              start: {
                character: -15,
                line: 1,
              },
            },
          },
        },
      ]);
    });
  });
});
