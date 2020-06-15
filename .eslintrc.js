module.exports = {
	'env': {
		'commonjs': true,
		'es2020': true,
		'node': true
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 11
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'windows'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		]
	}
};
