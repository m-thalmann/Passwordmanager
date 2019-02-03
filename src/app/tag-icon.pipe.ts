import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tagIcon'
})
export class TagIconPipe implements PipeTransform {
  static known = {
    "mail": "fas fa-envelope",
    "email": "fas fa-envelope",

    "adobe": "fab fa-adobe",
    "amazon": "fab fa-amazon",
    "apple": "fab fa-apple",
    "bitbucket": "fab fa-bitbucket",
    "codepen": "fab fa-codepen",
    "discord": "fab fa-discord",
    "dropbox": "fab fa-dropbox",
    "ebay": "fab fa-ebay",
    "facebook": "fab fa-facebook",
    "firefox": "fab fa-firefox",
    "git": "fab fa-git",
    "github": "fab fa-github",
    "gitlab": "fab fa-gitlab",
    "google": "fab fa-google",
    "instagram": "fab fa-instagram",
    "itunes": "fab fa-itunes",
    "jenkins": "fab fa-jenkins",
    "jsfiddle": "fab fa-jsfiddle",
    "kickstarter": "fab fa-kickstarter",
    "linux": "fab fa-linux",
    "medium": "fab fa-medium",
    "napster": "fab fa-napster",
    "npm": "fab fa-npm",
    "paypal": "fab fa-paypal",
    "pinterest": "fab fa-pinterest",
    "playstation": "fab fa-playstation",
    "quora": "fab fa-quora",
    "reddit": "fab fa-reddit",
    "skype": "fab fa-skype",
    "slack": "fab fa-slack",
    "snapchat": "fab fa-snapchat",
    "soundcloud": "fab fa-soundcloud",
    "spotify": "fab fa-spotify",
    "squarespace": "fab fa-squarespace",
    "stack-exchange": "fab fa-stack-exchange",
    "stack-overflow": "fab fa-stack-overflow",
    "steam": "fab fa-steam",
    "teamspeak": "fab fa-teamspeak",
    "telegram": "fab fa-telegram",
    "tripadvisor": "fab fa-tripadvisor",
    "tumblr": "fab fa-tumblr",
    "twitch": "fab fa-twitch",
    "twitter": "fab fa-twitter",
    "uber": "fab fa-uber",
    "wikipedia-w": "fab fa-wikipedia-w",
    "windows": "fab fa-windows",
    "xbox": "fab fa-xbox",
    "youtube": "fab fa-youtube",
  }

  transform(value: string) {
    value = value.toLowerCase();

    return TagIconPipe.known[value] ? TagIconPipe.known[value] : "fas fa-tag";
  }

}
