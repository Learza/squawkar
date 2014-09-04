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

    var pictureSource;   // picture source
    var destinationType; // sets the format of returned value 
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

function notifications(type) {

    $('.notify').html('');

    if (type == 'unread')
        var url = 'http://squawkar.herokuapp.com/api/v1/notifications/?user_token=' + window.localStorage.getItem('user_token');
    else
        var url = 'http://squawkar.herokuapp.com/api/v1/notifications/all/?user_token=' + window.localStorage.getItem('user_token');;

    $.ajax({
        type: 'GET',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        success: function(res) {
            console.log(res);
            addNotifications(res);
        },
        error: function(res) {
            console.log("error");
        }
    });
}


function addNotifications(data) {
    var html;
    $.each(data.notifications, function(index, val) {
        html = '<div class="list-group"> <a href="#" class="list-group-item" style="font-size:18px;"> <span style="color:#FF5200; font-weight:bold;">' + data.userdata[index].username + '</span> commented on <span style="color:#FF5200; font-weight:bold;">' + data.post_data[index].title + '</span> about ' + dateDiffInDays(data.notifications[index].created_at) + ' </a> </div>';
        $('.notify').append(html);

    });
}

function addPost(data) {

    if (data.length == 0) {
        $('#add-post').prepend('<h1 class="text-center post">No Squawks Found</h1>');
    } else {

        if (data.counts != undefined) {
            var pag = ''; //<li class="prev"><span>← Previous</span></li>
            for (var i = 1; i <= data.counts.pages; i++) {
                pag += '<li><a href="?page=' + i + '">' + i + '</a></li>';
            }
            pag += ''; //<li class="next"> <a rel="next" href="/?page=2">Next →</a> </li>
            $('.pagination').html(pag);

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
        }


        if (data.userdata == undefined)
            var userData = data.users.reverse();
        else
            var userData = data.userdata.reverse();

        $.each(data.posts.reverse(), function(index, val) {
            var thumb, content;
            var shadow = "";

            if (data.posts[index].format == "graffiti") {
                thumb = 'photos/graffiti/missing.png';
                shadow = "box-shadow: 0px 0px 0px 0px rgba(34, 34, 34, 0.15)";
            }else if(data.posts[index].format == "image"){
                var stringID = data.posts[index].id;
                console.log(stringID);
                while (stringID.toString().length < 3) {
                    console.log("Qwe");
                    stringID = "0" + val.id.toString();
                }
                thumb = "http://dw0sh5ecbsahi.cloudfront.net/squawks/photos/000/000/"+stringID+"/tiny/"+val.photo_file_name;
            } else {
                thumb = 'photos/text/missing.png';
                shadow = "box-shadow: 0px 0px 0px 0px rgba(34, 34, 34, 0.15)";
            }
            post = '<div class="post transfromOut"><div style="'+shadow+'inset 0px -4px 0px 0px #D7351C !important; height:53px; width:50px; border-radius:5px; margin-right:15px;" class="pull-left"><div class="post-thumb pull-left" style="width:50px;"><a class="post-thumb toSingle" data-id="' + data.posts[index].id + '" href="single.html"><img alt="Missing" class="img-rounded" src="'+ thumb + '"></a></div></div><div class="post-content pull-left"><div style="font-weight:bold; font-size:18px"><a class="toSingle" data-id="' + data.posts[index].id + '" href="single.html">' + data.posts[index].title + '</a></div><p class="text-muted">Posted by <a class="toUser" href="profile.html" data-uid="' + userData[index].username + '" style="color:#000; text-decoration:none;">' + userData[index].username + '</a> ' + dateDiffInDays(data.posts[index].created_at) + '</p></div><div class="clearfix"></div></div>';
            $('#add-post').prepend(post);
        });
        setTimeout(animateIn, 1000);
    }
    $('.toUser').click(function(e) {
        e.preventDefault();
        window.localStorage.setItem("userProfileId", $(this).data('uid'));
        window.localStorage.setItem("profile_view", 'activity');
        window.location = $(this).attr('href');
    });
}


function getProfileData(name) {

    var url;

    if (window.localStorage.getItem('page') == 'squawks') url = 'http://squawkar.herokuapp.com/api/v1/profile/' + name + '/squawks?user_token=' + window.localStorage.getItem('user_token');
    else if (window.localStorage.getItem('page') == 'favourites') url = 'http://squawkar.herokuapp.com/api/v1/profile/' + name + '/favourites?user_token=' + window.localStorage.getItem('user_token');
    else url = 'http://squawkar.herokuapp.com/api/v1/profile/' + name + '/?user_token=' + window.localStorage.getItem('user_token');

    $.ajax({
        type: 'GET',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        success: function(res) {
            console.log(res);
            $('.usr-name').html('<i class="icon-user"></i>' + res.user.slug);
            $('.joined').html('<i class="glyphicon glyphicon-time"></i>' + dateDiffInDays(res.user.created_at));
            if (window.localStorage.getItem('page') == 'squawks') addSquawks(res);
            else if (window.localStorage.getItem('page') == 'favourites') addFavourites(res);
            else addActivity(res);
        },
        error: function(res) {
            console.log("error");
        }
    });
}


function addSquawks(data) {
    $.each(data.squawks, function(index, val) {
        var html = '<div class="post"> <div style="box-shadow: 0px 0px 0px 0px rgba(34, 34, 34, 0.15),inset 0px -4px 0px 0px #D7351C !important; height:53px; width:50px; border-radius:5px; margin-right:15px;" class="pull-left"> <div class="post-thumb pull-left" style="width:50px;"> <a class="post-thumb toSingle" href="single.html" data-id="' + val.id + '" style=""><img alt="Missing" class="img-rounded" src="photos/' + val.format + '/missing.png"></a> </div> </div> <div class="post-content pull-left"> <div style="font-weight:bold; font-size:18px;"> <a href="single.html" data-id="' + val.id + '">' + ((val.format == "text") ? val.title : val.graffiti_text) + '</a> </div> <p class="text-muted">Posted by <a href="profile.html" class="toUser" data-uid="' + data.user.slug + '" style="color:#000; text-decoration:none;">' + data.user.slug + '</a> ' + dateDiffInDays(val.created_at) + '</p> </div> <div class="clearfix"></div> </div>';
        $('.squawks').append(html);
    });

    $('.toUser').click(function(e) {
        e.preventDefault();
        window.localStorage.setItem("userProfileId", $(this).data('uid'));
        window.localStorage.setItem("profile_view", 'activity');
        window.location = $(this).attr('href');
    });
}

function addFavourites(data) {
    $.each(data.squawks, function(index, val) {
        var html = '<div class="post"> <div style="box-shadow: 0px 0px 0px 0px rgba(34, 34, 34, 0.15),inset 0px -4px 0px 0px #D7351C !important; height:53px; width:50px; border-radius:5px; margin-right:15px;" class="pull-left"> <div class="post-thumb pull-left" style="width:50px;"> <a class="post-thumb toSingle" href="single.html" data-id="' + val.id + '" style=""><img alt="Missing" class="img-rounded" src="photos/' + val.format + '/missing.png"></a> </div> </div> <div class="post-content pull-left"> <div style="font-weight:bold; font-size:18px;"> <a href="single.html" data-id="' + val.id + '">' + ((val.format == "text") ? val.title : val.graffiti_text) + '</a> </div> <p class="text-muted">Posted by <a href="profile.html" class="toUser" data-uid="' + data.user.slug + '" style="color:#000; text-decoration:none;">' + data.user.slug + '</a> ' + dateDiffInDays(val.created_at) + '</p> </div> <div class="clearfix"></div> </div>';
        $('.squawks').append(html);
    });

    $('.toUser').click(function(e) {
        e.preventDefault();
        window.localStorage.setItem("userProfileId", $(this).data('uid'));
        window.localStorage.setItem("profile_view", 'activity');
        window.location = $(this).attr('href');
    });
}

function addActivity(data) {
    $.each(data.activities, function(index, val) {
        //var html = '<div class="col-lg-12"> <div style="box-shadow: 0px 0px 0px 0px rgba(34, 34, 34, 0.15),inset 0px -4px 0px 0px #D7351C !important; height:53px; width:50px; border-radius:5px;  margin-right:15px;" class="pull-left"> <div class="post-thumb pull-left" style="width:50px;"> <a class="post-thumb" href="single.html" data-id="' + val.id + '"> <img alt="Missing" class="img-rounded" src="photos/text/missing.png"></a> </div> </div> <div class="post-content pull-left"> <div style="font-weight:bold; font-size:18px;"> <span style="font-weight:normal;">Posted</span> <a href="/squawks/61">testt</a> </div> <p class="text-muted">Posted by <a href="/profile/azrael" style="color:#000; text-decoration:none;">azrael</a> 6 days ago</p> </div> <div class="clearfix"></div> </div>';
        var html = '<div class="post"> <div style="box-shadow: 0px 0px 0px 0px rgba(34, 34, 34, 0.15),inset 0px -4px 0px 0px #D7351C !important; height:53px; width:50px; border-radius:5px; margin-right:15px;" class="pull-left"> <div class="post-thumb pull-left" style="width:50px;"> <a class="post-thumb toSingle" href="single.html" data-id="' + val.id + '" style=""><img alt="Missing" class="img-rounded" src="photos/' + data.squawks[index].format + '/missing.png"></a> </div> </div> <div class="post-content pull-left"> <div style="font-weight:bold; font-size:18px;"> <a href="single.html" data-id="' + val.trackable_id + '">' + ((data.squawks[index].format == "text") ? data.squawks[index].title : data.squawks[index].graffiti_text) + '</a> </div> <p class="text-muted">Posted by <a href="profile.html" class="toUser" data-uid="' + data.user.slug + '" style="color:#000; text-decoration:none;">' + data.user.slug + '</a> ' + dateDiffInDays(val.created_at) + '</p> </div> <div class="clearfix"></div> </div>';
        $('.activity').append(html);
    });
}

function animateIn() {
    var postsToHide = $('.post');
    postsToHide.each(function(index, el) {
        setTimeout(function() {
            $(el).addClass('has-transition').removeClass('transfromOut');
        }, 30 * index);
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

    if (data == 'following')
        url += '?user_token=' + window.localStorage.getItem('user_token');

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
            console.log(res);
            $('.toSingle').bind('click', toSingle);
        },
        error: function(res) {
            $('#add-post').prepend('error');
        }
    });
}


function addSingleData(data) {


    if (data.squawk.format == 'graffiti') {
        var text = '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><div class="graffiti-text"><h1>' + data.squawk.graffiti_text + '</h1></div></div>';
    }else if(data.squawk.format == 'image'){
        var stringID = data.squawk.id;

        while (stringID.toString().length < 3) {;
            stringID = "0" + val.id.toString();
        }

        thumb = "http://dw0sh5ecbsahi.cloudfront.net/squawks/photos/000/000/"+stringID+"/original/"+data.squawk.photo_file_name;
        var title = '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><h2 style="color:#000; font-family: proxima-nova, sans-serif; font-size: 30px; font-weight: bold;">' + data.squawk.title + '</h2></div></div>';
        var text = '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><img alt="7981?1409528911" class="img-rounded" src="'+thumb+'" style="width:100%;"></div></div><br>';
        text = title + text;
    } else {
        var title = '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><h2 style="color:#000; font-family: proxima-nova, sans-serif; font-size: 30px; font-weight: bold;">' + data.squawk.title + '</h2></div></div>';
        var text = '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><div style="padding-bottom:20px;"><p></p><p>' + data.squawk.description + '</p><p></p></div></div></div>';
        text = title + text;
    }

    var authorData = '<a class="toUser" data-uid="' + data.userdata[0].username + '" href="/profile/' + data.userdata[0].username + '" style="text-decoration:none;"><img alt="Missing" class="img-rounded" src="img/missing.png"></a> <strong style="font-size:20px; margin-left:5px;"><a class="toUser" data-uid="' + data.userdata[0].username + '" href="/profile/' + data.userdata[0].username + '" style="color:#000; text-decoration:none;">' + data.userdata[0].username + '</a></strong> - <strong syle="font-size:18px; font-weight:normal;">Posted ' + dateDiffInDays(data.squawk.created_at) + '</strong>';
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
            var comment = '<div class="media"><a class="pull-left toUser" data-uid="' + data.commentusers[index].username + '" href="" style="text-decoration:none;"><img alt="Missing" class="img-rounded media-object" src="img/missing.png"></a><div class="media-body"><h4 class="media-heading" style="font-size:14px;">Posted by <a class="toUser" data-uid="' + data.commentusers[index].username + '" href="">' + data.commentusers[index].username + '</a> Posted ' + dateDiffInDays(val.created_at) + '<span>-</span> <span class="pull-right">' + like + ' | ' + unlike + ' </span></h4><p>' + val.message + '</p></div></div>';
            $('#comments').append(comment);
        });
    } else {
        $('#comments h3').remove();
        $('#comments').html('<br><h1 class="text-center">No Comments</h1>');
    }

    $('.toUser').click(function(e) {
        e.preventDefault();
        window.localStorage.setItem("userProfileId", $(this).data('uid'));
        window.localStorage.setItem("profile_view", 'activity');
        window.location = 'profile.html';
    });

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

    else if (format == 'text' && description.length > 200) return 'description_error';
    else if (category.length < 1 || category.length >= 20) return 'category_error';

    var url = 'http://squawkar.herokuapp.com/api/v1/squawks/new?user_token=' + window.localStorage.getItem('user_token');

    if (format == "text") {
        var data = {
            title: title,
            description: description,
            category: category,
            format: format
        };
    } else {
        var data = {
            graffiti_text: description,
            category: category,
            format: format
        };
    }

    $.ajax({
        type: 'GET',
        url: url,
        contentType: "application/json",
        dataType: 'jsonp',
        jsonp: "callback",
        crossDomain: true,
        data: {
            squawk: data,
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
    var url = 'http://squawkar.herokuapp.com/api/v1/api_users/sign_up';
	console.log('ok');
	return;
    $.ajax({
        type: 'GET',
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
        var navbar = '<li><a class="new-squawk-button" href="new.html">Squawk</a></li><li><a href="notifications.html">Notifications</a></li><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown"> ' + window.localStorage.getItem('user_name') + ' <b class="caret"></b> </a> <ul class="dropdown-menu"> <li><a class="toUser" href="profile.html" data-uid="' + window.localStorage.getItem('user_name') + '">Profile</a></li> <li><a href="following.html">Following</a></li> <li class="divider"></li> <li><a id="logout" data-method="delete" href="" rel="nofollow">Logout</a></li> </ul> </li>';
        $('.navbar-right').html(navbar);
        $('.hide-onLoggedin').remove();
    }


    $('.category-button').click(function() {
        $('#squawk_category').val($(this).data('category'));
    });

    $('#unread_notif').click(function(e) {
        e.preventDefault();
        notifications('unread');
    });
    $('#all_notif').click(function(e) {
        e.preventDefault();
        notifications('alll');
    });

    $('.top-menu>li:first-of-type').click(function(event) {
        event.preventDefault();
        if ($('.top-menu li div').hasClass('show-menu')) {
            $('.top-menu li div').removeClass('show-menu').css('height', '0px');
        } else {
            $('.top-menu li div').addClass('show-menu').css('height', $('.top-menu ul.nav').height());
        }
    });

    $('#search button').click(function(e) {
        e.preventDefault();
        $('#search').submit();
    })

    $('#search').submit(function(e) {
        e.preventDefault();
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

    $('.nav-pills:not(.profile):not(.top-menu) a').click(function(event) {
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
                window.localStorage.setItem("user_token", res.user_token);
                window.localStorage.setItem("user_name", res.username);
                window.location = 'index.html';
            })
            .fail(function() {
                console.log("error");
            })
            .always(function() {
            });

    });

    $('.navbar-toggle').click(function(event) {
        if ($('.navbar-collapse').hasClass('collapse')) {
            $('.navbar-collapse').removeClass('collapse');
        } else {
            $('.navbar-collapse').addClass('collapse');
        }
    });

    $('.dropdown-toggle').click(function(event) {
        if ($(this).parent('li').hasClass('open')) {
            $(this).parent('li').removeClass('open');
        } else {
            $(this).parent('li').addClass('open');
        }
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
        else if (response == "description_error") alert('Description must be less than 200 characters');
        else if (response == "category_error") alert('Category must be filled');
        else window.location = "index.html";
    });

    $('.toUser').click(function(e) {
        e.preventDefault();
        window.localStorage.setItem("userProfileId", $(this).data('uid'));
        window.localStorage.setItem("profile_view", 'activity');
        window.location = $(this).attr('href');
    });


});