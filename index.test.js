const { onComplete } = require('./index');

describe('empty autocomplete', () => {
  it('should not autocomplete if no data', () => {
    expect(
      onComplete('', {
        results: [],
        type: 'template',
        position: {
          character: 1,
          line: 1,
        },
        focusPath: {
          node: {
            type: 'StringLiteral',
            value: '',
          },
          parent: {
            type: 'MustacheStatement',
            path: {
              original: 't',
            },
          },
        },
      })
    ).toMatchSnapshot();
  });
});

describe('Intl translations', () => {
  it('should autocomplete root translation in handlebars', () => {
    expect(
      onComplete('./test-fixtures', {
        results: [],
        type: 'template',
        position: {
          character: 19,
          line: 1,
        },
        focusPath: {
          node: {
            type: 'StringLiteral',
            value: 'rootFileTranslaELSCompletionDummy',
          },
          parent: {
            type: 'MustacheStatement',
            path: {
              original: 't',
            },
          },
        },
      })
    ).toEqual([
      {
        detail: 'en-us : text 1',
        kind: 0,
        label: 'rootFileTranslation',
        textEdit: {
          newText: 'rootFileTranslation',
          range: {
            end: {
              character: 4,
              line: 1,
            },
            start: {
              character: 4,
              line: 1,
            },
          },
        },
      },
    ]);
  });

  it('should respect placeholder position in handlebars', () => {
    expect(
      onComplete('./test-fixtures', {
        results: [],
        type: 'template',
        position: {
          character: 19,
          line: 1,
        },
        focusPath: {
          node: {
            type: 'StringLiteral',
            value: 'rootFilELSCompletionDummyeTransla',
          },
          parent: {
            type: 'MustacheStatement',
            path: {
              original: 't',
            },
          },
        },
      })
    ).toEqual([
      {
        detail: 'en-us : text 1',
        kind: 0,
        label: 'rootFileTranslation',
        textEdit: {
          newText: 'rootFileTranslation',
          range: {
            end: {
              character: 12,
              line: 1,
            },
            start: {
              character: 12,
              line: 1,
            },
          },
        },
      },
    ]);
  });

  it('should autocomplete sub folder translation in handlebars', () => {
    expect(
      onComplete('./test-fixtures', {
        results: [],
        type: 'template',
        position: {
          character: 19,
          line: 1,
        },
        focusPath: {
          node: {
            type: 'StringLiteral',
            value: 'subFolderTranslatELSCompletionDummy',
          },
          parent: {
            type: 'MustacheStatement',
            path: {
              original: 't',
            },
          },
        },
      })
    ).toEqual([
      {
        detail: 'en-us : text 2',
        kind: 0,
        label: 'subFolderTranslation.subTranslation',
        textEdit: {
          newText: 'subFolderTranslation.subTranslation',
          range: {
            end: {
              character: 2,
              line: 1,
            },
            start: {
              character: 2,
              line: 1,
            },
          },
        },
      },
      {
        detail: 'en-us : another text',
        kind: 0,
        label: 'subFolderTranslation.anotherTranslation',
        textEdit: {
          newText: 'subFolderTranslation.anotherTranslation',
          range: {
            end: {
              character: 2,
              line: 1,
            },
            start: {
              character: 2,
              line: 1,
            },
          },
        },
      },
    ]);
  });

  it('should autocomplete in JS files when in the end of expression', () => {
    let focusPathNode = {
      type: 'StringLiteral',
      value: 'subFolderTranslation.another',
    };
    expect(
      onComplete('./test-fixtures', {
        results: [],
        type: 'script',
        position: {
          character: 28 + 5 + 3, // subFolderTranslation.another|
          line: 1,
        },
        focusPath: {
          node: focusPathNode,
          parent: {
            type: 'CallExpression',
            arguments: [focusPathNode],
            callee: {
              type: 'MemberExpression',
              property: {
                type: 'Identifier',
                name: 't',
                loc: {
                  start: { column: 5 },
                },
              },
            },
          },
        },
      })
    ).toEqual([
      {
        detail: 'en-us : another text',
        kind: 0,
        label: 'subFolderTranslation.anotherTranslation',
        textEdit: {
          newText: 'subFolderTranslation.anotherTranslation',
          range: {
            end: {
              character: 8,
              line: 1,
            },
            start: {
              character: 8,
              line: 1,
            },
          },
        },
      },
    ]);
  });

  it('should autocomplete in JS files when in the middle of expression', () => {
    let focusPathNode = {
      type: 'StringLiteral',
      value: 'subFolderTranslation.another',
    };
    expect(
      onComplete('./test-fixtures', {
        results: [],
        type: 'script',
        position: {
          character: 5 + 5 + 3, // subFo|lderTranslation.another
          line: 1,
        },
        focusPath: {
          node: focusPathNode,
          parent: {
            type: 'CallExpression',
            arguments: [focusPathNode],
            callee: {
              type: 'MemberExpression',
              property: {
                type: 'Identifier',
                name: 't',
                loc: {
                  start: { column: 5 },
                },
              },
            },
          },
        },
      })
    ).toEqual([
      {
        detail: 'en-us : text 2',
        kind: 0,
        label: 'subFolderTranslation.subTranslation',
        textEdit: {
          newText: 'subFolderTranslation.subTranslation',
          range: {
            end: {
              character: 8,
              line: 1,
            },
            start: {
              character: 8,
              line: 1,
            },
          },
        },
      },
      {
        detail: 'en-us : another text',
        kind: 0,
        label: 'subFolderTranslation.anotherTranslation',
        textEdit: {
          newText: 'subFolderTranslation.anotherTranslation',
          range: {
            end: {
              character: 8,
              line: 1,
            },
            start: {
              character: 8,
              line: 1,
            },
          },
        },
      },
    ]);
  });
});
