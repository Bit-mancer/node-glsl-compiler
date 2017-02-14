module.exports = {
    "env": {
        "node": true
    },
    "extends": "eslint:recommended",
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
        "no-warning-comments": [
            "warn", {
                "terms": ["TODO", "FIXME"]
            }
        ]
    }
};
