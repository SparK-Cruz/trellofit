(function(){
    class Dev {
        constructor() {
            const that = this;
            const interval = setInterval(() => {
                if (this.bindElements()) {
                    clearInterval(interval);
                    this.start();
                }
            }, 300);

            setInterval(() => {
                this.sanityCheck();
            }, 10000);
        }

        start() {
            this.showCount();
            this.trackChanges();
            this.removeAddCardButtons();
        }

        sanityCheck() {
            this.removeInvisible();

            if (!this.wip || !this.todo || !this.done
                || !this.wip.length || !this.todo.length || !this.done.length) {
                this.bindElements();
                this.start();
            }

            this.showCount();
            this.updateAll();
        }

        removeInvisible() {
            this.lists = this.lists.filter(list => {
                return list.offsetParent !== null;
            });
        }

        bindElements() {
            this.board = document.querySelector('#board');
            this.lists = [].slice.call(document.querySelectorAll('.list'));

            if (this.lists) {
                this.wip = this.lists.filter(element => {
                    return /^\[WIP\]/.test(element.querySelector('.list-header-name').value);
                });
                this.todo = this.lists.filter(element => {
                    return /^\[TODO\]/.test(element.querySelector('.list-header-name').value);
                })[0];
                this.done = this.lists.filter(element => {
                    return /^\[DONE\]/.test(element.querySelector('.list-header-name').value);
                })[0];
            }

            return this.board
                && this.lists
                && this.todo
                && this.wip
                && this.done;
        }

        showCount() {
            [].slice.call(document.querySelectorAll('.list-header-num-cards')).forEach(element => element.style.display = 'inline');
        }

        trackChanges() {
            this.lists.forEach(list => {
                list.addEventListener('mouseenter', () => {
                    if (this.wip.includes(list)) {
                        this.updateListLimitStatus(list);
                    }

                    this.updateListCardHours(list);
                });
                list.addEventListener('mouseup', () => {
                    if (this.wip.includes(list)) {
                        this.updateListLimitStatus(list);
                    }

                    this.updateListCardHours(list);
                });
                list.querySelector('.list-header-name').addEventListener('change', () => {
                    if (this.wip.includes(list)) {
                        this.updateListLimitStatus(list);
                    }

                    this.updateListCardHours(list);
                });

                setTimeout(() => {
                    if (this.wip.includes(list)) {
                        this.updateListLimitStatus(list);
                    }

                    this.updateListCardHours(list);
                }, 500);
            });
        }

        removeAddCardButtons() {
            this.done.querySelector('.open-card-composer').remove();
            this.wip.forEach(list => {
                list.querySelector('.open-card-composer').remove();
            });
        }

        // private

        updateAll() {
            this.lists.forEach(list => {
                this.updateListCardHours(list);
                this.updateListLimitStatus(list);
            });
        }

        updateListLimitStatus(list) {
            this.removeClass(list, 'full');
            this.removeClass(list, 'overflown');

            const name = list.querySelector('.list-header-name').value;
            if (!/\[\d+\]$/.test(name))
                return;

            const count = parseInt(list.querySelector('.list-header-num-cards').innerHTML.split(' ')[0]);
            const limit = parseInt(/\[(\d+)\]$/.exec(name)[1]);

            if (count == limit)
                this.addClass(list, 'full');

            if (count > limit)
                this.addClass(list, 'overflown');
        }

        updateListCardHours(list) {
            const countElement = list.querySelector('.list-header-num-cards');
            const titles = list.querySelectorAll('.list-card-title');

            const totals = titles.length ? ([].slice.call(titles).map(title => {
                // title.firstChild.textContent = '';
                const match = title.firstChild.nextSibling.textContent.match(/^(\d+\.?\d*)h?\s?(?:\/\s?(\d+\.?\d*)h?)?/);

                if (match && match.length) {
                    let values = match.slice(1).map(x => parseFloat(x) || 0.0);

                    return values;
                }

                return [0.0, 0.0];
            }).reduce((prev, pair) => {
                return [prev[0] + pair[0], prev[1] + pair[1]];
            })) : [0.0, 0.0];

            let text = countElement.textContent.split(' - ')[0];
            countElement.textContent = text+' - '+totals[0].toFixed(1)+'h / '+totals[1].toFixed(1)+'h';
        }

        hasClass(element, name) {
            const classes = element.className.split(' ').map(c => c.trim());
            return !!~classes.indexOf(name);
        }

        addClass(element, name) {
            const classes = element.className.split(' ').map(c => c.trim());
            if (this.hasClass(element, name)) {
                return;
            }

            classes.push(name);
            element.className = classes.join(' ');
        }

        removeClass(element, name) {
            const classes = element.className.split(' ').map(c => c.trim());
            if (!this.hasClass(element, name)) {
                return;
            }

            classes.splice(classes.indexOf(name), 1);
            element.className = classes.join(' ');
        }
    }

    new Dev();
})();
