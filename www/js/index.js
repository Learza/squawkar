/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('offline', this.onOffline, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    onOffline: function() {
        alert("No internet connection!");
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }

};

var post;
var user_token;

function addPost(data) {

    if (data.length == 0) {
        $('#add-post').prepend('<h1 class="text-center post">No Squawks Found</h1>');
    } else {


        var pag = '<li class="prev"><span>← Previous</span></li>';
        for (var i = 1; i <= data.counts.pages; i++) {
            pag += '<li><a href="/?page=' + i + '">' + i + '</a></li>';
        }
        pag += '<li class="next"> <a rel="next" href="/?page=2">Next →</a> </li>';
        $('.pagination').html(pag);

        var userData = data.userdata.reverse();

        $.each(data.posts.reverse(), function(index, val) {
            var thumb, content;
            if (data.posts[index].format != "graffiti") {
                thumb = 'text';
            } else {
                thumb = 'graffiti';
            }
            post = '<div class="post transfromOut"><div style="box-shadow: 0px 0px 0px 0px rgba(34, 34, 34, 0.15),inset 0px -4px 0px 0px #D7351C !important; height:53px; width:50px; border-radius:5px; margin-right:15px;" class="pull-left"><div class="post-thumb pull-left" style="width:50px;"><a class="post-thumb toSingle" data-id="' + data.posts[index].id + '" href="single.html"><img alt="Missing" class="img-rounded" src="photos/' + thumb + '/missing.png"></a></div></div><div class="post-content pull-left"><div style="font-weight:bold; font-size:18px"><a class="toSingle" data-id="' + data.posts[index].id + '" href="single.html">' + data.posts[index].title + '</a></div><p class="text-muted">Posted by <a href="' + data.posts[index].user_id + '" style="color:#000; text-decoration:none;">' + userData[index].username + '</a> ' + dateDiffInDays(data.posts[index].created_at) + '</p></div><div class="clearfix"></div></div>';
            $('#add-post').prepend(post);
        });
        setTimeout(animateIn, 1000);
    }
}

function animateIn() {
    var postsToHide = $('.post');
    postsToHide.each(function(index, el) {
        setTimeout(function() {
            $(el).addClass('has-transition').removeClass('transfromOut');
        }, 50 * index);
    });
}

function toSingle() {
    event.preventDefault();
    window.localStorage.setItem("id", $(this).data("id"));
    window.location = 'single.html';
}



function getData(data) {
    var url = 'http://squawkar.herokuapp.com/api/v1/' + data;
    var ret;

    $.ajax({
        type: 'GET',
        url: url,
        data: data,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        success: function(res) {
            addPost(res);
            $('.toSingle').bind('click', toSingle);

        },
        error: function(res) {
            $('#add-post').prepend('error');
        }
    });
}


function addSingleData(data) {

    console.log(data);

    if (data.squawk.format == 'graffiti') {
        var text = '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><div class="graffiti-text"><h1>' + data.squawk.graffiti_text + '</h1></div></div>';
    } else {
        var title = '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><h2 style="color:#000; font-family: proxima-nova, sans-serif; font-size: 30px; font-weight: bold;">' + data.squawk.title + '</h2></div></div>';
        var text = '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><div style="padding-bottom:20px;"><p></p><p>' + data.squawk.description + '</p><p></p></div></div></div>';
        text = title + text;
    }

    var authorData = '<a href="/profile/' + data.userdata[0].username + '" style="text-decoration:none;"><img alt="Missing" class="img-rounded" src="img/missing.png"></a> <strong style="font-size:20px; margin-left:5px;"><a href="/profile/' + data.userdata[0].username + '" style="color:#000; text-decoration:none;">' + data.userdata[0].username + '</a></strong> - <strong syle="font-size:18px; font-weight:normal;">Posted ' + dateDiffInDays(data.squawk.created_at) + '</strong>';
    $('#text').html(text);
    $('#author-data').html(authorData);

    if (data.comments.length > 0) {
        $.each(data.comments, function(index, val) {
            if (window.localStorage.getItem('user_token') != -1) {
                var like = '<a href="" class="like" onclick="like(\'like\',' + window.localStorage.getItem("id") + ',' + data.comments[index].id + ');return false;">Like </a>(' + data.votes[index].upvotes + ')';
                var unlike = '<a href="" class="like" onclick="like(\'dislike\',' + window.localStorage.getItem("id") + ',' + data.comments[index].id + ');return false;">Dislike </a>(' + data.votes[index].downvotes + ')';
            } else {
                var like = data.votes[index].upvotes + ' Likes';
                var unlike = data.votes[index].downvotes + 'Dislikes';
            }
            //TODO user data
            var comment = '<div class="media"><a class="pull-left" href="/profile/' + data.commentusers[index].username + '" style="text-decoration:none;"><img alt="Missing" class="img-rounded media-object" src="img/missing.png"></a><div class="media-body"><h4 class="media-heading" style="font-size:14px;">Posted by <a href="/profile/' + data.commentusers[index].username + '">' + data.commentusers[index].username + '</a> Posted ' + dateDiffInDays(val.created_at) + '<span>-</span> <span class="pull-right">' + like + ' | ' + unlike + ' </span></h4><p>' + val.message + '</p></div></div>';
            $('#comments').append(comment);
        });
    } else {
        $('#comments h3').remove();
        $('#comments').html('<br><h1 class="text-center">No Comments</h1>');
    }

}

function getSingle() {
    var url = 'http://squawkar.herokuapp.com/api/v1/squawks/' + window.localStorage.getItem('id');
    var ret;

    $.ajax({
        type: 'GET',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        success: function(res) {
            addSingleData(res);
            console.log(res);
        },
        error: function(res) {
            $('#add-post').prepend('error');
        }
    });
}

var _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(postDate) {
    // Discard the time and time-zone information.
    var ret;
    var now = new Date();
    postDate = new Date(postDate);


    var utc1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var utc2 = Date.UTC(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());

    ret = Math.floor((utc2 - utc1) / _MS_PER_DAY);

    if (Math.abs(ret) >= 365) return Math.ceil(Math.abs(ret) / 365) + ' years ago';
    else if (Math.abs(ret) >= 30) return Math.ceil(Math.abs(ret) / 30) + ' months ago';
    else return Math.abs(ret) + ' days ago';

}

function createPost(title, description, category, format) {

    if (window.localStorage.getItem('user_token') == -1) return false;

    if (format == 'text' && (title.length < 5 || title.length >= 90)) return 'title_error';

    else if (description.length > 200) return 'description_error';
    else if (category.length < 1 || category.length >= 20) return 'category_error';

    var url = 'http://squawkar.herokuapp.com/api/v1/squawks/new?user_token=' + window.localStorage.getItem('user_token');


    $.ajax({
        type: 'GET',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        data: {
            squawk: {
                title: title,
                description: description,
                category: category,
                format: format
            },
            commit: 'Squawk'
        },
        success: function(res) {
            console.log(res);
            return 'OK';
        },
        error: function(res) {
            console.log('error');
        }
    });
}

function deletePost(postId) {

    if (window.localStorage.getItem('user_token') == -1) return;

    var url = 'http://squawkar.herokuapp.com/api/v1/squawks/' + postId + '?user_token=' + window.localStorage.getItem('user_token');

    $.ajax({
        type: 'GET',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        data: {
            _method: 'delete'
        },
        success: function(res) {
            console.log(res);
        },
        error: function(res) {
            console.log(error);
        }
    });
}


function addComment(postId, comment, isGraffiti) {
    if (window.localStorage.getItem('user_token') == -1) return;

    var url = 'http://squawkar.herokuapp.com/api/v1/squawks/' + postId + '/comments/new?user_token=' + window.localStorage.getItem('user_token');

    $.ajax({
        type: 'GET',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        data: {
            comment: {
                message: comment
            },
            commit: 'Create'
        },
    })
        .done(function(res) {
            location.reload();
        })
        .fail(function(res) {
            console.log("error");
        });

}

function registration() {
    var url = 'http://squawkar.herokuapp.com/api/v1/api_users';

    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        data: {
            api_user: {
                name: 'teszt',
                username: 'test2',
                email: 'test2@email.com',
                gender: 'Male',
                location: 'Hungary',
                password: '12345678',
                password_confirmation: '12345678'
            },

            commit: 'Sign Up'
        },
        success: function(res) {
            console.log(res);
        },
        error: function(res) {
            console.log(error);
        }
    });
}

function like(action, postId, commentId) {

    console.log('megy');

    if (window.localStorage.getItem('user_token') == -1) return;

    var url = 'http://squawkar.herokuapp.com/api/v1/squawks/' + postId + '/comments/' + commentId + '/' + action + '?user_token=' + window.localStorage.getItem('user_token');
    $.ajax({
        type: 'GET',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        success: function(res) {
            location.reload();
        },
        error: function(res) {
            console.log(res);
        }
    });
}

function favourite(action, postId) {
    if (window.localStorage.getItem('user_token') == -1) return;

    var url = 'http://squawkar.herokuapp.com/api/v1/squawks/' + postId + '/' + action + '?user_token=' + window.localStorage.getItem('user_token');
    $.ajax({
        type: 'GET',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        success: function(res) {
            console.log(res);
        },
        error: function(res) {
            console.log(error);
        }
    });
}

function follow(action, username) {
    if (window.localStorage.getItem('user_token') == -1) return;

    var url = 'http://squawkar.herokuapp.com/api/v1/profile/' + username + '/' + action + '?user_token=' + window.localStorage.getItem('user_token');
    $.ajax({
        type: 'GET',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        success: function(res) {
            console.log(res);
        },
        error: function(res) {
            console.log(error);
        }
    });
}

var filter = 'squawks';

jQuery(document).ready(function() {


    if (window.localStorage.getItem('user_token') == undefined)
        window.localStorage.setItem("user_token", '-1');

    if (window.localStorage.getItem('user_token') != -1) {
        var navbar = '<li><a class="new-squawk-button" href="new.html">Squawk</a></li><li><a href="/notifications">Notifications</a></li><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown"> ' + window.localStorage.getItem('user_name') + ' <b class="caret"></b> </a> <ul class="dropdown-menu"> <li><a href="/profile/' + window.localStorage.getItem('user_name') + '">Profile</a></li> <li><a href="/following">Following</a></li> <li><a href="/users/edit">Settings</a></li> <li class="divider"></li> <li><a id="logout" data-method="delete" href="/users/sign_out" rel="nofollow">Logout</a></li> </ul> </li>';
        $('.navbar-right').html(navbar);
    }


    getData('squawks');


    $('.category-button').click(function() {
        $('#squawk_category').val($(this).data('category'));
    });


    $('#search').submit(function(e) {


        var postsToHide = $('.post');
        var filter = 'search?q=' + $(this).find('#q').val();

        postsToHide.each(function(index, el) {
            setTimeout(function() {
                $(el).addClass('transfromOut');
            }, 50 * index);
            setTimeout(function() {
                $('.post').remove();
                if (postsToHide.length == index + 1) {
                    getData(filter);
                }
            }, 2100);
        });
        return false;
    });

    $('.nav-pills a').click(function(event) {
        event.preventDefault();
        var postsToHide = $('.post');

        if ($(this).attr('id') == 'all' || $(this).attr('id') == 'popular' || $(this).attr('id') == 'commented') filter = 'squawks?order=' + $(this).attr('id');
        else filter = $(this).data('link');

        $(this).parent().siblings('li').removeClass('active');
        $(this).parent().addClass('active');

        postsToHide.each(function(index, el) {
            setTimeout(function() {
                $(el).addClass('transfromOut');
            }, 50 * index);
            setTimeout(function() {
                $('.post').remove();
                if (postsToHide.length == index + 1) {
                    getData(filter);
                }
            }, 2100);
        });
    });

    $('#login_btn').click(function(event) {
        event.preventDefault();
        $.ajax({
            url: 'http://squawkar.herokuapp.com/api/v1/api_users/sign_in',
            type: 'POST',
            dataType: 'jsonp',
            jsonp: "callback",
            crossDomain: true,
            data: {
                login: $('#user_login').val(),
                password: $('#user_password').val()
            }
        })
            .done(function(res) {
                console.log(res);
                window.localStorage.setItem("user_token", res.user_token);
                window.localStorage.setItem("user_name", res.username);
                window.location = 'index.html';
            })
            .fail(function() {
                console.log("error");
            });

    });

    $('#logout').click(function(event) {
        event.preventDefault();
        window.localStorage.setItem("user_token", '-1');
        window.location = 'index.html';
    });

    $("#add-new").click(function(e) {
        e.preventDefault();
        var title = $('#squawk_title').val();
        var description = ($(this).hasClass('graffiti')) ? $('#squawk_graffiti_text').val() : $('#squawk_description').val();
        var category = $('#squawk_category').val();
        var format = ($(this).hasClass('graffiti')) ? 'graffiti' : 'text';

        var response = createPost(title, description, category, format);

        if (response == "title_error") alert('Title must be between 5 and 20 characters');
        if (response == "description_error") alert('Description must be less than 200 characters');
        if (response == "category_error") alert('Category must be filled');
    });

    $(".pagination li a").click(function(event) {
        event.preventDefault();
        var postsToHide = $('.post');

        $(this).parent().siblings('li').removeClass('active');
        $(this).parent().addClass('active');

        var page = $(this).attr('href').replace('/', '');

        postsToHide.each(function(index, el) {
            setTimeout(function() {
                $(el).addClass('transfromOut');
            }, 50 * index);
            setTimeout(function() {
                $(this).remove();
                if (postsToHide.length == index + 1) {
                    getData(filter + page);
                }
            }, 2100);
        });
    });

});