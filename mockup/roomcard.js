/* jshint browser: true */
/* global $ */

function Roomcard(opts) {
    if (typeof opts !== "object") {
        throw new Error("Invalid options passed");
    }

    if (typeof opts.id !== "string") {
        throw new Error("Invalid title passed");
    }

    this._title = $('<h3 class="card-cover-title">').text(opts.id);

    this._mentionbadge = $('<span class="card-header-badge notification-badge notification-badge-mention">').attr("data-empty", "");
    this._messagebadge = $('<span class="card-header-badge notification-badge notification-badge-messages">').attr("data-empty", "");

    this.more = $('<a class="card-header-icon card-header-icon-more card-cover-icon js-room-more">');

    this.element = $('<div class="card room-card js-room-card">').append(
        $('<div class="card-cover">').append(
            $('<div class="card-cover-header card-header">').append(
                this._mentionbadge,
                this._messagebadge,
                this.more
            ),
            $('<div class="card-cover-logo">').css("background-image", "url(" + opts.avatar + ")"),
            this._title
        ).css("background-image", "url(" + opts.cover + ")")
    ).attr({
        "data-color": (typeof opts.color !== "undefined") ? opts.color : '',
        "data-room": opts.id
    });

    this.id = opts.id;
}

Roomcard.prototype = {
    setTitle: function(text) {
        if (typeof text !== "string") {
            throw new Error("Invalid title specified");
        }

        this._title.text(text);

        return this;
    },
    setCount: function(type, text) {
        var $badge;

        if (typeof type !== "string" || !this["_" + type + "badge"]) {
            throw new Error("Invalid property specified");
        }

        if (typeof text !== "string" && typeof text !== "number") {
            throw new Error("Invalid value");
        }

        $badge = this["_" + type + "badge"];

        if (text) {
            $badge.removeAttr("data-empty");
        } else {
            $badge.attr("data-empty", true);
        }

        $badge.text(text);

        return this;
    },
    addMessage: function(message) {
        if (typeof message !== "object") {
            throw new Error("Invalid message");
        }

        if (typeof message.from !== "string") {
            throw new Error("Invalid 'from' property in message");
        }

        if (typeof message.text !== "string") {
            throw new Error("Invalid 'text' property in message");
        }

        if (!this._content) {
            this._content = $('<div class="card-content card-content-big">');
            this._content.append($('<h4 class="card-content-title">').text("Recent discussions"));
            this._content.appendTo(this.element);
        }

        this._content.append(
            $('<div class="card-discussion">').append(
                $('<span class="card-discussion-message">').text(message.text),
                $('<span class="card-discussion-by">').text(message.from + " and " + message.count + " others")
            )
        );

        return this;
    }
};

module.exports = Roomcard;
