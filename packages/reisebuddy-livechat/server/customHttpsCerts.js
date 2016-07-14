/**
 * Hack to apply own certs
 */
(function () {
	var https = Npm.require('https');
	var certDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.nodeCaCerts/';

	var caMap = (function () {
		try {
			var fs = Npm.require('fs');
			var result = {};
			if (fs.statSync(certDir).isDirectory()) {
				var certList = fs.readdirSync(certDir);
				for (var i = 0; i < certList.length; i++) {
					result[certList[i]] = fs.readFileSync(certDir + certList[i]);
				}
			}
		} catch (e) {
			console.warn("unable to load private root certs from path: " + certDir);
		}
		return result;
	})();
	https.request = (function (request) {
		return function (options, cb) {
			if (options && !options.ca) {
				var crt = caMap[options.hostname || options.host];
				if(crt) {
					options.ca = caMap[options.hostname || options.host];
				}
			}
			return request.call(https, options, cb);
		};
	})(https.request);
})();