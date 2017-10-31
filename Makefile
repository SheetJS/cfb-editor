.PHONY: init
init:
	git rm -f *.gif logo.{png,svg} app.*.{js,css} fontawesome-webfont.* index.html manifest.*.js styles.css vendor.*.{css,js} || echo
	cp dist/* .
	sed -i.foo 's#href="/#href="#g; s#src="/#src="#g' index.html
	sed -i.foo 's#url(/font#url(font#g' *.css
	git add *.gif logo.{png,svg} app.*.{js,css} fontawesome-webfont.* index.html manifest.*.js styles.css vendor.*.{css,js}
	@make clean

.PHONY: clean
clean:
	rm -f *.foo *.map
