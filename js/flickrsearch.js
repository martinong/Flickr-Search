var flickr = new Flickr({
	api_key: 'e91b242509f0e72935f55dd64b1bdf90'
});

var page;
$(document).ready(function(){
	$('#search_button').click(function(event){
		page = 1;
		search();
		$('.main-nav').attr('style','');
	});

	$('#nextpage').click(function(event){
		page = page + 1;
		search();
	});

	$('#prevpage').click(function(event){
		page = page - 1;
		search();
	});

	$('#searchbar').keypress(function(e){
		if(e.keyCode==13)
			$('#search_button').click();
	});

	$('#username').keypress(function(e){
		if(e.keyCode==13)
			$('#search_button').click();
	});

	$('#advtext').click(function(event){
		$('#advsearch').attr('style','');
		$('#advtext').attr('style','display:none;');
	});

});

search = function() {

	$('#search_area').attr('style','margin-top:10px;margin-bottom:20px;');
	for (var i = 0; i < 10; i++) {
		$('#imgtd'+i).html('<a id=\'imglink'+i+'\'><img id=\'img'+i+'\'></img></a>');
		$('#username'+i).html('');
	};
	$('#pagenum').text('');
	$('#results').attr('style','');
	$('#status').text('Searching...');
	$('#nextpage').attr('style','display:none;');
	$('#prevpage').attr('style','display:none;');

	if ($('#username').val() != '') {
		flickr.people.findByUsername({
			username: $('#username').val()
		}, function(err, result) {
			if(err) { throw new Error(err); }
			var uid = result.user.nsid;

			flickr.photos.search({
				text: $('#searchbar').val(), 
				page: page,
				per_page: '10',
				sort: 'relevance',
				user_id: uid,
				min_upload_date: $('#minY').val()+'-'+$('#minM').val()+'-'+$('#minD').val()+' 00:00:00', 
				max_upload_date: $('#maxY').val()+'-'+$('#maxM').val()+'-'+$('#maxD').val()+' 23:59:59'
			}, function(err, result) {
				if(err) { throw new Error(err); }

				if (result.photos.total == '0') {
					$('#results').attr('style','display:none;');
					$('#status').text('Sorry, no images found.');
				} else {
					$('#status').text(result.photos.total+' images found.');

					if (result.photos.pages > result.photos.page) {
						$('#nextpage').attr('style','');
					};
					if (result.photos.page > 1) {
						$('#prevpage').attr('style','');
					};

					$('#pagenum').text('Page '+page+' of '+result.photos.pages);
					for (var i = 0; i < result.photos.photo.length; i++) {
						var current = result.photos.photo[i];
						$('#img'+i).attr('src',thumbnailURL(current));
						$('#imglink'+i).attr('href',photoURL(current));
						addDetails(i, current);
					};
				};
			}); // End flickr.photos.search
});
} else {
	flickr.photos.search({
		text: $('#searchbar').val(), 
		page: page,
		per_page: '10',
		sort: 'relevance',
		min_upload_date: $('#minY').val()+'-'+$('#minM').val()+'-'+$('#minD').val()+' 00:00:00', 
		max_upload_date: $('#maxY').val()+'-'+$('#maxM').val()+'-'+$('#maxD').val()+' 23:59:59'

	}, function(err, result) {
		if(err) { throw new Error(err); }

		if (result.photos.total == '0') {
			$('#results').attr('style','display:none;');
			$('#status').text('Sorry, no images found.');
		} else {
			$('#status').text(result.photos.total+' images found.');
			$('#pagenum').text('Page '+page+' of '+result.photos.pages);

					console.log(JSON.stringify(result.photos));
					if (result.photos.pages > result.photos.page) {
						$('#nextpage').attr('style','');
					};
					if (result.photos.page > 1) {
						$('#prevpage').attr('style','');
					};
					for (var i = 0; i < result.photos.photo.length; i++) {
						var current = result.photos.photo[i];
						$('#img'+i).attr('src',thumbnailURL(current));
						$('#imglink'+i).attr('href',photoURL(current));
						addDetails(i, current);
					}
				};
			});
	}
};

addDetails = function(photoNum, currentPhoto) {
	flickr.urls.lookupUser({
		url: 'https://www.flickr.com/people/'+currentPhoto.owner
	}, function(err, result) {
		if(err) { throw new Error(err); }
		$('#username'+photoNum).html(currentPhoto.title+'<br /><small><em><a href=\"https://www.flickr.com/people/'+currentPhoto.owner+'/\">'+result.user.username._content+'</a></em></small>');
	});
};

thumbnailURL = function(photo) {
	var farm = photo.farm;
	var server = photo.server;
	var ID = photo.id;
	var secret = photo.secret;
	return 'https://farm'+farm+'.staticflickr.com/'+server+'/'+ID+'_'+secret+'_q.jpg'
};

photoURL = function(photo) {
	var ID = photo.id;
	var UID = photo.owner;
	return 'https://www.flickr.com/photos/'+UID+'/'+ID
};