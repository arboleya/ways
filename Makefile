MVERSION=node_modules/mversion/bin/version
VERSION=`$(MVERSION) | sed -E 's/\* package.json: //g'`

ISTANBUL=node_modules/istanbul/lib/cli.js
MOCHA=node_modules/mocha/bin/mocha
_MOCHA=node_modules/mocha/bin/_mocha
COVERALLS=node_modules/coveralls/bin/coveralls.js

setup:
	@npm install



test:
	@$(MOCHA) --compilers coffee:coffee-script \
		--ui bdd \
		--reporter spec \
		--recursive \
		test

test.coverage:
	@$(ISTANBUL) cover $(_MOCHA) -- \
		--compilers coffee:coffee-script \
		--ui bdd \
		--reporter spec \
		--recursive \
		test

test.coverage.preview: test.coverage
	@cd coverage/lcov-report && python -m SimpleHTTPServer 8080



bump.minor:
	@$(MVERSION) minor

bump.major:
	@$(MVERSION) major

bump.patch:
	@$(MVERSION) patch



publish:
	git tag $(VERSION)
	git push origin $(VERSION)
	git push origin master
	npm publish

re-publish:
	git tag -d $(VERSION)
	git tag $(VERSION)
	git push origin :$(VERSION)
	git push origin $(VERSION)
	git push origin master -f
	npm publish -f

.PHONY: test