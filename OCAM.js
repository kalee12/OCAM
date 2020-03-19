var config = "AIzaSyBE8ZWnoQXkspCvrQQWZntyP4ddfmhMejQ";

// import config from "./config.js"; 

var js_file = document.createElement('script');
// js_file.async = true;
// js_file.defer = true;
js_file.type = 'text/javascript';
js_file.src = 'https://maps.googleapis.com/maps/api/js?key=' + config + '&callback=initMap';
document.body.appendChild(js_file);

var map;

var currentCampus = null;
var currentMarker = null;
var mapData = new Map();

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
    



    
  loadJSON(function(response) {
    var infowindow = new google.maps.InfoWindow();
    
    for (var item in response){
      console.log(response[item].NAME_MEMBER);
      
      // populates list
      let member = document.createElement("div");
      member.className = "item";
      member.innerHTML = response[item].NAME_MEMBER;
      member.campuses = [];
      member.marker = [];
      
      document.getElementById("list").appendChild(member);
      
      // populates dialog box for each member
      let dialog = document.createElement("div");
      let header = document.createElement("h2");
      
      header.innerHTML = response[item].NAME_MEMBER;
      dialog.appendChild(header);
      
      member.addEventListener("click", function() {
        showResult(dialog);
      })
      

      for (var campus in response[item].CAMPUSES) {
        let data = response[item].CAMPUSES[campus];
        
        let itemCampus = document.createElement("div");
        
        // accounts for schools with only one campus
        if (data.NAME_CAMPUS) {
          let cName = document.createElement("h3");
          cName.innerHTML = data.NAME_CAMPUS;
          itemCampus.appendChild(cName);
        }
        
        let cAddress = document.createElement("div");
        let cLib = document.createElement("div");
        let cLibPhone = document.createElement("div");
        let cLibWebsite = document.createElement("a");
        let cLibWebsiteText;
        let cLibHours = document.createElement("a");
        let cLibHoursText;
        
        
        cAddress.innerHTML = data.ADDRESS_CAMPUS;
        cLib.innerHTML = data.NAME_LIBRARY;
        cLibPhone.innerHTML = data.PHONE_CIRCULATION;
        cLibWebsite.href = data.URL;
        
        if (response[item].NAME_MEMBER == "Orbis Cascade Alliance") {
          cLibWebsiteText = document.createTextNode("Website");
        } else {
          cLibWebsiteText = document.createTextNode("Library website");
        }
        
        itemCampus.appendChild(cAddress);
        itemCampus.appendChild(cLib);
        itemCampus.appendChild(cLibPhone);
        cLibWebsite.appendChild(cLibWebsiteText);
        itemCampus.appendChild(cLibWebsite);
        
        if (data.URL_HOURS) {
          cLibHours.href = data.URL_HOURS;
          cLibHoursText = document.createTextNode("Hours");
          cLibHours.appendChild(cLibHoursText)        
          itemCampus.appendChild(cLibHours);
        }
        
        let marker = new google.maps.Marker({
          position: new google.maps.LatLng(data.LAT, data.LONG),
          map: map,
        });
        
        marker.addListener('click', function() {
          if (currentMarker != marker || currentCampus == null){
            clear();
            currentMarker = marker;
            currentCampus = mapData.get(marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            currentCampus.classList.add("focus");
            showResult(dialog);
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
            itemCampus.marker.setAnimation(google.maps.Animation.BOUNCE);
          }
          
          showResult(dialog);
        });
  
        dialog.appendChild(itemCampus);
        member.campuses.push(itemCampus);
      }
      
      member.addEventListener('click', function() {
          clear();
          currentCampus = member.campuses[0];
          member.campuses[0].classList.add("focus");
          currentMarker = member.marker;
          member.marker.setAnimation(google.maps.Animation.BOUNCE);
          map.panTo(member.marker.position);
          showResult(dialog);
      });
    }
  });
  
  map.addListener('click', function() {
    clear(currentCampus, mapData);
    nav();
  });
}

function clear() {
  debugger;
  if (currentMarker) {
    currentMarker.setAnimation(undefined);
    mapData.get(currentMarker).classList.remove("focus");
    currentMarker = null;
  }
  
  if (currentCampus) {
    currentCampus.classList.remove("focus");
    currentCampus = null;
  }
}

function showResult(dialog) {
  document.getElementById("list").style.display = "none";
  let result = document.getElementById("result");
  result.innerHTML = "";
  result.appendChild(dialog);
  document.getElementById("resultContainer").style.display = "initial";  
}

document.getElementById("nav").addEventListener("click", nav);

function nav() {
  clear();
  document.getElementById("resultContainer").style.display = "none";
  document.getElementById("list").style.display = "block";    
}
