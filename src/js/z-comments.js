(function () {
    'use strict';

    var key = '%%poof-' + poof.data.name + poof.data.ifid;

    function store () {
        if (!window.localStorage) {
            console.warn('Cannot access storage.');
            return {
                save : function () {},
                load : function () {},
                del : function () {}
            };
        }
        return {
            save : function (data) {
                localStorage.setItem(key, JSON.stringify(data));
            },
            load : function () {
                try {
                    return JSON.parse(localStorage.getItem(key) || '');
                } catch (err) {
                    console.warn(err);
                    return false;
                }
            },
            del : function () {
                localStorage.removeItem(key);
            }
        };
    }

    window.poof.store = store(); // storage methods, if possible

    // comments

    function escapeHtml(unsafe) { // from: https://stackoverflow.com/a/6234804
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
     }

    function commentToHtml (comment, idx, passage) {
        var el = poof.el;
        return el('div', { classes : 'comment-readout' }, [
            el('div', { classes : 'number' }, idx + 1),
            el('div', { classes : 'title' }, escapeHtml(comment.title)),
            el('div', { classes : 'content' }, escapeHtml(comment.body))
        ]).attr({
            role : 'button',
            title : comment.title
        }).on('click', function () {
            $(document).trigger({
                type : ':view-comment',
                comment : comment,
                idx : idx,
                passage : passage
            });
        }).css('cursor', 'pointer');
    }

    function commentsToDiv (commentList, passage) {
        var el = poof.el;
        var $list = el('div', { classes : 'comments-list'});

        var commentEls = commentList.map( function (comment, idx) {
            return commentToHtml(comment, idx, passage);
        });

        $list.append(commentEls);

        return $list;
    }

    function deleteComment (passage, idx) {
        if (confirm('Are you sure you want to permanently delete this comment?')) {

            poof.state.comments[passage.name].splice(idx, 1);

            $(document).trigger({
                type : ':refresh-comments',
                passage : passage
            });
            return true;
        }
    }

    function viewComment (comment, idx, passage) {
        var $confirm = poof.forms.confirm('Edit', function () {
            commentEdit(passage, idx);
        });
        var $cancel = poof.forms.cancel('Delete', function () {
            if(deleteComment(passage, idx)) {
                poof.modal.close();
            }
        });
        poof.modal.write(comment.title, comment.body, [$confirm, $cancel]);
    }

    function commentEdit (passage, idx) {
        poof.state.comments[passage.name] = poof.state.comments[passage.name] || [];
        var comments = poof.state.comments[passage.name];
        var thisIsAnEdit = (typeof idx === 'number' && comments[idx]);

        var $title = poof.forms.text('comment-title', '', 'Title...');
        var $content = poof.el('textarea', { id : 'comment-content', placeholder : 'Write a comment...' });

        if (thisIsAnEdit) {
            $title.find('#comment-title').val(comments[idx].title);
            $content.val(comments[idx].body);
        }

        var $form = poof.el('form', { classes : 'pure-form' }, 
            poof.el('fieldset', { classes : 'pure-group' }, [$title, $content]));

        var $confirm = poof.forms.confirm('Save', function () {

            var newComment = {
                title : $('#comment-title').val(),
                body : $('#comment-content').val()
            };

            if (!newComment.title && !newComment.body) {
                // handle blank comments
                poof.modal.write('Hmmm', 'Your comment is totally blank! Are you trying to delete it?', [
                    poof.forms.confirm('No!', function () {
                        commentEdit(passage, idx);
                    }),
                    poof.forms.cancel('Yes, delete it.', function () {
                        if (typeof idx === 'number') {
                            if (!deleteComment(passage, idx)) {
                                commentEdit(passage, idx);
                                return;
                            }
                        }
                        poof.modal.close();
                    })
                ]);
                return;
            }

            if (thisIsAnEdit) {
                comments[idx] = newComment;
                $(document).trigger({
                    type : ':view-comment',
                    comment : newComment
                });
                $(document).trigger({
                    type : ':refresh-comments',
                    passage : passage
                });
            } else {
                comments.push(newComment);
                poof.modal.close();
                $(document).trigger({
                    type : ':refresh-comments',
                    passage : passage
                });
            }
        });

        var $cancel = poof.forms.cancel('Cancel', function () {

            if (thisIsAnEdit) {
                $(document).trigger({
                    type : ':view-comment',
                    comment : newComment
                });
            } else {
                poof.modal.close();
            }

        });

        poof.modal.write('Edit Comment', $form, [$confirm, $cancel]);
    }

    function commentSave () {
        window.poof.store.save(window.poof.state);
        console.log('State saved!');
    }

    $(document).on(':refresh-comments', function (ev) {
        commentSave(); // comments are refreshed on delete / new / edit; good time to save
        var comments = poof.state.comments[ev.passage.name];
        var $footer = ev.passage.$el.children('.passage-footer');
        var $output = $footer.children('.comment-wrapper');

        if ($footer.hasClass('closed')) {
            return; // do nothing
        }

        var $new = poof.btn.primary('New Comment', function () {
            $(document).trigger({
                type : ':new-comment',
                passage : ev.passage
            });
        });

        var $list = commentsToDiv(comments, ev.passage);

        $output.empty().append($list, $new);

    });

    $(document).on(':comment-open', function (ev) {
        var comments = poof.state.comments[ev.passage.name];
        var $footer = ev.passage.$el.children('.passage-footer');
        var $output = $footer.children('.comment-wrapper');

        if ($footer.hasClass('closed')) {
            $output.empty();
            return;
        }

        if (comments && Array.isArray(comments) && comments.length) {
            
            var $new = poof.btn.primary('New Comment', function () {
                $(document).trigger({
                    type : ':new-comment',
                    passage : ev.passage
                });
            });

            var $list = commentsToDiv(comments, ev.passage);

            $output.empty().append($list, $new);

        } else {
            $output.empty().append( poof.el('div', { role : 'button', classes : 'empty-comment add-comment' }, 
                '+ Add a comment...').on('click', function () {
                    $(document).trigger({
                        type : ':new-comment',
                        passage : ev.passage
                    });
            }));
        }
    });

    // todo: figure out a good way to refresh the comment list; calling :comment-open doesn't seem to work

    $(document).on(':new-comment', function (ev) {
        commentEdit(ev.passage);
    });

    $(document).on(':view-comment', function (ev) {
        viewComment(ev.comment, ev.idx, ev.passage);
    });

    // load up comments on startup, but after DOM, and report what happened

    $(document).ready( function () {
        var loaded = poof.store.load();
        var loadMe = function () {
            if (loaded) {
                console.log('Poof state loaded from local storage for story "' + poof.data.ifid + '".');
                return loaded;
            }
            console.log('Poof state generated for story "' + poof.data.ifid + '".');
            return false;
        };
        window.poof.state = loadMe() || {
            ifid : poof.data.ifid, // used to test if this story can use this data
            comments : {} // array of comments indexed by passage name
        };
    });

    function createCommentExport () {
        // this utility function exports the state, with comments; a seperate function handles imports
        var data = window.poof.state;
        var filename = poof.data.name.toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .trim() + '.comments.poof';
        try {
            data = btoa(JSON.stringify(data));
        } catch (err) {
            console.warn(err);
            alert('Something went wrong. Error code: "camel". Please report this bug at: https://github.com/ChapelR/poof/issues/new');
            return;
        }
        download(data, filename, 'text/plain;charset=utf-8');
    }

    function readCommentExport (data) {
        var read, warnings = [], fix = {};

        // get the data
        try {
            read = atob(JSON.parse(data));
        } catch (err) {
            console.warn(err);
            alert('This file could not be opened. It may be corrupted.');
            return;
        }

        // check for any weirdness
        if (!read.ifid || typeof read.ifid !== 'string') {
            warnings.push('This file is missing some of its metadata.');
            fix.ifid = poof.data.ifid;
        } else if (read.ifid.trim().toLowerCase() !== poof.data.ifid.trim().toLowerCase()) {
            warnings.push('This file has a differend IFID than the loaded story.');
            fix.ifid = poof.data.ifid;
        }
        if (!read.comments || typeof read.comments !== 'object') {
            warngings.push('The comments in this file may be corrupted or missing.');
            fix.comments = {};
        } else if (!Object.keys(read.comments).length) {
            warngings.push('There appear to be no comments in this file.');
        }

        // report warnings
        if (warnings.length) {
            var message = 'There ' + (warnings.length > 1 ? 'are multiple ' : 'is a ') + 'problem with this comment file: \n\n' +
                warnings.join('\n') + '\n\nWould you like to try to load it anyway?';
            var loadAnyway = confirm(message);
            if (loadAnyway) {
                console.log('Attempting to fix malformed comment data: ', read, fix);
                Object.assign(read, fix);
                console.log('Fix restults: ', read);
            } else {
                return; // don't load
            }
        }

        // merge comments
        $('.passage-footer').addClass('closed'); // hide the work
        warnings = [];
        check = function (item) {
            return (item && Array.isArray(item) && item.length);
        };

        Object.keys(read.comments).forEach( function (passage) {
            if (poof.passages.findIndex( function (psg) {
                return passage === psg.name;
            }) === -1) {
                warnings.push('Cannot find passage "' + passage + '", ignoring comments.');
            } else {
                if (read.comments[passage] && check(read.comments[passage])) {
                    if (poof.state.comments[passage] && check(poof.state.comments[passage])) {
                        // possiblity one - both arrays have data: merge
                        poof.state.comments[passage] = poof.state.comments[passage].concat(read.comments[passage]);
                        return;
                    } else {
                        // possiblity two - only the newData has data: overwrite
                        poof.state.comments[passage] = read.comments[passage];
                    }
                } else {
                    // possibility three: the new data is not an array, empty, etc
                    return; // do nothing
                }
            }
        });

        // report and further oddities
        if (warnings.length) {
            console.warn(warnings.join('\n'));
            alert('Some comments may not have been imported, check the console for more information.');
        }

        // update the storage state
        console.log('File import complete; updating state.');
        commentSave();

    }

    window.poof.comments = {
        // export the API
        store : commentSave,
        export : createCommentExport,
        import : readCommentExport
    };

}());