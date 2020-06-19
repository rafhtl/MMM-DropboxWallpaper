/* Magic Mirror
* Module: MMM-DropboxWallpaper
* v2.0.0
*
* By eouia
*/


Module.register("MMM-DropboxWallpaper",{
  defaults: {
    refreshInterval: 1000*60,
    search: [".jpg", ".png", ".gif"], // Or you can find target files like "FILENAME". (wildcard or regexp not supported)
    directory: "/", // root of directories to be scanned.
    sort: "random", //"time09", "time90", "nameAZ", "nameZA""random"
    tokenLocationIQ : "", // See http://locationiq.org/#register
    dropboxAccessToken: "",
    width: "100%", // 'px' or '%' or valid value for CSS dimensions units.
    height: "100%",
    mode: "cover", // 'cover', 'contain', 'hybrid' or any other values for CSS `background-size`
    dateTimeFormat: "HH:mm MMM Do, YYYY", // See. moment.js .format()
    thepagename: 'images01', // what pahe is the module active and needs to activate functions
  },

  getStyles: function() {
    return ["MMM-DropboxWallpaper.css"]
  },

  start: function() {
      this.toggle_play_stop = "PLAY";

  },


  getDom: function() {
    var wrapper = document.createElement("div")
    wrapper.id = "DBXWLP_CONTAINER"
    wrapper.style.width = this.config.width
		wrapper.style.height = this.config.height
    var bg = document.createElement("div")
    bg.id = "DBXWLP"
    bg.style.width = this.config.width
		bg.style.height = this.config.height

    var info = document.createElement("div")
    info.id = "DBXWLP_INFO"

    var date = document.createElement("div")
    date.id = "DBXWLP_DATE"

    var location = document.createElement("div")
    location.id = "DBXWLP_LOCATION"
    
    
    var touchme = document.createElement("div");
    var text = document.createElement("span");
    touchme.className = "DBXWLP touchme";
    //text.innerHTML = "PLAY/STOP";
    text.innerHTML = "&nbsp;";
    text.id = "touchme_id";
    touchme.onclick = () => this.itemClicked("1");    
    touchme.appendChild(text);

    info.appendChild(date)
    info.appendChild(location)
    wrapper.appendChild(bg)
    wrapper.appendChild(info)
    wrapper.appendChild(touchme)
    
    var touchmehome = document.createElement("div");
    var texttouchmehome = document.createElement("span");
    touchmehome.className = "DBXWLP touchmehome";
    texttouchmehome.innerHTML = "&nbsp;";
    texttouchmehome.id = "touchme_id";
    touchmehome.onclick = () => this.touchmehomeClicked("1");    
    touchmehome.appendChild(texttouchmehome);
    wrapper.appendChild(touchmehome)
    
    return wrapper
  },

  notificationReceived: function(noti, payload, sender) {
    switch(noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification('INIT_CONFIG', this.config)
        break
        
      case "PHOTO_DROPBOX":
            if(payload.command=="stop"){
                this.toggle_play_stop = "STOP"
                this.sendSocketNotification('PHOTO_STOP',item);
                this.sendNotification("SHOW_ALERT", {title: "Please wait", message: "PHOTO STOP", timer: 1200}); 
                return
            }
            if(payload.command=="play"){
                this.toggle_play_stop = "PLAY"
                this.sendSocketNotification('PHOTO_START',item);
                this.sendNotification("SHOW_ALERT", {title: "Please wait", message: "PHOTO START", timer: 1200});
                
                return
            }
        break    
    }
    
    
    
    
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      case 'NEW_PHOTO':
        this.updateView(payload)
        break;
    }
  },
  
    itemClicked: function (item) {
      if (this.toggle_play_stop === "STOP") {
        this.toggle_play_stop = "START"
        this.sendSocketNotification('PHOTO_START',item);
        this.sendNotification("SHOW_ALERT", {title: "Please wait", message: "PHOTO START", timer: 1200});
      }else 
      {    
        this.toggle_play_stop = "STOP"
        this.sendSocketNotification('PHOTO_STOP',item);
        this.sendNotification("SHOW_ALERT", {title: "Please wait", message: "PHOTO STOP", timer: 1200});  
      }
    },
    touchmehomeClicked: function (item) {
        
        this.sendNotification("PAGE_SELECT", "main");
    },

  updateView: function(photo) {
    const tr = [
      "",
      "",
      "rotateY(180deg)",
      "rotate(180deg)",
      "rotateX(180deg)",
      "rotate(270deg) rotateY(180deg)",
      "rotate(90deg)",
      "rotateX(180deg) rotate(90deg)",
      "rotate(270deg)",
    ]
    var wrapper = document.getElementById("DBXWLP")
    wrapper.className += " fo"

    var wrpRatio = (wrapper.offsetHeight < wrapper.offsetWidth) ? 'h' : 'v'
    //var height = photo.dimensions.height
    //var width = photo.dimensions.width

    var height = (photo.orientation > 4) ? photo.dimensions.width : photo.dimensions.height
    var width = (photo.orientation > 4) ? photo.dimensions.height : photo.dimensions.width
    var mode = this.config.mode
    if (this.config.mode == 'hybrid') {
      var imgRatio = ( height < width) ? 'h' : 'v'
      mode = (imgRatio == wrpRatio) ? 'cover' : 'contain'
    }
    wrapper.style.backgroundSize = this.config.mode

    var timer = setTimeout(()=>{
      wrapper.style.backgroundImage = "none"
      wrapper.className = "tr_" + photo.orientation

      //console.log(width, height, wrapper.offsetHeight, wrapper.offsetWidth)

      //wrapper.style.backgroundSize = zoom + "%"



      wrapper.style.backgroundImage
        = "url('modules/MMM-DropboxWallpaper/cache/temp?"
        + Date.now()
        + "')"


      var zoom = Math.round(width * width / height / height * 100) / 100
      var scale = ""

      if (mode == "cover") {
        scale = (photo.orientation == 1) ? "" : " scale(" + zoom + ")"
      }
      wrapper.style.transform = tr[photo.orientation] + scale
      //console.log(tr[photo.orientation], wrapper.style.transform)
      var date = document.getElementById("DBXWLP_DATE")
      var location = document.getElementById("DBXWLP_LOCATION")

      date.innerHTML = (typeof photo.time !== "undefined") ? photo.time : ""
      location.innerHTML = (typeof photo.locationText !== "undefined") ? photo.locationText : ""
    }, 2000)
  },
  suspend: function () {
    this.sendNotification("BGnormal");
  },
  resume: function () {
    this.sendNotification("BGhide");
  },

})
