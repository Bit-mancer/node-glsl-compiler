module.exports = {
    'env': {
        'es6': true,
        'node': true,
        'jest': true,
        'jasmine': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 6
    },
    'rules': {
        'indent': [
            'warn',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'warn',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'no-console': ['warn'],
        'no-unused-vars': ['warn', {'vars': 'all', 'args': 'after-used'}],
        'comma-dangle': ['error', 'only-multiline'],
        'no-var': ['error'],
        'no-warning-comments': [
            'warn', {
                'terms': ['TODO', 'FIXME']
            }
        ],
        'strict': ['error', 'global'],
        'valid-jsdoc': [
            'warn',
            {
                'requireReturn': false
            }
        ],
        'require-jsdoc': [
            'error',
            {
                'require': {
                    'ClassDeclaration': true
                }
            }
        ]
    }
};
