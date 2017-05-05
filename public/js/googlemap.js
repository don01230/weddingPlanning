window.onload = function(){
		var index = document.getElementById("act_index").value;
		for(var i=0; i<index;i++){
			var address = document.getElementById("loc-input"+i).value;
			mapAddress(i, address);
		}
	}
	function mapAddress(mapElement, address) {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ 'address': address }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
					var mapOptions = {
							zoom: 15,
							center: results[0].geometry.location,
							mapTypeControl: true,
							mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
							navigationControl: true,
							mapTypeId: google.maps.MapTypeId.ROADMAP,
							scrollwheel: false
					};
					var map = new google.maps.Map(document.getElementById("map"+mapElement), mapOptions);
					var infowindow = new google.maps.InfoWindow(
							{ content: '<b>'+address+'</b>',
								size: new google.maps.Size(150,50)
							});
					var marker = new google.maps.Marker({
							map: map,
							position: results[0].geometry.location,
							title: address
					});
					google.maps.event.addListener(marker, 'click', function() {
							infowindow.open(map,marker);
					});
			} else {
					alert("Geocode was not successful for the following reason: " + status);
			}
		});
	}
