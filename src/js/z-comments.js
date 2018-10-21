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

    window.poof.state = poof.store.load() || {
        ifid : poof.data.ifid, // used to test if this story can use this data
        comments : {} // array of comments indexed by passage name
    };

    // comments are not loaded until requested by a `comments...` button
    // comments are then listed, expanding the passage card
    // comments may have a title and text (textbox and text area)
    // comments may be added, deleted, or edited
    // comments may be exported separately; no story export system exports them
    // comments may be imported from file, shared, etc
    // comments are exported to html format only

    function commentToHtml (comment, idx, passage) {
        var el = poof.el;
        return el('div', { classes : 'comment-readout' }, [
            el('div', { classes : 'number' }, idx + 1),
            el('div', { classes : 'title' }, comment.title),
            el('div', { classes : 'content' }, comment.body)
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

    function viewComment (comment, idx, passage) {
        var $confirm = poof.forms.confirm('Edit', function () {
            commentEdit(passage, idx);
        });
        var $cancel = poof.forms.cancel('Delete', function () {
            poof.modal.close();
            $(document).trigger({
                type : ':comment-open',
                passage : passage
            });
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

            console.log(newComment, poof.state.comments);

            if (thisIsAnEdit) {
                comments[idx] = newComment;
                $(document).trigger({
                    type : ':view-comment',
                    comment : newComment
                });
                $(document).trigger({
                    type : ':comment-open',
                    passage : passage
                });
            } else {
                comments.push(newComment);
                poof.modal.close();
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

    // todo: save, load, and export comments

}());