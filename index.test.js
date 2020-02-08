const { onComplete } = require('./index');

describe('empty autocomplete', () => {
    it('should not autocomplete if no data', () => {
        expect(onComplete('', {
            results: [],
            type: 'template',
            position: {
                character: 1,
                line: 1
            },
            focusPath: {
                node: {
                    type: 'StringLiteral',
                    value: ''
                },
                parent: {
                    type: 'MustacheStatement',
                    path: {
                        original: 't'
                    }
                }
            }
        })).toMatchSnapshot();
    })
});
