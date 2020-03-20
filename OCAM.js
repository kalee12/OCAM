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
        
        // populates member list
        let member = document.createElement("div");
        member.className = "member";
        member.innerHTML = response[item].NAME_MEMBER;
        member.campuses = [];
        member.marker = [];
        document.getElementById("list").appendChild(member);
        
        // populates info box for each member
        let info = document.createElement("div");
        let header = document.createElement("div");
        
        header.innerHTML = response[item].NAME_MEMBER;
        header.classList.add("mHeader");
        info.member = header;
        
        member.addEventListener("click", function() {
            showResult(info);
        })
        
        // populates info box for each campus
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
            let cLibWebsite = document.createElement("a");
            let cLibWebsiteText;
            let cLibHours = document.createElement("a");
            let cLibHoursText;

            cAddress.classList.add("address");
            cLib.classList.add("library");
            cLibPhone.classList.add("phone");
            cLibWebsite.classList.add("website");
            cLibHours.classList.add("hours");
            
            cAddress.innerHTML = data.ADDRESS_CAMPUS;
            cLib.innerHTML = data.NAME_LIBRARY;
            cLibPhone.innerHTML = data.PHONE_CIRCULATION;
            cLibWebsite.href = data.URL;
            cLibWebsite.target = "_blank";
            
            if (response[item].NAME_MEMBER == "Orbis Cascade Alliance") {
            cLibWebsiteText = document.createTextNode("Website");
            } else {
            cLibWebsiteText = document.createTextNode("Library Website");
            }
            
            itemCampus.appendChild(cAddress);
            itemCampus.appendChild(cLib);
            itemCampus.appendChild(cLibPhone);
            cLibWebsite.appendChild(cLibWebsiteText);
            itemCampus.appendChild(cLibWebsite);
            
            if (data.URL_HOURS) {
            cLibHours.href = data.URL_HOURS;
            cLibHours.target = "_blank";
            cLibHoursText = document.createTextNode("Hours");
            cLibHours.appendChild(cLibHoursText)        
            itemCampus.appendChild(cLibHours);
            }
            
            let marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.LAT, data.LONG),
            map: map,
            icon: mIcon
            });
            
            marker.addListener('click', function() {
            if (currentMarker != marker || currentCampus == null){
                clear();
                checkZoom();
                currentMarker = marker;
                currentCampus = mapData.get(marker);
                // var divElem = document.getElementById('scrolling_div');
                // var chElem = document.getElementById('element_within_div');
                // var topPos = divElem.offsetTop;
                // divElem.scrollTop = topPos - chElem.offsetTop;
                debugger;
                var result = document.getElementById("result");
                var topPos = result.offsetTop;
                result.scrollTop = topPos - currentCampus.offsetTop;
                map.panTo(marker.position);
                marker.setIcon(mIconSelected);
                currentCampus.classList.add("focus");
                showResult(info);
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
        });
        }
    });
  
  map.addListener('click', function() {
    clear(currentCampus, mapData);
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
  let resultMember = document.getElementById("resultMember");
  let result = document.getElementById("result");
  resultMember.innerHTML = "";
  result.innerHTML = "";
  resultMember.appendChild(info.member);
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
