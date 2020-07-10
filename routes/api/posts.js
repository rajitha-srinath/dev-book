const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post model
const Post = require('../../models/Post');

// Profile model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');

//@route    GET api/posts/test
//@des      Test posts routes
//@access   Public
router.get('/test', (req, res) => res.json({ msg: 'Posts works...' }));

//@route    GET api/posts/
//@des      Get posts
//@access   Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({nopostsfond: 'No posts found that ID'}));
});

//@route    GET api/posts/:id
//@des      Get post by id
//@access   Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({nopostfond: 'No post found that ID'}));
});

//@route    POST api/posts
//@des      Create post
//@access   Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });
    newPost.save().then(post => res.json(post));
});

//@route    DELETE api/posts/:id
//@des      Delete post
//@access   Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'User not authorized' })
                    }
                    post.remove().then(() => res.json({ success: true }));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});

//@route    POST api/posts/like/:id
//@des      Like post
//@access   Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({ alreadyliked: 'User alrady like this post' })
                    }
                    post.likes.unshift({ user: req.user.id });
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});

//@route    POST api/posts/unlike/:id
//@des      Unlike post
//@access   Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({ notliked: 'You have not liked this post' });
                    }
                    const removeIndex = post.likes
                        .map(item =>item.user.toString())
                        .indexOf(req.user.id);
                    
                    post.likes.splice(removeIndex, 1);
                    
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        });
});

//@route    POST api/posts/comment/:id
//@des      Add comment to post
//@access   Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }
            post.comments.unshift(newComment);
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});

//@route    DELETE api/posts/comment/:id/:comment_id
//@des      Remove comment from post
//@access   Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res.status(404).json({ commentnoexists: 'Comment does not exists' });
            }
            const removeIndex = post.comments
                .map(item => item._id.toString)
                .indexOf(req.params.comment_id);
            
            post.comments.splice(removeIndex, 1);
            post.save().then(post => res.json(post));    
        })
});

module.exports = router;