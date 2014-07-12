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

function addPost(data) {

    $.each(data, function(index, val) {
        var thumb;
        if (data[index].isGraffiti == "true") thumb = 'text';
        else thumb = 'graffiti';
        post = '<div class="post" style="margin-left:-1000px"><div style="box-shadow: 0px 0px 0px 0px rgba(34, 34, 34, 0.15),inset 0px -4px 0px 0px #D7351C !important; height:53px; width:50px; border-radius:5px; margin-right:15px;" class="pull-left"><div class="post-thumb pull-left" style="width:50px;"><a class="post-thumb toSingle" data-id="' + data[index].id + '" href="single.html"><img alt="Missing" class="img-rounded" src="photos/' + thumb + '/missing.png"></a></div></div><div class="post-content pull-left"><div style="font-weight:bold; font-size:18px;"><a class="toSingle" data-id="' + data[index].id + '" href="single.html">' + data[index].content + '</a></div><p class="text-muted">Posted by <a href="' + data[index].postedBy.link + '" style="color:#000; text-decoration:none;">' + data[index].postedBy.name + '</a> ' + data[index].date + '</p></div><div class="clearfix"></div></div>';
        $('#add-post').prepend(post);
    });
    animateIn();
}

function animateIn() {
    var postsToHide = $('.post');
    postsToHide.each(function(index, el) {
        $(el).animate({
            marginLeft: 0
        }, {
            duration: 1000 + index * 1000,
            complete: function() {
                $(el).width($(el).width());
                $(el).children('.post-content').css('max-width', $(el).width() - 65);
            }
        });
    });
}

function toSingle() {
    event.preventDefault();
    window.localStorage.setItem("id", $(this).data("id"));
    window.location = 'single.html';
}

function getData(data) {
    var url = 'http://aurettoworks.com/squawkar/ajax.php';
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

jQuery(document).ready(function() {

    getData({
        'posts': 'all'
    });


    $('.nav-pills a').click(function(event) {
        event.preventDefault();
        var postsToHide = $('.post');
        var filter = $(this).attr('id');

        postsToHide.each(function(index, el) {
            $(el).animate({
                marginLeft: -$(el).width() + 100
            }, {
                complete: function() {
                    $(this).remove();
                    if (postsToHide.length = index) {
                        getData({
                            'posts': filter
                        });
                    }
                },
                duration: 1000 + index * 1000
            });
        });
    });
});