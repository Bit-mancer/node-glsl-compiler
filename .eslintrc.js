module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 6,
        "ecmaFeatures": {
            "impliedStrict": true,
        }
    },
    "rules": {
        "indent": [
            "warn",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "warn",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": ["warn"],
        "no-unused-vars": ["warn", {"vars": "all", "args": "after-used"}],
        "comma-dangle": ["error", "only-multiline"],
        "no-var": ["error"],
        "no-warning-comments": [
            "warn", {
                "terms": ["TODO", "FIXME"]
            }
        ]
    }
};
