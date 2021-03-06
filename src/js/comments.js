(function () {
    'use strict';

    window.poof = window.poof || {};
    window.poof.init = window.poof.init || {};

    var escape = poof.utils.escape;
    var unescape = poof.utils.unescape;

    function commentToHtml (comment, idx, passage) {
        var el = poof.el;
        return el('div', { classes : 'comment-readout' }, [
            el('div', { classes : 'number' }, idx + 1),
            el('div', { classes : 'title' }, escape(comment.title)),
            el('div', { classes : 'content' }, escape(comment.body))
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

        var commentEls = Fast.map(commentList, function (comment, idx) {
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
        poof.modal.write(comment.title, poof.el('p', { classes : 'comment-content-out' }, escape(comment.body)), [$confirm, $cancel]);
    }

    function commentEdit (passage, idx) {
        poof.state.comments[passage.name] = poof.state.comments[passage.name] || [];
        var comments = poof.state.comments[passage.name];
        var thisIsAnEdit = (typeof idx === 'number' && comments[idx]);
        var thisIsAPsgComment = (typeof idx === 'boolean' && idx);

        var $title = poof.forms.text('comment-title', '', 'Title...');
        var $content = poof.el('textarea', { 
            id : 'comment-content', 
            placeholder : 'Write a comment...',
            spellcheck : 'true',
            contenteditable : 'true'
        });

        if (thisIsAnEdit) {
            $title.find('#comment-title').val(comments[idx].title);
            $content.val(comments[idx].body);
        } else if (thisIsAPsgComment) {
            $title.find('#comment-title').val(passage.name);
            $content.val(unescape(passage.source));
        }

        var $form = poof.el('form', { classes : 'pure-form' }, 
            poof.el('fieldset', { classes : 'pure-group' }, [$title, $content]));

        var $confirm = poof.forms.confirm('Save', function () {

            var newComment = {
                title : poof.utils.escComment($('#comment-title').val()),
                body : poof.utils.escComment($('#comment-content').val())
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
                    comment : comments[idx],
                    passage : passage,
                    idx : idx
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

    function displayCommentNumbers () {
        var comments = poof.state.comments;
        Fast.forEach(Object.keys(comments), function (psg) {
            var readout = comments[psg].length;
            if (!readout) {
                return;
            }
            readout = '&#128172; ' + readout;
            $('.passage-card[name="' + psg + '"]')
                .find('button.comment-open')
                .empty()
                .append(readout);
        });
    }

    $(document).on(':refresh-comments', function (ev) {
        commentSave(); // comments are refreshed on delete / new / edit; good time to save
        var comments = poof.state.comments[ev.passage.name];
        var $footer = ev.passage.$el.children('.passage-footer');
        var $output = $footer.children('.comment-wrapper');

        $footer.find('button.comment-open').empty().append('&#128172; ' + (comments.length || ''));

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

    $(document).on(':comment-from-passage-text', function (ev) {
        commentEdit(ev.passage, true);
    });

    $(document).on(':view-comment', function (ev) {
        viewComment(ev.comment, ev.idx, ev.passage);
    });

    // load up comments on startup, but after DOM, and report what happened

    function commentInit () {
        var loaded = poof.store.load();
        var loadMe = (function () {
            if (loaded) {
                console.log('Poof state loaded from local storage for story "' + poof.data.ifid + '".');
                return loaded;
            }
            console.log('Poof state generated for story "' + poof.data.ifid + '".');
            return false;
        }());
        window.poof.state = {
            ifid : poof.data.ifid, // used to test if this story can use this data
            comments : (loadMe && loadMe.comments) || {} // array of comments indexed by passage name
        };
        displayCommentNumbers();
    }

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
            read = JSON.parse(atob(data));
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
            warnings.push('This file has a different IFID than the loaded story.');
            fix.ifid = poof.data.ifid;
        }
        if (!read.comments || typeof read.comments !== 'object') {
            warnings.push('The comments in this file may be corrupted or missing.');
            fix.comments = {};
        } else if (!Object.keys(read.comments).length) {
            warnings.push('There appear to be no comments in this file.');
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
        var check = function (item) {
            return (item && Array.isArray(item) && item.length);
        };

        Fast.forEach(Object.keys(read.comments), function (passage) {
            if (Fast.findIndex(poof.passages, function (psg) {
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
        displayCommentNumbers();
    }

    window.poof.comments = {
        // export the API
        store : commentSave,
        export : createCommentExport,
        import : readCommentExport
    };

    window.poof.init.comments = commentInit;

}());