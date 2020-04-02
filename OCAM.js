var config = "AIzaSyBE8ZWnoQXkspCvrQQWZntyP4ddfmhMejQ";

// import config from "./config.js"; 

var js_file = document.createElement('script');
// js_file.async = true;
// js_file.defer = true;
js_file.type = 'text/javascript';
js_file.src = 'https://maps.googleapis.com/maps/api/js?key=' + config + '&callback=initMap';
document.body.appendChild(js_file);

var map;
var mapData = new Map();
var currentCampus = null;
var currentMarker = null;

function loadJSON(callback) {   
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', './OCAM_DATA.json', true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(JSON.parse(xobj.responseText));
    }
  };
  xobj.send(null);  
}

function initMap() {
  var portland = {lat: 45.572809, lng: -122.726747};
  map = new google.maps.Map(
  document.getElementById('map'), {zoom: 7, center: portland});

  var mIcon = new google.maps.MarkerImage('./icons/pin-default.svg',
      null, null, null, new google.maps.Size(30,30));
  
  var mIconSelected = new google.maps.MarkerImage('./icons/pin-selected.svg',
  null, null, null, new google.maps.Size(40,40));
    
  loadJSON(function(response) {

    for (var item in response){
        
      // populates item for member list
      let member = document.createElement("div");
      member.className = "member";
      member.innerHTML = response[item].NAME_MEMBER;
      member.campuses = [];
      member.marker = [];
      document.getElementById("list").appendChild(member);
          
      // populates info box for each member
      let info = document.createElement("div");
      let header = document.createElement("div");
      let logo = document.createElement("img");
      
      header.innerHTML = response[item].NAME_MEMBER;
      header.classList.add("mHeader");
      info.member = header;

      logo.src = "./icons/" + response[item].CAMPUSES[0].LOGO;
      logo.alt = response[item].NAME_MEMBER + " logo";
      info.logo = logo;
      
      member.addEventListener("click", function() {
        showResult(info);
      })
        
      // populates info for each campus
      for (var campus in response[item].CAMPUSES) {
        let data = response[item].CAMPUSES[campus];
          
        let itemCampus = document.createElement("div");
        itemCampus.classList = "campusContainer";
          
        // only make headers for members with multiple campuses
        if (data.NAME_CAMPUS) {
          let cName = document.createElement("div");
          cName.classList.add("campus");
          cName.innerHTML = data.NAME_CAMPUS + " Campus";
          itemCampus.appendChild(cName);
        }
          
        let cAddress = document.createElement("div");
        let cLib = document.createElement("div");
        let cLibPhone = document.createElement("div");

        cAddress.classList.add("address");
        cLib.classList.add("library");
        cLibPhone.classList.add("phone");

        cAddress.innerHTML = data.ADDRESS_CAMPUS;
        cLib.innerHTML = data.NAME_LIBRARY;
        cLibPhone.innerHTML = data.PHONE_CIRCULATION;

        itemCampus.appendChild(cAddress);
        itemCampus.appendChild(cLib);
        itemCampus.appendChild(cLibPhone);

        let cLibWebsite;
        if (data.URL) {
          cLibWebsite = document.createElement("a");
          let cLibWebsiteText;
          cLibWebsite.classList.add("website");
          cLibWebsite.href = data.URL;
          cLibWebsite.target = "_blank";
          if (response[item].NAME_MEMBER == "Orbis Cascade Alliance") {
            cLibWebsiteText = document.createTextNode("Website");
          } else {
            cLibWebsiteText = document.createTextNode("Library Website");
          }

          cLibWebsite.appendChild(cLibWebsiteText);
        } else {
          cLibWebsite = document.createElement("div");
          cLibWebsite.innerHTML = "No website available";
          
        }
        itemCampus.appendChild(cLibWebsite);

        if (data.URL_HOURS) {
          let cLibHours;
          if (data.URL_HOURS == "Posted on library website") {
            cLibHours = document.createElement("div");
            cLibHours.innerText = "Posted on library website";
          } else {
            cLibHours = document.createElement("a");
            let cLibHoursText = document.createTextNode("Hours");
            cLibHours.appendChild(cLibHoursText)  
            cLibHours.href = data.URL_HOURS;
            cLibHours.target = "_blank";
          }
          cLibHours.classList.add("hours");      
          itemCampus.appendChild(cLibHours);              
        }
          
        let marker = new google.maps.Marker({
          position: new google.maps.LatLng(data.LAT, data.LONG),
          map: map,
          icon: mIcon
        });
          
        marker.addListener('click', function() {
          if (currentMarker != marker || currentCampus == null) {
            clear();
            checkZoom();
            currentMarker = marker;
            currentCampus = mapData.get(marker);                
            map.panTo(marker.position);
            marker.setIcon(mIconSelected);
            currentCampus.classList.add("focus");
            showResult(info);
            var result = document.getElementById("result");
            var topPos = result.offsetTop;
            result.scrollTop = currentCampus.offsetTop - topPos;
          }
        });
        
        if (data == response[item].CAMPUSES[0]) {
          member.marker = marker;
        }
          
        itemCampus.marker = marker;
        mapData.set(marker, itemCampus);
        itemCampus.addEventListener('click', function() {
          if (currentCampus != itemCampus){
            clear();  
            if (currentCampus) {
              currentCampus.classList.remove("focus");
            }
            currentCampus = itemCampus;
            itemCampus.classList.add("focus");
            currentMarker = itemCampus.marker;
            checkZoom();
            map.panTo(currentMarker.getPosition());
            itemCampus.marker.setIcon(mIconSelected);
          }
          showResult(info);
          var result = document.getElementById("result");
          var topPos = result.offsetTop;
          result.scrollTop = currentCampus.offsetTop - topPos;
        });
        info.appendChild(itemCampus);
        member.campuses.push(itemCampus);
      }
        
      member.addEventListener('click', function() {
        clear();
        currentCampus = member.campuses[0];
        member.campuses[0].classList.add("focus");
        currentMarker = member.marker;
        member.marker.setIcon(new google.maps.MarkerImage('./icons/pin-selected.svg',
            null, null, null, new google.maps.Size(40,40)));
        map.panTo(member.marker.position);
        checkZoom();
        showResult(info);
        var result = document.getElementById("result");
        var topPos = result.offsetTop;
        result.scrollTop = currentCampus.offsetTop - topPos;
      });
    }
  });
  
  map.addListener('click', function() {
    clear();
    nav();
  });
}

function clear() {
  if (currentMarker) {
    currentMarker.setIcon(new google.maps.MarkerImage('./icons/pin-default.svg',
      null, null, null, new google.maps.Size(30,30)));
    mapData.get(currentMarker).classList.remove("focus");
    currentMarker = null;
  }
  
  if (currentCampus) {
    currentCampus.classList.remove("focus");
    currentCampus = null;
  }
}

function showResult(info) {
  document.getElementById("list").style.display = "none";
  let resultLogo = document.getElementById("resultLogo");
  let resultMember = document.getElementById("resultMember");
  let result = document.getElementById("result");
  resultLogo.innerHTML = "";
  resultMember.innerHTML = "";
  result.innerHTML = "";
  resultMember.appendChild(info.member);
  resultLogo.appendChild(info.logo);
  result.appendChild(info);
  document.getElementById("nav").style.visibility = "initial";
  document.getElementById("resultContainer").style.display = "initial";  
}

document.getElementById("nav").addEventListener("click", nav);

function nav() {
  clear();
  document.getElementById("nav").style.visibility = "hidden";
  document.getElementById("resultContainer").style.display = "none";
  document.getElementById("list").style.display = "block";    
}

function checkZoom() {
  if (map.getZoom() < 10) {
    map.setZoom(10);
  }
}
