
// Add this to the Date class so we can get spelled out month names
Date.prototype.getMonthName = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names[this.getMonth()];
};

Date.locale = {
    en: {
       month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
};

function githubActivity(username) {

    // Number of feed items we want to display
    var numItems = 10;

    // Container to populate. CSS is currently all set for 'div#githubActivity,' FYI
    var divSelector = "div#githubActivity";

    var url = encodeURIComponent("http://github.com/"+username+".json");
    
    // We have to pipe the GitHub JSON through Yahoo! Pipes to get JSONP
    var pipesURL = "http://pipes.yahoo.com/pipes/pipe.run?u="+url+"&_id=332d9216d8910ba39e6c2577fd321a6a&_render=json&_callback=?";

  jQuery.getJSON(pipesURL, function(data){
    items = data.value.items[0].json;
    var html = "";

    for(var i=0;i<numItems;i++) {

      html += formatEventHTML(items[i]);
    }

    // Append the feed HTML and make the dates relative to now.
    jQuery(divSelector).append(html);
    jQuery("time.js-relative-date").timeago();
  });
}

// Print out an ISO 8601 date time string
function getISODateString(d){
 function pad(n){return n<10 ? '0'+n : n}
 return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z';}

// Return HTML for each type of GitHub event
function formatEventHTML(event) {

    var avatarStub = "https://secure.gravatar.com/avatar/";
    var githubStub = "https://github.com/"

    switch(event.type) {
      
      case 'WatchEvent':

        var dateTime = new Date(event.created_at);
        var itemHTML = "<div class=\"alert watch_started\"><div class=\"body\"><div class=\"title\"><a href=\""+githubStub+event.actor+"\">"+event.actor+"</a> <span>started watching</span> <a href=\""+githubStub+event.repository.owner+"/"+event.repository.name+"\">"+event.repository.owner+"/"+event.repository.name+"</a> <time class=\"js-relative-date\" datetime=\""+getISODateString(dateTime)+"\" title=\""+getISODateString(dateTime)+"\">"+dateTime.getMonthName()+" "+dateTime.getDate()+", "+dateTime.getFullYear()+"</time></div><div class=\"details\"><div class=\"gravatar\"><img height=\"30\" src=\""+avatarStub+event.actor_attributes.gravatar_id+"?s=140&amp;d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png\" width=\"30\"></div><div class=\"message\">"+event.repository.name+"'s description: <blockquote>"+event.repository.description+"</blockquote></div></div></div></div>";
        break;

      case 'PushEvent':
        var dateTime = new Date(event.created_at);
        var commits = event.payload.shas;
        var itemHTML = "<div class=\"alert push\"><div class=\"body\"><div class=\"title\"><a href=\""+githubStub+event.actor+"\">"+event.actor+"</a> <span>pushed</span> to "+getBranch(event.payload.ref)+" at <a href=\""+event.repository.owner+"/"+event.repository.name+"\">"+event.repository.owner+"/"+event.repository.name+"</a> <time class=\"js-relative-date\" datetime=\""+getISODateString(dateTime)+"\" title=\""+getISODateString(dateTime)+"\">"+dateTime.getMonthName()+" "+dateTime.getDate()+", "+dateTime.getFullYear()+"</time></div><div class=\"details\"><div class=\"gravatar\"><img height=\"30\" src=\""+avatarStub+event.actor_attributes.gravatar_id+"?s=140&amp;d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png\" width=\"30\"></div><div class=\"commits\"><ul>";

        // If there is only one commit and thus commits is an object and not an array, it will not have
        // a length value, so we do this instead:
        if( typeof commits.length === "undefined" ) {
        
          itemHTML += "<li><code><a href=\""+githubStub+event.repository.owner+"/"+event.repository.name+"/commit/"+event.payload.head+"\">"+commits.json[0].substring(0,6)+"</a></code><div class=\"message\"><blockquote title=\""+commits.json[2]+"\">"+commits.json[2]+"</blockquote></div></li>";

        } else {

          // If there are multiple commits in a push they will be in an array
          for(var i=0;i<commits.length;i++) {

            itemHTML += "<li><span title=\""+event.actor+"\"><img height=\"16\" src=\""+avatarStub+event.actor_attributes.gravatar_id+"?s=140&amp;d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png\" width=\"16\"></span>";
            itemHTML += "<code><a href=\""+githubStub+event.repository.owner+"/"+event.repository.name+"/commit/"+event.payload.head+"\">"+commits[i].json[0].substring(0,6)+"</a></code><div class=\"message\"><blockquote title=\""+commits[i].json[2]+"\">"+commits[i].json[2]+"</blockquote></div></li>";
          }
        }

        itemHTML += "</ul></div></div></div></div>";
        break;

      case 'PullRequestEvent':
        var dateTime = new Date(event.created_at);
        var itemHTML = "<div class=\"alert issues_closed\"><div class=\"body\"><div class=\"title\"><a href=\""+githubStub+event.actor+"\">"+event.actor+"</a> <span>"+event.payload.action+"</span> <a href=\""+githubStub+"/"+event.repository.name+"/pull/"+event.payload.number+"\">pull request "+event.payload.number+"</a> on <a href=\""+githubStub+event.payload.pull_request.base.user.login+"/"+event.repository.name+"\">"+event.payload.pull_request.base.user.login+"/"+event.repository.name+"</a> <time class=\"js-relative-date\" datetime=\""+getISODateString(dateTime)+"\" title=\""+getISODateString(dateTime)+"\">"+dateTime.getMonthName()+" "+dateTime.getDate()+", "+dateTime.getFullYear()+"</time></div><div class=\"details\"><div class=\"gravatar\"><img height=\"30\" src=\""+avatarStub+event.actor_attributes.gravatar_id+"?s=140&amp;d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png\" width=\"30\"></div><div class=\"message\"><blockquote>"+event.payload.pull_request.title+"</blockquote></div></div></div></div>";
        break;
      case 'CreateEvent':
        if(event.payload.ref === null) { break; }
        var dateTime = new Date(event.created_at);
        var itemHTML = "<div class=\"alert create\"><div class=\"body\"><div class=\"title\"><a href=\""+githubStub+event.actor+"\">"+event.actor+"</a> <span>created</span> branch <a href=\""+githubStub+githubStub+event.actor+"/"+event.repository.name+"/tree/"+event.payload.ref+"\">"+event.payload.ref+"</a> at <a href=\""+githubStub+githubStub+event.actor+"/"+event.repository.name+"\">"+event.actor+"/"+event.repository.name+"</a> <time class=\"js-relative-date\" datetime=\""+getISODateString(dateTime)+"\" title=\""+getISODateString(dateTime)+"\">"+dateTime.getMonthName()+" "+dateTime.getDate()+", "+dateTime.getFullYear()+"</time> </div><div class=\"details\"><div class=\"gravatar\"><img height=\"30\" src=\""+avatarStub+event.actor_attributes.gravatar_id+"?s=140&amp;d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png\" width=\"30\"></div> <div class=\"message\">New branch is at <a href=\""+githubStub+event.actor+"/"+event.repository.name+"/tree/"+event.payload.ref+"\">/"+event.actor+"/"+event.repository.name+"/tree/"+event.payload.ref+"</a><br><a href=\""+githubStub+event.actor+"/"+event.repository.name+"/compare/"+event.payload.ref+"\" class=\"compare-link\">Compare "+event.payload.ref+" branch with master »</a></div></div></div></div>";
        break;
      case 'FollowEvent':
        var dateTime = new Date(event.created_at);
        var itemHTML = "<div class=\"alert follow\"><div class=\"body\"><div class=\"title\"><a href=\""+githubStub+event.actor+"\">"+event.actor+"</a> <span>started following</span> <a href=\""+githubStub+"/"+event.payload.target.login+"\">"+event.payload.target.login+"</a> <time class=\"js-relative-date\" datetime=\""+getISODateString(dateTime)+"\" title=\""+getISODateString(dateTime)+"\">"+dateTime.getMonthName()+" "+dateTime.getDate()+", "+dateTime.getFullYear()+"</time></div><div class=\"details\"><div class=\"gravatar\"><img height=\"30\" src=\""+avatarStub+event.payload.target.gravatar_id+"?s=140&amp;d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png\" width=\"30\"></div><div class=\"message\">"+event.payload.target.login+" has "+event.payload.target.repos+" public repo";

        if( event.payload.target.repos > 1 ) {
          itemHTML += "s";
        }

        itemHTML += " and "+event.payload.target.followers+" follower";

        if( event.payload.target.followers > 1 ) {
          itemHTML += "s";
        }

        itemHTML += "</div></div></div></div>";
        
        break;
      case 'IssuesEvent':
        console.log(event);
        var itemHTML = '';
        break;

      case 'GistEvent':
        var dateTime = new Date(event.created_at);
        var itemHTML = "<div class=\"alert gist\"><div class=\"body\"><div class=\"title\"><a href=\""+githubStub+event.actor+"\">"+event.actor+"</a> <span>";

        switch(event.payload.action) {
          case 'create':
            itemHTML += "created";
            break;

        }

        itemHTML += "</span> <a href=\""+event.payload.url+"\">gist: "+event.payload.id+"</a> <time class=\"js-relative-date\" datetime=\""+getISODateString(dateTime)+"\" title=\""+getISODateString(dateTime)+"\">December 18, 2011</time></div><div class=\"details\"><div class=\"gravatar\"><img height=\"30\" src=\""+avatarStub+event.actor_attributes.gravatar_id+"?s=140&amp;d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png\" width=\"30\"></div><div class=\"message\">"+event.payload.desc+"</div></div></div></div>";
        break;

      case 'ForkEvent':
        var dateTime = new Date(event.created_at);
        var itemHTML = "<div class=\"alert fork\"><div class=\"body\"><div class=\"title\"><a href=\""+githubStub+event.actor+"\">"+event.actor+"</a> <span>forked</span> <a href=\""+githubStub+"/"+event.repository.owner+"/"+event.repository.name+"\">"+event.repository.owner+"/"+event.repository.name+"</a> <time class=\"js-relative-date\" datetime=\""+getISODateString(dateTime)+"\" title=\""+getISODateString(dateTime)+"\">"+dateTime.getMonthName()+" "+dateTime.getDate()+", "+dateTime.getFullYear()+"</time></div><div class=\"details\"><div class=\"gravatar\"><img height=\"30\" src=\""+avatarStub+event.actor_attributes.gravatar_id+"?s=140&amp;d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png\" width=\"30\"></div><div class=\"message\">Forked repository is at <a href=\""+githubStub+"/"+event.actor+"/"+event.repository.name+"\">"+event.actor+"/"+event.repository.name+"</a></div></div></div></div>";
        break;

      case 'IssueCommentEvent':
        console.log(event);
        break;
      
      case 'MemberEvent':
        console.log(event);
        break;
          
      default:
        console.log(event);
        var itemHTML = '';
        break;
    } 

    // If for some reason the switch doesn't catch anything, create an empty string
    // so we don't print out an undefined.
    if(typeof itemHTML === 'undefined' ) {
      var itemHTML = '';
    }

    return itemHTML;
}

// Simple function, take in a branch path and return the last node
function getBranch(branch) {
  
  var regex = /^.*\/([^/]+)$/;
  var match = regex.exec(branch);

  return match[1];
}