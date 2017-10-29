.PHONY: dist
dist:
	rm -f dist/*.{js,css,html,map}
	npm run build

.PHONY: lint
lint:
	npm run lint

.PHONY: clean
clean:
	rm -f *.map *.foo
