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
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        checkConnection();
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

    function checkConnection() {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection';

        alert('Connection type: ' + states[networkState]);
    }
};

var post;

function addPost(data) {

    if (data.length == 0) {
        $('#add-post').prepend('<h1 class="text-center post">No Squawks Found</h1>');
    } else {

        $.each(data.reverse(), function(index, val) {
            var thumb, content;
            if (data[index].format != "graffiti") {
                thumb = 'text';
            } else {
                thumb = 'graffiti';
            }
            post = '<div class="post transfromOut"><div style="box-shadow: 0px 0px 0px 0px rgba(34, 34, 34, 0.15),inset 0px -4px 0px 0px #D7351C !important; height:53px; width:50px; border-radius:5px; margin-right:15px;" class="pull-left"><div class="post-thumb pull-left" style="width:50px;"><a class="post-thumb toSingle" data-id="' + data[index].id + '" href="single.html"><img alt="Missing" class="img-rounded" src="photos/' + thumb + '/missing.png"></a></div></div><div class="post-content pull-left"><div style="font-weight:bold; font-size:18px;"><a class="toSingle" data-id="' + data[index].id + '" href="single.html">' + data[index].title + '</a></div><p class="text-muted">Posted by <a href="' + data[index].user_id + '" style="color:#000; text-decoration:none;">' + '---' + '</a> ' + dateDiffInDays(data[index].created_at) + '</p></div><div class="clearfix"></div></div>';
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

    if (data.squawk.format == 'graffiti') {
        var text = '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><div class="graffiti-text"><h1>' + data.squawk.graffiti_text + '</h1></div></div>';
    } else {
        var title = '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><h2 style="color:#000; font-family: proxima-nova, sans-serif; font-size: 30px; font-weight: bold;">' + data.squawk.title + '</h2></div></div>';
        var text = '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><div style="padding-bottom:20px;"><p></p><p>' + data.squawk.description + '</p><p></p></div></div></div>';
        text = title + text;
    }

    var authorData = '<a href="/profile/pappgergely" style="text-decoration:none;"><img alt="Missing" class="img-rounded" src="img/missing.png"></a> <strong style="font-size:20px; margin-left:5px;"><a href="/profile/pappgergely" style="color:#000; text-decoration:none;">pappgergely</a></strong> - <strong syle="font-size:18px; font-weight:normal;">Posted ' + dateDiffInDays(data.squawk.created_at) + '</strong>';
    $('#text').html(text);
    $('#author-data').html(authorData);

    if (data.comments.length < 0) {
        $.each(data.comments, function(index, val) {
            var comment = '<div class="media"><a class="pull-left" href="/profile/pmoney" style="text-decoration:none;"><img alt="Missing" class="img-rounded media-object" src="img/missing.png"></a><div class="media-body"><h4 class="media-heading" style="font-size:14px;">Posted by <a href="/profile/pmoney">PMoney</a>Posted ' + dateDiffInDays(val.created_at) + '<span>-</span> <span class="pull-right">0 Likes | 0 Dislikes</span></h4><p>' + val.message + '</p></div></div>';
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
    else return ret + ' days ago';

}

var filter = 'squawks';

jQuery(document).ready(function() {

    getData('squawks');

    $('.nav-pills a').click(function(event) {
        event.preventDefault();
        var postsToHide = $('.post');
        filter = $(this).data('link');

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

    $(".pagination li a").click(function() {
        event.preventDefault();
        var postsToHide = $('.post');

        $(this).parent().siblings('li').removeClass('active');
        $(this).parent().addClass('active');

        var page = $(this).attr('href');

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